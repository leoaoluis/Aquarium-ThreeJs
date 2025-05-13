import * as THREE from '../../modules/three_rev.js';
import { OBJLoader2 } from '../../modules/OBJLoader2.js';
import { MTLLoader } from '../../modules/MTLLoader.js';

export class Aquarium {
  constructor(onLoadedCallback) {
    this.mesh = new THREE.Group();
    this.onLoaded = onLoadedCallback; // callback a chamar depois de carregar
    this.loadAquarium();
  }

  getAbsolutePath(relativePath) {
    return new URL(relativePath, window.location.href).href;
  }

  loadAquarium() {
    const basePath = '/static/assets/models/aquarium/';
    const modelName = 'aquario';

    const fullMtlPath = this.getAbsolutePath(`${basePath}${modelName}.mtl`);
    const fullObjPath = this.getAbsolutePath(`${basePath}${modelName}.obj`);

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

        // Usar a mesma orientação e escala do Jola
        root.rotation.set(Math.PI * -0.5, 0, 0);
        root.scale.set(7, 15, 7);
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

        // Calcular bounding box para enviar posição ao index.js
        const box = new THREE.Box3().setFromObject(root);
        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());

        console.log('Aquário carregado e posicionado corretamente!');
        if (this.onLoaded) this.onLoaded(boxCenter, boxSize); // callback com info do modelo
      }, undefined, (error) => {
        console.error('Erro ao carregar modelo do aquário:', error);
      });
    }, undefined, (error) => {
      console.error('Erro ao carregar materiais do aquário:', error);
    });
  }

  addDirtOverlay() {
    const textureLoader = new THREE.TextureLoader();
    const dirtTexture = textureLoader.load('/static/assets/models/textures/dirt_overlay.png');

    const material = new THREE.MeshBasicMaterial({
      map: dirtTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const geometry = new THREE.PlaneGeometry(5, 3); // Ajustar se necessário
    const dirtMesh = new THREE.Mesh(geometry, material);
    dirtMesh.position.set(0, 1.5, -2.45); // Frente do aquário

    this.mesh.add(dirtMesh);
    this.dirtMesh = dirtMesh;
  }
}
