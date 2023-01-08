import { GameObjects, Scene, Tilemaps, Types } from 'phaser';
import { Player } from '../entities/player';
import { Wreckage } from '../entities/wreckage';
import { Collectable, CollectableType } from '../entities/collectable';
import { Asteroid } from '../entities/asteroid';

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

    wrecks: Wreckage[];
    collectables: Collectable[];
    asteroids: Asteroid[];
    gameOverActive: boolean;
    lastAsteroidShower: number;
    map?: Tilemaps.Tilemap;


    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'GameScene';
        super(config);
        this.wrecks = [];
        this.collectables = [];
        this.asteroids = [];
        this.gameOverActive = false;
        this.lastAsteroidShower = 0;
    }

    preload () {
        this.load.tilemapTiledJSON('ship', 'maps/ship.tmj');
        this.load.image('ship', 'assets/tilemap.png');

        this.load.image('player', 'assets/player.png');
        this.load.image('lightmask', 'assets/lightmask.png');
        this.load.image('lightcone', 'assets/lightcone.png');

        this.load.image('asteroid', 'assets/asteroid.png');
        this.load.image('hull', 'assets/hull.png');

        this.load.image('fuel', 'assets/fuel.png');
        this.load.image('oxygen', 'assets/oxygen.png');
        this.load.image('battery', 'assets/battery.png');

        this.load.image('thrust_rotate_cw', 'assets/thrust_rotate_cw.png');
        this.load.image('thrust_rotate_ccw', 'assets/thrust_rotate_ccw.png');
        this.load.image('thrust_backward', 'assets/thrust_backward.png');
        this.load.image('thrust_forward', 'assets/thrust_forward.png');
        this.load.image('thrust_strafe_left', 'assets/thrust_strafe_left.png');
        this.load.image('thrust_strafe_right', 'assets/thrust_strafe_right.png');

        this.load.audio("fuel_change", "sfx/fuel_change.mp3");
        this.load.audio("oxygen_change", "sfx/oxygen_change.mp3");
        this.load.audio("battery_change", "sfx/battery_change.mp3");
    }

    create () {
        this.map = this.add.tilemap('ship');
        const tiles = this.map.addTilesetImage('ship');
        const layer = this.map.createLayer(this.map.layers[0].name, tiles);

        layer.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(layer);

        const worldWidth = 5000;
        const worldHeight = 5000;
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D,Q,E') as WASDKeyMap;
        this.gameOverActive = false;

        this.matter.world.setBounds(-worldWidth, -worldHeight, worldWidth*2, worldHeight*2);

        this.lights.enable();

        this.lastAsteroidShower = this.time.now - ASTEROID_SHOWER_INTERVAL * 2;

        this.wrecks = [];
        for(let i=0;i<50;i++){
            const x = (Math.random()-0.5) * worldWidth*2;
            const y = (Math.random()-0.5) * worldHeight*2;
            this.wrecks.push(new Wreckage(this, x, y));
        }

        this.collectables = [];
        const ta:CollectableType[] = ["fuel", "oxygen", "battery"];
        for(let i=0;i<100;i++){
            const x = (Math.random()-0.5) * worldWidth*2;
            const y = (Math.random()-0.5) * worldHeight*2;
            const t = ta[(Math.random() * 3)|0];
            const v = Math.random() * 1000.0;
            this.collectables.push(new Collectable(this, x, y, v, t));
        }

        for(let i=0;i<100;i++){
            const x = (Math.random()-0.5) * worldWidth*2;
            const y = (Math.random()-0.5) * worldHeight*2;
            const vx = (Math.random()-0.5) * 0.2;
            const vy = (Math.random()-0.5) * 0.2;
            this.asteroids.push(new Asteroid(this, x, y, vx, vy));
        }

        this.scene.run("UIScene");

        for(const object of this.map.objects[0].objects){
            if(object.gid == 21){
                this.player = new Player(this, (object.x||0), (object.y||0), this.cursorKeys, this.wasdKeys);
            }
            if(object.gid == 20){
                this.collectables.push(new Collectable(this, (object.x||0), (object.y || 0), 500, "battery"));
            }
            if(object.gid == 19){
                this.collectables.push(new Collectable(this, (object.x||0), (object.y || 0), 500, "fuel"));
            }
            if(object.gid == 18){
                this.collectables.push(new Collectable(this, (object.x||0), (object.y || 0), 500, "oxygen"));
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
        if(time > this.lastAsteroidShower + ASTEROID_SHOWER_INTERVAL){
            this.lastAsteroidShower = time;
            //this.spawnAsteroidShower();
        }

        if(this.cursorKeys?.space.isDown){
            if(time > this.lastAsteroidShower){
                this.spawnAsteroidShower();
            }
            this.lastAsteroidShower = time + 50.0;
        }
    }
}