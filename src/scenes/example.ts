import { Scene } from 'phaser';

const SPRITE_COUNT = 20;

export class Example extends Scene
{
    constructor (config: string | Phaser.Types.Scenes.SettingsConfig)
    {
        super(config);
    }

    preload ()
    {
        this.load.image('bg', 'assets/background.png');
        this.load.image('sicp', 'assets/player.png');
    }

    create ()
    {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const bg = this.add.tileSprite(width/2, height/2, width, height, 'bg');

        for(let i=0;i<SPRITE_COUNT;i++){
            const b = this.add.image(Math.random() * width, Math.random() * height, 'sicp');
            this.tweens.add({
                targets: b,
                y: Math.random() * height/2 + height/4,
                x: Math.random() * width * 0.8 + width * 0.2,
                ease: 'Sine.easeInOut',
                duration: Math.random() * 200 + 1000,
                yoyo: true,
                repeat: -1
            });
        }
    }
}