

export class Player{

    constructor(localName,scene, position, rotation = new BABYLON.Quaternion(),material){
        //console.log(position);
        //console.log(localName);
        this.localName = localName;
        this.scene = scene;
        this.engine = scene.getEngine();
        this.position = position;
        this.rotation = rotation;
        this.material = material;
        this.speed = 0.05;
        this.mesh = null;
        this.damping = 0.99;  // adjust as needed
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

    init(localName){
        
        this.mesh = this.createPlayer(localName);
        
        return this.mesh;
    }

    attachControlToPlayer(player){
        this.scene.onKeyboardObservable.add((kbInfo) => {
            var currentPlayer = player
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    let impulse;
                    switch (kbInfo.event.key) {
                        case "a":
                        case "A":
                            impulse = new BABYLON.Vector3(-1, 0, 0);
                            break
                        case "d":
                        case "D":
                            impulse = new BABYLON.Vector3(1, 0, 0);
                            break
                        case "w":
                        case "W":
                            impulse = new BABYLON.Vector3(0, 0, 1);
                            break
                        case "s":
                        case "S":
                            impulse = new BABYLON.Vector3(0, 0, -1);
                            break
                    }
                    currentPlayer.mesh.physicsImpostor.applyImpulse(impulse, currentPlayer.mesh.getAbsolutePosition());
                    break;                                   
            }
            
        })
    }
    

    
    createPlayer(localName){
        
        this.scene.enablePhysics(new BABYLON.Vector3(0,-20,0), new BABYLON.AmmoJSPlugin(true,Ammo));


        var box = new BABYLON.MeshBuilder.CreateBox(localName, {width:2, depth:2, height:2}, this.scene);

        box.position = this.position;
        box.material = this.material;
        box.rotation.set(0,0,0);

        box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, {mass:1, friction:0.5, restitution:0.7},this.scene);

        return box;
    }


    

    
    

   
}