if (vars.DEBUG===true) { console.log('Initialising...'); }
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
        update: main,
        pack: {
            files: [
                { type: 'image', key: 'loadingImage', url: 'assets/UI/loading.jpg' },
                { type: 'image', key: 'loadingText', url: 'assets/UI/loadingText.png' }
            ]
        }
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
    vars.enemies.CLUT.init(); // these colurs are used throughout the code and need setting up first.
    scene.add.image(vars.canvas.cX, vars.canvas.cY, 'loadingImage').setName('loadingImage');
    scene.add.image(vars.canvas.cX, vars.canvas.height-100, 'loadingText').setName('loadingText');
    scene.load.setPath('assets');

    // LOADING PROGRESS UI STUFF
    preloadText = scene.add.text(vars.canvas.cX, vars.canvas.height-65, 'Loading...', { fontSize: 20, fontFamily: 'consolas', fill: '#444' }).setOrigin(0.5,0.5);
    versionText = scene.add.text(10, vars.canvas.height-20, 'VERSION ' + vars.version, { fontSize: 20, fontFamily: 'consolas', fill: '#F00' }).setOrigin(0,0.5).setName('version');

    scene.load.on('fileprogress', function (file) { preloadText.setText('Loading asset: ' + file.key); }); // as external file loads

    // MUSIC
    scene.load.audio('intro', 'music/intro.ogg');
    scene.load.audio('gamemusic1', 'music/gameplayTrack1.ogg');
    // BACKGROUND
    let bgList = [
        ['levelBackground', 'level/background_grass.png'],
        ['levelBackground2', 'level/background_water.png'], // this 2nd image isnt used any more as the animated water waves cover the lower part of the screen
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
    scene.load.image('enemyBossBuildingBlock', 'enemy/enemyBuildingBlock.gif');
    scene.load.atlas('bossShield', 'enemy/bossShield.png', 'enemy/bossShield.json');
    // BULLET
    scene.load.spritesheet('bulletPrimaryEnemy', 'enemy/bulletPrimary-ext.png', { frameWidth: 34, frameHeight: 42, margin: 1, spacing: 2 });

    // SCENERY
    scene.load.atlas('asteroid1', 'level/asteroid1.png', 'level/asteroid1.json');
    scene.load.atlas('asteroid2', 'level/asteroid2.png', 'level/asteroid2.json');
    scene.load.image('alienBG', 'level/alienPlanetBG.gif');
    scene.load.spritesheet('alienPlanet', 'level/alienPlanet-ext.png', { frameWidth: 201, frameHeight: 101, margin: 1, spacing: 2 });
    scene.load.spritesheet('barn1', 'level/barn1_600x500.png', { frameWidth: 600, frameHeight: 500 });
    scene.load.spritesheet('barn2', 'level/barn2_600x500.png', { frameWidth: 600, frameHeight: 500 });
    scene.load.atlas('carriers', 'level/carriers.png', 'level/carriers.json');
    scene.load.atlas('ships', 'level/ships.png', 'level/ships.json');
    scene.load.spritesheet('galaxies', 'level/galaxies.png', { frameWidth: 300, frameHeight: 200 });
    scene.load.spritesheet('nebulae', 'level/nebula-ext.jpg', { frameWidth: 720, frameHeight: 2160 });
    scene.load.image('nightTimeMask', 'level/nightTimeMask.png');
    scene.load.image('nightTimeMaskWater', 'level/nightTimeMaskWaterOnly.png');
    scene.load.spritesheet('trees', 'level/trees.png', { frameWidth: 150, frameHeight: 250 });
    scene.load.image('waterGradient', 'level/waterStripe.png'); // 16x400

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
    scene.load.image('fire', 'particles/fire.png');
    scene.load.atlas('rain', 'particles/rain.png', 'particles/rain.json');

    // FONT
    scene.load.bitmapFont('azoRed', 'fonts/azo-red.png', 'fonts/azo-fire.xml');
    scene.load.bitmapFont('azo', 'fonts/azo-fire.png', 'fonts/azo-fire.xml');

    // SHADER PIPE LINES
    // cS = colour scaline
    // gS = grayscale scaline
    // gSS = greenscreen scanline
    // warp = Incoming boss distortion
    scene.cSPipeline = game.renderer.addPipeline('ColourScanline', new ColourScanlinePipeline(scene.game)); // <-- different variables!
    scene.cSPipeline.setFloat2('resolution', game.config.width, game.config.height);
    scene.cSPipeline.setFloat2('mouse', 0.0, 0.0);
    
    scene.gSPipeline = game.renderer.addPipeline('GrayScanline', new GrayScanlinePipeline(scene.game)); // <-- different variables!
    scene.gSPipeline.setFloat2('resolution', game.config.width, game.config.height);
    scene.gSPipeline.setFloat2('mouse', 0.0, 0.0);

    scene.gSSPipeline = game.renderer.addPipeline('GreenScreenScanline', new GreenScreenScanlinePipeline(scene.game)); // <-- different variables!
    scene.gSSPipeline.setFloat2('resolution', game.config.width, game.config.height);
    scene.gSSPipeline.setFloat2('mouse', 0.0, 0.0);

    scene.warpPipeline = game.renderer.addPipeline('EnemyBossWarpPipeline', new EnemyBossWarpPipeline(scene.game));
    scene.warpPipeline.setFloat2('resolution', game.config.width, game.config.height);

    // boss spinners
    scene.bossSpinnerBlue = game.renderer.addPipeline('bossSpinnerBlue', new bossSpinnerBlue(scene.game));
    scene.bossSpinnerBlue.setFloat2('resolution', game.config.width, game.config.height);

    scene.bossSpinnerGreen = game.renderer.addPipeline('bossSpinnerGreen', new bossSpinnerGreen(scene.game));
    scene.bossSpinnerGreen.setFloat2('resolution', game.config.width, game.config.height);

    scene.bossSpinnerPurple = game.renderer.addPipeline('bossSpinnerPurple', new bossSpinnerPurple(scene.game));
    scene.bossSpinnerPurple.setFloat2('resolution', game.config.width, game.config.height);

    scene.bossSpinnerPurple2 = game.renderer.addPipeline('bossSpinnerPurple2', new bossSpinnerPurple2(scene.game));
    scene.bossSpinnerPurple2.setFloat2('resolution', game.config.width, game.config.height);

    scene.bossSpinnerRed = game.renderer.addPipeline('bossSpinnerRed', new bossSpinnerRed(scene.game));
    scene.bossSpinnerRed.setFloat2('resolution', game.config.width, game.config.height);

    scene.bossSpinnerYellow = game.renderer.addPipeline('bossSpinnerYellow', new bossSpinnerYellow(scene.game));
    scene.bossSpinnerYellow.setFloat2('resolution', game.config.width, game.config.height);

    // set up the shader pipelines time variables
    scene.t = 0; // only needed for shaders that change over time (such as waves etc)
    scene.tIncrement = 0.03; // see above + basic increment used in main() for shaders

    // frag shaders
    //scene.load.glsl('bossSpinnerSprites', 'shaders/sprites/bossSpinners.glsl.js'); // these can be attached to sprites
    //scene.load.glsl('bossSpinnerCamera', 'shaders/cameras/bossSpinners.glsl.js'); // these can be attached to cameras

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

    // UI
    scene.load.image('loaded',        'UI/loaded.png');
    scene.load.image('loadedImage',   'UI/loadedImage.png');
    scene.load.image('hpBarInner',    'UI/hpBarInner.png');
    scene.load.image('hpBarOutline',  'UI/hpBarOutline.png');
    scene.load.atlas('hpBarPlayer',   'UI/hpBarPlayer.png', 'UI/hpBarPlayer.json');
    scene.load.atlas('photoSButtons', 'UI/photosensitiveButtons.png', 'UI/photoS.json');
    scene.load.image('photoSScreen',  'UI/siezure_warning.png');
    scene.load.spritesheet('pixel',   'UI/pixels-ext.png', { frameWidth: 50, frameHeight: 50, margin: 1, spacing: 2 });
    scene.load.image('title',         'UI/title.png');
    scene.load.atlas('upgradesBar',   'UI/upgradesBar.png', 'UI/upgradesBar.json');
    // UI = 3D Anims
    scene.load.image('3DBG', 'UI/__3DEnemies/3DBG.png');
    scene.load.image('3DBGShadow', 'UI/__3DEnemies/3DBGShadow.png');
    scene.load.atlas('namePlates', 'UI/__3DEnemies/namePlates.png', 'UI/__3DEnemies/namePlates.json');
    scene.load.image('namePlateShadow', 'UI/__3DEnemies/namePlateShadow.png');
    scene.load.atlas('3DBlue', 'UI/__3DEnemies/eBlue.png', 'UI/__3DEnemies/eBlue.json');
    scene.load.atlas('3DGreen', 'UI/__3DEnemies/eGreen.png', 'UI/__3DEnemies/eGreen.json');
    scene.load.atlas('3DRed', 'UI/__3DEnemies/eRed.png', 'UI/__3DEnemies/eRed.json');
    scene.load.atlas('3DPurple', 'UI/__3DEnemies/ePurple.png', 'UI/__3DEnemies/ePurple.json');
    scene.load.atlas('3DYellow', 'UI/__3DEnemies/eYellow.png', 'UI/__3DEnemies/eYellow.json');

    // VIDEO
    scene.load.video('introVideo', 'video/spaceinvaders.mp4');
}



