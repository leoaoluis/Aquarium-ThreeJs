import * as THREE from '../../static/js/modules/three_rev.js';
import { OrbitControls } from './modules/OrbitControls.js';
import { Aquarium } from './objects/aquarium/Aquarium.js';
import { Fishes } from './objects/fishes/Fishes.js';
import { FirstPersonControls } from './modules/obj2/FirstPersonControls.js';
import { Accessories } from './objects/accessories.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#87CEFA');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
  antialias: true, 
  canvas: document.getElementById('gl-canvas') 
});
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.7;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.5;
controls.minDistance = 5;
controls.maxDistance = 100;

const directionalLight = new THREE.DirectionalLight(0xfffbe0, 0.35);
directionalLight.position.set(-30, 50, 30);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(2048, 2048);
directionalLight.shadow.radius = 4;
directionalLight.shadow.bias = -0.003;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 150;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xfff2e5, 0.8);
scene.add(ambientLight);

const fishLight = new THREE.PointLight(0xffffff, 0.1, 10);
fishLight.position.set(0, 10, 0);
scene.add(fishLight);

const spot = new THREE.SpotLight(0xffefd5, 0.2);
spot.position.set(0, 80, 0);
spot.angle = Math.PI / 4;
spot.penumbra = 0.5;
scene.add(spot);

let fpControls;
let mode = 'creative';
let boundingBox = null;
let roomBoundingBox = null;
let fishViewFlag = 0;
const clock = new THREE.Clock();
const initialCameraPosition = new THREE.Vector3();

const pauseMenu = document.getElementById('pauseMenu');

window.addEventListener('DOMContentLoaded', () => {
  // Corrigido toggle do menu peixes
  const toggleBtn = document.getElementById('toggleFishMenu');
  const fishMenu = document.getElementById('fishMenu');

  if (toggleBtn && fishMenu) {
    toggleBtn.addEventListener('click', () => {
      if (fishMenu.classList.contains('collapsed')) {
        fishMenu.classList.remove('collapsed');
        toggleBtn.textContent = 'Peixes ▲';
      } else {
        fishMenu.classList.add('collapsed');
        toggleBtn.textContent = 'Peixes ▼';
      }
    });
  }
});

