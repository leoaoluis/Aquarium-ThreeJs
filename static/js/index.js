import * as THREE from '../../static/js/modules/three_rev.js';
import { OrbitControls } from './modules/OrbitControls.js';
import { Aquarium } from './objects/aquarium/Aquarium.js';
import { Fishes } from './objects/fishes/Fishes.js';

// 1. Configuração básica da cena
const scene = new THREE.Scene();
scene.background = new THREE.Color('#87CEFA');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
  antialias: true, 
  canvas: document.getElementById('gl-canvas') 
});
renderer.setSize(window.innerWidth, window.innerHeight);

// 2. Controles da câmera
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.7;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.5;
controls.minDistance = 5;
controls.maxDistance = 50;

// 3. Iluminação básica
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);
scene.add(new THREE.AmbientLight(0x404040));

// 4. Criação do aquário e peixes
const aquarium = new Aquarium((boxCenter, boxSize) => {
  // Executado depois do aquário estar carregado

  // Adiciona à cena só depois de carregado
  scene.add(aquarium.mesh);

  // Calcula o centro do modelo
  camera.position.set(
  boxCenter.x + boxSize * 4,
  boxCenter.y + boxSize * 2,
  boxCenter.z + boxSize * 6
  );

  camera.lookAt(boxCenter);
  controls.target.copy(boxCenter);
  controls.update();
});

const fishes = new Fishes(scene);


// 5. Sistema de sujidade simplificado
let dirtLevel = 0;
const updateWaterStatus = () => {
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = `Sujidade: ${dirtLevel}%`;
  }

  // Atualiza opacidade da sujidade visual no aquário
  if (aquarium.dirtMesh) {
    aquarium.dirtMesh.material.opacity = dirtLevel / 100;
  }
};

setInterval(() => {
  dirtLevel = Math.min(100, dirtLevel + 1);
  updateWaterStatus();
}, 100);

// 6. Controles UI básicos
document.getElementById('cleanBtn')?.addEventListener('click', () => {
  dirtLevel = 0;
  updateWaterStatus();
});

// 7. Loop de animação
function animate() {
  requestAnimationFrame(animate);
  fishes.animate(); // usa fishes.animate() conforme tua estrutura
  controls.update();
  renderer.render(scene, camera);
}
animate();

// 8. Responsividade
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