/*
█████ ████  █████ █████ █████ █████ 
█     █   █ █     █   █   █   █     
█     ████  ████  █████   █   ████  
█     █   █ █     █   █   █   █     
█████ █   █ █████ █   █   █   █████ 
*/
function create() {
    preloadText.destroy(); preloadText=undefined;
    scene.input.on('pointermove', function (pointer) { 
        scene.gSPipeline.setFloat2('mouse', pointer.x, pointer.y);
        scene.gSSPipeline.setFloat2('mouse', pointer.x, pointer.y);
    });
    vars.cameras.preInit();

    let loaded = scene.add.image(vars.canvas.cX, vars.canvas.height-95, 'loaded').setName('loaded');
    scene.tweens.add({ targets: loaded, scale: 0.69, ease: 'Bounce', duration: 3000, repeat: -1, yoyo: true })
    scene.sound.setVolume(vars.audio.volume); // this volume is roughly equal to the volume of a standard youtube video.

    // INPUT
    vars.input.init(); // keys that control the game config (music etc)
    inputInit(); // game controls

    // scenery animations init
    animationInit('asteroids');

    //var gridEx = scene.add.grid(0,0,896,896,32,32,0x00ff00).setOrigin(0,0)
    // SET UP THE GROUPS
    scene.groups = {};
    scene.groups.scoreGroup = scene.add.group();
    scene.groups.logoGroup = scene.add.group();

    // levels
    vars.levels.init();

    // player
    scene.groups.shipUpgradeGroup = scene.add.group();
    scene.groups.shipPowerUpGroup = scene.add.group();
    animationInit('shipUpgrades');
    animationInit('upgrades');
    bullets = scene.physics.add.group(); // there are lots of links to this, do later TODO, should be scene.groups.bullets

    // enemies
    enemies = scene.physics.add.group(); // same with this one! Should be scene.groups.enemies
    scene.groups.enemyBossGroup = scene.physics.add.group();
    scene.groups.enemyBullets = scene.physics.add.group();
    scene.groups.enemyAttackingGroup = scene.physics.add.group();
    scene.groups.enemyAttackingGroup25 = scene.physics.add.group();
    scene.groups.enemy3DGroup = scene.add.group();

    // scenery
    alienPlanetContainer = scene.add.container();
    scene.groups.nebulaGroup = scene.add.group();
    scene.groups.sceneryGroup = scene.add.group();
    scene.groups.wavesGroup = scene.add.group();

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
    animationInit('3D');
    generateSprites(); // spriteGenerator.js
    enemyAttackPatternsNonDynamic(); // enemy.js

    // draw the background(s)
    bG = scene.add.image(0,0,'levelBackground').setScale(vars.canvas.width,1).setOrigin(0,0).setName('levelBG').setVisible(false).setDepth(0);
    vars.game.generateWaterWaves(); // the waves are created then hidden so they can be faded in on level 10
    // night time mask used on level 5 - 15
    scene.add.image(vars.canvas.cX, vars.canvas.height,'nightTimeMask').setOrigin(0.5,1).setAlpha(0).setName('nightTimeMask');

    //console.log('%c Generating Alien Planet', vars.console.callFrom);
    vars.scenery.generateAlienPlanet();

    // draw the player
    let sV = vars.player.ship;
    player = scene.physics.add.sprite(vars.canvas.cX, vars.canvas.height-75, 'player').setName('player').setVisible(false);//.setScale(vars.game.scale);
    player.setCollideWorldBounds(true);
    player.setSize(sV.bodyWidths[0][0], sV.bodyWidths[0][1]);

    // physics overlaps
    scene.physics.add.overlap(bullets, enemies, enemyHit, null, this);
    scene.physics.add.overlap(bullets, scene.groups.enemyBossGroup, enemyBossHit, null, this);
    scene.physics.add.overlap(scene.groups.enemyBullets, player, playerHit, null, this);
    scene.physics.add.overlap(scene.groups.shipUpgradeGroup, player, shipUpgradePickUp, null, this);
    scene.physics.add.overlap(scene.groups.shipPowerUpGroup, player, shipPowerUpPickUp, null, this);
    scene.physics.add.overlap(scene.groups.enemyAttackingGroup, bullets, enemyAttackingHit, null, this);
    scene.physics.add.overlap(scene.groups.enemyAttackingGroup25, bullets, enemy25Hit, null, this);

    // set up the particles
    particles = scene.add.particles('particles');
    particlesInit();

    // everything has loaded, swap the loading image
    scene.children.getByName('loadingImage').destroy();
    let loadingImage = scene.add.image(vars.canvas.cX, vars.canvas.cY, 'loadedImage').setName('loadingImage').setInteractive();
    loadingImage.on('pointerdown', vars.intro.start);
    // show the new title (space invasion blue)
    scene.add.image(vars.canvas.cX, 745, 'title').setName('title');

    setTimeout( function() { // normally I try not to use timeouts but the function its requesting is safe (ie it wont crash the game or do anything weird)
        vars.intro.logoDraw();
    }, 7500)

    scene.children.getByName('loadingText').destroy();

    vars.localStorage.init();
}