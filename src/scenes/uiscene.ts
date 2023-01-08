import { GameObjects, Scene } from 'phaser';
import { GameScene } from './gamescene';

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
        this.bar.setCrop(0,0, this.value * 256, 32);
    }
}

export class UIScene extends Scene {
    fuelbar?: Bar;
    airbar?: Bar;
    energybar?: Bar;
    stunned?: GameObjects.Text;

    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'UIScene';
        super(config);
    }

    preload () {
        this.load.image('bar_bg', 'assets/bar_bg.png');
        this.load.image('bar_air', 'assets/bar_air.png');
        this.load.image('bar_fuel', 'assets/bar_fuel.png');
    }

    create () {
        this.airbar = new Bar(this, 'bar_air', 16);
        this.fuelbar = new Bar(this, 'bar_fuel', 40);
        this.stunned = this.add.text(16, 84, "Stunned");
        this.stunned.setVisible(false);
    }

    update(time: number, delta: number) {
        const game = this.scene.get('GameScene') as GameScene;
        const player = game.player;
        if(player){
            if(this.fuelbar){
                this.fuelbar.value = player.fuel / player.fuelMax;
                this.fuelbar.update(this, time, delta);
            }
            if(this.airbar){
                this.airbar.value = player.oxygen / player.oxygenMax;
                this.airbar.update(this, time, delta);
            }
            if(player.stunned > 0.0){
                if(player.stunned > 1000.0){
                    this.stunned?.setVisible(player.stunned > 0.0);
                }else{
                    this.stunned?.setVisible((((player.stunned / 200.0)|0)&1) == 0);
                }
            }else{
                this.stunned?.setVisible(false);
            }
        }
    }
}