import { GameObjects, Scene } from 'phaser';
import { Bar } from '../ui/fuelbar';
import { GameScene } from './gamescene';

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
        this.load.image('bar_energy', 'assets/bar_energy.png');
    }

    create () {
        this.airbar = new Bar(this, 'bar_air', 16);
        this.fuelbar = new Bar(this, 'bar_fuel', 40);
        this.energybar = new Bar(this, 'bar_energy', 64);
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
            if(this.energybar){
                this.energybar.value = player.battery / player.batteryMax;
                this.energybar.update(this, time, delta);
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