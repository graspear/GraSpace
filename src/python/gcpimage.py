import cv2
import numpy as np
import utm

# Define a function to detect features in an image using ORB
def detect_features(image_path):
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    orb = cv2.ORB_create(500)  # ORB detector with 500 keypoints
    keypoints, descriptors = orb.detectAndCompute(image, None)
    return image, keypoints, descriptors

# Match features between two images using Brute-Force Matcher
def match_features(desc1, desc2):
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = bf.match(desc1, desc2)
    matches = sorted(matches, key=lambda x: x.distance)  # Sort by quality
    return matches

# Convert pixel coordinates to real-world UTM coordinates
def convert_to_utm(pixel_x, pixel_y, transform_matrix):
    world_coords = np.dot(transform_matrix, np.array([pixel_x, pixel_y, 1]))  # Apply transformation
    lat, lon = world_coords[0], world_coords[1]
    utm_coords = utm.from_latlon(lat, lon)  # Convert to UTM
    return utm_coords

# Process overlapping images and extract GCPs
def process_overlapping_images(image1_path, image2_path, transform_matrix):
    img1, kp1, desc1 = detect_features(image1_path)
    img2, kp2, desc2 = detect_features(image2_path)

    matches = match_features(desc1, desc2)

    gcp_list = []
    for match in matches[:10]:  # Select best 10 matches
        pixel_x = kp1[match.queryIdx].pt[0]
        pixel_y = kp1[match.queryIdx].pt[1]
        utm_x, utm_y, zone, letter = convert_to_utm(pixel_x, pixel_y, transform_matrix)
        gcp_list.append((utm_x, utm_y, 0, pixel_x, pixel_y, image1_path))

    return gcp_list

# Example transformation matrix (Adjust based on calibration)
transform_matrix = np.array([[0.00001, 0, 500000],  # Scaling & Offset
                             [0, 0.00001, 4000000],
                             [0, 0, 1]])

# Run the processing
gcps = process_overlapping_images("overlap1.jpg", "overlap2.jpg", transform_matrix)

# Save GCPs to a file
with open("output.gcps", "w") as f:
    f.write("+proj=utm +zone=15 +ellps=WGS84 +datum=WGS84 +units=m +no_defs\n")
    for gcp in gcps:
        f.write(f"{gcp[0]} {gcp[1]} {gcp[2]} {gcp[3]} {gcp[4]} {gcp[5]}\n")

