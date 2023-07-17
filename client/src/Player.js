

export class Player {

    constructor(sessionId, scene, position, rotation = new BABYLON.Quaternion(), room) {
        //console.log(position);
        //console.log(localName);
        this.localName = `player-${sessionId}`;
        this.room = room;
        this.sessionId = sessionId;
        this.scene = scene;
        this.engine = scene.getEngine();
        this.position = position;
        this.rotation = rotation;

        this.speed = 0.05;
        this.mesh = null;
        this.damping = 0.99;  // adjust as needed

        this.keys = { w: false, a: false, s: false, d: false };  // To track the state of each key
        this.turnSpeed = 0.05;  // The speed at which the wheels turn back to their normal position
        this.maxTurnAngle = Math.PI / 4;  // The maximum turn angle in radians (45 degrees)
 

        this.scene.registerBeforeRender(() => {
            if (this.mesh && this.mesh.physicsImpostor) {
                let velocity = this.mesh.physicsImpostor.getLinearVelocity();
                if (velocity) {
                    velocity.scaleInPlace(this.damping);
                    this.mesh.physicsImpostor.setLinearVelocity(velocity);
                }
            }
        });
        this.init();






        //dkfjslkfj
    }

    init() {

        this.mesh = this.createPlayer(this.sessionId, this.room);

        return this.mesh;
    }

    createPlayer(sessionId, room) {
        this.localName="player-"+sessionId;
        var isLocalPlayer = sessionId === room.sessionId;

        if (isLocalPlayer) {

            this.attachControlToPlayer(this, room);
            console.log("starting updates for " + sessionId);

        }
        this.scene.enablePhysics(new BABYLON.Vector3(0, -20, 0), new BABYLON.AmmoJSPlugin(true, Ammo));


        var box = new BABYLON.MeshBuilder.CreateBox(this.localName, {width:2, depth:4, height:1}, this.scene);

        box.position = this.position;
        box.material = this.material;
        box.rotation.set(0, 0, 0);

        box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, {mass:1, friction:0.5, restitution:0.5},this.scene);


        // Create the wheels
        var wheelRadius = 0.5;
        var wheelWidth = 0.2;
        this.frontWheels = [];
        for (var i = 0; i < 4; i++) {
            var wheel = new BABYLON.MeshBuilder.CreateCylinder(this.localName= + "Wheel" + i, { diameter: wheelRadius * 2, height: wheelWidth }, this.scene);
            wheel.rotation.z = Math.PI / 2;  // Rotate the wheel so that it lies flat
            wheel.parent = box;
            if (i < 2) {  // Front wheels
                wheel.position = new BABYLON.Vector3(i * 2 - 1, -0.5, 1.5);  // Position the wheel relative to the car
                this.frontWheels.push(wheel);
            } else {  // Rear wheels
                wheel.position = new BABYLON.Vector3(i * 2 - 5, -0.5, -1.5);  // Position the wheel relative to the car
            }
            wheel.physicsImpostor = new BABYLON.PhysicsImpostor(wheel, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, this.scene);
        }

        return box;
    }



    attachControlToPlayer(player){
        this.scene.onKeyboardObservable.add((kbInfo) => {
            var currentPlayer = player;
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    switch (kbInfo.event.key.toLowerCase()) {
                        case "a":
                            currentPlayer.keys.a = true;
                            break;
                        case "d":
                            currentPlayer.keys.d = true;
                            break;
                        case "w":
                            currentPlayer.keys.w = true;
                            break;
                        case "s":
                            currentPlayer.keys.s = true;
                            break;
                    }
                    break;
                case BABYLON.KeyboardEventTypes.KEYUP:
                    switch (kbInfo.event.key.toLowerCase()) {
                        case "a":
                            currentPlayer.keys.a = false;
                            break;
                        case "d":
                            currentPlayer.keys.d = false;
                            break;
                        case "w":
                            currentPlayer.keys.w = false;
                            break;
                        case "s":
                            currentPlayer.keys.s = false;
                            break;
                    }
                    break;
            }
        });

        this.scene.registerBeforeRender(() => {
            var currentPlayer = player;

            if (currentPlayer.mesh && currentPlayer.mesh.physicsImpostor) {
                let velocity = currentPlayer.mesh.physicsImpostor.getLinearVelocity();
                if (velocity) {
                    velocity.scaleInPlace(currentPlayer.damping);
                    currentPlayer.mesh.physicsImpostor.setLinearVelocity(velocity);
                }
            }

            // Code to handle simultaneous keypresses
            if (currentPlayer.keys.a) {
                currentPlayer.frontWheels.forEach(wheel => {
                    wheel.rotation.y = Math.min(wheel.rotation.y + 0.1, currentPlayer.maxTurnAngle);
                });
            } else if (currentPlayer.keys.d) {
                currentPlayer.frontWheels.forEach(wheel => {
                    wheel.rotation.y = Math.max(wheel.rotation.y - 0.1, -currentPlayer.maxTurnAngle);
                });
            } else {
                currentPlayer.frontWheels.forEach(wheel => {
                    wheel.rotation.y = Math.abs(wheel.rotation.y) < currentPlayer.turnSpeed ? 0 : (wheel.rotation.y > 0 ? wheel.rotation.y - currentPlayer.turnSpeed : wheel.rotation.y + currentPlayer.turnSpeed);
                });
            }

            if (currentPlayer.keys.w || currentPlayer.keys.s) {
                let forward = new BABYLON.Vector3(Math.sin(currentPlayer.frontWheels[0].rotation.y), 0, Math.cos(currentPlayer.frontWheels[0].rotation.y));
                let impulse = forward.scale(currentPlayer.keys.w ? 1 : -1);
                currentPlayer.mesh.physicsImpostor.applyImpulse(impulse, currentPlayer.mesh.getAbsolutePosition());
            }
        });
    }
    
}