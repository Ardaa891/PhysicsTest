import { MapSchema,Schema, Context, type } from "@colyseus/schema";

export class Player extends Schema{
  @type("number") x: number;
  @type("number") y: number;
  @type("number") z: number;
  @type("number") rx: number;
  @type("number") ry: number;
  @type("number") rz: number;
  @type("number") rw: number;
}

export class MyRoomState extends Schema {

  @type({map: Player}) players = new MapSchema<Player>();

}
