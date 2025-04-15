import * as THREE from '../../modules/three_rev.js';
import { OBJLoader2 } from '../../modules/OBJLoader2.js';
import { MTLLoader } from '../../modules/MTLLoader.js';

export class Fish {
  constructor(modelPath, scale = 0.2, baseSpeed = 1) {
    this.modelPath = modelPath;
    this.scale = scale;
    this.baseSpeed = baseSpeed;
    this.mesh = new THREE.Group();
    this.loaded = false;
    this.loadFish();
  }

  getAbsolutePath(relativePath) {
    return new URL(relativePath, window.location.href).href;
  }

  getModelName() {
    throw new Error('Método getModelName() deve ser implementado nas subclasses');
  }

  loadFish() {
    const modelName = this.getModelName();
    const fullMtlPath = this.getAbsolutePath(`${this.modelPath}${modelName}.mtl`);
    const fullObjPath = this.getAbsolutePath(`${this.modelPath}${modelName}.obj`);

    console.log(`Carregando peixe de: ${fullMtlPath}`);

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

        root.scale.set(this.scale, this.scale, this.scale);

        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.side = THREE.DoubleSide;
              child.material.shininess = 30;
              child.material.needsUpdate = true;
            }
          }
        });

        this.mesh.add(root);
        this.loaded = true;
        this.onFishLoaded(root);
        console.log(`Peixe ${modelName} carregado e visível!`);
      }, undefined, (error) => {
        console.error(`Erro ao carregar modelo do peixe ${modelName}:`, error);
      });
    }, undefined, (error) => {
      console.error(`Erro ao carregar materiais do peixe ${modelName}:`, error);
    });
  }

  onFishLoaded(model) {
    // Pode ser sobrescrito pelas subclasses para ajustes específicos
  }

  move() {
    throw new Error('Método move() deve ser implementado nas subclasses');
  }
}