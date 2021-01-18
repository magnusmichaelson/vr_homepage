import * as THREE from "./three.module.js";
import { VRButton } from "./VRButton.js";
import { XRControllerModelFactory } from "./XRControllerModelFactory.js";
import { XRHandModelFactory } from "./XRHandModelFactory.js";


function buildRacks() {
    var color = {};
    var countRow;
    var countRack;
    var edges;
    var geometry;
    var line;
    var material;
    var mesh;
    var height;
    var maxRow = 10;
    var maxRack = 10;
    for (countRow = 0; countRow < maxRow; countRow++){
        for (countRack = 0; countRack < maxRack; countRack++){
            height = (countRow + countRack + 2) / 5;
            height = 2;
            // @ts-ignore
            geometry = new THREE.BoxGeometry(1, 1, height);
            // @ts-ignore
            material = new THREE.MeshStandardMaterial();
            color = spectrumGreenRed(Math.random(), 1);
            material.color.setRGB(color["red"],color["green"],color["blue"]);
            // @ts-ignore
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = countRack + 0.5;
            mesh.position.y = (countRow * 2) + 0.5;
            mesh.position.z = height / 2;
            mesh.name = "rack_" + countRow + "+" + countRack;
            scene.add(mesh);
            // @ts-ignore
            edges = new THREE.EdgesGeometry(geometry);
            // @ts-ignore
            material = new THREE.LineBasicMaterial();
            material.color.setRGB(0.2, 0.2, 0.2);
            // @ts-ignore
            line = new THREE.LineSegments(edges, material);
            mesh.add(line);
        }
    }
}

function feedback(){
    var geometry;
    var mesh;
    var material;
    geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    material = new THREE.MeshStandardMaterial();
    material.color.setRGB(1,0,0);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -0.2;
    mesh.position.y = 0.1;
    mesh.position.z = -1;
    mesh.name = "feedback";
    camera.add(mesh);
    //edges = new THREE.EdgesGeometry(geometry);
    //material = new THREE.LineBasicMaterial();
    //material.color.setRGB(0.2, 0.2, 0.2);
    //line = new THREE.LineSegments(edges, material);
    //mesh.add(line);
}

/**
 * @function spectrumGreenRed
 * @description take a number and returns color data from green to red
 * @param {number} decimal - the number to be converted into color
 */
function spectrumGreenRed(numerator, denominator) {
    var color = {
        "red": 1,
        "green": 1,
        "blue": 1
    };
    var decimal;
    var saturation;
    saturation = 0.5;
    decimal = numerator / denominator;
    if (denominator == 0) {
        decimal = 1;
    }
    // green to yellow
    if (decimal < 0.5) {
        color["red"] = (1 - saturation) + (decimal / 0.5 * saturation);
        color["green"] = 1;
        color["blue"] = (1 - saturation);
    }
    // yellow to red
    if (decimal >= 0.5) {
        color["red"] = 1;
        color["green"] = (1 - saturation) + (saturation - ((decimal - 0.5) / 0.5) * saturation);
        color["blue"] = (1 - saturation);
    }
    // max or over, hard red
    if (decimal >= 1.0) {
        color = {
            "red": 1,
            "green": 0.2,
            "blue": 0.2
        };
    }
    return (color);
}



// Boilerplate
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
//renderer.setPixelRatio(2);
renderer.xr.enabled = true;
renderer.setClearColor(0xffffff);

document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  30
);
// xr camera seems to be at y = 1, setting this to match
camera.position.set(0, 1, 0);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x808080);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

// Create floor
//const floorGeometry = new THREE.PlaneBufferGeometry(4, 4);
//const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
//const floor = new THREE.Mesh(floorGeometry, floorMaterial);
//floor.rotation.x = -Math.PI / 2;
//scene.add(floor);

// add racks
buildRacks();

// Create player object
const player = new THREE.Object3D();
player.rotation.order = "ZXY";
player.rotation.x = Math.PI * 0.5;
player.rotation.z = Math.PI * -0.5;
player.position.x = -3;
player.position.y = -3;
// player position of 0.8 + 1.0 height of camera = 1.8 meter eye level
player.position.z = 0.8;
scene.add(player);

// add cube


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

// add feedback block
feedback();


// Handle window resize
const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener("resize", handleResize);

renderer.setAnimationLoop(() => {
  // Update player
  renderer.render(scene, camera);
  const session = renderer.xr.getSession();
  if (session){
      if (session.hasOwnProperty("gamepad")){

      }

  }
/*
    const handedness = session.inputSources.find(source => source.handedness);
    const axes = source.gamepad.axes.slice(0);
    
    axes.forEach((axis, index) => {
      if (index === 2 && handedness === 'left') {
        // left and right axis on left thumbstick
      }
    
      if (index === 3 && handedness === 'right') {
        // up and down axis on right thumbstick
      }
    });
    */
  //} else {
    player.position.y = (performance.now() % 20000) / 20000 * 20;

    // change color of block
    if (performance.now() % 2000 > 1000){
        scene.getObjectByName("feedback").material.color.setRGB(1,0,0);
    }
    else {
        scene.getObjectByName("feedback").material.color.setRGB(0,1,0);
    }


  //}
  
});