import * as THREE from 'three';

export default function createTextPlane({ width, height, depth, text }) {
  // scale up to increase resolution of the canvas
  const scale = 10;
  const textCanvas = document.createElement('canvas');
  textCanvas.width = width * scale;
  textCanvas.height = height * scale;

  const ctx = textCanvas.getContext('2d');
  ctx.scale(scale, scale);

  // draw the text on the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, width / 2, height / 2);

  // use the canvas to create a three.js texture
  const canvasTexture = new THREE.CanvasTexture(textCanvas);
  canvasTexture.colorSpace = THREE.SRGBColorSpace;

  // use the canvas texture as material to create a plane
  const textMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      map: canvasTexture,
      transparent: true,
    }),
  );
  textMesh.position.z = depth / 2;
  return textMesh;
}
