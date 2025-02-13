document.getElementById('load-points-btn').addEventListener('click', loadPoints);
document.getElementById('export-btn').addEventListener('click', exportData);

let uploadedTxtFile = null;
let controlPoints = [];

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.txt')) {
        uploadedTxtFile = file;
        parseTxtFile(file);
    }
}

function parseTxtFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        // Parse the content to extract control points and images
        controlPoints = parseControlPoints(content);
        displayImages(content); // Display images based on the content
    };
    reader.readAsText(file);
}

function parseControlPoints(content) {
    // Implement your logic to parse control points from the txt file
    // For example, assume each point is stored on a new line as `imageName x y`
    const points = [];
    const lines = content.split('\n');
    lines.forEach(line => {
        const [imageName, x, y] = line.split(' ');
        if (imageName && x && y) {
            points.push({ imageName, x: parseFloat(x), y: parseFloat(y) });
        }
    });
    return points;
}

function displayImages(content) {
    const imagesGrid = document.querySelector('.images-grid');
    imagesGrid.innerHTML = ''; // Clear previous images
    const lines = content.split('\n');
    lines.forEach(line => {
        const [imageName] = line.split(' ');
        if (imageName) {
            const imgElement = document.createElement('img');
            imgElement.src = `path_to_images/${imageName}`; // Replace with actual image path
            imagesGrid.appendChild(imgElement);
        }
    });
}

function loadPoints() {
    const imagesGrid = document.querySelector('.images-grid');
    const images = imagesGrid.querySelectorAll('img');
    
    images.forEach(img => {
        // Load and display control points for each image
        const imageName = img.src.split('/').pop(); // Extract image name from the path
        const pointsForImage = controlPoints.filter(point => point.imageName === imageName);
        pointsForImage.forEach(point => {
            // Example: draw points on the image or store them for later use
            console.log(`Control Point for ${imageName}: (${point.x}, ${point.y})`);
        });
    });
}

function exportData() {
    const data = controlPoints.map(point => `${point.imageName} ${point.x} ${point.y}`).join('\n');
    const txtBlob = new Blob([data], { type: 'text/plain' });
    
    // Create a link to trigger the download
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(txtBlob);
    downloadLink.download = 'control_points.txt';
    downloadLink.click();
    
    // Additionally, trigger the download of the uploaded TXT file if needed
    if (uploadedTxtFile) {
        const uploadedTxtBlob = new Blob([uploadedTxtFile], { type: 'text/plain' });
        const uploadLink = document.createElement('a');
        uploadLink.href = URL.createObjectURL(uploadedTxtBlob);
        uploadLink.download = uploadedTxtFile.name;
        uploadLink.click();
    }
}
