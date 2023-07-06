import { Player } from "./Player.js";



const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
const scene = new BABYLON.Scene(engine);

const camera = new BABYLON.ArcRotateCamera("camera1", Math.PI/2, 2.1, -24, new BABYLON.Vector3(0,0,0),scene);
camera.setPosition(new BABYLON.Vector3(0, 60, -100));
camera.setTarget(new BABYLON.Vector3(0, 0, 20));
camera.fov = 0.9;

camera.attachControl(canvas, true);


const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

scene.clearColor = new BABYLON.Color3(0,0,0.2);

let localPlayer = null;

const groundRadius = 45;
const ground = BABYLON.MeshBuilder.CreateDisc('ground',{radius: groundRadius, tesselation:64},scene);
const groundMaterial = new BABYLON.GridMaterial('groundMaterial', scene);
groundMaterial.mainColor = new BABYLON.Color3(0.8, 0.8, 0.8);
groundMaterial.lineColor = new BABYLON.Color3(0.8, 0.8, 0.8);
ground.material = groundMaterial;

ground.position.z = -1;

ground.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);

localPlayer = new Player(scene, new BABYLON.Vector3(1,1,1), new BABYLON.Quaternion(1,1,1));

var colyseusSDK = new Colyseus.Client("ws://localhost:2567");
colyseusSDK.joinOrCreate("my_room").then(function(room){
        console.log("Connected to roomId: " + room.roomId);
}).catch(function(error){
        console.log("Couldn't connect.");
});







engine.runRenderLoop(function () {
        scene.render();
});
// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});