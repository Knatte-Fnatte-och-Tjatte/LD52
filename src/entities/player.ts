import { Textures, GameObjects, Scene } from "phaser";

export class Player {
    sprite: GameObjects.Sprite;

    constructor (scene:Scene, x:number, y:number) {
        this.sprite = scene.add.sprite(x,y,'player', 0);
    }
}