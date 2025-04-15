// Fish3.js
import * as THREE from '../../modules/three_rev.js';
import { OBJLoader2 } from '../../modules/OBJLoader2.js';
import { MTLLoader } from '../../modules/MTLLoader.js';
import { Fish } from './Fish.js';

export class Fish3 extends Fish {
  constructor() {
    super('static/assets/models/fish/fish3/', 0.7, 1.9);
    this.verticalDrift = 0.2 + Math.random() * 0.2;
    this.horizontalSwing = 0.4 + Math.random() * 0.4;
    this.phase = Math.random() * Math.PI * 2;
  }

  getModelName() {
    return 'fish3';
  }

  onFishLoaded(model) {
    model.traverse(child => {
      if (child.isMesh) {
        child.material.color.setHSL(0.05, 0.8, 0.3);
      }
    });
  }

  move() {
    this.phase += 0.008 * this.baseSpeed;

    this.mesh.position.x = 1.5 * Math.sin(this.phase);
    this.mesh.position.y = -0.5 + this.verticalDrift * Math.sin(this.phase * 1.5);
    this.mesh.position.z += 0.01 * Math.cos(this.phase);

    this.mesh.rotation.y = Math.sin(this.phase * 2) * 0.3;
    this.mesh.rotation.z = Math.cos(this.phase * 1.5) * 0.1;
  }
}