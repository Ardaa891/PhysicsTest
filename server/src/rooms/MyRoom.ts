import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import { Player, Wheel } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

  onCreate (options: any) {
    this.setState(new MyRoomState());
    
    console.log("room", this.roomId, "creating...");

    this.onMessage("updatePosition", (client, data) => {
      //console.log(data);
      const player = this.state.players.get(client.sessionId);
      player.x = data.x;
      player.y = data.y;
      player.z = data.z;
      player.rx = data.rx;
      player.ry = data.ry;
      player.rz = data.rz;      
      player.rw = data.rw;      
      data.wheelPositions.forEach((wheelPos, index) => {
        if (player.wheelPositions[index]) {
          // Update existing wheel position
          player.wheelPositions[index].x = wheelPos.x;
          player.wheelPositions[index].y = wheelPos.y;
          player.wheelPositions[index].z = wheelPos.z;
        } else {
          // Add new wheel position
          const wheel = new Wheel();
          wheel.x = wheelPos.x;
          wheel.y = wheelPos.y;
          wheel.z = wheelPos.z;
          player.wheelPositions.push(wheel);
        }
      });
    });
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const player = new Player();

    
        player.x = -(20) + (Math.random() * 20);
        player.y = 3;//nice
        player.z = -(20) + (Math.random() * 20);

        this.state.players.set(client.sessionId, player);
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
