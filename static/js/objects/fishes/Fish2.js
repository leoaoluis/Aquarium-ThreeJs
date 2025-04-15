import * as THREE from '../../modules/three_rev.js';
import { OBJLoader2 } from '../../modules/OBJLoader2.js';
import { MTLLoader } from '../../modules/MTLLoader.js';

import { Fish } from './Fish.js';

export class Fish2 extends Fish {
  constructor() {
    super('static/assets/models/fish/fish2/', 0.4, 2.0);
    this.colorHue = 0.6 + Math.random() * 0.1;
    this.amplitude = 0.5 + Math.random() * 0.5;
    this.phase = Math.random() * Math.PI * 2;
  }

  getModelName() {
    return 'fish2';
  }

  onFishLoaded(model) {
    model.traverse(child => {
      if (child.isMesh) {
        child.material.color.setHSL(this.colorHue, 0.7, 0.5);
      }
    });
  }

  move() {
    this.phase += 0.01 * this.baseSpeed;

    this.mesh.position.x = 2 * Math.cos(this.phase * 0.8);
    this.mesh.position.z = 2 * Math.sin(this.phase * 0.8);
    this.mesh.position.y = 0.3 * Math.sin(this.phase * 3) * this.amplitude;

    this.mesh.rotation.y = Math.atan2(
      this.mesh.position.z,
      this.mesh.position.x
    ) + Math.PI / 2;
  }
}
