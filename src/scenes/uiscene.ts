import { Scene, Types } from 'phaser';
import { Bar } from '../ui/fuelbar';
import { Player } from '../entities/player';
import { Wreckage } from '../entities/wreckage';
import { GameScene } from './gamescene';

const SPRITE_COUNT = 20;

export class UIScene extends Scene {
    fuelbar?: Bar;
    airbar?: Bar;
    energybar?: Bar;

    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'UIScene';
        config.active = true;
        super(config);
    }

    preload () {
        this.load.image('bar_bg', 'assets/bar_bg.png');
        this.load.image('bar_air', 'assets/bar_air.png');
        this.load.image('bar_fuel', 'assets/bar_fuel.png');
        this.load.image('bar_energy', 'assets/bar_energy.png');
    }

    create () {
        const game = this.scene.get('GameScene');
        this.airbar = new Bar(this, 'bar_air', 16);
        this.fuelbar = new Bar(this, 'bar_fuel', 40);
        this.energybar = new Bar(this, 'bar_energy', 64);
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
        }
    }
}