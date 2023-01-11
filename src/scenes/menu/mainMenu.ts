import { GameObjects, Scene, Types } from 'phaser';

const introTextArr = `Another routine mission, *yawn*.

Become an astronaut they said.

You will experience great adventures
and get to see the universe!

But they don't tell you about all the
boredom and monotonous work.

Everything is double or triple monitored and secured.

I guess the most difficult part
of the job is not to be bored to death.

*yawn*

*snoring*`.split("\n");

export class MainMenuScene extends Scene {
    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'MainMenuScene';
        super(config);
    }

    startGame () {
        this.scene.run("UIScene");
        this.scene.switch("GameScene");
    }

    create () {
        const that = this;
        const titleText = this.add.text(this.scale.width/2 - 74, 64, ["Space Harvest Wreckage","Extreme 2001"], { align: 'center'});
        const introText = this.add.text(this.scale.width/2 - 320, 128, introTextArr, { align: 'justify', fixedWidth: 640});

        const startButton = this.add.image(this.scale.width/2, this.scale.height - 128, 'packed', 'button_start');
        startButton.setInteractive().on("pointerdown", () => {
            that.startGame();
        });


        const params = new URLSearchParams(window.location.search);
        const skipMenu = params.get("skipMenu");
        if(skipMenu){
            that.startGame();
        }
    }

    update(time: number, delta: number): void {
        const that = this;
        if(this.input.gamepad.gamepads[0]){
            const gamepad = this.input.gamepad.gamepads[0];
            if(gamepad.A){
                that.startGame();
            }
        }
    }
}