import * as GaussianSplats3D from "../build/gaussian-splats-3d.module.js";
import * as THREE from "../build/demo/lib/three.module.js";
import * as fs from "fs";

if (process.argv.length < 4) {
  console.log("Expected at least 2 arguments!");
  console.log(
    'Usage: node create-ksplat.js [path to .PLY or .SPLAT] [output file name] [compression level = 0] [alpha removal threshold = 1] [scene center = "0,0,0"] [block size = 5.0] [bucket size = 256] [spherical harmonics level = 0]'
  );
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];
// const compressionLevel = (process.argv.length >= 5) ? parseInt(process.argv[4]) : 0;
const compressionLevel = 2;
const splatAlphaRemovalThreshold =
  process.argv.length >= 6 ? parseInt(process.argv[5]) : 1;
const sceneCenter =
  process.argv.length >= 7
    ? new THREE.Vector3().fromArray(process.argv[6].split(","))
    : new THREE.Vector3(0, 0, 0);
const blockSize = process.argv.length >= 8 ? parseFloat(process.argv[7]) : 5.0;
const bucketSize = process.argv.length >= 9 ? parseInt(process.argv[8]) : 256;
const outSphericalHarmonicsDegree =
  process.argv.length >= 10 ? parseInt(process.argv[9]) : 0;

const fileData = fs.readFileSync(inputFile);
const path = inputFile.toLowerCase().trim();
const format = GaussianSplats3D.LoaderUtils.sceneFormatFromPath(path);
const splatBuffer = fileBufferToSplatBuffer(
  fileData.buffer,
  format,
  compressionLevel,
  splatAlphaRemovalThreshold
);

applyRotation(splatBuffer);

fs.writeFileSync(outputFile, Buffer.from(splatBuffer.bufferData));

function fileBufferToSplatBuffer(
  fileBufferData,
  format,
  compressionLevel,
  alphaRemovalThreshold
) {
  let splatBuffer;
  if (
    format === GaussianSplats3D.SceneFormat.Ply ||
    format === GaussianSplats3D.SceneFormat.Splat
  ) {
    let splatArray;
    if (format === GaussianSplats3D.SceneFormat.Ply) {
      splatArray = GaussianSplats3D.PlyParser.parseToUncompressedSplatArray(
        fileBufferData,
        outSphericalHarmonicsDegree
      );
    } else {
      splatArray =
        GaussianSplats3D.SplatParser.parseStandardSplatToUncompressedSplatArray(
          fileBufferData
        );
    }
    const splatBufferGenerator =
      GaussianSplats3D.SplatBufferGenerator.getStandardGenerator(
        alphaRemovalThreshold,
        compressionLevel,
        0,
        sceneCenter,
        blockSize,
        bucketSize
      );
    splatBuffer =
      splatBufferGenerator.generateFromUncompressedSplatArray(splatArray);
  } else {
    splatBuffer = new GaussianSplats3D.SplatBuffer(fileBufferData);
  }

  return splatBuffer;
}

function applyRotation(splatBuffer) {
  const rotationMatrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2); // Rotate 90 degrees around the X axis
  for (let i = 0; i < splatBuffer.count; i++) {
    const splat = splatBuffer.getSplat(i);
    const position = new THREE.Vector3(splat.x, splat.y, splat.z);
    position.applyMatrix4(rotationMatrix);
    splat.x = position.x;
    splat.y = position.y;
    splat.z = position.z;
  }
}
