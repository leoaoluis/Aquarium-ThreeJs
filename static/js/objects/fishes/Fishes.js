import * as THREE from '../../modules/three_rev.js';
import { Fish1 } from './Fish1.js';
import { Fish2 } from './Fish2.js';
import { Fish3 } from './Fish3.js';

export class Fishes {
  constructor(scene) {
    this.scene = scene;
    this.fishes = [];
    this.init();
  }

  init() {
    // Cria 5-6 de cada tipo de peixe
    this.createFishGroup(Fish1, 2);  // Peixes tropicais (Fish1)
    this.createFishGroup(Fish2, 3);  // Peixes listrados (Fish2)
    this.createFishGroup(Fish3, 1);  // Peixes profundos (Fish3)
  }

  createFishGroup(FishType, count) {
    for (let i = 0; i < count; i++) {
      const fish = new FishType();

      // Posição inicial dentro de um cubo visível
      fish.mesh.position.set(
        (Math.random() - 0.5) * 3,  // X: -1.5 a 1.5
        (Math.random() - 0.5) * 2,  // Y: -1 a 1
        (Math.random() - 0.5) * 3   // Z: -1.5 a 1.5
      );

      this.scene.add(fish.mesh);
      this.fishes.push(fish);
    }
  }

  animate() {
    this.fishes.forEach(fish => {
      fish.move();
      this.keepInTank(fish.mesh);
    });
  }

  keepInTank(mesh) {
    // Limites esféricos simples
    const center = new THREE.Vector3(0, 6, -5);
    const maxDistance = 5;

    if (mesh.position.distanceTo(center) > maxDistance) {
      const direction = mesh.position.clone().sub(center).normalize();
      mesh.position.copy(center).add(direction.multiplyScalar(maxDistance * 0.9));
    }
  }
}
