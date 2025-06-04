import * as THREE from '../../modules/three_rev.js';
import { Fish } from './Fish.js';

export class Fish3 extends Fish {
  constructor() {
    super('static/assets/models/fish/fish3/', 0.07, 1.4); 
    this.colorHue = 0.6 + Math.random() * 0.15;
    this.speed = 0.08 + Math.random() * 0.03;
    this.margin = 0.8;
    this.fixedZ = 0;
  }

  getModelName() {
    return 'fish3';
  }

  onFishLoaded(model) {
    model.traverse(child => {
      if (child.isMesh && child.material) {
        if (child.material.name.includes('body')) {
          child.material.color.setHSL(this.colorHue, 0.9, 0.5);
          child.material.shininess = 30;
        } else if (child.material.name.includes('fin')) {
          child.material.color.setHSL(this.colorHue + 0.1, 0.7, 0.7);
        }
      }
    });

    model.rotation.x += Math.PI / 2;
    model.rotation.y += Math.PI;
    model.scale.set(0.9, 0.9, 0.9); 
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