const aquarium = new Aquarium((boxCenter, boxSize, passedBoundingBox) => {
  scene.add(aquarium.mesh);

  camera.position.set(boxCenter.x, boxCenter.y + boxSize, boxCenter.z + boxSize * 15);
  initialCameraPosition.copy(camera.position);
  camera.lookAt(boxCenter);
  controls.target.copy(boxCenter);
  controls.update();

  boundingBox = passedBoundingBox;

  roomBoundingBox = new THREE.Box3(
    new THREE.Vector3(-100, 0, -30),
    new THREE.Vector3(100, 125, 120)
  );

  fpControls = new FirstPersonControls(camera, renderer.domElement);
  fpControls.enabled = false;

  window.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') {
      mode = 'fish';
      fpControls.enabled = true;
      controls.enabled = false;
      fishViewFlag = 0;
      fpControls.movementSpeed = 10;
      fpControls.lookSpeed = 0.05;
      fpControls.lookVertical = true;
      fpControls.constrainVertical = true;
      fpControls.verticalMin = 1.0;
      fpControls.verticalMax = 2.0;
    } else if (e.key === 't' || e.key === 'T') {
      mode = 'creative';
      fpControls.enabled = false;
      controls.enabled = true;
      fishViewFlag = 0;
      camera.position.copy(initialCameraPosition);
      camera.lookAt(controls.target);
      controls.target.copy(boxCenter);
      controls.update();
    } else if (e.key === 'Escape') {
      if (pauseMenu) pauseMenu.style.display = 'flex';
    }
  });

  const fishes = new Fishes(scene);
  fishes.setBoundingBox(boundingBox);

  // Novos elementos de áudio
  const press1Sound = document.getElementById('press1Sound');
  const press2Sound = document.getElementById('press2Sound');

  // Liga os botões do menu de peixes para controlar o aquário
  const fishMenuList = document.getElementById('fishList');
  fishMenuList.querySelectorAll('.fishItem').forEach(item => {
    const fishType = item.getAttribute('data-fishtype');

    const plusBtn = item.querySelector('.fishPlus');
    const minusBtn = item.querySelector('.fishMinus');
    const countSpan = item.querySelector('.fishCount');

    plusBtn.addEventListener('click', () => {
      fishes.addFish(fishType);
      updateFishCount(fishType);
      if (press1Sound) {
        press1Sound.currentTime = 0;
        press1Sound.play();
      }
    });

    minusBtn.addEventListener('click', () => {
      fishes.removeFish(fishType);
      updateFishCount(fishType);
      if (press2Sound) {
        press2Sound.currentTime = 0;
        press2Sound.play();
      }
    });

    // Atualiza visualmente a contagem de peixes naquele tipo no menu
    function updateFishCount(fishTypeStr) {
      const count = fishes.fishes.filter(f => {
        if (fishTypeStr === 'Fish1') return f instanceof fishes.fishTypes[0];
        if (fishTypeStr === 'Fish2') return f instanceof fishes.fishTypes[1];
        if (fishTypeStr === 'Fish3') return f instanceof fishes.fishTypes[2];
        return false;
      }).length;

      countSpan.textContent = count;
    }

    // Inicializa contagem no menu
    updateFishCount(fishType);
  });

  let dirtLevel = 0;
  let hungerLevel = 0;

  const updateStatusDisplay = () => {
    const dirtText = document.getElementById('dirtStatus');
    const hungerText = document.getElementById('hungerStatus');
    const fishState = document.getElementById('fishState');

    if (dirtText) dirtText.textContent = `${dirtLevel}%`;
    if (hungerText) hungerText.textContent = `${hungerLevel}%`;
    if (fishState) fishState.textContent = hungerLevel >= 100 ? 'Parados' : 'Ativos';

    if (aquarium.dirtTarget) {
      const opacity = 0.15 + (dirtLevel / 100) * 0.3;
      const cleanColor = new THREE.Color(0.1, 0.2, 0.7);
      const dirtyColor = new THREE.Color(0.63, 0.61, 0.27);
      aquarium.dirtTarget.opacity = opacity;
      aquarium.dirtTarget.color.copy(cleanColor.clone().lerp(dirtyColor, dirtLevel / 100));
      aquarium.dirtTarget.needsUpdate = true;
    }
  };

  setInterval(() => {
    dirtLevel = Math.min(100, dirtLevel + 1);
    updateStatusDisplay();
  }, 500);

  setInterval(() => {
    hungerLevel = Math.min(100, hungerLevel + 1);
    updateStatusDisplay();
  }, 100);

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

  const feedBtn = document.getElementById('feedBtn');
  if (feedBtn) {
    feedBtn.addEventListener('click', () => {
      fishes.feedAll();
      hungerLevel = 0;
      updateStatusDisplay();
    });
  }

  const fpViewBtn = document.getElementById('fpViewBtn');
  const tpViewBtn = document.getElementById('tpViewBtn');

  if (fpViewBtn) {
    fpViewBtn.addEventListener('click', () => {
      const fKey = new KeyboardEvent('keydown', { key: 'f' });
      window.dispatchEvent(fKey);
    });
  }

  if (tpViewBtn) {
    tpViewBtn.addEventListener('click', () => {
      const tKey = new KeyboardEvent('keydown', { key: 't' });
      window.dispatchEvent(tKey);
    });
  }

  const continueBtn = document.getElementById('continueBtn');
  const mainMenuBtn = document.getElementById('mainMenuBtn');
  const aboutBtn = document.getElementById('aboutBtn');

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      pauseMenu.style.display = 'none';
    });
  }

  if (mainMenuBtn) {
    mainMenuBtn.addEventListener('click', () => {
      window.location.href = './menu.html';
    });
  }

  if (aboutBtn) {
    aboutBtn.addEventListener('click', () => {
      window.location.href = './about.html';
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    const hungerFactor = Math.pow(1 - hungerLevel / 100, 2);
    fishes.animate(hungerFactor);

    const delta = clock.getDelta();

    if (fpControls.enabled) {
      fpControls.update(delta);
      const pos = camera.position;

      const currentBoundingBox = boundingBox;
      if (currentBoundingBox) {
        pos.x = THREE.MathUtils.clamp(pos.x, currentBoundingBox.min.x, currentBoundingBox.max.x);
        pos.y = THREE.MathUtils.clamp(pos.y, currentBoundingBox.min.y, currentBoundingBox.max.y);
        pos.z = THREE.MathUtils.clamp(pos.z, currentBoundingBox.min.z, currentBoundingBox.max.z);
      }
    } else {
      controls.update();
      const pos = camera.position;
      if (roomBoundingBox) {
        pos.x = THREE.MathUtils.clamp(pos.x, roomBoundingBox.min.x, roomBoundingBox.max.x);
        pos.y = THREE.MathUtils.clamp(pos.y, roomBoundingBox.min.y, roomBoundingBox.max.y);
        pos.z = THREE.MathUtils.clamp(pos.z, roomBoundingBox.min.z, roomBoundingBox.max.z);
      }
    }

    renderer.render(scene, camera);
  }
  animate();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

new Accessories(scene);
