import { Scene } from 'phaser';
import { GameScene } from '../game/gameScene';

export class GameOverScene extends Scene {
    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'GameOverScene';
        super(config);
    }

    continueGame () {
        const gs = this.scene.get("GameScene") as GameScene;
        this.scene.stop('GameOverScene');
        if(gs.player){
            gs.player.isDead = false;
            gs.player.fuel = 1000;
            gs.player.oxygen = 1000;
            gs.gameOverActive = false;
        }
    }

    restartGame () {
        this.scene.stop('GameOverScene');
        this.scene.get('GameScene').scene.restart();
    }

    create () {
        const that = this;
        const gs = that.scene.get("GameScene") as GameScene;
        const deathCount = gs.player?.deathCount;

        const $dom = document.createElement("div");
        $dom.style.textAlign = 'center';
        $dom.innerHTML = `<h1>Game Over</h1>
        <h2>Death Count: ${deathCount}</h2>
        <br/><br/>
        <button class="red-button">Start over</button>
        <br/><br/>
        <button class="green-button">Try again</button>`;
        this.add.dom(this.scale.width/2, this.scale.height/2, $dom);

        const $tryAgain = $dom.querySelector("button.green-button") as HTMLElement;
        $tryAgain.addEventListener("click", this.continueGame.bind(this));
        $tryAgain.focus();

        const $startOver = $dom.querySelector("button.red-button") as HTMLElement;
        $startOver.addEventListener("click", this.restartGame.bind(this));
    }

    update(time: number, delta: number): void {
        const that = this;
        if(this.input.gamepad.gamepads[0]){
            const gamepad = this.input.gamepad.gamepads[0];
            if(gamepad.B){
                that.restartGame();
            }
            if(gamepad.A){
                that.continueGame();
            }
        }
    }
}