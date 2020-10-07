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

    // LOADING PROGRESS UI STUFF
    preloadText = scene.add.text(vars.canvas.cX, vars.canvas.cY, 'Loading...', { fontSize: 20, fontFamily: 'consolas', fill: '#444' }).setOrigin(0.5,0.5);

    scene.load.on('fileprogress', function (file) { preloadText.setText('Loading asset: ' + file.key); }); // as external file loads
    scene.load.on('complete', function () { preloadText.destroy(); preloadText=undefined; });

    // MUSIC
    scene.load.audio('intro', 'music/intro.ogg');
    scene.load.audio('gamemusic1', 'music/gameplayTrack1.ogg');
    // BACKGROUND
    let bgList = [
        ['levelBackground', 'level/background_grass.png'],
        ['levelBackground2', 'level/background_water.png'],
    ]
    bgList.forEach( (bgData)=> {
        scene.load.image(bgData[0], bgData[1]);
    })

    // PLAYER
    scene.load.spritesheet('player', 'player/player.png', { frameWidth: 100, frameHeight: 75});
    // BULLET
    scene.load.image('bulletPrimary', 'player/bulletPrimary.png');
    // ROCKETS
    scene.load.spritesheet('rocket', 'player/rocket.png', { frameWidth: 40, frameHeight: 120 });
    // SHIP UPGRADE CRATES
    scene.load.spritesheet('upgradeBox', 'player/upgradeBox.png', { frameWidth: 80, frameHeight: 35 });

    // ENEMIES
    scene.load.spritesheet('enemies', 'enemy/enemies-ext.png', { frameWidth: 100, frameHeight: 100, margin: 1, spacing: 2 });
    // BULLET
    scene.load.spritesheet('bulletPrimaryEnemy', 'enemy/bulletPrimary-ext.png', { frameWidth: 34, frameHeight: 42, margin: 1, spacing: 2 });

    // SCENERY
    scene.load.spritesheet('trees', 'level/trees.png', { frameWidth: 150, frameHeight: 250 });
    scene.load.spritesheet('barn1', 'level/barn1_600x500.png', { frameWidth: 600, frameHeight: 500 });
    scene.load.spritesheet('barn2', 'level/barn2_600x500.png', { frameWidth: 600, frameHeight: 500 });

    // UPGRADES
    scene.load.spritesheet('upgradesB', 'upgrades/bulletUpgrades-ext.png', { frameWidth: 50, frameHeight: 60, margin: 1, spacing: 2 });
    scene.load.spritesheet('upgradesH', 'upgrades/health-ext.png', { frameWidth: 100, frameHeight: 100, margin: 1, spacing: 2 });
    scene.load.spritesheet('upgradesP', 'upgrades/points-ext.png', { frameWidth: 200, frameHeight: 100, margin: 1, spacing: 2 });
    scene.load.spritesheet('upgradesS', 'upgrades/fields-ext.png', { frameWidth: 100, frameHeight: 100, margin: 1, spacing: 2 });

    // HIGHLIGHTS
    scene.load.spritesheet('highlights', 'UI/highlights-ext.png', { frameWidth: 350, frameHeight: 350, margin: 1, spacing: 2 });
    scene.load.spritesheet('highlightsConnector', 'UI/connectors-ext.png', { frameWidth: 59, frameHeight: 80, margin: 1, spacing: 2 });

    // PARTICLES
    scene.load.atlas('particles', 'particles/particles.png', 'particles/particles.json');
    //scene.load.text('enemyPieceJSON', 'particles/enemyPieces.json'); <--- this is the actual config for the enemy piece but implementing it is a dick, so ive faked it... Should probably implement it properly at some point TODO

    // FONT
    scene.load.bitmapFont('azo', 'fonts/azo-fire.png', 'fonts/azo-fire.xml');

    // SOUNDS
    scene.load.audio('enemyShoot',       'audio/enemyBlaster.ogg');
    scene.load.audio('enemyHit',         'audio/enemyHit.ogg');
    scene.load.audio('enemyBossHit',     'audio/enemyBossHit.ogg');
    scene.load.audio('enemyBossExplode', 'audio/enemyBossExplode.ogg');
    scene.load.audio('enemyExplode',     'audio/enemyExplode.ogg');
    scene.load.audio('pickUpStandard',   'audio/pickup.ogg');
    scene.load.audio('playerDeath',      'audio/playerDeath.ogg');
    scene.load.audio('playerGun1',       'audio/blaster.ogg');
    scene.load.audio('playerHit',        'audio/bulletBounce.ogg');
    scene.load.audio('playerShieldDrop', 'audio/playerLoseShield.ogg');

    // SPEECH (original voice from https://www.naturalreaders.com/online/ English UK Rachel -> Goldwave, mechanise (star wars droid low) -> echo (reverb))
    scene.load.audio('speechBonusPoints',     'speech/bonusPoints.ogg');
    scene.load.audio('speechHP',              'speech/hpUpgrade.ogg');
    scene.load.audio('speechDoubleDamage',    'speech/doubleDamage.ogg');
    scene.load.audio('speechDoubleFireRate',  'speech/doubleFireRate.ogg');
    scene.load.audio('speechIncomingBoss',    'speech/warningIncomingBoss.ogg');
    scene.load.audio('speechShield100',       'speech/shield100.ogg');
    scene.load.audio('speechShield75',        'speech/shield75.ogg');
    scene.load.audio('speechShield50',        'speech/shield50.ogg');
    scene.load.audio('speechShield25',        'speech/shield25.ogg');
    scene.load.audio('speechShieldDestroyed', 'speech/shieldDestroyed.ogg');
    scene.load.audio('speechShieldUpgrade',   'speech/shieldUpgrade.ogg');

    // VIDEO
    scene.load.video('introVideo', 'video/spaceinvaders.mp4');


    // SHADER PIPE LINES
    // cS = colour scaline
    // gS = grayscale scaline
    // gSS = greenscreen scanline
    scene.gSPipeline = game.renderer.addPipeline('GrayScanline', new GrayScanlinePipeline(scene.game)); // <-- different variables!
    scene.gSPipeline.setFloat2('resolution', game.config.width, game.config.height);
    scene.gSPipeline.setFloat2('mouse', 0.0, 0.0);
    scene.cSPipeline = game.renderer.addPipeline('ColourScanline', new ColourScanlinePipeline(scene.game)); // <-- different variables!
    scene.cSPipeline.setFloat2('resolution', game.config.width, game.config.height);
    scene.cSPipeline.setFloat2('mouse', 0.0, 0.0);
    scene.gSSPipeline = game.renderer.addPipeline('GreenScreenScanline', new GreenScreenScanlinePipeline(scene.game)); // <-- different variables!
    scene.gSSPipeline.setFloat2('resolution', game.config.width, game.config.height);
    scene.gSSPipeline.setFloat2('mouse', 0.0, 0.0);
    scene.warpPipeline = game.renderer.addPipeline('EnemyBossWarpPipeline', new EnemyBossWarpPipeline(scene.game));
    scene.warpPipeline.setFloat2('resolution', game.config.width, game.config.height);
}



