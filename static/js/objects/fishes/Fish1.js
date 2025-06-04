import * as THREE from '../../modules/three_rev.js';
import { Fish } from './Fish.js';

export class Fish1 extends Fish {
  constructor() {
    super('static/assets/models/fish/fish1/', 0.05, 1.8);
    this.colorHue = 0.1 + Math.random() * 0.15;
    this.speed = 0.1 + Math.random() * 0.05;
    this.margin = 0.8;
    this.fixedZ = 0; 
  }

  getModelName() {
    return 'fish1';
  }

  onFishLoaded(model) {
    model.traverse(child => {
      if (child.isMesh && child.material) {
        if (child.material.name.includes('body')) {
          child.material.color.setHSL(this.colorHue, 0.9, 0.5);
          child.material.shininess = 50;
        } else if (child.material.name.includes('fin')) {
          child.material.color.setHSL(this.colorHue + 0.1, 0.7, 0.7);
        }
      }
    });

    model.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
    model.scale.set(0.1, 0.1, 0.1);
  }

  setBoundingBox(box) {
    this.boundingBox = box;

    const minZ = box.min.z + this.margin;
    const maxZ = box.max.z - this.margin;
    this.fixedZ = (minZ + maxZ) / 2;

    const initialX = THREE.MathUtils.randFloat(box.min.x + this.margin, box.max.x - this.margin);
    const initialY = THREE.MathUtils.randFloat(box.min.y + this.margin, box.max.y - this.margin);
    this.mesh.position.set(initialX, initialY, this.fixedZ);

    this.setNewTarget();
  }
}
