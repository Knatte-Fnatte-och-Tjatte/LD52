import { GameObjects, Scene, Tilemaps, Types } from 'phaser';
import { Player } from '../entities/player';
import { Wreckage } from '../entities/wreckage';
import { Collectable, CollectableType } from '../entities/collectable';
import { Asteroid } from '../entities/asteroid';
import { Conduit } from '../entities/conduit';
import { TileConduit } from '../entities/tileConduit';
import { Floppy } from '../entities/floppy';

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

const animation_frames = (frame:string, frames:number) => {
    const ret = [];
    for(let i=0;i<frames;i++){
        ret.push({key: 'packed', frame:`${frame}/${frame}-${i}`});
    }
    return ret;
};

export class GameScene extends Scene {
    player?: Player;
    lightSources?: GameObjects.Layer;
    cursorKeys?: Types.Input.Keyboard.CursorKeys;
    wasdKeys?: WASDKeyMap;

    gameOverActive: boolean;
    map?: Tilemaps.Tilemap;
    mapLayer?: Tilemaps.TilemapLayer;


    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'GameScene';
        super(config);
        this.gameOverActive = false;
    }

    preload () {
        if(!this.textures.exists('packed')){
           this.load.multiatlas('packed', 'gfx/packed.json', 'gfx');
        }
        this.load.image('tileset', 'gfx/tileset.MACHINE.GENERATED.png');
        this.load.image('lightmask', 'gfx/lightmask.png');
        this.load.image('lightcone', 'gfx/lightcone.png');

        this.load.tilemapTiledJSON('mainmap', 'maps/ship.tmj');

        this.load.audio("plasma_death", "sfx/plasma_death.mp3");
        this.load.audio("fuel_change", "sfx/fuel_change.mp3");
        this.load.audio("oxygen_change", "sfx/oxygen_change.mp3");
        this.load.audio("ambiance", "sfx/ambiance.mp3");
        this.load.audio("typing", "sfx/typing.mp3")

        this.anims.create({key: 'blaster_blast_blasting', frames: animation_frames('blaster_blast', 4), frameRate:24});
        this.anims.create({key: 'plasma_glow_flicker', frames: animation_frames('plasma_glow', 4), frameRate:24, repeat:-1,});
        this.anims.create({key: 'plasma_glow_horiz_flicker', frames: animation_frames('plasma_glow_horiz', 4), frameRate:24, repeat:-1,});
        this.anims.create({key: 'plasma_tile_glow_flicker', frames: animation_frames('plasma_tile_glow', 4), frameRate:12, repeat:-1,});
    }

    create () {

        const worldWidth = 5000;
        const worldHeight = 5000;
        const that = this;

        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D,Q,E') as WASDKeyMap;
        this.gameOverActive = false;
        this.matter.world.setBounds(-worldWidth, -worldHeight, worldWidth*2, worldHeight*2);

        this.scene.run("UIScene");
        const music = this.sound.add('ambiance');
        music.play({loop: true});


        this.map = this.add.tilemap('mainmap');
        const tiles = this.map.addTilesetImage('ship', 'tileset', 32, 32, 1, 2)
        const layer = this.map.createLayer(this.map.layers[0].name, tiles);
        this.mapLayer = layer;

        layer.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(layer);

        layer.forEachTile(tile => {
            switch(tile.index){
                case 18: {
                    const tileWorldPos = layer.tileToWorldXY(tile.x, tile.y);
                    new TileConduit(that, tileWorldPos.x + 16, tileWorldPos.y + 16);
                    break;
                }
            }
        });

        if(this.map.objects[0]?.objects){
            for(const object of this.map.objects[0].objects){
                switch(object.gid||0){
                    case 55:
                        new Collectable(this, (object.x||0), (object.y || 0), 500, "transponder");
                        break;
                    case 56:
                        new Collectable(this, (object.x||0), (object.y || 0), 500, "blaster");
                        break;
                    case 57:
                        const msg = (object?.properties || []).find((p:any) => p?.name === "text")?.value || '';
                        new Floppy(this, (object.x||0), (object.y || 0), msg.split("\n"));
                        break;
                    case 58:
                        new Conduit(this, (object.x||0), (object.y || 0), false);
                        break;
                    case 59:
                        new Conduit(this, (object.x||0), (object.y || 0), true);
                        break;
                    case 60: {
                        const vx = (Math.random() - 0.5) * 0.01;
                        const vy = (Math.random() - 0.5) * 0.01;
                        new Asteroid(this, (object.x||0), (object.y || 0), vx ,vy);
                        break;
                    }
                    case 61:
                        new Wreckage(this, (object.x||0), (object.y || 0));
                        break;
                    case 62:
                        new Collectable(this, (object.x||0), (object.y || 0), 500, "oxygen");
                        break;
                    case 63:
                        new Collectable(this, (object.x||0), (object.y || 0), 500, "fuel");
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
            new Asteroid(this, start_x, start_y, vx, vy);
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
        if(this.cursorKeys?.space.isDown){
            this.player?.blast();
        }
    }
}