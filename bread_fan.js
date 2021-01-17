import * as THREE from "three/build/three.module.js";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { XRHandModelFactory } from "three/examples/jsm/webxr/XRHandModelFactory.js";
import "./index.css";

// Boilerplate
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(2);
renderer.xr.enabled = true;

document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  10
);
camera.position.set(0, 1.6, 3);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x808080);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

// Create floor
const floorGeometry = new THREE.PlaneBufferGeometry(4, 4);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Create player object
const player = new THREE.Object3D();
scene.add(player);

// Add controllers
const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);

// Create controller and hand models
const controllerModelFactory = new XRControllerModelFactory();
const handModelFactory = new XRHandModelFactory();

// Add Joysticks
const controllerGrip1 = renderer.xr.getControllerGrip(0);
controllerGrip1.add(
  controllerModelFactory.createControllerModel(controllerGrip1)
);

const controllerGrip2 = renderer.xr.getControllerGrip(1);
controllerGrip2.add(
  controllerModelFactory.createControllerModel(controllerGrip2)
);

// Add Hands
const hand1 = renderer.xr.getHand(0);
hand1.add(handModelFactory.createHandModel(hand1));

const hand2 = renderer.xr.getHand(1);
hand2.add(handModelFactory.createHandModel(hand2));

// Add player objects
const playerObjects = [
  camera,
  controller1,
  controller2,
  controllerGrip1,
  controllerGrip2,
  hand1,
  hand2
];

playerObjects.forEach((object) => player.add(object));

// Handle window resize
const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener("resize", handleResize);

renderer.setAnimationLoop(() => {
  // Update player
  player.rotation.y += 0.01;

  renderer.render(scene, camera);
});