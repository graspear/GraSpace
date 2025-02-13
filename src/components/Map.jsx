import React from "react";
import ReactDOM from "react-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./GCPPopup.scss";
import GCPPopup from "./GCPPopup";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";

class Map extends React.Component {
  componentDidMount() {
    const map = L.map("map", {
      minZoom: 2,
      maxZoom: 18,
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
      maxBoundsViscosity: 1.0,
    }).setView([0, 0], 2);

    // Define tile layers
    const tileLayers = {
      osm: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }),
      satellite: L.tileLayer(
        "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        {
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
          attribution: "© Google Satellite",
        }
      ),
      custom: null, // Placeholder for custom URL
    };

    // Add the default OpenStreetMap layer to the map
    tileLayers.osm.addTo(map);
    let activeLayer = tileLayers.osm;

    // Add the search bar
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: true,
    })
      .on("markgeocode", function (e) {
        const bbox = e.geocode.bbox;
        const bounds = L.latLngBounds([bbox.getSouthWest(), bbox.getNorthEast()]);
        map.fitBounds(bounds);
      })
      .addTo(map);

    // Add map provider control UI
    const providerControl = L.control({ position: "topright" });
    providerControl.onAdd = function () {
      const div = L.DomUtil.create("div", "leaflet-map-providers leaflet-bar leaflet-control");
      div.innerHTML = `
        <div class="provider-icon" title="Map Provider">
          <span class="icon">&#x1f5fa;</span>
        </div>
        <div class="provider-menu hidden">
          <button class="close-provider-menu" title="Close">&#x2715;</button>
          <ul class="list-reset">
            <li class="provider-item" data-id="osm">
              <label>
                <input type="radio" name="map-provider" value="osm" checked> OpenStreetMap
              </label>
            </li>
            <li class="provider-item" data-id="satellite">
              <label>
                <input type="radio" name="map-provider" value="satellite"> Satellite
              </label>
            </li>
            <li class="provider-item" data-id="custom">
              <label>
                <input type="radio" name="map-provider" value="custom"> Custom
                <div class="custom-options">
                  <input type="text" class="custom-url-input" placeholder="Enter tile URL template">
                  <button class="apply-custom-btn">Apply</button>
                </div>
              </label>
            </li>
          </ul>
        </div>
      `;
      return div;
    };
    providerControl.addTo(map);

    // Add interaction for the map provider control
    const providerIcon = document.querySelector(".provider-icon");
    const providerMenu = document.querySelector(".provider-menu");
    const closeButton = document.querySelector(".close-provider-menu");

    // Toggle menu visibility on icon click
    providerIcon.addEventListener("click", () => {
      providerMenu.classList.toggle("hidden");
    });

    // Close the provider menu when the close button is clicked
    closeButton.addEventListener("click", () => {
      providerMenu.classList.add("hidden");
    });

    // Add logic for provider selection
    const providerItems = document.querySelectorAll(".provider-item input[type='radio']");
    const customOptions = document.querySelector(".custom-options");
    const customUrlInput = document.querySelector(".custom-url-input");
    const applyCustomBtn = document.querySelector(".apply-custom-btn");

    providerItems.forEach((item) => {
      item.addEventListener("change", (event) => {
        const selectedProvider = event.target.value;

        // Handle custom URL input visibility
        if (selectedProvider === "custom") {
          customOptions.classList.remove("hidden");
        } else {
          customOptions.classList.add("hidden");

          // Remove existing tile layers and add the selected one
          if (activeLayer) {
            map.removeLayer(activeLayer);
          }
          activeLayer = tileLayers[selectedProvider];
          if (activeLayer) {
            activeLayer.addTo(map);
          }
        }
      });
    });

    // Apply custom URL on button click
    applyCustomBtn.addEventListener("click", () => {
      const customUrl = customUrlInput.value.trim();

      if (customUrl) {
        try {
          // Validate URL
          new URL(customUrl);
          if (tileLayers.custom) {
            map.removeLayer(tileLayers.custom);
          }
          tileLayers.custom = L.tileLayer(customUrl, {
            attribution: "Custom Tile Layer",
          });

          // Remove existing active layer and add custom layer
          if (activeLayer) {
            map.removeLayer(activeLayer);
          }
          activeLayer = tileLayers.custom;
          activeLayer.addTo(map);

          alert("Custom map layer applied successfully!");
        } catch (e) {
          alert("Please enter a valid URL.");
          if (activeLayer) {
            map.removeLayer(activeLayer);
          }
          activeLayer = tileLayers.osm;
          activeLayer.addTo(map);
        }
      } else {
        alert("Please enter a valid custom URL.");
      }
    });

    // Add Load Points Button
    const loadPointsButton = L.control({ position: "topright" });
    loadPointsButton.onAdd = function () {
      const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
      div.innerHTML = `
        <button class="load-points-btn">Load</button>
      `;
      return div;
    };
    loadPointsButton.addTo(map);

    const customIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      iconSize: [25, 41], // Default Leaflet marker size
      iconAnchor: [12, 41], // Adjust anchor to bottom center
      popupAnchor: [1, -34], // Position popup above the marker
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      shadowSize: [41, 41], // Default shadow size
    });

    // Store last values
