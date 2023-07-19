
import { Vehicle } from "./Vehicle.js";




var scriptUrl = "https://unpkg.com/colyseus.js@^0.15.0-preview.2/dist/colyseus.js";
var externalScript = document.createElement("script");
externalScript.src = scriptUrl;
document.head.appendChild(externalScript);


const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
const scene = new BABYLON.Scene(engine);

await Ammo();
var physicsPlugin = new BABYLON.AmmoJSPlugin(true, Ammo);

scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), physicsPlugin);
//scene.debugLayer.show();

var loadingText = new BABYLON.GUI.TextBlock("instructions");

const camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, 2.1, -24, new BABYLON.Vector3(0, 0, 0), scene);
camera.setPosition(new BABYLON.Vector3(0, 60, -100));
camera.setTarget(new BABYLON.Vector3(0, 0, 0));
camera.fov = 0.3;
camera.attachControl(canvas, true);

const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

scene.clearColor = new BABYLON.Color3(0, 0, 0.2);




const groundRadius = 45;
const ground = BABYLON.MeshBuilder.CreateCylinder("ground", { height: 1, diameter: 45, tesselation: 64 }, scene);
//const ground = BABYLON.MeshBuilder.CreateCylinder('ground', { radius: groundRadius, tesselation: 64 }, scene);
const groundMaterial = new BABYLON.GridMaterial('groundMaterial', scene);
groundMaterial.mainColor = new BABYLON.Color3(0.8, 0.8, 0.8);
groundMaterial.lineColor = new BABYLON.Color3(0.8, 0.8, 0.8);
ground.material = groundMaterial;
// var ground = BABYLON.Mesh.CreateGround("ground", 460, 460, 2, scene);
// ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, scene);
// ground.material = new BABYLON.GridMaterial("groundMaterial", scene);
//ground.position.z = 0;

//ground.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);

ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, scene);

// var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { size: 2 }, scene);
// sphere.position.y = 10;
// sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 0.1, restitution: 0.4s }, scene);
// var sphereMat = new BABYLON.StandardMaterial("s-mat", scene);
// sphereMat.diffuseColor = new BABYLON.Color3(0, 0, 1);
// sphere.material = sphereMat;


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
externalScript.onload = function () {
    // build the final scene
    console.log("giriyoz mu");
    buildScene(scene);
};



var playerEntities = {};
var playerNextPosition = {};
var playerNextRotation = {};
var playerPrevPosition = {};
var playerPrevRotation = {};
var lastUpdateTime = {};
var lastUpdateTimestamp = {};

