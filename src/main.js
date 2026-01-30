import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import BoxGenerator from './BoxGenerator';
import { boxMaterials } from './boxTextures';

const canvas = document.getElementById('canvas');
const downloadBtn = document.getElementById('btn-download');

/* ----- THREE.JS scene set-up ----- */
// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
camera.position.set(60, 70, 150);
scene.add(camera);

// lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const lightHolder = new THREE.Group();
const topLight = new THREE.PointLight(0xffffff, 7500);
topLight.position.set(-20, 100, 0);
lightHolder.add(topLight);
const sideLight = new THREE.PointLight(0xffffff, 5000);
sideLight.position.set(65, 0, 90);
lightHolder.add(sideLight);

scene.add(lightHolder);

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false;

// renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true, //for preserving WebGL buffer for image export
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

// render loop
function animate() {
  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// resize listener
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  const needResize =
    canvas.width !== displayWidth || canvas.height !== displayHeight;
  if (needResize) {
    renderer.setSize(displayWidth, displayHeight, false);
  }
  return needResize;
}

/* ----- Cardboard box model generation ----- */
// box params in CM
const boxParams = {
  width: 60,
  depth: 40,
  height: 50,
  flapsAngle: 45,
  flapSizeOffset: 0.3,
  material: 'cardboard',
  text: 'Hello world',
};

const box = new BoxGenerator(boxMaterials, boxParams);
scene.add(box.group);

/* ----- GUI settings and interactions ----- */
const gui = new GUI({ container: document.getElementById('canvas-wrapper') });

gui.add(boxParams, 'width', 20, 100, 1).onChange(() => box.build());
gui.add(boxParams, 'height', 5, 80, 1).onChange(() => box.build());
gui.add(boxParams, 'depth', 10, 80, 1).onChange(() => box.build());
gui
  .add(boxParams, 'flapsAngle', 0, 89, 1)
  .name('flaps angle')
  .onChange((v) => box.setFlapsAngle(v));
gui
  .add(boxParams, 'material', {
    Cardboard: 'cardboard',
    Kraft: 'kraft',
    Recycled: 'recycled',
  })
  .onChange(() => box.build());
gui.add(boxParams, 'text').onFinishChange((v) => box.updateTextPlane(v));

/* ----- Export as image logic ----- */
downloadBtn.addEventListener('click', exportImage);

function exportImage() {
  //temporarily update renderer to desired export size
  const originalSize = renderer.getSize(new THREE.Vector2());
  const originalPixelRatio = renderer.getPixelRatio();

  renderer.setPixelRatio(1);
  renderer.setSize(1500, 1500, false);
  renderer.render(scene, camera);

  // return a temporary URL containing the image data
  const imgURL = renderer.domElement.toDataURL('image/png');

  // restore
  renderer.setSize(originalSize.x, originalSize.y);
  renderer.setPixelRatio(originalPixelRatio);
  renderer.render(scene, camera);

  // create a temporary anchor tag to trigger download
  const downloadLink = document.createElement('a');
  downloadLink.href = imgURL;
  downloadLink.download = 'my-cardboard-box.png';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
}
