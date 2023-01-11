import { GameObjects, Scene } from 'phaser';
import { GameScene } from '../game/gameScene';

export class Bar {
    value: number;
    bar: GameObjects.Sprite;
    bg: GameObjects.Sprite;

    constructor (scene:Scene, texture: string, y:number) {
        this.value = 1.0;
        this.bg = scene.add.sprite(16, y, 'packed', 'bar_bg');
        this.bg.displayOriginX = 0;
        this.bg.displayOriginY = 0;

        this.bar = scene.add.sprite(16, y, 'packed', texture);
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
    floppyIcon?: GameObjects.Image;
    blasterIcon?: GameObjects.Image;
    floppyScore?: GameObjects.Text;
    logEntry?: GameObjects.Text;
    lastFloppyScore = 0;

    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'UIScene';
        super(config);
    }

    create () {
        this.airbar = new Bar(this, 'bar_air', 16);
        this.fuelbar = new Bar(this, 'bar_fuel', 40);
        this.stunned = this.add.text(280, 16, "Stunned");
        this.stunned.setVisible(false);

        this.floppyIcon = this.add.image(28, 80, 'packed', 'floppy');
        this.floppyScore = this.add.text(48, 70, '0');
        this.blasterIcon = this.add.image(128, 80, 'packed', 'blaster').setVisible(false);
        this.logEntry = this.add.text(16, 104, '', {color: '#3E1'});

        const game = this.scene.get("GameScene");
        const that = this;
        game.events.on('readFloppy', (msg:string[]) => {
            if(that.logEntry){
                that.logEntry.setText(msg);
            }
        });
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

            if((player.floppies != this.lastFloppyScore) && this.floppyScore){
                this.floppyScore.setText(player.floppies.toString());
            }
            this.blasterIcon?.setVisible(player.hasBlaster);
        }
    }
}