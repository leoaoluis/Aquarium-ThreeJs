import { Fish1 } from './Fish1.js';
import { Fish2 } from './Fish2.js';
import { Fish3 } from './Fish3.js';
import * as THREE from '../../modules/three_rev.js';

export class Fishes {
  constructor(scene, boundingBox = null) {
    this.scene = scene;
    this.fishes = [];
    this.boundingBox = boundingBox;

    this.hungerLevel = 0;
    this.lastUpdate = Date.now();
    this.boostUntil = 0;

    this.createFishGroup(Fish1, 2);
    this.createFishGroup(Fish2, 2);
    this.createFishGroup(Fish3, 2);
  }

  createFishGroup(FishType, count) {
    for (let i = 0; i < count; i++) {
      const fish = new FishType();
      if (this.boundingBox && typeof fish.setBoundingBox === 'function') {
        fish.setBoundingBox(this.boundingBox);
      }
      this.scene.add(fish.mesh);
      this.fishes.push(fish);
    }
  }

  setBoundingBox(box) {
    this.boundingBox = box;
    this.fishes.forEach(fish => {
      if (typeof fish.setBoundingBox === 'function') {
        fish.setBoundingBox(box);
      }
    });
  }

  feedAll() {
    this.hungerLevel = 0;
    this.lastUpdate = Date.now();
    this.updateHungerUI();

    this.boostUntil = Date.now() + 5000;

    // 🔊 Tocar som
    const audio = document.getElementById('feedSound');
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }

    // ✨ Efeito visual de comida
    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.SphereGeometry(0.2, 12, 12);
      const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const particle = new THREE.Mesh(geometry, material);

      particle.position.set(
        Math.random() * 8 - 4,
        25,
        Math.random() * 8 - 4
      );
      this.scene.add(particle);

      const fallSpeed = 0.02 + Math.random() * 0.02;
      const duration = 100 + Math.random() * 100;
      let frame = 0;

      const drop = () => {
        if (frame < duration) {
          particle.position.y -= fallSpeed;
          frame++;
          requestAnimationFrame(drop);
        } else {
          this.scene.remove(particle);
        }
      };
      drop();
    }
  }

  updateHunger() {
    const now = Date.now();
    const delta = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    this.hungerLevel = Math.min(100, this.hungerLevel + delta * 1.5);
    this.updateHungerUI();
  }

  updateHungerUI() {
    const label = document.getElementById('hungerStatus');
    const fishState = document.getElementById('fishState');

    if (label) {
      label.textContent = `Fome: ${Math.round(this.hungerLevel)}%`;
    }

    if (fishState) {
      fishState.textContent = this.hungerLevel >= 100 ? 'Parados' : 'Ativos';
    }
  }

  animate() {
    this.updateHunger();

    const now = Date.now();
    let hungerFactor = 1 - Math.pow(this.hungerLevel / 100, 2);
    if (now < this.boostUntil) {
      hungerFactor = 1.5;
    }

    this.fishes.forEach(fish => {
      if (typeof fish.move === 'function') {
        fish.move(hungerFactor);
      }
    });
  }

  getFishStatus() {
    return this.hungerLevel >= 100 ? 'Parados' : 'Ativos';
  }
}
