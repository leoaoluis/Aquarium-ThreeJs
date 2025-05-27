import * as THREE from '../../modules/three_rev.js';
import { OBJLoader2 } from '../../modules/OBJLoader2.js';
import { MTLLoader } from '../../modules/MTLLoader.js';

export class Aquarium {
  constructor(onLoadedCallback) {
    this.mesh = new THREE.Group();
    this.onLoaded = onLoadedCallback;
    this.dirtTarget = null;
    this.boundingBox = null;
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

        root.rotation.set(Math.PI * -0.5, 0, 0);
        root.scale.set(1.5, 1.5, 1.5);
        root.position.set(0, 0, 0);

        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.side = THREE.DoubleSide;
              const matName = child.material.name?.toLowerCase() || '';
              if (!this.dirtTarget && (matName.includes('glass') || matName.includes('vidro'))) {
                this.dirtTarget = child.material;
                this.dirtTarget.transparent = true;
                this.dirtTarget.opacity = 0.35;
                this.dirtTarget.color.setRGB(0.1, 0.2, 0.7);
              }
            }
          }
        });

        this.mesh.add(root);

        // Caixa manual para interior aquário
        const center = new THREE.Vector3(0, 14, 0);
        const halfSize = new THREE.Vector3(23, 10.5, 8);
        this.boundingBox = new THREE.Box3().setFromCenterAndSize(center, halfSize.multiplyScalar(2));
        console.log('BoundingBox manual definida:', this.boundingBox.min, this.boundingBox.max);

        const boxSize = this.boundingBox.getSize(new THREE.Vector3()).length();
        const boxCenter = this.boundingBox.getCenter(new THREE.Vector3());

        if (this.onLoaded) this.onLoaded(boxCenter, boxSize, this.boundingBox);

        // Som limpeza
        const cleanAudio = document.getElementById('clean');
        const cleanBtn = document.getElementById('cleanBtn');
        if (cleanBtn && cleanAudio) {
          cleanBtn.addEventListener('click', () => {
            cleanAudio.currentTime = 0;
            cleanAudio.play().catch(e => console.warn('Som de limpeza falhou:', e));
          });
        }
      }, undefined, (error) => {
        console.error('Erro ao carregar modelo do aquário:', error);
      });
    }, undefined, (error) => {
      console.error('Erro ao carregar materiais do aquário:', error);
    });
  }
}
