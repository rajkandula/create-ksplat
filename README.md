# create-ksplat

# Gaussian Splats 3D Conversion

This project contains scripts to convert PLY files to KSPLAT format using Node.js.

Source from: https://github.com/mkkellogg/GaussianSplats3D

## Requirements

- Node.js
- NPM (Node Package Manager)

## Installation

1. Clone this repository.
2. Navigate to the project directory.
3. Install the necessary dependencies:

   ```bash
   npm install

## To convert a PLY file to KSPLAT format, use the following command:
  ```bash  
  node --max-old-space-size=4096 util/create-ksplat.js /path/to/your/file.ply /path/to/output.ksplat