this.lastControlPointsLength = null;
this.lastImageControlPointsLength = null;
this.controlPointMarkers = [];
this.imageControlPointMarkers = [];
this.LatLngControl = null;
this.LatLngImage = null;

// Define different icons for control points and image control points
const controlPointIcon = L.icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png', // Red icon
  iconSize: [32, 32],
});

const imageControlPointIcon = L.icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Blue icon
  iconSize: [32, 32],
});

document.querySelector(".load-points-btn").addEventListener("click", async () => {
  if (this.props.controlPointsLength === 0 && this.props.imageControlPointsLength === 0) {
    alert("Please enter control points");
    return;
  }

  async function checkIfLand(lat, lon) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      return data.address !== undefined;
    } catch (error) {
      console.error("Error checking land:", error);
      return false;
    }
  }

  const getLandCoordinates = async () => {
    while (true) {
      const lat = Math.random() * 180 - 90;
      const lon = Math.random() * 360 - 180;
      const isLand = await checkIfLand(lat, lon);
      if (isLand) return [lat, lon];
    }
  };

  if (this.props.controlPointsLength !== this.lastControlPointsLength) {
    this.controlPointMarkers.forEach(marker => map.removeLayer(marker));
    this.controlPointMarkers = [];

    this.LatLngControl = await getLandCoordinates();
    
    for (let i = 0; i < this.props.controlPointsLength; i++) {
      const marker = L.marker(this.LatLngControl, { icon: controlPointIcon, draggable: true })
        .addTo(map)
        .bindTooltip(`🔴 Existing Control Point ${i + 1}`, { permanent: false });

      this.controlPointMarkers.push(marker);
    }

    // Zoom into the first control point
    map.setView(this.LatLngControl, 10);

    this.lastControlPointsLength = this.props.controlPointsLength;
  } else if (this.props.controlPointsLength > 0) {
    alert("Same control points detected.");
  }

  if (this.props.imageControlPointsLength !== this.lastImageControlPointsLength) {
    this.imageControlPointMarkers.forEach(marker => map.removeLayer(marker));
    this.imageControlPointMarkers = [];

    this.LatLngImage = await getLandCoordinates();

    for (let i = 0; i < this.props.imageControlPointsLength; i++) {
      const marker = L.marker(this.LatLngImage, { icon: imageControlPointIcon, draggable: true })
        .addTo(map)
        .bindTooltip(`🔵 Image Control Point ${i + 1}`, { permanent: false });

      this.imageControlPointMarkers.push(marker);
    }

    // Zoom into the first image control point
    map.setView(this.LatLngImage, 10);

    this.lastImageControlPointsLength = this.props.imageControlPointsLength;
  } else if (this.props.imageControlPointsLength > 0) {
    alert("Same image control points detected.");
  }
});

    // Fetch Ground Control Points and add markers
    fetch("/api/ground_control_points")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.features)) {
          data.features.forEach((feature) => {
            const coordinates = feature?.geometry?.coordinates;
            if (coordinates && coordinates.length === 2) {
              const [longitude, latitude] = coordinates;

              if (
                typeof latitude === "number" &&
                typeof longitude === "number" &&
                latitude >= -90 &&
                latitude <= 90 &&
                longitude >= -180 &&
                longitude <= 180
              ) {
                const marker = L.marker([latitude, longitude]).addTo(map);

                const popupContainer = document.createElement("div");
                ReactDOM.render(
                  <GCPPopup feature={feature} task={{ project: 1, id: 1 }} />,
                  popupContainer
                );
                marker.bindPopup(popupContainer);
              } else {
                console.error("Invalid coordinates:", coordinates);
              }
            } else {
              console.error("Coordinates missing or invalid in feature:", feature);
            }
          });
        } else {
          console.error("Invalid features array in response.");
        }
      })
      .catch((err) => console.error("Error fetching Ground Control Points:", err));

    // Make the map resize dynamically when the window is resized
    window.addEventListener("resize", () => {
      map.invalidateSize();
    });
  }

  render() {
    return (
      <div
        className="map-container"
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
        }}
      >
        <div
          id="map"
          style={{
            flex: 1,
            border: "1px solid #ddd",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        ></div>
      </div>
    );
  }
}

export default Map;
