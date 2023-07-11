
import { Player } from "./Player.js";




var scriptUrl = "https://unpkg.com/colyseus.js@^0.15.0-preview.2/dist/colyseus.js";
var externalScript = document.createElement("script");
externalScript.src = scriptUrl;
document.head.appendChild(externalScript);


const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
const scene = new BABYLON.Scene(engine);

await Ammo();


scene.enablePhysics(new BABYLON.Vector3(0,-10,0), new BABYLON.AmmoJSPlugin(true,Ammo));

var loadingText = new BABYLON.GUI.TextBlock("instructions");

const camera = new BABYLON.ArcRotateCamera("camera1", Math.PI/2, 2.1, -24, new BABYLON.Vector3(0,0,0),scene);
camera.setPosition(new BABYLON.Vector3(0, 60, -100));
camera.setTarget(new BABYLON.Vector3(0, 0, 20));
camera.fov = 0.9;
camera.attachControl(canvas, true);

const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

scene.clearColor = new BABYLON.Color3(0,0,0.2);

var _player = null;
var isLocalPlayer;



const groundRadius = 45;
const ground = BABYLON.MeshBuilder.CreateDisc('ground',{radius: groundRadius, tesselation:64},scene);
const groundMaterial = new BABYLON.GridMaterial('groundMaterial', scene);
groundMaterial.mainColor = new BABYLON.Color3(0.8, 0.8, 0.8);
groundMaterial.lineColor = new BABYLON.Color3(0.8, 0.8, 0.8);
ground.material = groundMaterial;

ground.position.z = 0;

ground.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);

ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.CylinderImpostor, {mass:0, friction:0.5, restitution:0.7},scene);

var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {size:2}, scene);
sphere.position.y = 1;
sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor,{mass: 1, restitution:0.9},scene);
var sphereMat = new BABYLON.StandardMaterial("s-mat", scene);
sphereMat.diffuseColor = new BABYLON.Color3(0,0,1);
sphere.material = sphereMat;


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
        console.log("giriyoz mu");
        buildScene(scene);
    };



    var playerEntities = {};
    var playerNextPosition = {};


var buildScene = async function(scene){

        var colyseusSDK = new Colyseus.Client("ws://localhost:2567");
        loadingText.text = "Connecting with the server, please wait...";

        var room = await colyseusSDK.joinOrCreate("my_room");
        loadingText.text = "Connection established!";
        console.log("Connected to roomId: " + room.roomId);

    
        room.state.players.onAdd(function(player, sessionId){
                isLocalPlayer = sessionId === room.sessionId;
                _player = new Player(`player-${sessionId}`,scene, new BABYLON.Quaternion(1,1,1));
                _player.position.set(player.x,player.y,player.z);
                playerEntities[sessionId] = _player;
                console.log(`player-${sessionId}` + " Joined! and instantiated at: " + _player.position);

                if(isLocalPlayer){
                        scene.onKeyboardObservable.add((kbInfo) => {
                                switch (kbInfo.type) {
                                    case BABYLON.KeyboardEventTypes.KEYDOWN:
                                        switch (kbInfo.event.key) {
                                            case "a":
                                            case "A":
                                                _player.position.x -= 0.5;
                                            break
                                            case "d":
                                            case "D":
                                                _player.position.x += 0.5;
                                            break
                                            case "w":
                                            case "W":
                                                _player.position.z += 0.5;
                                            break
                                            case "s":
                                            case "S":
                                                _player.position.z -= 0.5;
                                            break
                                        }
                                    break;                                   
                                }


                                room.send("updatePosition",{
                                    x: _player.position.x,
                                    y: _player.position.y,
                                    z: _player.position.z,
                                
                
                            });
                        })



                }


                playerNextPosition[sessionId] = _player.position.clone();

                player.onChange(function(){
                        playerEntities[sessionId].set(player.x,player.y,player.z);
                        var targetPosition = _player.position.clone();
                        playerNextPosition[sessionId] = targetPosition;
                });


                
                       
        });

        room.state.players.onRemove(function(player, sessionId){
                console.log(sessionId + " Left!");
                playerEntities[sessionId].dispose();
                delete playerEntities[sessionId];
                delete playerNextPosition[sessionId]; 
        });

        room.onLeave(code=>{
                loadingText.text = "Disconnected from the room.";
        });
     
}
buildScene(scene);
scene.registerBeforeRender(() => {
        for (let sessionId in playerEntities) {
            //console.log(sessionId);
            var targetPosition = playerNextPosition[sessionId];
            //console.log(targetPosition);
            //console.log(entity.position);
           playerEntities[sessionId].position.set = BABYLON.Vector3.Lerp(playerEntities[sessionId].position, targetPosition, 0.05);
            
        }
    });


engine.runRenderLoop(function () {
        scene.render();
});
// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});