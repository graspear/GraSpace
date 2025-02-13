import React, { useState } from "react";
import { useAuth } from "../App.jsx";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = () => {
    if (username === "" || password === "") {
      setErrorMessage("Please fill in both fields.");
      return;
    }
    if (username === "admin" && password === "Admin@123") {
      login();
      navigate("/");
    } else {
      setErrorMessage("Invalid username or password.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        {errorMessage && <p style={styles.error}>{errorMessage}</p>}
        <div style={styles.inputGroup}>
          <label htmlFor="username" style={styles.label}>Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={styles.input}
          />
        </div>
        
        <div style={styles.buttonContainer}>
          <button 
            onClick={handleLogin} 
            style={styles.button}
            onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
          >
            Login
          </button>
        </div>

        <p 
          onClick={() => setShowForgotPassword(!showForgotPassword)} 
          style={styles.forgotPassword}
        >
          Forgot Password?
        </p>

        {showForgotPassword && (
          <p style={styles.forgotMessage}>
            The username and password are <strong>admin</strong> and <strong>Admin@123</strong><br></br> 
            If you want to change them, navigate to <strong>src/components/Login.js</strong> <br></br>
            and modify this condition: <br></br>
            <code> username === "admin" && password === "Admin@123" </code>.
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",  // **Ensures Full Screen Without Scroll**
    overflow: "hidden",  // **Prevents Scrolling**
    background: "linear-gradient(135deg, #89CFF0, #ffffff)", 
  },
  card: {
    width: "350px",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#ffffff",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  inputGroup: {
    marginBottom: "15px",
    textAlign: "left",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "14px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    outline: "none",
    transition: "border-color 0.3s",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "10px",
  },
  button: {
    padding: "12px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  forgotPassword: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#007bff",
    cursor: "pointer",
    textDecoration: "underline",
  },
  forgotMessage: {
    marginTop: "10px",
    fontSize: "12px",
    color: "#666",
    backgroundColor: "#f8f9fa",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  error: {
    color: "red",
    marginBottom: "10px",
    fontSize: "14px",
  },
};


export default Login;
