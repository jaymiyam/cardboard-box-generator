import * as THREE from 'three';

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

export const boxMaterials = {
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
