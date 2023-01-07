import { Scene } from 'phaser';

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

    preload () {
        this.load.image('button_start', 'assets/button_start.png');
    }

    create () {
        const titleText = this.add.text(1280/2 - 74, 64, ["Cosmonaut Game"], { align: 'center'});

        const introText = this.add.text(1280/2 - 320, 128, introTextArr, { align: 'justify', fixedWidth: 640});

        const tryAgainButton = this.add.image(1280/2, 720 - 128, 'button_start');
        const that = this;
        tryAgainButton.setInteractive().on("pointerdown", () => {
            that.scene.switch("GameScene");
        })
    }

    update(time: number, delta: number) {

    }
}