export class Vehicle {
    constructor(sessionId, scene, position, rotation, room,engine) {
        this.engine = engine;
        this.scene = scene;
        this.position=position;
        this.rotation=rotation;
        this.vehicle = null;
        this.chassisMesh = null;
        this.wheelMeshes = [];
        this.vehicleReady = false;

        this.chassisWidth = 1.8;
        this.chassisHeight = .6;
        this.chassisLength = 4;
        this.massVehicle = 100;

        this.wheelAxisPositionBack = -1;
        this.wheelRadiusBack = .4;
        this.wheelWidthBack = .3;
        this.wheelHalfTrackBack = 1;
        this.wheelAxisHeightBack = 0.4;

        this.wheelAxisFrontPosition = 1.0;
        this.wheelHalfTrackFront = 1;
        this.wheelAxisHeightFront = 0.4;
        this.wheelRadiusFront = .4;
        this.wheelWidthFront = .3;

        this.friction = 5;
        this.suspensionStiffness = 10;
        this.suspensionDamping = 0.3;
        this.suspensionCompression = 4.4;
        this.suspensionRestLength = 0.6;
        this.rollInfluence = 0.0;

        this.steeringIncrement = .01;
        this.steeringClamp = 0.2;
        this.maxEngineForce = 500;
        this.maxBreakingForce = 10;
        this.incEngine = 10.0;

        this.FRONT_LEFT = 0;
        this.FRONT_RIGHT = 1;
        this.BACK_LEFT = 2;
        this.BACK_RIGHT = 3;

        this.actions = { accelerate: false, brake: false, right: false, left: false };

        this.keysActions = {
            "KeyW": 'acceleration',
            "KeyS": 'braking',
            "KeyA": 'left',
            "KeyD": 'right'
        };

        this.wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
        this.wheelAxleCS = new Ammo.btVector3(-1, 0, 0);
  
        this.redMaterial = new BABYLON.StandardMaterial("RedMaterial", this.scene);
        this.redMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.4, 0.5);
        this.redMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.4, 0.5);
      
        this.blueMaterial = new BABYLON.StandardMaterial("RedMaterial", this.scene);
        this.blueMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.4, 0.8);
        this.blueMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.4, 0.8);
      
        this.greenMaterial = new BABYLON.StandardMaterial("RedMaterial", this.scene);
        this.greenMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.8, 0.5);
        this.greenMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.8, 0.5);
      
        this.blackMaterial = new BABYLON.StandardMaterial("RedMaterial", this.scene);
        this.blackMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        this.blackMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        this.keyup = this.keyup.bind(this);
        this.keydown = this.keydown.bind(this);

        this.createChassis();   
        this.createVehicle();
        this.vehicleReady = true;
        this.scene.registerBeforeRender(() => {
            this.updateVehicle();
        });
        }
    attachControl() {
        console.log("attaching controls to local player");
       
        document.addEventListener('keyup', this.keyup);
        document.addEventListener('keydown', this.keydown);
        
    }
    keyup(e) {
        
        if (this.keysActions[e.code]) {
            this.actions[this.keysActions[e.code]] = false;
        }
    }
    
    keydown(e) {
        
        if (this.keysActions[e.code]) {
            this.actions[this.keysActions[e.code]] = true;
        }
    }    
    createChassis() {
        var mesh = new BABYLON.MeshBuilder.CreateBox("box", { width: this.chassisWidth, depth: this.chassisLength, height: this.chassisHeight }, this.scene);
        mesh.rotationQuaternion = new BABYLON.Quaternion();
        mesh.position=this.position;
        mesh.material = this.greenMaterial;

        // var camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), this.scene);
        // camera.radius = 10;
        // camera.heightOffset = 4;
        // camera.rotationOffset = 0;
        // camera.cameraAcceleration = 0.05;
        // camera.maxCameraSpeed = 400;
        // camera.attachControl(canvas, true);
        // camera.lockedTarget = mesh;
        // this.scene.activeCamera = camera;

        this.chassisMesh = mesh;
    }
    addWheel (isFront, pos, radius, width, index)  {
        console.log("wheel added" + index);
        var wheelInfo = this.vehicle.addWheel(
            pos,
            this.wheelDirectionCS0,
            this.wheelAxleCS,
            this.suspensionRestLength,
            radius,
            this.tuning,
            isFront
        );

        wheelInfo.set_m_suspensionStiffness(this.suspensionStiffness);
        wheelInfo.set_m_wheelsDampingRelaxation(this.suspensionDamping);
        wheelInfo.set_m_wheelsDampingCompression(this.suspensionCompression);
        wheelInfo.set_m_maxSuspensionForce(600000);
        wheelInfo.set_m_frictionSlip(40);
        wheelInfo.set_m_rollInfluence(this.rollInfluence);

        this.wheelMeshes[index] = this.createWheelMesh(radius, width);
        
    };
    createVehicle() {
        var physicsWorld = this.scene.getPhysicsEngine().getPhysicsPlugin().world;
    
        var geometry = new Ammo.btBoxShape(new Ammo.btVector3(this.chassisWidth * .5, this.chassisHeight * .5, this.chassisLength * .5));
        var transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(this.position);
        var motionState = new Ammo.btDefaultMotionState(transform);
        var localInertia = new Ammo.btVector3(0, 0, 0);
        geometry.calculateLocalInertia(this.massVehicle, localInertia);
    
        var massOffset = new Ammo.btVector3(0, 0.4, 0);
        var transform2 = new Ammo.btTransform();
        transform2.setIdentity();
        transform2.setOrigin(massOffset);
        var compound = new Ammo.btCompoundShape();
        compound.addChildShape(transform2, geometry);
    
        var body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(this.massVehicle, motionState, compound, localInertia));
        body.setActivationState(4);
    
        physicsWorld.addRigidBody(body);
    

        var tuning = new Ammo.btVehicleTuning();
        var rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
        this.vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
        this.vehicle.setCoordinateSystem(0, 1, 2);
        physicsWorld.addAction(this.vehicle);
    
        var trans = this.vehicle.getChassisWorldTransform();
    
        this.addWheel( true, new Ammo.btVector3(this.wheelHalfTrackFront, this.wheelAxisHeightFront, this.wheelAxisFrontPosition), this.wheelRadiusFront, this.wheelWidthFront, this.FRONT_LEFT);
        this.addWheel( true, new Ammo.btVector3(-this.wheelHalfTrackFront, this.wheelAxisHeightFront, this.wheelAxisFrontPosition), this.wheelRadiusFront, this.wheelWidthFront, this.FRONT_RIGHT);
        this.addWheel( false, new Ammo.btVector3(-this.wheelHalfTrackBack, this.wheelAxisHeightBack, this.wheelAxisPositionBack), this.wheelRadiusBack, this.wheelWidthBack, this.BACK_LEFT);
        this.addWheel( false, new Ammo.btVector3(this.wheelHalfTrackBack, this.wheelAxisHeightBack, this.wheelAxisPositionBack), this.wheelRadiusBack, this.wheelWidthBack, this.BACK_RIGHT);
    }

    createWheelMesh(radius, width) {
        var mesh = new BABYLON.MeshBuilder.CreateCylinder("Wheel", { diameter: 1, height: 0.5, tessellation: 6 }, this.scene);
        mesh.rotationQuaternion = new BABYLON.Quaternion();
        mesh.material = this.blackMaterial;
        return mesh;
    }

    updateVehicle() {
        // Update vehicle controls
        var dt = this.engine.getDeltaTime().toFixed() / 1000;
        
        if (this.vehicleReady) {
        
    
            var speed = this.vehicle.getCurrentSpeedKmHour();
            var maxSteerVal = 0.2; 
            var vehicleSteering = 0;
     
            var breakingForce = 0;
            var engineForce = 0;
            
            if (this.actions.acceleration) {
                if (speed < -1) {
                    breakingForce = this.maxBreakingForce;
                } else {
                    engineForce = this.maxEngineForce;
                }
    
            } else if (this.actions.braking) {
                if (speed > 1) {
                    breakingForce = this.maxBreakingForce;
                } else {
                    engineForce = -this.maxEngineForce;
                }
            }
    
            if (this.actions.right) {
                if (vehicleSteering < this.steeringClamp) {
                    vehicleSteering += this.steeringIncrement;
                }
    
            } else if (this.actions.left) {
                if (vehicleSteering > -this.steeringClamp) {
                    vehicleSteering -= this.steeringIncrement;
                }
    
            } else {
                vehicleSteering = 0;
            }
            // console.log("engine force", engineForce);
            // console.log("braking force", breakingForce);
            this.vehicle.applyEngineForce(engineForce, this.FRONT_LEFT);
            this.vehicle.applyEngineForce(engineForce, this.FRONT_RIGHT);
    
            this.vehicle.setBrake(breakingForce/ 2, this.FRONT_LEFT);
            this.vehicle.setBrake(breakingForce / 2, this.FRONT_RIGHT);
            this.vehicle.setBrake(breakingForce, this.BACK_LEFT);
            this.vehicle.setBrake(breakingForce, this.BACK_RIGHT);
    
            this.vehicle.setSteeringValue(vehicleSteering, this.FRONT_LEFT);
            this.vehicle.setSteeringValue(vehicleSteering, this.FRONT_RIGHT);
    
            var tm, p, q, i;
            var n = this.vehicle.getNumWheels();
            for (i = 0; i < n; i++) {
                this.vehicle.updateWheelTransform(i, true);
                tm = this.vehicle.getWheelTransformWS(i);
                p = tm.getOrigin();
                q = tm.getRotation();
                
                this.wheelMeshes[i].position.set(p.x(), p.y(), p.z());
                this.wheelMeshes[i].rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
                this.wheelMeshes[i].rotate(BABYLON.Axis.Z, Math.PI / 2);
            }
    
            tm = this.vehicle.getChassisWorldTransform();
            p = tm.getOrigin();
            q = tm.getRotation();
            
            this.chassisMesh.position.set(p.x(), p.y(), p.z());
            this.chassisMesh.rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
           // this.chassisMesh.rotate(BABYLON.Axis.X, Math.PI);
        }
    }

}
