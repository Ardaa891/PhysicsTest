

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
                        switch (kbInfo.event.key) {
                            case "a":
                            case "A":
                                currentPlayer.mesh.position.x -= 0.005;
                            break
                            case "d":
                            case "D":
                                currentPlayer.mesh.position.x += 0.005;
                            break
                            case "w":
                            case "W":
                                currentPlayer.mesh.position.z += 0.005;
                            break
                            case "s":
                            case "S":
                                currentPlayer.mesh.position.z -= 0.005;
                            break
                        }
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