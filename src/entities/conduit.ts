import { GameObjects, Physics } from "phaser";
import { GameScene } from "../scenes/game/gameScene";

export class Conduit extends Physics.Matter.Sprite {
    glow: GameObjects.Sprite;

    constructor (scene:GameScene, x:number, y:number, horiz: boolean) {
        if(horiz){
            super(scene.matter.world, x, y, 'packed', 'plasma_conduit');
            this.glow = scene.add.sprite(x,y,'packed','plasma_glow/plasma_glow-0').setDepth(2).play('plasma_glow_flicker').setBlendMode(Phaser.BlendModes.ADD);
        } else {
            super(scene.matter.world, x, y, 'packed', 'plasma_conduit_horiz');
            this.glow = scene.add.sprite(x,y,'packed','plasma_glow_horiz/plasma_glow_horiz-0').setDepth(2).play('plasma_glow_horiz_flicker').setBlendMode(Phaser.BlendModes.ADD);
        }
        this.scene.add.existing(this);
        this.setStatic(true);
    }
}

