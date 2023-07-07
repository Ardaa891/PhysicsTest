import { Player } from "./Player.js";


var scriptUrl = "https://unpkg.com/colyseus.js@^0.15.0-preview.2/dist/colyseus.js";
var externalScript = document.createElement("script");
externalScript.src = scriptUrl;
document.head.appendChild(externalScript);


const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
const scene = new BABYLON.Scene(engine);

var loadingText = new BABYLON.GUI.TextBlock("instructions");

const camera = new BABYLON.ArcRotateCamera("camera1", Math.PI/2, 2.1, -24, new BABYLON.Vector3(0,0,0),scene);
camera.setPosition(new BABYLON.Vector3(0, 60, -100));
camera.setTarget(new BABYLON.Vector3(0, 0, 20));
camera.fov = 0.9;
camera.attachControl(canvas, true);

const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

scene.clearColor = new BABYLON.Color3(0,0,0.2);

var localPlayer = null;

const groundRadius = 45;
const ground = BABYLON.MeshBuilder.CreateDisc('ground',{radius: groundRadius, tesselation:64},scene);
const groundMaterial = new BABYLON.GridMaterial('groundMaterial', scene);
groundMaterial.mainColor = new BABYLON.Color3(0.8, 0.8, 0.8);
groundMaterial.lineColor = new BABYLON.Color3(0.8, 0.8, 0.8);
ground.material = groundMaterial;

ground.position.z = -1;

ground.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
// Display "loading" text
var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("textUI");

loadingText.text = "Loading the Colyseus SDK file...";
loadingText.color = "#fff000"
loadingText.fontSize = 24;
loadingText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
loadingText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
loadingText.paddingBottom = "10px";
advancedTexture.addControl(loadingText);


    // build scene only after Colyseus SDK script is loaded.
    externalScript.onload = function() {
        // build the final scene
        buildScene(scene);
    };





var buildScene = async function(scene){

        var colyseusSDK = new Colyseus.Client("ws://localhost:2567");
        loadingText.text = "Connecting with the server, please wait...";

        var room = await colyseusSDK.joinOrCreate("my_room");
        loadingText.text = "Connection established!";
        console.log("Connected to roomId: " + room.roomId);

        var playerEntities = {};
        var playerNextPosition = {};
    
        room.state.players.onAdd(function(player, sessionId){
                localPlayer = new Player(`player-${sessionId}`,scene, new BABYLON.Quaternion(1,1,1));
                localPlayer.position.set(player.x,player.y,player.z);
                playerEntities[sessionId] = localPlayer;
                console.log(`player-${sessionId}` + " Joined!");         
        });

        room.state.players.onRemove((player, sessionId)=>{
                console.log(sessionId + " Left!");
                playerEntities[sessionId].dispose();
                delete playerEntities[sessionId];
                delete playerNextPosition[sessionId]; 
        });

        room.onLeave(code=>{
                loadingText.text = "Disconnected from the room.";
        });
     
}




engine.runRenderLoop(function () {
        scene.render();
});
// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});