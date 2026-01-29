import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

const canvas = document.getElementById('canvas');
const UIpanel = document.getElementById('controls');
const downloadBtn = document.getElementById('btn-download');

/* ----- THREE.JS scene set-up ----- */

// scene
const scene = new THREE.Scene();
// scene.add(new THREE.AxesHelper(100));

// camera
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
camera.position.set(0, 100, 100);
scene.add(camera);

// lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
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

/* ----- textures registry and materials generation ----- */
const textureLoader = new THREE.TextureLoader();

// TODO: update URL to import.meta.env.base_URL on build
const textures = {
  cardboard: {
    map: textureLoader.load('/textures/cardboard_Color.jpg'),
    roughnessMap: textureLoader.load('/textures/cardboard_Roughness.jpg'),
  },
  kraft: {
    map: textureLoader.load('/textures/kraftPaper_Color.jpg'),
    roughnessMap: textureLoader.load('/textures/kraftPaper_Roughness.jpg'),
  },
  recycled: {
    map: textureLoader.load('/textures/recycledPaper_Color.jpg'),
    roughnessMap: textureLoader.load('/textures/recycledPaper_Roughness.jpg'),
  },
};

Object.values(textures).forEach((tex) => {
  tex.map.wrapS = tex.map.wrapT = THREE.RepeatWrapping;
  tex.map.repeat.set(1, 1);
  tex.roughnessMap.wrapS = tex.roughnessMap.wrapT = THREE.RepeatWrapping;
  tex.roughnessMap.repeat.set(1, 1);
  tex.map.colorSpace = THREE.SRGBColorSpace;
});

const boxMaterials = {
  cardboard: new THREE.MeshStandardMaterial({
    map: textures.cardboard.map,
    roughnessMap: textures.cardboard.roughnessMap,
    metalness: 0,
    side: THREE.DoubleSide,
  }),
  kraft: new THREE.MeshStandardMaterial({
    map: textures.kraft.map,
    roughnessMap: textures.kraft.roughnessMap,
    metalness: 0,
    side: THREE.DoubleSide,
  }),
  recycled: new THREE.MeshStandardMaterial({
    map: textures.recycled.map,
    roughnessMap: textures.recycled.roughnessMap,
    metalness: 0,
    side: THREE.DoubleSide,
  }),
};

/* ----- Cardboard box model generation ----- */

// box params in CM
const boxParams = {
  width: 60,
  depth: 40,
  height: 50,
  flapsAngle: 45,
  flapSizeOffset: 0.3,
  material: 'cardboard',
};

// box mesh generation
let box;

function createBox({ width, depth, height, flapSizeOffset, flapsAngle }) {
  const box = new THREE.Group();
  const mat = boxMaterials[boxParams.material];

  // bottom panel
  const bottom = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), mat);
  bottom.rotation.x = Math.PI / 2;
  bottom.position.y = -height / 2;
  box.add(bottom);

  // front panel
  const front = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
  front.position.z = depth / 2;
  box.add(front);

  // back panel
  const back = front.clone();
  back.rotation.y = Math.PI;
  back.position.z = -depth / 2;
  box.add(back);

  // left panel
  const left = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), mat);
  left.rotation.y = -Math.PI / 2;
  left.position.x = -width / 2;
  box.add(left);

  // right panel
  const right = left.clone();
  right.rotation.y = Math.PI / 2;
  right.position.x = width / 2;
  box.add(right);

  // create left and right flaps
  const leftFlap = new THREE.Mesh(
    new THREE.PlaneGeometry(depth / 2, depth - flapSizeOffset),
    mat,
  );
  leftFlap.rotation.x = Math.PI / 2;
  leftFlap.position.y = height / 2;
  leftFlap.position.x = -width / 2 + depth / 4;
  box.add(leftFlap);

  const rightFlap = leftFlap.clone();
  rightFlap.position.x = width / 2 - depth / 4;
  box.add(rightFlap);

  // create front flap
  const frontFlap = new THREE.Mesh(
    new THREE.PlaneGeometry(width - flapSizeOffset, depth / 2 - flapSizeOffset),
    mat,
  );
  frontFlap.position.y = depth / 4 - flapSizeOffset;

  const frontFlapPivot = new THREE.Object3D();
  frontFlapPivot.position.y = height / 2;
  frontFlapPivot.position.z = depth / 2;

  // rotation X of the pivot is the param for the flap opening
  frontFlapPivot.rotation.x = (-flapsAngle * Math.PI) / 180;

  frontFlapPivot.add(frontFlap);
  box.add(frontFlapPivot);

  // create back flap
  const backFlap = new THREE.Mesh(
    new THREE.PlaneGeometry(width - flapSizeOffset, depth / 2 - flapSizeOffset),
    mat,
  );
  backFlap.rotation.y = Math.PI;
  backFlap.position.y = depth / 4 - flapSizeOffset;

  const backFlapPivot = new THREE.Object3D();
  backFlapPivot.position.y = height / 2;
  backFlapPivot.position.z = -depth / 2;

  backFlapPivot.rotation.x = (flapsAngle * Math.PI) / 180;

  backFlapPivot.add(backFlap);
  box.add(backFlapPivot);

  box.userData.frontFlapPivot = frontFlapPivot;
  box.userData.backFlapPivot = backFlapPivot;

  // create crease lines
  const creaseMat = new THREE.LineBasicMaterial({
    color: 0x7a5a2e,
    transparent: true,
    opacity: 0.6,
  });

  // box.traverse((child) => {
  //   if (child.isMesh) {
  //     const edges = new THREE.EdgesGeometry(child.geometry);
  //     const lines = new THREE.LineSegments(edges, creaseMat);
  //     lines.position.copy(child.position);
  //     lines.rotation.copy(child.rotation);
  //     box.add(lines);
  //   }
  // });

  return box;
}

box = createBox(boxParams);
scene.add(box);

/* ----- GUI settings and interactions ----- */

const gui = new GUI();

gui.add(boxParams, 'width', 20, 100, 1).onChange(rebuildBox);
gui.add(boxParams, 'height', 5, 100, 1).onChange(rebuildBox);
gui.add(boxParams, 'depth', 10, 100, 1).onChange(rebuildBox);
gui
  .add(boxParams, 'flapsAngle', 0, 89, 1)
  .name('flaps angle')
  .onChange((v) => changeFlapsAngle(v));
gui
  .add(boxParams, 'material', {
    Cardboard: 'cardboard',
    Kraft: 'kraft',
    Recycled: 'recycled',
  })
  .onChange(rebuildBox);

// function to rebuild box upon change
function rebuildBox() {
  if (box) scene.remove(box);
  box = createBox(boxParams);
  scene.add(box);
}

// function to change flap angles
function changeFlapsAngle(degree) {
  box.userData.frontFlapPivot.rotation.x = -(degree * Math.PI) / 180;
  box.userData.backFlapPivot.rotation.x = (degree * Math.PI) / 180;
}

/* ----- Export as image logic ----- */
downloadBtn.addEventListener('click', exportImage);

function exportImage() {
  // precaution to render to most updated scene before handling download
  renderer.render(scene, camera);
  // return a temporary URL containing the image data
  const imgURL = renderer.domElement.toDataURL('image/png');

  // create a temporary anchor tag to trigger download
  const downloadLink = document.createElement('a');
  downloadLink.href = imgURL;
  downloadLink.download = 'my-cardboard-box.png';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
}
