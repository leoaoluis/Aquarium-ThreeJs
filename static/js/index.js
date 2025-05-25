import * as THREE from '../../static/js/modules/three_rev.js';
import { OrbitControls } from './modules/OrbitControls.js';
import { Aquarium } from './objects/aquarium/Aquarium.js';
import { Fishes } from './objects/fishes/Fishes.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#87CEFA');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
  antialias: true, 
  canvas: document.getElementById('gl-canvas') 
});
renderer.setSize(window.innerWidth, window.innerHeight);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.7;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.5;
controls.minDistance = 5;
controls.maxDistance = 50;

// Luzes
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);
scene.add(new THREE.AmbientLight(0x404040));

// Aquário
const aquarium = new Aquarium((boxCenter, boxSize, boundingBox) => {
  scene.add(aquarium.mesh);

  camera.position.set(boxCenter.x, boxCenter.y + boxSize, boxCenter.z + boxSize * 10);
  camera.lookAt(boxCenter);
  controls.target.copy(boxCenter);
  controls.update();

  const fishes = new Fishes(scene);
  fishes.setBoundingBox(boundingBox);

  let dirtLevel = 0;
  let hungerLevel = 0;

  const updateStatusDisplay = () => {
    const dirtText = document.getElementById('dirtStatus');
    const hungerText = document.getElementById('hungerStatus');
    const fishState = document.getElementById('fishState');

    if (dirtText) dirtText.textContent = `${dirtLevel}%`;
    if (hungerText) hungerText.textContent = `${hungerLevel}%`;
    if (fishState) fishState.textContent = hungerLevel >= 100 ? 'Parados' : 'Ativos';

    // Atualizar visuais da água
    if (aquarium.dirtTarget) {
      const opacity = 0.15 + (dirtLevel / 100) * 0.3;
      const cleanColor = new THREE.Color(0.1, 0.2, 0.7);
      const dirtyColor = new THREE.Color(0.63, 0.61, 0.27);
      aquarium.dirtTarget.opacity = opacity;
      aquarium.dirtTarget.color.copy(cleanColor.clone().lerp(dirtyColor, dirtLevel / 100));
      aquarium.dirtTarget.needsUpdate = true;
    }

  };

  // Dirt: cresce lentamente
  setInterval(() => {
    dirtLevel = Math.min(100, dirtLevel + 1);
    updateStatusDisplay();
  }, 500); // + devagar

  // Fome: cresce rapidamente
  setInterval(() => {
    hungerLevel = Math.min(100, hungerLevel + 1);
    updateStatusDisplay();
  }, 100); // + rápido

  // Botão limpar
  const cleanBtn = document.getElementById('cleanBtn');
  if (cleanBtn) {
    cleanBtn.addEventListener('click', () => {
      let fade = setInterval(() => {
        if (dirtLevel <= 0) {
          clearInterval(fade);
        } else {
          dirtLevel = Math.max(0, dirtLevel - 5);
          updateStatusDisplay();
        }
      }, 50);
    });
  }

  // Botão alimentar
  const feedBtn = document.getElementById('feedBtn');
  if (feedBtn) {
    feedBtn.addEventListener('click', () => {
      fishes.feedAll();
      updateFishStatus(); // atualiza o estado após alimentar
    });
  }

  function updateFishStatus() {
    const fishStateSpan = document.getElementById('fishState');
    if (fishStateSpan) {
      fishStateSpan.textContent = fishes.getFishStatus();
    }
  }

  // Loop
  function animate() {
    requestAnimationFrame(animate);
    const hungerFactor = Math.pow(1 - hungerLevel / 100, 2);
    fishes.animate(hungerFactor);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
});

// Responsividade
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
