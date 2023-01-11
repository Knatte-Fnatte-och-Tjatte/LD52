import { Scene } from 'phaser';
import { GameScene } from '../game/gameScene';

export class GameWonScene extends Scene {
    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'GameWonScene';
        super(config);
    }

    restartGame () {
        this.scene.stop('GameOverScene');
        this.scene.get('GameScene').scene.restart();
    }

    create () {
        const that = this;
        const gs = that.scene.get("GameScene") as GameScene;
        const deathCount = gs.player?.deathCount;
        this.add.text(this.scale.width/2 - 48, 64, ["Congratulations", "", "You won!","",`And only died ${deathCount} times`], { align: 'center'});

        const tryAgainButton = this.add.image(this.scale.width/2, this.scale.height - 128, 'packed', 'button_try_again');
        tryAgainButton.setInteractive().on("pointerdown", () => {
            that.scene.stop('GameWonScene');
            that.scene.get('GameScene').scene.restart();
        })
    }

    update(time: number, delta: number): void {
        const that = this;
        if(this.input.gamepad.gamepads[0]){
            const gamepad = this.input.gamepad.gamepads[0];
            if(gamepad.B){
                that.restartGame();
            }
        }
    }
}