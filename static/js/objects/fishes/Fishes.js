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

    this.fishTypes = [Fish1, Fish2, Fish3];

    // Quantidade total de peixes entre 6 e 15
    const totalFishes = Math.floor(Math.random() * 10) + 6;

    // Primeiro adiciona 2 de cada tipo
    this.fishTypes.forEach(FishType => {
      for (let i = 0; i < 2; i++) {
        this._addFishInternal(FishType);
      }
    });

    // Completa até totalFishes com peixes aleatórios
    const remaining = totalFishes - this.fishes.length;
    for (let i = 0; i < remaining; i++) {
      const FishType = this.fishTypes[Math.floor(Math.random() * this.fishTypes.length)];
      this._addFishInternal(FishType);
    }
  }

  _addFishInternal(FishType) {
    const fish = new FishType();
    if (this.boundingBox && typeof fish.setBoundingBox === 'function') {
      fish.setBoundingBox(this.boundingBox);
    }
    this.scene.add(fish.mesh);
    this.fishes.push(fish);
    return fish;
  }

  // Adiciona peixe do tipo fishType (string 'Fish1', 'Fish2' ou 'Fish3')
  addFish(fishTypeStr) {
    const FishType = this._getFishClassByName(fishTypeStr);
    if (!FishType) return;

    // Limite máximo de peixes no aquário (20)
    if (this.fishes.length >= 20) return;

    this._addFishInternal(FishType);
  }

  // Remove um peixe do tipo fishTypeStr, o último adicionado desse tipo
  removeFish(fishTypeStr) {
    const FishType = this._getFishClassByName(fishTypeStr);
    if (!FishType) return;

    // Não deixa ter menos de 1 peixe desse tipo
    const fishesOfType = this.fishes.filter(f => f instanceof FishType);
    if (fishesOfType.length <= 1) return;

    // Remove o último peixe desse tipo da cena e do array
    const fishToRemove = fishesOfType[fishesOfType.length - 1];
    this.scene.remove(fishToRemove.mesh);
    this.fishes.splice(this.fishes.indexOf(fishToRemove), 1);
  }

  _getFishClassByName(name) {
    switch(name) {
      case 'Fish1': return Fish1;
      case 'Fish2': return Fish2;
      case 'Fish3': return Fish3;
      default: return null;
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
      label.textContent = ` ${Math.round(this.hungerLevel)}%`;
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