var updateInterval = 100;
var room;
var buildScene = async function (scene) {

    var colyseusSDK = new Colyseus.Client("wss://008.invr.life/c");
    loadingText.text = "Connecting with the server, please wait...";

    room = await colyseusSDK.joinOrCreate("my_room");
    loadingText.text = "Connection established!";
    console.log("Connected to roomId: " + room.roomId);


    room.state.players.onAdd(function (player, sessionId) {

        var _player = null;
        var isLocalPlayer;
        isLocalPlayer = sessionId === room.sessionId;
        //_player = new Player(sessionId,scene,new BABYLON.Vector3(player.x,player.y,player.z), new BABYLON.Quaternion(1,1,1), room);
        _player = new Vehicle(sessionId, scene, new BABYLON.Vector3(player.x, player.y, player.z), new BABYLON.Quaternion(1, 1, 1), room, engine, isLocalPlayer);
        //console.log(_player);
        //wa_player.position.set(player.x,player.y,player.z);
        playerEntities[sessionId] = _player;
        console.log(`player-${sessionId}` + " Joined! and instantiated at: " + _player.chassisMesh.position);
        playerNextPosition[sessionId] = new Array(4);
        playerNextRotation[sessionId] = new Array(4);
        playerPrevPosition[sessionId] = new Array(4);
        playerPrevRotation[sessionId] = new Array(4);
        for (let i = 0; i < _player.wheelMeshes.length; i++) {
            playerNextPosition[sessionId][i] = _player.wheelMeshes[i].position.clone();
            playerNextRotation[sessionId][i] = _player.wheelMeshes[i].rotationQuaternion.clone();
            playerPrevPosition[sessionId][i] = _player.wheelMeshes[i].position.clone();
            playerPrevRotation[sessionId][i] = _player.wheelMeshes[i].rotationQuaternion.clone();
        }
        if (isLocalPlayer) {
            // window.addEventListener('keydown', _player.keydown);
            // window.addEventListener('keyup', _player.keyup);
            _player.attachControl();
            setInterval(() => {
                var wheelPositions = _player.wheelMeshes.map(wheel => ({
                    x: wheel.position.x,
                    y: wheel.position.y,
                    z: wheel.position.z,
                    rx: wheel.rotationQuaternion.x,
                    ry: wheel.rotationQuaternion.y,
                    rz: wheel.rotationQuaternion.z,
                    rw: wheel.rotationQuaternion.w,
                }));

                room.send("updatePosition", {
                    x: _player.chassisMesh.position.x,
                    y: _player.chassisMesh.position.y,
                    z: _player.chassisMesh.position.z,
                    rx: _player.chassisMesh.rotationQuaternion.x,
                    ry: _player.chassisMesh.rotationQuaternion.y,
                    rz: _player.chassisMesh.rotationQuaternion.z,
                    rw: _player.chassisMesh.rotationQuaternion.w,
                    wheelPositions: wheelPositions  // sending wheel positions


                });
            }, 30);
        }


        playerNextPosition[sessionId] = _player.chassisMesh.position.clone();

        player.onChange(function () {
            // console.log(playerEntities[sessionId]);
            if (playerEntities[sessionId] == undefined) return;

            isLocalPlayer = sessionId === room.sessionId;

            if (!isLocalPlayer) {
                try {
                    if (playerEntities[sessionId].body)

                        playerPrevPosition[sessionId] = playerEntities[sessionId].chassisMesh.position.clone();
                    playerPrevRotation[sessionId] = playerEntities[sessionId].chassisMesh.rotationQuaternion.clone();

                    // playerEntities[sessionId].position = new BABYLON.Vector3(player.x,player.y,player.z);
                    // playerEntities[sessionId].chassisMesh.position = new BABYLON.Vector3(player.x, player.y, player.z);
                    // playerEntities[sessionId].chassisMesh.rotationQuaternion = new BABYLON.Quaternion(player.rx, player.ry, player.rz, player.rw);
                    playerNextPosition[sessionId] = new BABYLON.Vector3(player.x, player.y, player.z);
                    playerNextRotation[sessionId] = new BABYLON.Quaternion(player.rx, player.ry, player.rz, player.rw);

                    player.wheelPositions.forEach((wheelPos, index) => {
                        if (playerEntities[sessionId].wheelMeshes[index]) {
                            playerEntities[sessionId].wheelMeshes[index].position = new BABYLON.Vector3(wheelPos.x, wheelPos.y, wheelPos.z);
                            playerEntities[sessionId].wheelMeshes[index].rotationQuaternion = new BABYLON.Quaternion(wheelPos.rx, wheelPos.ry, wheelPos.rz, wheelPos.rw);
                            
                            playerNextPosition[sessionId][index] = new BABYLON.Vector3(wheelPos.x, wheelPos.y, wheelPos.z);
                            playerNextRotation[sessionId][index] = new BABYLON.Quaternion(wheelPos.rx, wheelPos.ry, wheelPos.rz, wheelPos.rw);
                        }

                    });
                    let transform = new Ammo.btTransform();
                    //playerEntities[sessionId].body.getMotionState().getWorldTransform(transform);

                    // Update position
                    transform.setOrigin(new Ammo.btVector3(player.x, player.y, player.z));

                    // Update rotation
                    let quaternion = new Ammo.btQuaternion(player.rx, player.ry, player.rz, player.rw);
                    transform.setRotation(quaternion);

                    // Update the body's motion state

                    playerEntities[sessionId].body.getMotionState().setWorldTransform(transform);

                    playerEntities[sessionId].body.activate();
                    playerEntities[sessionId].body.setCollisionFlags(2);
                    //console.log(playerEntities[sessionId].position);

                    playerNextPosition[sessionId] = _player.chassisMesh.position.clone();;
                    playerNextRotation[sessionId] = _player.chassisMesh.rotation.clone();;

                    lastUpdateTime[sessionId] = Date.now();
                    lastUpdateTimestamp[sessionId] = Date.now();

                }
                catch (err) {
                    console.log(err);
                }

            }
        });




    });

    room.state.players.onRemove(function (player, sessionId) {
        console.log(sessionId + " Left!");
        playerEntities[sessionId].dispose();

        delete playerEntities[sessionId];
        delete playerNextPosition[sessionId];
    });

    room.onLeave(code => {
        loadingText.text = "Disconnected from the room.";
    });

}
buildScene(scene);



engine.runRenderLoop(function () {
    let currentTime = Date.now();
    for (let sessionId in playerEntities) {
        if (sessionId !== room.sessionId && lastUpdateTime[sessionId]) {
            let alpha = (currentTime - lastUpdateTimestamp[sessionId]) / (lastUpdateTimestamp[sessionId] - lastUpdateTime[sessionId]);
            
            if (playerPrevPosition[sessionId] && playerNextPosition[sessionId]) {
                playerEntities[sessionId].chassisMesh.position = BABYLON.Vector3.Lerp(playerPrevPosition[sessionId], playerNextPosition[sessionId], alpha);
            }
            if (playerPrevRotation[sessionId] && playerNextRotation[sessionId]) {
                playerEntities[sessionId].chassisMesh.rotationQuaternion = BABYLON.Quaternion.Slerp(playerPrevRotation[sessionId], playerNextRotation[sessionId], alpha);
            }
            
            for (let i = 0; i < playerEntities[sessionId].wheelMeshes.length; i++) {
                if (playerPrevPosition[sessionId][i] && playerNextPosition[sessionId][i]) {
                    playerEntities[sessionId].wheelMeshes[i].position = BABYLON.Vector3.Lerp(playerPrevPosition[sessionId][i], playerNextPosition[sessionId][i], alpha);
                }
                if (playerPrevRotation[sessionId][i] && playerNextRotation[sessionId][i]) {
                    playerEntities[sessionId].wheelMeshes[i].rotationQuaternion = BABYLON.Quaternion.Slerp(playerPrevRotation[sessionId][i], playerNextRotation[sessionId][i], alpha);
                }
            }
        }
    }
    scene.render();
});
// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});