/*
█████ ████  █████ █████ █████ █████ 
█     █   █ █     █   █   █   █     
█     ████  ████  █████   █   ████  
█     █   █ █     █   █   █   █     
█████ █   █ █████ █   █   █   █████ 
*/
function create() {
    scene.input.on('pointermove', function (pointer) { 
        scene.gSPipeline.setFloat2('mouse', pointer.x, pointer.y);
        scene.gSSPipeline.setFloat2('mouse', pointer.x, pointer.y);
    });
    scene.sound.setVolume(vars.audio.volume); // this volume is roughly equal to the volume of a standard youtube video.

    // INPUT
    vars.input.init(); // keys that control the game config (music etc)
    inputInit(); // game controls

    //var gridEx = scene.add.grid(0,0,896,896,32,32,0x00ff00).setOrigin(0,0)
    // set up the groups and colliders
    // UI
    scoreGroup = scene.add.group();

    // player
    shipUpgradeGroup    = scene.add.group();
    shipPowerUpGroup    = scene.add.group();
    animationInit('shipUpgrades');
    animationInit('upgrades');

    bullets             = scene.physics.add.group();

    // enemies
    enemies             = scene.physics.add.group();
    enemyBossGroup      = scene.physics.add.group();
    enemyBullets        = scene.physics.add.group();
    enemyAttackingGroup = scene.physics.add.group();

    // scenery
    sceneryGroup = scene.add.group();

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
    animationInit('enemies');

    // draw the background
    bG = scene.add.image(0,0,'levelBackground').setScale(vars.canvas.width,1).setOrigin(0,0).setName('levelBG').setVisible(false);

    // draw the player
    let sV = vars.player.ship;
    player = scene.physics.add.sprite(vars.canvas.cX, vars.canvas.height-75, 'player').setName('player').setVisible(false);//.setScale(vars.game.scale);
    player.setCollideWorldBounds(true);
    player.setSize(sV.bodyWidths[0][0], sV.bodyWidths[0][1]);

    // physics overlaps
    scene.physics.add.overlap(bullets, enemies, enemyHit, null, this);
    scene.physics.add.overlap(bullets, enemyBossGroup, enemyBossHit, null, this);
    scene.physics.add.overlap(enemyBullets, player, playerHit, null, this);
    scene.physics.add.overlap(shipUpgradeGroup, player, shipUpgradePickUp, null, this);
    scene.physics.add.overlap(shipPowerUpGroup, player, shipPowerUpPickUp, null, this);
    scene.physics.add.overlap(enemyAttackingGroup, bullets, enemyAttackingHit, null, this);

    // set up the particles
    particles = scene.add.particles('particles');
    particlesInit();

    // start the game
    if (vars.audio.isEnabled===true) {
        scene.sound.play('intro', { loop: true });
    }
    vars.video.play();
    storyInit();
    player.setDepth(10);

    // if debug is enabled add the debug overlay
    if (vars.DEBUGHIDE===false) {
        vars.DEBUGTEXT = this.add.text(0, 0, '', { font: '12px consolas', fill: '#ffffff' });
        vars.DEBUGTEXT.setOrigin(0,0);
        vars.DEBUGTEXT.setStroke(0x000000,4)
    }

    // cameras
    vars.cameras.init();
    vars.cameras.ignore(cam2, player);

    // set up the shader pipelines time variables
    scene.t = 0; // only needed for shaders that change over time (such as waves etc)
    scene.tIncrement = 0.03; // see above + basic increment used in main() for shaders

}