import * as THREE from 'three';
import createTextPlane from './TextPlane';

export default class BoxGenerator {
  constructor(materials, params) {
    this.group = new THREE.Group();
    this.materials = materials;
    this.params = params;

    this.frontFlapPivot = null;
    this.backFlapPivot = null;
    this.textMesh = null;

    // call this.build on instantiation
    this.build();
  }

  build() {
    // clear all existing geometries
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
    });

    // three.js Object3D method: Removes all child objects
    this.group.clear();

    // build process
    const { width, depth, height, flapSizeOffset, flapsAngle, material } =
      this.params;
    const mat = this.materials[material];

    this._createBottom(width, height, depth, mat);
    this._createSides(width, height, depth, mat);
    this._createFlaps(width, height, depth, flapsAngle, flapSizeOffset, mat);
    this._createTextPlane();
    return this.group;
  }

  _createBottom(width, height, depth, mat) {
    // bottom panel
    const bottom = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), mat);
    bottom.rotation.x = Math.PI / 2;
    bottom.position.y = -height / 2;
    this.group.add(bottom);
  }

  _createSides(width, height, depth, mat) {
    // front panel
    const front = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
    front.position.z = depth / 2;
    this.group.add(front);

    // back panel
    const back = front.clone();
    back.rotation.y = Math.PI;
    back.position.z = -depth / 2;
    this.group.add(back);

    // left panel
    const left = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), mat);
    left.rotation.y = -Math.PI / 2;
    left.position.x = -width / 2;
    this.group.add(left);

    // right panel
    const right = left.clone();
    right.rotation.y = Math.PI / 2;
    right.position.x = width / 2;
    this.group.add(right);
  }

  _createFlaps(width, height, depth, flapsAngle, flapSizeOffset, mat) {
    // create left and right flaps
    const leftFlap = new THREE.Mesh(
      new THREE.PlaneGeometry(depth / 2, depth - flapSizeOffset),
      mat,
    );
    leftFlap.rotation.x = Math.PI / 2;
    leftFlap.position.y = height / 2;
    leftFlap.position.x = -width / 2 + depth / 4;
    this.group.add(leftFlap);

    const rightFlap = leftFlap.clone();
    rightFlap.position.x = width / 2 - depth / 4;
    this.group.add(rightFlap);

    // create front flap
    const frontFlap = new THREE.Mesh(
      new THREE.PlaneGeometry(
        width - flapSizeOffset,
        depth / 2 - flapSizeOffset,
      ),
      mat,
    );
    frontFlap.position.y = depth / 4 - flapSizeOffset;

    const frontFlapPivot = new THREE.Group();
    frontFlapPivot.position.y = height / 2;
    frontFlapPivot.position.z = depth / 2;

    // rotation X of the pivot is the param for the flap opening
    frontFlapPivot.rotation.x = (-flapsAngle * Math.PI) / 180;

    frontFlapPivot.add(frontFlap);
    this.group.add(frontFlapPivot);

    // create back flap
    const backFlap = new THREE.Mesh(
      new THREE.PlaneGeometry(
        width - flapSizeOffset,
        depth / 2 - flapSizeOffset,
      ),
      mat,
    );
    backFlap.rotation.y = Math.PI;
    backFlap.position.y = depth / 4 - flapSizeOffset;

    const backFlapPivot = new THREE.Group();
    backFlapPivot.position.y = height / 2;
    backFlapPivot.position.z = -depth / 2;

    backFlapPivot.rotation.x = (flapsAngle * Math.PI) / 180;

    backFlapPivot.add(backFlap);
    this.group.add(backFlapPivot);

    this.frontFlapPivot = frontFlapPivot;
    this.backFlapPivot = backFlapPivot;
  }

  _createTextPlane() {
    // clear existing text mesh
    if (this.textMesh) {
      this.group.remove(this.textMesh);
    }

    this.textMesh = createTextPlane(this.params);
    this.group.add(this.textMesh);
  }

  updateTextPlane(text) {
    this.params.text = text;
    this._createTextPlane();
  }

  setFlapsAngle(deg) {
    const rad = (deg * Math.PI) / 180;
    this.frontFlapPivot.rotation.x = -rad;
    this.backFlapPivot.rotation.x = rad;
  }
}
