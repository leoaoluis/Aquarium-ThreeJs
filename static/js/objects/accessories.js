import * as THREE from '../modules/three_rev.js';
import { MTLLoader } from '../modules/MTLLoader.js';
import { OBJLoader2 } from '../modules/OBJLoader2.js';
import { MtlObjBridge } from '../modules/obj2/bridge/MtlObjBridge.js';

export class Accessories {
  constructor(scene) {
    this.scene = scene;
    this.loadTable();
    this.loadPainting();
    this.createRoom(); // ✅ Adiciona as paredes, chão e teto
  }

  loadModel(objPath, mtlPath, position, scale = 1, rotation = null) {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(mtlPath, (mtlParseResult) => {
      const materials = MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
      const objLoader = new OBJLoader2();
      objLoader.addMaterials(materials);

      objLoader.load(objPath, (event) => {
        const root = event.detail?.loaderRootNode || event;

        root.position.copy(position);
        root.scale.set(scale, scale, scale);
        if (rotation) {
          root.rotation.set(...rotation);
        }

        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.side = THREE.DoubleSide;
          }
        });

        this.scene.add(root);
      });
    });
  }

  loadTable() {
    const base = '/static/assets/models/table/';
    const obj = `${base}table.obj`;
    const mtl = `${base}table.mtl`;
    const position = new THREE.Vector3(0, -13.1, 0);
    const rotation = [0, Math.PI / 2, 0];
    this.loadModel(obj, mtl, position, 0.25, rotation);
  }

  loadPainting() {
    const base = '/static/assets/models/paint/';
    const obj = `${base}PM.obj`;
    const mtl = `${base}PM.mtl`;
    const position = new THREE.Vector3(20, 60, -29.3);
    const rotation = [0, Math.PI / -2, 0];
    this.loadModel(obj, mtl, position, 80, rotation);
  }

  createRoom() {
    const loader = new THREE.TextureLoader();

    // 🧱 Textura para as paredes laterais
    const wallTexture = loader.load('/static/assets/textures/stone_tiles_diff_4k.jpg');
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2, 2); // ajusta consoante o tamanho da parede

    const wallSideMaterial = new THREE.MeshStandardMaterial({
      map: wallTexture,
      roughness: 1
    });

    // 🪵 Textura para o chão
    const floorTexture = loader.load('/static/assets/textures/wood_floor_diff_4k.jpg');
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4); // repete mais no chão

    const floorMaterial = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 1
    });

    // 🔹 Materiais lisos para as outras superfícies
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xcceeff });
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xe0e0e0 });

    // 📐 Dimensões da sala
    const width = 200;
    const height = 125;
    const depth = 150;
    const thickness = 1;
    const offset = new THREE.Vector3(0, -24.7, 45); // centro ajustado

    // 🧱 Chão
    const floor = new THREE.Mesh(new THREE.BoxGeometry(width, thickness, depth), floorMaterial);
    floor.position.set(offset.x, offset.y - thickness / 2, offset.z);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 🔲 Teto
    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(width, thickness, depth), wallSideMaterial);
    ceiling.position.set(offset.x, offset.y + height, offset.z);
    this.scene.add(ceiling);

    // 🔲 Parede de trás
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, height, thickness), wallSideMaterial);
    backWall.position.set(offset.x, offset.y + height / 2, offset.z - depth / 2);
    this.scene.add(backWall);

    // 🔲 Parede da frente
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(width, height, thickness), wallSideMaterial);

    frontWall.position.set(offset.x, offset.y + height / 2, offset.z + depth / 2);
    this.scene.add(frontWall);

    // 🧱 Parede esquerda (com textura)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, depth), wallSideMaterial);
    leftWall.position.set(offset.x - width / 2, offset.y + height / 2, offset.z);
    this.scene.add(leftWall);

    // 🧱 Parede direita (com textura)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, depth), wallSideMaterial);
    rightWall.position.set(offset.x + width / 2, offset.y + height / 2, offset.z);
    this.scene.add(rightWall);
  }

}
