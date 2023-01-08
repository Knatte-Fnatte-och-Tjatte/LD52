import { GameObjects, Scene, Tilemaps, Types } from 'phaser';
import { Player } from '../entities/player';
import { Wreckage } from '../entities/wreckage';
import { Collectable, CollectableType } from '../entities/collectable';
import { Asteroid } from '../entities/asteroid';
import { Conduit } from '../entities/conduit';
import { TileConduit } from '../entities/tileConduit';

const ASTEROID_SHOWER_INTERVAL = 1.0 * 60.0 * 1000.0;

const normalize = (v:[number, number]) => {
    const m = Math.max(v[0],v[1]);
    return [v[0]/m,v[1]/m];
};

export type WASDKeyMap = {
    W: Phaser.Input.Keyboard.Key,
    A: Phaser.Input.Keyboard.Key,
    S: Phaser.Input.Keyboard.Key,
    D: Phaser.Input.Keyboard.Key,
    Q: Phaser.Input.Keyboard.Key,
    E: Phaser.Input.Keyboard.Key,
}

export class GameScene extends Scene {
    player?: Player;
    lightSources?: GameObjects.Layer;
    cursorKeys?: Types.Input.Keyboard.CursorKeys;
    wasdKeys?: WASDKeyMap;

    conduits: Conduit[];
    wrecks: Wreckage[];
    collectables: Collectable[];
    asteroids: Asteroid[];
    gameOverActive: boolean;
    map?: Tilemaps.Tilemap;


    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'GameScene';
        super(config);
        this.wrecks = [];
        this.collectables = [];
        this.asteroids = [];
        this.conduits = [];
        this.gameOverActive = false;
    }

    preload () {
        this.load.tilemapTiledJSON('ship', 'maps/karteship.tmj');
        this.load.spritesheet('ship', 'assets/tilemap.png', {frameWidth: 32, frameHeight: 32});

        this.load.image('player', 'assets/player.png');
        this.load.image('lightmask', 'assets/lightmask.png');
        this.load.image('lightcone', 'assets/lightcone.png');

        this.load.image('plasma_conduit', 'assets/plasma_conduit.png');
        this.load.image('plasma_conduit_horiz', 'assets/plasma_conduit_horiz.png');
        this.load.spritesheet('plasma_glow', 'assets/plasma_glow.png', { frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('plasma_glow_horiz', 'assets/plasma_glow_horiz.png', { frameWidth: 32, frameHeight: 32});

        this.load.spritesheet('plasma_tile_glow', 'assets/plasma_tile_glow.png', { frameWidth: 64, frameHeight: 64});

        this.load.image('asteroid', 'assets/asteroid.png');
        this.load.image('asteroid_big', 'assets/asteroid_big.png');
        this.load.image('asteroid_tiny', 'assets/asteroid_tiny.png');
        this.load.image('hull', 'assets/hull.png');

        this.load.image('fuel', 'assets/fuel.png');
        this.load.image('oxygen', 'assets/oxygen.png');

        this.load.image('thrust_rotate_cw', 'assets/thrust_rotate_cw.png');
        this.load.image('thrust_rotate_ccw', 'assets/thrust_rotate_ccw.png');
        this.load.image('thrust_backward', 'assets/thrust_backward.png');
        this.load.image('thrust_forward', 'assets/thrust_forward.png');
        this.load.image('thrust_strafe_left', 'assets/thrust_strafe_left.png');
        this.load.image('thrust_strafe_right', 'assets/thrust_strafe_right.png');

        this.load.audio("plasma_death", "sfx/plasma_death.mp3");
        this.load.audio("fuel_change", "sfx/fuel_change.mp3");
        this.load.audio("oxygen_change", "sfx/oxygen_change.mp3");
    }

    create () {
        this.anims.create({key: 'plasma_glow_flicker', frames: 'plasma_glow', frameRate:24, repeat:-1,});
        this.anims.create({key: 'plasma_glow_horiz_flicker', frames: 'plasma_glow_horiz', frameRate:24, repeat:-1,});
        this.anims.create({key: 'plasma_tile_glow_flicker', frames: 'plasma_tile_glow', frameRate:8, repeat:-1,});
        const worldWidth = 5000;
        const worldHeight = 5000;
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D,Q,E') as WASDKeyMap;
        this.gameOverActive = false;
        this.matter.world.setBounds(-worldWidth, -worldHeight, worldWidth*2, worldHeight*2);

        this.conduits = [];
        this.wrecks = [];
        this.collectables = [];
        const that = this;
        this.scene.run("UIScene");

        this.map = this.add.tilemap('ship');
        const tiles = this.map.addTilesetImage('ship');
        const layer = this.map.createLayer(this.map.layers[0].name, tiles);
        layer.forEachTile(tile => {
            if(tile.index == 18){
                const tileWorldPos = layer.tileToWorldXY(tile.x, tile.y);
                const tc = new TileConduit(that, tileWorldPos.x + 16, tileWorldPos.y + 16)
            }
        });

        layer.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(layer);
        if(this.map.objects[0]?.objects){
            for(const object of this.map.objects[0].objects){
                switch(object.gid||0){
                    case 58:
                        this.conduits.push(new Conduit(this, (object.x||0), (object.y || 0), false));
                        break;
                    case 59:
                        this.conduits.push(new Conduit(this, (object.x||0), (object.y || 0), true));
                        break;
                    case 60: {
                        const vx = (Math.random() - 0.5) * 0.01;
                        const vy = (Math.random() - 0.5) * 0.01;
                        this.asteroids.push(new Asteroid(this, (object.x||0), (object.y || 0), vx ,vy));
                        break;
                    }
                    case 61:
                        this.wrecks.push(new Wreckage(this, (object.x||0), (object.y || 0)));
                        break;
                    case 62:
                        this.collectables.push(new Collectable(this, (object.x||0), (object.y || 0), 500, "oxygen"));
                        break;
                    case 63:
                        this.collectables.push(new Collectable(this, (object.x||0), (object.y || 0), 500, "fuel"));
                        break;
                    case 64:
                        this.player = new Player(this, (object.x||0), (object.y||0), this.cursorKeys, this.wasdKeys);
                        break;
                }
            }
        }
        if(!this.player){
            this.player = new Player(this, 0, 0, this.cursorKeys, this.wasdKeys);
        }
        this.cameras.main.setBounds(-worldWidth, -worldHeight, worldWidth*2, worldHeight*2);
        this.cameras.main.startFollow(this.player, false, 0.1, 0.1, 0, 0);
    }

    spawnAsteroidShower(){
        const mdeg = Math.random() * Math.PI*2.0;
        const px = this.player?.x || 0;
        const py = this.player?.y || 0;

        for(let i=0;i<4;i++){
            const deg = mdeg + (Math.random()-0.5) * Math.PI*2.0 * 0.2;
            const start_x = px + Math.cos(deg) * 5000.0;
            const start_y = py + Math.sin(deg) * 5000.0;
            const vx = start_x * -0.005 * (1.0 + ((Math.random() - 0.5)*0.1));
            const vy = start_y * -0.005 * (1.0 + ((Math.random() - 0.5)*0.1));
            this.asteroids.push(new Asteroid(this, start_x, start_y, vx, vy));
        }
    }

    update(time: number, delta: number) {
        this.player?.update(time, delta);
        if(this.player?.isDead){
            if(!this.gameOverActive){
               this.scene.run("GameOverScene");
               this.gameOverActive = true;
            }
        }
    }
}