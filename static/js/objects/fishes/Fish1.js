import * as THREE from '../../modules/three_rev.js';
import { Fish } from './Fish.js';

export class Fish1 extends Fish {
  constructor() {
    super('static/assets/models/fish/fish1/', 0.05, 1.8);
    this.colorHue = 0.1 + Math.random() * 0.15;
    this.waveIntensity = 0.5 + Math.random();
    this.phase = Math.random() * Math.PI * 2;
  }

  getModelName() {
    return 'fish1';
  }

  onFishLoaded(model) {
    model.traverse(child => {
      if (child.isMesh) {
        if (child.material.name.includes('body')) {
          child.material.color.setHSL(this.colorHue, 0.9, 0.5);
          child.material.shininess = 50;
        } else if (child.material.name.includes('fin')) {
          child.material.color.setHSL(this.colorHue + 0.1, 0.7, 0.7);
        }
      }
    });
  }

  move() {
    this.phase += 0.012 * this.baseSpeed;

    this.mesh.position.x = 2.5 * Math.sin(this.phase * 0.7);
    this.mesh.position.z = 1.8 * Math.sin(this.phase * 1.3);
    this.mesh.position.y = 0.4 * Math.sin(this.phase * 2.5) * this.waveIntensity;

    this.mesh.rotation.y = Math.atan2(
      this.mesh.position.z,
      this.mesh.position.x
    ) - Math.PI / 2;

    this.mesh.rotation.z = 0.15 * Math.sin(this.phase * 3);
  }
}
