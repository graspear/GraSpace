import React, { useState, createContext, useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";
import Map from "./components/Map";
import Login from "./components/Login";
import "./App.scss";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand"><h1>GraSpace</h1></div>
      <h1
        style={{
          margin: "0 auto",
          textAlign: "center",
          fontSize: "1.25rem",
          fontWeight: "normal",
          color: "#555",
        }}
      >
        Ground Control Point Interface
      </h1>
      <div className="navbar-actions">
        {isAuthenticated && (
          <button onClick={logout} className="logout-btn">Logout</button>
        )}
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute element={<MainApp />} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};
const MainApp = () => {
  const [images, setImages] = useState([]); // Uploaded images
  const [controlPoints, setControlPoints] = useState([]); // Valid GCPs from the file
  const [projection, setProjection] = useState(""); // Store projection line
  const [selectedImage, setSelectedImage] = useState(null); // Currently previewed image
  const [imageControlPoints, setImageControlPoints] = useState([]); // Control points for images
  const [uploadedControlPointFile, setUploadedControlPointFile] = useState(null);
  // Handle image uploads
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...imageUrls]);
  };



  // Handle image removal
  const handleImageDelete = (imageToDelete) => {
    setImages((prevImages) => {
      const updatedImages = prevImages.filter((image) => image !== imageToDelete);
      console.log(updatedImages); // Debugging the state after deletion
      return updatedImages;
    });


    // Remove associated control points for the deleted image
    setImageControlPoints((prevPoints) =>
      prevPoints.filter((point) => point.image !== imageToDelete)
    );
  };

  const handleControlPointUpload = (event) => {
    const file = event.target.files[0];

    if (!file) {
      alert("No file selected. Please upload a valid file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split("\n").map((line) => line.trim());

      if (lines.length < 2) {
        alert("File format is invalid. Ensure it contains a projection line and control points.");
        return;
      }

      const projectionLine = lines[0];
      if (!projectionLine.startsWith("+proj=")) {
        alert("Invalid file format: The first line must define the projection.");
        return;
      }

      const extractedControlPoints = lines.slice(1).reduce((acc, line, idx) => {
        const parts = line.split("\t");
        if (parts.length === 6 && parts.every((part) => part.trim() !== "")) {
          acc.push(line);
        } else {
          console.warn(`Invalid control point at line ${idx + 2}: "${line}"`);
        }
        return acc;
      }, []);

      if (extractedControlPoints.length < 1) {
        alert("No valid control points found in the file.");
        return;
      }

      setProjection(content);
      setControlPoints(extractedControlPoints);
      setUploadedControlPointFile(file); // Store file for preview
    };

    reader.readAsText(file);
  };

  // Handle image selection for preview
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleDeselectControlPoint = (index) => {
    setImageControlPoints((prevPoints) =>
      prevPoints.filter((point, idx) => {
        // Keep points that either don't belong to the selected image or don't match the index
        return point.image !== selectedImage || idx !== index;
      })
    );
  };
  const handleFileDelete = () => {
    setUploadedControlPointFile(null);
    setProjection("");
    setControlPoints([]);
  };

  // Add control points by clicking on the previewed image
  const handleImageClickForControlPoint = (e) => {
    if (!selectedImage) return;
  
    const img = e.target;
    const rect = img.getBoundingClientRect();
    
    // Get click position relative to displayed image size
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    setImageControlPoints((prevPoints) => [
      ...prevPoints,
      { image: selectedImage, x: x.toFixed(2), y: y.toFixed(2) },
    ]);
  };
  
  
  // Filter control points for the currently selected image
  const getControlPointsForSelectedImage = () => {
    return imageControlPoints.filter((point) => point.image === selectedImage);
  };
  const handleFileClick = () => {
    if (uploadedControlPointFile) {
      const fileReader = new FileReader();
      fileReader.readAsText(uploadedControlPointFile);
      fileReader.onload = () => {
        alert(`File content:\n\n${fileReader.result}`);
      };
    }
  };
  const handleExport = () => {
    // Use the latest value of imageControlPoints
    const currentImageControlPoints = [...imageControlPoints];
  
    if (!uploadedControlPointFile && currentImageControlPoints.length === 0) {
      alert("No control points detected.");
      return;
    }
  
    let fileContent;
    let fileName;
  
    if (!uploadedControlPointFile && currentImageControlPoints.length !== 0) {
      // No file uploaded but control points exist → Download only "EPSG:4326"
      fileContent = "EPSG:4326";
      fileName = "control_points.txt";
    } else if (uploadedControlPointFile) {
      if (currentImageControlPoints.length === 0) {
        // File uploaded but no control points → Download the uploaded file only
        fileContent = projection;
        fileName = "control_points.txt";
      } else {
        // File uploaded & control points exist → Download "EPSG:4326" + uploaded file content
        fileContent = `EPSG:4326\n${projection}`;
        fileName = "control_points.txt";
      }
    }
  
    const blob = new Blob([fileContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  


  return (
    <div className="app-container">
      {/* <header
        className="navbar"
        style={{
          backgroundColor: "#409efc",
          color: "#333",
          padding: "1rem",
          borderBottom: "1px solid #ddd",
        }}
      >
        <div className="navbar-brand" style={{ display: "flex", alignItems: "center" }}>
          <h1 style={{ margin: "0", fontSize: "1.5rem", fontWeight: "bold" }}>GraSpace</h1>
        </div>
        <h1
          style={{
            margin: "0 auto",
            textAlign: "center",
            fontSize: "1.25rem",
            fontWeight: "normal",
            color: "#555",
          }}
        >
          Ground Control Point Interface
        </h1>
      </header> */}

      <div className="container">
        <div className="left-panel">
          <div className="image-nav-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="image-nav no-images">
              <div className="control-points-i">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="black"
                    viewBox="0 0 24 24"
                    style={{ marginRight: "8px" }}
                  >
                    <path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7H3z" />
                  </svg>
                  <div>
                    <h3 style={{ margin: "0", color: "#333" }}>Ground Control Points</h3>
                    <h4 style={{ margin: "0", color: "#666" }}>
                      {controlPoints.length + imageControlPoints.length > 0
                        ? `${controlPoints.length + imageControlPoints.length} points found`
                        : "No points..."}
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              style={{
                padding: "8px 16px",
                backgroundColor: "gray",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Export
            </button>
          </div>


          <div className="directions">
            <h3 style={{ color: "#333" }}>Directions</h3>
            <p style={{ color: "#555" }}>
              Connect at least 5 high-contrast objects in 3 or more photos to
              their corresponding locations on the map.
            </p>
            <ol style={{ color: "#555" }}>
              <li>Upload images (JPEG or PNG).</li>
              <li>Click on an image to add a point.</li>
              <li>Click on the map to set a corresponding point.</li>
              <li>
                Repeat the process for at least 5 high-contrast objects in 3 or
                more images.
              </li>
              <li>Generate the ground control point file.</li>
            </ol>
          </div>

          <div className="image-loader-container">
            <div className="control-point-panel">
              <div>
                <b>Load Existing Control Point</b>
                <input type="file" accept=".txt" onChange={handleControlPointUpload} />

                {/* Show preview box for uploaded Control Point TXT file */}
                {uploadedControlPointFile && (
                  <div
                    className="image-preview control-point-box"
                    style={{
                      position: "relative",
                      width: "200px",
                      height: "50px",
                      border: "2px dashed #ccc",
                      background: "#f9f9f9",
                      fontSize: "14px",
                      textAlign: "center",
                      color: "#555",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginTop: "10px",
                    }}
                    onClick={handleFileClick}
                  >
                    <span>{uploadedControlPointFile.name}</span>

                    {/* Delete Button for TXT File */}
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileDelete();
                      }}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      &#10005;
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="choose-images-panel">
              <div>
                <b>Choose Images / drag here</b>
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg"
                  className="image-uploader"
                  onChange={handleImageUpload}
                />
                <div className="file-count" style={{ marginTop: "10px" }}>
                  {images.length > 0
                    ? `${images.length} file${images.length > 1 ? "s" : ""} uploaded`
                    : "No files uploaded"}
                </div>
              </div>
            </div>
          </div>

          <div className="images-grid">
            <div className="wrapper">
              {images.map((image, index) => {
                const count = imageControlPoints.filter((point) => point.image === image).length;
                return (
                  <div key={index} className="image-preview" style={{ position: "relative", width: "100px", height: "100px" }}>
                    {/* Control points count display */}
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "5px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {count} Pts
                    </div>

                    <img
                      src={image}
                      alt={`Uploaded Preview ${index + 1}`}
                      onClick={() => handleImageClick(image)}
                      style={{
                        cursor: "pointer",
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "5px",
                      }}
                    />

                    <button
                      className="delete-btn"
                      onClick={() => handleImageDelete(image)}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      &#10005;
                    </button>
                  </div>
                );
              })}

            </div>
          </div>

        </div>

        <div className="map-container">
          <Map
            controlPointsLength={controlPoints.length}
            imageControlPointsLength={imageControlPoints.length}
          />
        </div>


        {selectedImage && (
  <div
    className="image-preview-container"
    style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: "1000",
      backgroundColor: "#fff",
      borderRadius: "10px",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
      width: "80vw",
      height: "80vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* Header with draggable close button */}
    <div
      style={{
        position: "relative",
        backgroundColor: "#f1f1f1",
        padding: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h3 style={{ margin: 0, textAlign: "center", flex: 1 }}>Preview</h3>
      <button
        onClick={() => setSelectedImage(null)}
        style={{
          backgroundColor: "transparent",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
          color: "#333",
        }}
      >
        &#10005;
      </button>
    </div>

    {/* Content area */}
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "row",
        gap: "20px",
        padding: "20px",
      }}
    >
      {/* Image Preview */}
      <div
        style={{
          flex: 3,
          position: "relative",
          border: "1px solid #ccc",
          borderRadius: "8px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={selectedImage}
          alt="Preview"
          onClick={handleImageClickForControlPoint}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            cursor: "crosshair",
            position: "relative",
          }}
        />
        {/* Render control points on the image */}
        {getControlPointsForSelectedImage().map((point, idx) => (
          <div
            key={idx}
            style={{
              position: "absolute",
              top: `${point.y}px`,
              left: `${point.x}px`,
              width: "10px",
              height: "10px",
              backgroundColor: "red",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              border: "2px solid white",
            }}
          ></div>
        ))}
      </div>

      {/* Control Points List */}
      <div
        style={{
          flex: 1,
          maxHeight: "100%",
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
          padding: "10px",
        }}
      >
        <h4 style={{ margin: "0 0 10px", textAlign: "center" }}>
          Control Points
        </h4>
        <ul
          style={{
            margin: 0,
            paddingLeft: "15px",
            textAlign: "left",
          }}
        >
          {getControlPointsForSelectedImage().map((point, idx) => (
            <li
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                X: {point.x}, Y: {point.y}
              </span>
              {/* Deselect Button */}
              <button
                onClick={() => handleDeselectControlPoint(idx)}
                style={{
                  backgroundColor: "#ff4d4d",
                  border: "none",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Deselect
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
)}


      </div>
    </div>
  );
};

export default App;
