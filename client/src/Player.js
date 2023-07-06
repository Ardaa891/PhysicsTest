export class Player{

    constructor(scene, position = new BABYLON.Vector3(0,0,0), rotation = new BABYLON.Quaternion()){
        console.log(position);
        this.scene = scene;
        this.engine = scene.getEngine();
        this.position = position;
        this.rotation = rotation;
        this.speed = 0.05;
        this.mesh = null;
        this.init();

    }

    init(){
        
        this.mesh = this.createPlayer(this.position);
        return this.mesh;
    }

    createPlayer(){
        var box = new BABYLON.MeshBuilder.CreateBox("box", {width:2, depth:2, height:2}, this.scene);
        box.position.set(0,0,0);
        box.rotation.set(0,0,0);
        box.position.y += 1;

        this. scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    switch (kbInfo.event.key) {
                        case "a":
                        case "A":
                            box.position.x -= 0.5;
                        break
                        case "d":
                        case "D":
                            box.position.x += 0.5;
                        break
                        case "w":
                        case "W":
                            box.position.z += 0.5;
                        break
                        case "s":
                        case "S":
                            box.position.z -= 0.5;
                        break
                    }
                break;
            }
        });

        return box;
    }


    

    
    

   
}