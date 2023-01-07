import { Body } from "matter";
import { Textures, GameObjects, Scene, Physics } from "phaser";
import { Player } from "../entities/player";

export class Bar {
    value: number;
    bar: GameObjects.Sprite;
    bg: GameObjects.Sprite;

    constructor (scene:Scene, texture: string, y:number) {
        this.value = 1.0;
        this.bg = scene.add.sprite(16, y, 'bar_bg');
        this.bg.displayOriginX = 0;
        this.bg.displayOriginY = 0;

        this.bar = scene.add.sprite(16, y, texture);
        this.bar.displayOriginX = 0;
        this.bar.displayOriginY = 0;
    }

    update(scene: Scene, time: number, delta: number) {
        this.bar.setScale(this.value, 1.0);
    }
}