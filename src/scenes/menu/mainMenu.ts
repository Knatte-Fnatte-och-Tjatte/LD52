import { GameObjects, Scene } from 'phaser';

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
        const titleText = this.add.text(1280/2 - 74, 64, ["Space Harvest Wreckage","Extreme 2001"], { align: 'center'});
        const introText = this.add.text(1280/2 - 320, 128, introTextArr, { align: 'justify', fixedWidth: 640});

        const startButton = this.add.image(1280/2, 720 - 128, 'packed', 'button_start');
        const that = this;
        startButton.setInteractive().on("pointerdown", () => {
            that.startGame();
        });

        const params = new URLSearchParams(window.location.search);
        const skipMenu = params.get("skipMenu");
        if(skipMenu){
            this.startGame();
        }

    }
}