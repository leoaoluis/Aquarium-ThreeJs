import * as THREE from '../../modules/three_rev.js';
import { OBJLoader2 } from '../../modules/OBJLoader2.js';
import { MTLLoader } from '../../modules/MTLLoader.js';

export class Aquarium {
  constructor() {
    this.mesh = new THREE.Group();
    this.loadAquarium();
  }

  getAbsolutePath(relativePath) {
    return new URL(relativePath, window.location.href).href;
  }

  loadAquarium() {
    const basePath = '/static/assets/models/aquarium/';
    const modelName = 'aquario';

    const fullMtlPath = `${basePath}${modelName}.mtl`;
    const fullObjPath = `${basePath}${modelName}.obj`;

    console.log(`Carregando aquário de: ${fullMtlPath}`);

    new MTLLoader().load(fullMtlPath, (materials) => {
      materials.preload();

      const objLoader = new OBJLoader2();

      if (typeof objLoader.setMaterials === 'function') {
        objLoader.setMaterials(materials);
      } else {
        objLoader.setModelName(modelName);
        objLoader.addMaterials(materials.materials, true);
      }

      objLoader.load(fullObjPath, (event) => {
        const root = event.detail?.loaderRootNode || event;

        root.rotation.set(9.6, 0, 0);
        root.scale.set(0.5, 0.5, 0.5);
        root.position.set(0, 0, 0);

        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.side = THREE.DoubleSide;
            }
          }
        });

        this.mesh.add(root);
        this.addDirtOverlay();
        console.log('Aquário carregado e posicionado corretamente!');
      }, undefined, (error) => {
        console.error('Erro ao carregar modelo do aquário:', error);
      });
    }, undefined, (error) => {
      console.error('Erro ao carregar materiais do aquário:', error);
    });
  }

  addDirtOverlay() {
    const textureLoader = new THREE.TextureLoader();
    const dirtTexture = textureLoader.load('./static/assets/models/textures/dirt_overlay.png');

    const material = new THREE.MeshBasicMaterial({
      map: dirtTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const geometry = new THREE.PlaneGeometry(5, 3); // Ajustar conforme dimensões do aquário
    const dirtMesh = new THREE.Mesh(geometry, material);
    dirtMesh.position.set(0, 1.5, -2.45); // Frente do aquário

    this.mesh.add(dirtMesh);
    this.dirtMesh = dirtMesh; // guardar referência
  }
}
