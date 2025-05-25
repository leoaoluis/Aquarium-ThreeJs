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

    this.targetPosition = new THREE.Vector3();
    this.speedFactor = 0.02 + Math.random() * 0.015;
    this.margin = 3;
    this.velocity = new THREE.Vector3();
    this.setNewTarget();

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

        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        root.position.sub(center);

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
      }, undefined, (error) => {
        console.error(`Erro ao carregar modelo do peixe ${modelName}:`, error);
      });
    }, undefined, (error) => {
      console.error(`Erro ao carregar materiais do peixe ${modelName}:`, error);
    });
  }

  onFishLoaded(model) {}

  setBoundingBox(box) {
    this.boundingBox = box;
    this.setNewTarget();
  }

  setNewTarget() {
    if (!this.boundingBox) return;

    const min = this.boundingBox.min;
    const max = this.boundingBox.max;

    let attempt = 0;
    const maxAttempts = 10;
    let newTarget;

    do {
      const x = THREE.MathUtils.randFloat(min.x + this.margin, max.x - this.margin);
      const y = THREE.MathUtils.randFloat(min.y + this.margin, max.y - this.margin);
      const z = THREE.MathUtils.randFloat(min.z + this.margin, max.z - this.margin);
      newTarget = new THREE.Vector3(x, y, z);
      attempt++;
    } while (
      this.targetPosition &&
      newTarget.distanceTo(this.mesh.position) < 10 &&
      attempt < maxAttempts
    );

    this.targetPosition = newTarget;

    setTimeout(() => this.setNewTarget(), 7000 + Math.random() * 5000);
  }

  move(hungerFactor = 1) {
    if (!this.mesh || !this.targetPosition) return;

    const direction = new THREE.Vector3().subVectors(this.targetPosition, this.mesh.position);
    const distance = direction.length();

    if (distance < 0.2) {
      this.setNewTarget();
      return;
    }

    direction.normalize();

    // ✅ Aplica fator de fome ao movimento
    const adjustedSpeed = this.speedFactor * 2 * hungerFactor;
    this.velocity.lerp(direction.multiplyScalar(adjustedSpeed), 0.05);
    this.mesh.position.add(this.velocity);

    // ✅ Rotação horizontal (Y) apenas se mudar de direção no eixo X
    const flatVelocity = this.velocity.clone();
    flatVelocity.y = 0;

    if (Math.abs(flatVelocity.x) > 0.01) {
      const angleY = Math.atan2(flatVelocity.x, flatVelocity.z);

      if (this.currentRotationY === undefined) {
        this.currentRotationY = angleY;
      }

      const delta = angleY - this.currentRotationY;
      if (Math.abs(delta) > 0.01) {
        this.currentRotationY += delta * 0.1;
      }

      this.mesh.rotation.set(0, this.currentRotationY, 0);
    }

    // ✅ Limitar à bounding box
    if (this.boundingBox) {
      const pos = this.mesh.position;
      pos.x = THREE.MathUtils.clamp(pos.x, this.boundingBox.min.x + this.margin, this.boundingBox.max.x - this.margin);
      pos.y = THREE.MathUtils.clamp(pos.y, this.boundingBox.min.y + this.margin, this.boundingBox.max.y - this.margin);
      pos.z = THREE.MathUtils.clamp(pos.z, this.boundingBox.min.z + this.margin, this.boundingBox.max.z - this.margin);
    }
  }
}
