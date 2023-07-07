

export class Player{

    constructor(localName,scene, position, rotation = new BABYLON.Quaternion()){
        //console.log(position);
        //console.log(localName);
        this.localName = localName;
        this.scene = scene;
        this.engine = scene.getEngine();
        this.position = position;
        this.rotation = rotation;
        this.speed = 0.05;
        this.mesh = null;
        this.init();
        //dkfjslkfj
    }

    init(localName){
        
        this.mesh = this.createPlayer(localName);
        return this.mesh;
    }

    createPlayer(localName){
        var box = new BABYLON.MeshBuilder.CreateBox(localName, {width:2, depth:2, height:2}, this.scene);

        //const randomValue = -(20/2) + (Math.random() * 20);
        box.position = this.position;
        box.rotation.set(0,0,0);

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