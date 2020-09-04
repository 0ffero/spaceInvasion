console.log('Initialising...');
init();

var config = {
    title: "spaceInvasion",
    type: Phaser.WEBGL,

    backgroundColor: '#000000',
    disableContextMenu: true,

    height: vars.canvas.height,
    width: vars.canvas.width,
    parent: 'spaceInvasion',

    input: {
        gamepad: true,
    },

    physics: {
        default: 'arcade',
        arcade: { debug: vars.DEBUG }
    },

    scale: {
        parent: 'spaceInvasion',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: vars.canvas.width,
        height: vars.canvas.height,
    },

    scene: {
        preload: preload,
        create: create,
        update: main
    }
};

var game = new Phaser.Game(config);


/*
█████ ████  █████ █      ███  █████ ████  
█   █ █   █ █     █     █   █ █   █ █   █ 
█████ ████  ████  █     █   █ █████ █   █ 
█     █   █ █     █     █   █ █   █ █   █ 
█     █   █ █████ █████  ███  █   █ ████  
*/
function preload() {
    scene = this;
    scene.load.setPath('assets');
    // MUSIC
    scene.load.audio('intro', 'music/intro.ogg');
    scene.load.audio('gamemusic1', 'music/gameplayTrack1.ogg');
    scene.load.audio('gamemusic2', 'music/gameplayTrack2.ogg');
    // BACKGROUND
    let bgList = [
        ['levelBackground', 'level/background_grass.png'],
        ['levelBackground2', 'level/background_water.png'],
    ]
    bgList.forEach( (bgData)=> {
        scene.load.image(bgData[0], bgData[1]);
    })

    // PLAYER
    scene.load.spritesheet( 'player', 'player/player.png', { frameWidth: 100, frameHeight: 75});
    // BULLET
    scene.load.image('bulletPrimary', 'player/bulletPrimary.png');
    // SHIP UPGRADE CRATES
    scene.load.spritesheet( 'upgradeBox', 'player/upgradeBox.png', { frameWidth: 250, frameHeight: 100 });

    // ENEMIES
    scene.load.spritesheet( 'enemies', 'enemy/enemies-ext.png', { frameWidth: 100, frameHeight: 100, margin: 1, spacing: 2 });

    // BULLET
    scene.load.spritesheet('bulletPrimaryEnemy', 'enemy/bulletPrimary-ext.png', { frameWidth: 34, frameHeight: 42, margin: 1, spacing: 2 });

    // SCENERY
    scene.load.spritesheet( 'trees', 'level/trees.png', { frameWidth: 150, frameHeight: 250 });
    scene.load.spritesheet( 'barn1', 'level/barn1_600x500.png', { frameWidth: 600, frameHeight: 500 });
    scene.load.spritesheet( 'barn2', 'level/barn2_600x500.png', { frameWidth: 600, frameHeight: 500 });

    // PARTICLES
    scene.load.atlas('particles', 'particles/particles.png', 'particles/particles.json');
    //scene.load.text('enemyPieceJSON', 'particles/enemyPieces.json'); <--- this is the actual config for the enemy piece but implementing it is a dick, so ive faked it... Should probably implement it properly at some point TODO

    // FONT
    scene.load.bitmapFont('azo', 'fonts/azo-fire.png', 'fonts/azo-fire.xml');

    // SOUNDS
    scene.load.audio('enemyHit', 'audio/enemyHit.ogg');
    scene.load.audio('enemyBossHit', 'audio/enemyBossHit.ogg');
    scene.load.audio('playerGun1', 'audio/primaryGun.ogg');
}



/*
█████ ████  █████ █████ █████ █████ 
█     █   █ █     █   █   █   █     
█     ████  ████  █████   █   ████  
█     █   █ █     █   █   █   █     
█████ █   █ █████ █   █   █   █████ 
*/
function create() {
    scene.sound.setVolume(0.5)
    //var gridEx = scene.add.grid(0,0,896,896,32,32,0x00ff00).setOrigin(0,0)

    // set up the colliders
    bullets = scene.physics.add.staticGroup();
    enemies = scene.physics.add.group();
    sceneryGroup = scene.add.group();
    shipUpgradeGroup = scene.add.group();
    // add enemy count to the enemies var
    let note = '\n\nNOTES:\nAnother weird thing PHASER does... the frame total, for some inexplicable fukn\nreason is 1 more than the actual count. So we need a version check here :S\nIf we get an error on the count we know that this count CANNOT be trusted!';
    vars.versionCheck();
    vars.enemies.spriteCount = (scene.textures.list.enemies.frameTotal-1)/2;
    if (vars.enemies.spriteCount%1!==0) {
        let message = 'According to PHASER the sprite count for the enemies is ' + vars.enemies.spriteCount + '\n|||THIS IS A SERIOUS PROBLEM !!!' + note;
        console.error(message);
        if (vars.DEBUG===true) { alert(message); }
        debugger;
    }
    enemyBossGroup = scene.physics.add.group();
    animationInit('enemies');
    enemyBullets = scene.physics.add.group();

    scene.physics.add.overlap(bullets, enemies, enemyHit, null, this);
    scene.physics.add.overlap(bullets, enemyBossGroup, enemyBossHit, null, this);

    // draw the background
    bG = scene.add.image(0,0,'levelBackground').setScale(vars.canvas.width,1).setOrigin(0,0).setName('levelBG').setVisible(false);

    // draw the player
    let sV = vars.player.ship;
    player = scene.physics.add.sprite(vars.canvas.cX, vars.canvas.height-75, 'player').setName('player').setVisible(false);//.setScale(vars.game.scale);
    player.setCollideWorldBounds(true);
    player.setSize(sV.bodyWidths[0][0], sV.bodyWidths[0][1]);
    scene.physics.add.overlap(enemyBullets, player, playerHit, null, this);
    scene.physics.add.overlap(shipUpgradeGroup, player, shipUpgradePickUp, null, this);

    inputInit();
    //animationInit('player');

    // set up the particles
    particles = scene.add.particles('particles');
    particlesInit();

    if (vars.audio.isEnabled===true) {
        scene.sound.play('intro', { loop: true });
    }
    storyInit();

    player.setDepth(10);

}