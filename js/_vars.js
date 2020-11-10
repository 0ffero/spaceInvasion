var fps = 60;
var gameScale = 0.4;

const consts = {
    INVALID: -1,
}

const constsLevelGroups = {
    GRASS        :  0,
    WATER        : 10,
    SPACE        : 20,
    NEBULA       : 25,
    STELLAR      : 30,
    ALIENCITIES  : 35,
    BOSS         : 45
}

const constsM = { // mouse buttons
    mouse: {
        left   : 1,
        right  : 2,
        middle : 4,
        mouse4 : 8,
        mouse5 : 16
    }
}

const constsPS = { // player shields frames
    NO_SHIELD     : { frame: 12, hpLower:   1, hpUpper:  75, strength: 0, var: 0 },
    LOW_SHIELD    : { frame: 9,  hpLower:  76, hpUpper:  99, strengthLower:   0, strength: 25,  var: 1 },
    RED_SHIELD    : { frame: 6,  hpLower: 100, hpUpper: 124, strengthLower:  25, strength: 50,  var: 2 },
    ORANGE_SHIELD : { frame: 3,  hpLower: 125, hpUpper: 149, strengthLower:  50, strength: 75,  var: 3 },
    GREEN_SHIELD  : { frame: 0,  hpLower: 150, hpUpper: 250, strengthLower:  75, strength: 100, var: 4 },
    EXTRA_SHIELD  : { frame: 12, hpLower: 251, hpUpper: 300, strengthLower: 100 },
}

const constsD = { // depth of sprite groups
    BG      :  1,
    SCENERY : 20,
    MAIN    : 50
}


var vars = {
    cameras: {
        init: false,

        flash: function(_flashColour='white', duration=100) {
            let r,g,b;
            if (_flashColour==='white') {
                r=g=b=255;
            } else if (_flashColour==='red') {
                r=255; g=b=0;
            } else if (_flashColour==='green') {
                g=255; r=b=0;
            }

            cam1.flash(duration,r,g,b);
        },

        ignore: function(_cam=cam1, _objects) {
            _cam.ignore(_objects);
        },

        init: function() {
            // CAMERAS
            let nightTimeMask = scene.children.getByName('nightTimeMask');
            cam2.ignore([ bG, enemies, scene.groups.wavesGroup, nightTimeMask, alienPlanetContainer ]);
            shaderType('colour',1);
        },
        
        preInit: function() {
            cam1 = scene.cameras.main;
            cam2 = scene.cameras.add(0, 0, vars.canvas.width, vars.canvas.height); // used for switching between shaders smoothly
            cam2.setAlpha(0);
        },

        shake: function(_cam=cam1, _duration=200) {
            _cam.shake(_duration);
        }
    },

    canvas: {
        width: 720,
        height: 1080,
        cX: -1,
        cY: -1,

        init: function() {
            console.log('      %c...canvas', vars.console.doing);
            let vC = vars.canvas;
            vC.cX = vC.width/2;
            vC.cY = vC.height/2;
        },

        setCursor: function(_type='none') {
            if (_type==='none') {
                scene.sys.canvas.style.cursor = 'none';
            } else if (_type==='cross' || _type==='default') {
                scene.sys.canvas.style.cursor = 'crosshair';
            } else if (_type==='def') {
                scene.sys.canvas.style.cursor = 'default';
            } else {
                console.log('Unknown Cursor Type');
            }
        }
    },

    cheats: {
        annihilate: function(_all=false) {
            let first=true;
            enemies.children.each( (c)=> {
                if (first===true && _all===false) {
                    first=false;
                } else {
                    c.destroy();
                }
            })

            if (_all===true) { // load the next wave
                gameLevelNext();
            }
        },

        bossSpawn: function() {
            vars.enemies.spawnBoss();
        },
        bossSpawnCthulhu: function() {
            vars.levels.wave=3
            vars.enemies.bossNext=4
            vars.cheats.bossSpawn()
        },

        levelSkip: function() {
            vars.cheats.annihilate(true);
        },

        levelSkipTo: function(_level=-1) {
            let wave = _level;
            if (_level===-1) {
                wave = vars.levels.wave+1;
            }
            var cWave = vars.levels.wave;
            var skip = setInterval( function() {
                if (cWave<wave) {
                    vars.cheats.levelSkip();
                    cWave++;
                } else {
                    clearInterval(skip);
                }
            },333, this)
        },

        removeOldLevelScenery: function(_level) {
            if (lV.wave===20 || lV.wave===25 || lV.wave===30 || lV.wave===35 || lV.wave===45) { // space stars, nebula, corona, alien cities, boss
                lV.currentWaveBG = lV.waveBGs[lV.wave];
                changeBackground = true;
            }

            if (bG.visible===true) { bG.visible=false; }
        },
    },

    console: {
        animSetUp: 'font-size: 12px; color: #0080ff;',
        callFrom: 'font-size: 12px; color: green',
        callTo: 'font-size: 14px; color: green',
        doing: 'font-size: 10px; color: yellow',
        error: 'font-size: 12px; color: red; background-color: #660000;',
        errorResolved: 'font-size: 14px; color: yellow; background-color: #006600;',
        playerUpgrade: 'font-size: 14px; color: green; background-color: white;',
    },

    input: {
        init: function() {
            let musicKey = scene.input.keyboard.addKey('M');
            musicKey.on('up', vars.audio.musicEnableDisable);
        }
    },

    test: {
        // filled by test.js <-- generally unused
    },

    DEBUG: false,
    VERBOSE: false,

    DEBUGHIDE: true,
    DEBUGTEXT: '',
    version : '0.9.142 (beta release)',
    versionCheckResult: -1,

    audio: {
        currentTrack: 0,
        gameTracks: ['gamemusic1'],
        isEnabled: true,
        volume: 0.5,

        getNext: function() {
            let aV = vars.audio;
            // delete the current audio sprite
            scene.sound.sounds.forEach( (c)=> {
                c.destroy();
            })

            // then
            if (aV.isEnabled===true) {
                aV.currentTrack<aV.gameTracks.length-1 ? aV.currentTrack++ : aV.currentTrack=0;
                let gM = scene.sound.add(aV.gameTracks[aV.currentTrack]);
                gM.play();
                gM.once('complete', function() {
                    aV.getNext();
                })
            }
        },

        levelMusicStart: function() {
            let aV = vars.audio;
            if (aV.isEnabled===true) {
                let currentTrack = aV.gameTracks[aV.currentTrack];
                let gM = scene.sound.add(currentTrack);
                if (scene.sound.sounds.length===1) {
                    gM.play();
                }
                gM.once('complete', function() {
                    aV.getNext();
                })
            }
        },

        musicEnableDisable: function() {
            let aV = vars.audio;
            if (aV.isEnabled===true) {
                aV.isEnabled=false;
                scene.sound.sounds.forEach( (c)=> {
                    if (c.key==='intro' || c.key==='gamemusic1') {
                        c.setVolume(0);
                    }
                })
            } else {
                aV.isEnabled=true;
                scene.sound.sounds.forEach( (c)=> {
                    if (c.key==='intro' || c.key==='gamemusic1') {
                        c.setVolume(1);
                    }
                })
            }
        },

        stop: function(_override=false) {
            let aV = vars.audio;
            let currentTrack = aV.gameTracks[aV.currentTrack];
            if (aV.isEnabled===true || _override===true) {
                scene.sound.stopByKey(currentTrack);
            }
        }
    },

    enemies: {
        attackTimeout: [8*fps,12*fps],
        attackPatternsEnabled: false,
        attackPatternsNonDynamic: { 
            // generated in enemyAttackPatternsNonDynamic()

            debugPathDraw: function(_path) {
                if (typeof scene.paths[_path] !== 'undefined') {
                    graphics  = scene.add.graphics();
                    let colour = Phaser.Math.RND.between(0, scene.consts.colours.white);
                    graphics.lineStyle(1, colour, 1);
                    scene.paths[_path].draw(graphics, 128);
                }
            },
        },
        availableAttackPatterns: { 
            ready: [],
            used: [],

            getFollowerCount: function() { // this count is only dont when a follower reaches the end of the path
                return scene.groups.enemyAttackingGroup25.children.size;
            },

            init: function() {
                console.log('%c  Setting up available attack patterns', vars.console.callTo);
                let aAP = vars.enemies.availableAttackPatterns;
                for (p in scene.paths) {
                    aAP.ready.push(p);
                }
            },

            pathAddFollowers: function(_pathName='none', _pathData, _maxFollowers = false) {
                if (pathName==='none') { return false; }
                let eV = vars.enemies;
                eV.availableAttackPatterns.used.push(_pathName);
                let delay = _pathData.delay; let duration=_pathData.duration;
                if (delay<=0 || duration<=0) { console.log('Error with path. The delay (' + delay + ') or duration (' + duration + ') was invalid!'); return false; }
                let totalFollowers = _pathData.maxOnPath;
                if (_maxFollowers===true) {
                    totalFollowers = ~~(duration/delay);
                }
                // limit the total followers in case we dont have enough enemies to fill the path (paths have their own max followers variable)
                totalFollowers = Phaser.Math.Clamp(totalFollowers, 0, vars.enemies.list.length);

                let ease = 'Linear'; // if we need to modify the ease for a specific path (most paths WONT need this!)
                /* if (_pathName==='lineToCircle') { ease = 'Sine.easeInOut' } */

                let actualPath = scene.paths[_pathName];
                for (let f=0; f<totalFollowers; f++) {
                    // grab the next enemy and attach to the follower
                    let currentEnemy = vars.enemies.list.shift(); // grab the first available enemy
                    eV.list.push(currentEnemy); // push it to the end of the list
                    let frame = currentEnemy.row;
                    let eName = currentEnemy.name;
                    let enemyFollower = scene.add.follower(actualPath, 0, 0, 'enemies', frame).setScale(0.4).setName('f25_' + eName);
                    scene.groups.enemyAttackingGroup25.add(enemyFollower);
                    if (f===totalFollowers-1) {
                        enemyFollower.startFollow({
                            positionOnPath: true,
                            delay: f*delay,
                            duration: duration,
                            repeat: _pathData.repeat,
                            ease: ease,
                            onComplete: vars.enemies.availableAttackPatterns.pathPickNext
                        });
                    } else {
                        enemyFollower.startFollow({
                            positionOnPath: true,
                            delay: f*delay,
                            duration: duration,
                            repeat: _pathData.repeat,
                            ease: ease
                        });
                    }
                }
            },

            pathPickNext: function() {
                // check that we have enemies left to add to the path
                if (vars.enemies.list.length<=0) { // no enemies left to attach to paths (ie get next level)
                    debugger; // <--- ive left this in, but in general we should be checking
                              // the enemies left when an enemy dies, and going to the next
                              // wave via that function. The only problem is that we may be
                              // jumping to another wave. that means this will come back with
                              // enemies = 0. Obviously ill be adding a function to check this
                              // properly but this will do just now TODO
                }
                // first, sort the enemies by hp
                sortByKey(vars.enemies.list, 'hp', true); // true = sort by highest hp
                let aap = vars.enemies.availableAttackPatterns;
                let rndPath = Phaser.Math.RND.between(0, aap.ready.length-1); // get array index
                let pathNameArray = aap.ready.splice(rndPath,1); // get the path name
                pathName = pathNameArray[0];
                let pathData = vars.enemies.attackPatternsNonDynamic[pathName];
                //console.log(pathName);

                if (aap.ready.length===0) { // this was the last available pattern move all used paths back into ready
                    console.log('All paths used. Resetting them');
                    aap.ready = aap.used;
                    aap.used = [];
                }
                vars.enemies.availableAttackPatterns.pathAddFollowers(pathName, pathData);
            }
        },
        bossMatrix: [
            [-1,-1],[0,-1],[1,-1],
            [-1, 0],[0, 0],[1, 0],
            [-1, 1],[0, 1],[1, 1]
        ],
        bossSpawnTimeout: [25,25], // [0] = current counter [1] = reset to ie every 10 enemy deaths a boss spawns
        bossSpawnCount: 0,
        bossFireRates: [],
        bossFireRatesResets: [],
        bossLimit: 1,
        bossNext: -1,
        bossPaths: [], // these are built at run time. All boss paths are set, unlike standard enemy attack paths which start at the enemy xy
        bulletDamage: 1,

        // NOTE: THE ORDER OF THIS LIST IS IMPORTANT!!
        // If you add colours to the array, at run time they will be assimilated into the collective (CLUT colour lookup table)
        colours: [
            ['red',     0xFF0000, 0xFF0000, '#ff0000'], // name of colour, bullet colour, enemyPiece tint
            ['green',   0x00FF00, 0x00FF00, '#00ff00'],
            ['blue',    0x00BFFF, 0x0000FF, '#0000ff'],
            ['purple',  0xC926FF, 0xA300D9, '#C926FF'],
            ['yellow',  0xFFFF00, 0xffff00, '#FFFF00'],
            ['purple2', 0xC926FF, 0xC926FF, '#C926FF'], // cthulhu's bullets
            ['white',   0xFFFFFF, 0xFFFFFF, '#FFFFFF'],
            ['black',   0x000000, 0x000000, '#000000']
        ],
        CLUT: { // 
            // filled by init

            init: function() {
                scene.consts = {} 
                scene.consts.colours = {}
                for (c of vars.enemies.colours) {
                    // convert the colours to glsl format
                    let glslC = convertHexToRGB(c[3]);
                    vars.enemies.CLUT[c[0]] = { bullet: c[1], piece: c[2], glslColourVector: glslC }
                    scene.consts.colours[c[0]] = c[1];
                }
            }
        },
        cthulhuSpotted: false,
        deadSinceLastPowerup: 0,
        deathTotal: 0,
        landingPositions: [],
        isLanding: false,
        list: [],
        maxYForWinCondition: 800,
        moveDirectionCurrent: 'right',
        moveDirectionPrevious: 'down',
        palette: ['#FFFFFF', '#C7C7C7', '#000000', '#FFFF00', '#FF8000', '#FF0000', '#C70000', '#3399FF', '#0A7DF0', '#0048C7', '#0037A5', '#5EFF92', '#36D900', '#00B300', '#008D00', '#9D64A3', '#88548D', '#A300D9'],
        paletteColours: ['white', 'grey', 'black', 'yellow', 'orange', 'red', 'redDark', 'blueLight', 'blue', 'blueMedium', 'blueDark', 'greenLight', 'green', 'greenMedium', 'greenDark', 'purpleLight', 'purple', 'purpleDark'],
        removeBosses: true,

        replaceArrays: {
            counter: -1,
            methods: {
                1: {
                    replaceArray: [
                        [3,4,5,12,13,14,21,22,23]
                    ],
                },
                2: {
                    replaceArray: [
                        [0,1,2,9,10,11,18,19,20],
                        [6,7,8,15,16,17,24,25,26]
                    ]
                },
            },

            init: function() {
                let eRV = vars.enemies.replaceArrays
                let methods = eRV.methods;
                let counter=0;
                for (m in methods) {
                    counter++;
                }
                vars.enemies.replaceArrays.counter=counter;
            }
        },
        replaceMethodSelected: 1,


        shootTimeout: [fps*0.5, fps*0.5],
        speed: 50,
        speeds: { min: 50, max: 100 },

        spriteCount: -1,
        spritesGenerated: {},

        // these positions are used to determine when the enemies should move
        // down after moving left or right and hitting the edge of the screen
        bounds: { left: -1, right: -1, bottom: 10, },
        updateTimeout: 10, // in frames. We use this to update the enemies velocity
        updateTimeoutMax: 10,
        width: -1,

        attackersFireUpdate: function(_enemyCount) {
            scene.groups.enemyAttackingGroup.children.each( (c)=> {
                let progress = c.pathTween.totalProgress;
                //console.log('Current Progress: ' + progress);

                if (progress===1) {
                    console.log('Enemy progress is 1. Deleting child');
                    // get the original and re-enable it if it isnt dead
                    let phaserObject = scene.children.getByName(c.name.replace('f_', ''));
                    if (phaserObject!==null) {
                        phaserObject.setData('attacking', false);
                        if (phaserObject.getData('dead')!==true) {
                            phaserObject.setVisible(true); // this needs fixing. it will do just now but I also need to disable its hitbox TODO
                        }
                    }
                    c.destroy(); // this is the duplicate that is being destroyed here!
                } else {
                    //console.log('Updating fire timeouts');
                    let initWait = c.getData('initialWait');
                    if (initWait>0) {
                        c.setData('initialWait', initWait-1);
                    } else { // were past the initial wait time out
                        let bulletSpacing = c.getData('bulletSpacing');
                        // are we waiting for the bulletTimeout?
                        if (bulletSpacing>0) { // yes update timeout
                            c.setData('bulletSpacing', bulletSpacing-1);
                        } else { // FIRE!
                            // now test for firespacing
                            let fireSpacing=c.getData('fireSpacing');
                            if (fireSpacing>0) {
                                c.setData('fireSpacing', fireSpacing-1);
                            } else {
                                //console.log('Firing!');
                                let resets = c.getData('resets'); // this is an array
                                if (c.getData('bulletCount')>0) { // we still have bullets left, so fire it
                                    // reduce the bullet count by 1
                                    let bC = c.getData('bulletCount');
                                    c.setData('bulletCount', bC-1);
                                    //now fire
                                    let xy = [c.x, c.y];
                                    let name = c.name;
                                    name = name.replace('f_','');
                                    //debugger;
                                    if (scene.children.getByName(name)!==null) { // make sure the player hasnt just destroyed the enemy
                                        let bullet = scene.children.getByName(name).getData('row')-1;
                                        let scale = vars.game.scale+0.1;
                                        let strength = vars.enemies.bulletDamage*1.05;
                                        vars.enemies.bulletPhysicsObject(xy,bullet,scale,strength);
                                    }
                                } else { // weve fired the last bullet in the sequence, reset the bulletCount
                                    let bulletCount = resets[0];
                                    let fireSpacing = resets[2];
                                    c.setData({ bulletCount: bulletCount, fireSpacing: fireSpacing });
                                }
                                // reset the bullet spacing
                                c.setData('bulletSpacing', resets[1]);
                            }
                        }
                    }
                }
            
            })
        },

        attackTimeoutDo: function() {
            let eV=vars.enemies;
            eV.attackTimeout[0]-=1;
            if (eV.attackTimeout[0]===0) {
                eV.attackTimeout[0] = eV.attackTimeout[1];
                for (let rE=0; rE<1; rE++) { // spawn x enemies that will be attached to a spline. TODO 3 is too many anemies, see trello
                    // randomly pick an enemy to attach a spline
                    let enemy = enemyGetRandom();
                    enemy.setVisible(false); // TODO this also requires the body to be disabled but will do for testing
                    enemy.setData('attacking', true);

                    // get a random path and reverse it if needed
                    let available = eV.enemyPatterns.splines.available;
                    let randomAP = Phaser.Math.RND.between(0, available.length-1);
                    let selectedPath = available[randomAP];
                    let duration=0;
                    if (selectedPath==='alpha') {
                        duration=6000;
                    } else if (selectedPath==='beta') {
                        duration=9000;
                    }
                    if (enemy.x>vars.canvas.cX) { selectedPath+='Reversed'; }
                    console.log('Selected Path: ' + selectedPath);

                    // get the fire timings for the attack type
                    let fireTimings = eV.enemyPatterns.splines.fireTimings;
                    fireTimings = eV.enemyPatterns.modifyFireTimings(fireTimings);

                    // build the spline attack pattern
                    let path = eV.enemyPatterns.convertPatternToSpline(selectedPath,[enemy.x,enemy.y])
                    let enemyXY = [enemy.x, enemy.y];
                    let enemyName = enemy.name; // needed to re-enable the real enemy sprite
                    let enemySpriteFrame = enemy.frame.name%vars.enemies.spriteCount;
                    let attackingEnemy = scene.add.follower(path, enemyXY[0], enemyXY[1], 'enemies', enemySpriteFrame).setName('f_' + enemyName).setScale(vars.game.scale);
                    scene.groups.enemyAttackingGroup.add(attackingEnemy);
                    vars.cameras.ignore(cam2, attackingEnemy);

                    let resets = [fireTimings.bulletCount, fireTimings.bulletSpacing, fireTimings.fireSpacing ];
                    attackingEnemy.setData( { initialWait: fireTimings.initialWait, bulletCount: fireTimings.bulletCount, bulletSpacing: 0, fireSpacing: fireTimings.fireSpacing, resets: resets } );

                    if (duration!==0) {
                        attackingEnemy.startFollow({
                            positionOnPath: true,
                            duration: duration,
                        });
                    } else {
                        console.error('The duration is 0! Attack pattern failed. THIS IS A PROBLEM!');
                    }
                }
            }
        },

        bossBulletSpread: function(_bulletCount=0) {
            let spread = { min: 0, max: 0 };
            if (vars.levels.wave>1) {
                // now, how wide a spread are we going with (based on player hp)
                // obviously a higher spread speed (up to xVelocity(0)+600) would be more dangerous so we'll set the spread based on player hp
                let pV = vars.player;
                if (pV.hitpoints>125) {
                    spread =  { min: 400, max: 600 };
                } else if (pV.hitpoints>100) {
                    spread =  { min: 200, max: 400 };
                } else if (pV.hitpoints>75) {
                    spread =  { min: 150, max: 200 };
                }
                let bulletSpreadSpeed = Phaser.Math.RND.between(spread.min, spread.max);
                
                spreadLimit=0.1;
                if (vars.levels.wave>=15) {
                    spreadLimit=1;
                } else if (vars.levels.wave>=10) {
                    spreadLimit=0.75;
                } else if (vars.levels.wave>=6) {
                    spreadLimit=0.5;
                } else if (vars.levels.wave>=3) {
                    spreadLimit=0.25;
                }
                console.log('Original Spread: ' + bulletSpreadSpeed + ', Spread Limit: ' + spreadLimit);
                bulletSpreadSpeed*=spreadLimit; // reduce the spread at lower levels

                bulletSpreadSpeed = ~~(bulletSpreadSpeed/5)*5; // drop the sread to the closest mult of 5
                console.log('New Spread: ' + bulletSpreadSpeed);
                let startSpeed = bulletSpreadSpeed;
                let xI = ~~(startSpeed*2 / _bulletCount); // gives us the xVel increment
                startSpeed*=-1;
                return [startSpeed, xI];
            } else {
                return [0, 0];
            }
        },

        bossFireRatesInit: function() {
            let eV = vars.enemies;
            // all values are in frames
            let fps = vars.game.fps;
            eV.bossFireRates = [
                { firetimeout: fps*2, bullettimeout: 1, bulletsperframe: 1, bulletcount: 10 },
                { firetimeout: fps*2, bullettimeout: 2, bulletsperframe: 1, bulletcount: 10 },
                { firetimeout: fps*2, bullettimeout: 3, bulletsperframe: 1, bulletcount: 10 },
                { firetimeout: fps*2, bullettimeout: 3, bulletsperframe: 1, bulletcount: 15 },
                { firetimeout: fps*2, bullettimeout: 2, bulletsperframe: 1, bulletcount: 15 },
                { firetimeout: fps*2, bullettimeout: 1, bulletsperframe: 1, bulletcount: 15 },
                { firetimeout: fps*3, bullettimeout: 2, bulletsperframe: 2, bulletcount: 15 } // this firerate is god damned dangerous! We really need to limit it to waves higher than maybe 5 or 7
            ];
            for (let fr=0; fr<eV.bossFireRates.length; fr++) {
                eV.bossFireRatesResets.push({firetimeout: eV.bossFireRates[fr].firetimeout, bullettimeout: eV.bossFireRates[fr].bullettimeout, bulletsperframe: eV.bossFireRates[fr].bulletsperframe, bulletcount: eV.bossFireRates[fr].bulletcount })
            }
        },

        bossFireRateGetRandom: function() {
            let eV = vars.enemies;
            let fireratesMax = 2; // the max index
            if (vars.levels.wave > 7) { // allow all fire rates... including the dangerous ones
                fireratesMax=eV.bossFireRates.length-1;
            } else if (vars.levels.wave>3) {
                fireratesMax+=3;
            }
            let randomShootPattern = Phaser.Math.RND.between(0, fireratesMax);
            let returnData = eV.bossFireRates[randomShootPattern];
            return [returnData, randomShootPattern];
        },

        bulletGetStrength: function() {

        },

        bulletPhysicsObject: function(_xy, _bullet=0, _scale=0.4, _strength=1, _speed=500, _cam2Ignore=true, _xSpeed=0, _boss=false) {
            if (_scale===0.4 && vars.game.scale!==0.4) { _scale = vars.game.scale; }
            let theBullet = scene.physics.add.sprite(_xy[0], _xy[1], 'bulletPrimaryEnemy', _bullet).setScale(_scale);
            theBullet.setName('bullet_' + generateRandomID());
            theBullet.setData({ hp: _strength, boss: _boss });
            scene.sound.play('enemyShoot');
            scene.groups.enemyBullets.add(theBullet);
            if (_cam2Ignore===true) {
                vars.cameras.ignore(cam2, theBullet);
            }
            if (_xSpeed!==0 && vars.DEBUG===true) { // if x speed isnt 0 - this is only used by bosses after wave 1
                console.log('Boss Bullet - Setting xSpeed: ' + _xSpeed);
            }
            theBullet.setVelocity(_xSpeed, _speed);
        },

        checkForWinCondition: function(_lowest) {
            if (_lowest>vars.enemies.maxYForWinCondition) {
                console.log('DEAD! Cause: Enemy boundary reached');
                vars.game.pause();
                vars.game.started=false; // this tells us that we have died
                vars.player.dead();
                vars.enemies.destroyAllBullets();
                return true;
            }
            return false;
        },

        deathCountIncrease: function() {
            let eV = vars.enemies;
            eV.deathTotal+=1;
            // update the dead total text
            scene.children.getByName('deathTextIntS').setText(eV.deathTotal);
            scene.children.getByName('deathTextInt').setText(eV.deathTotal);
        },

        debugBossPatterns: function() {
            let graphics = scene.add.graphics();
            graphics.lineStyle(1, scene.consts.colours.white, 1);
            let bP = vars.enemies.bossPaths;
            for (let path=0; path<bP.length; path++){
                bP[path][1].draw(graphics, 128);
            }
        },

        destroyAllAttackers: function() {
            if (scene.groups.enemyAttackingGroup.children.size>0) {
                scene.groups.enemyAttackingGroup.children.each( (c)=> {
                    c.destroy();
                })
            }
        },

        destroyAllBullets: function() {
            scene.groups.enemyBullets.children.each( (c)=> {
                c.destroy();
            })
        },

        destroyAllBosses: function() {
            if (scene.groups.enemyBossGroup.children.size>0) {
                // hold the boss types in an array
                let bossTypes = '';
                scene.groups.enemyBossGroup.children.each( (c)=> {
                    // get the bosses hp bar
                    let bossName = c.getData('name');
                    bossTypes += c.getData('enemyType');
                    scene.children.getByName('hpO_' + bossName).destroy();
                    scene.children.getByName('hpI_' + bossName).destroy();
                    c.destroy();
                })
                if (vars.shader.current!=='default' && bossTypes.indexOf('5')!==-1) { // if theres a cthulhu boss on screen and the shader isnt default
                    shaderType(); // calling shader type with no vars resets it to default
                }
            }
        },

        hideSmallEnemies: function() {
            // get the total enemy count
            console.log('Hiding small enemies for wave ' + vars.levels.wave);
            let last = enemies.children.size-1;
            enemies.children.each( (c, i)=>{
                let onComplete = null;
                if (i===last) {
                    // start the new enemy paths
                    onComplete = vars.enemies.availableAttackPatterns.pathPickNext;
                }
                c.disableBody(true,false); // stop the enemy
                scene.tweens.add({
                    delay: i*100,
                    targets: c,
                    alpha: 0,
                    duration: 1000,
                    onComplete: onComplete
                })
            })
        },

        increaseEnemySpeed: function() {
            let eV = vars.enemies;
            eV.speed < eV.speeds.max ? eV.speed +=5 : eV.speed = eV.speeds.max;
            //console.log('Enemy speed is now ' + eV.speed);
        },

        init: function() {
            let eV = vars.enemies;
            let border = 20;
            let enemyHalfWidth = 20;
            eV.bounds.left = 0 + border + enemyHalfWidth;
            eV.bounds.right = vars.canvas.width - border - enemyHalfWidth;
            eV.bounds.bottom *= 50;
            enemyBossPatternsCreate();
            eV.bossFireRatesInit();
            eV.replaceArrays.init();
            eV.landingPositionsInit();
        },

        landingPositionsInit: function() {
            let xInc = vars.canvas.width/12; // gives us 11 positions
            let positionsPerRow = 11;
            let rows = 10; let cols = 9; // 90 positions are totally unnecessary as we will probably max out the rows at 7 and cols at 10 (ie 70 positions) TODO we should decide what these maximums are to limit the array
            let maxEnemies=rows*cols;
            let requiredRows = ~~(maxEnemies/positionsPerRow)+1;
            let y = vars.canvas.height-50;

            console.log('Setting up landing positions..\n  total possible enemies: ' + maxEnemies + ', required rows: ' + requiredRows);

            let landingPositions = [];
            for (let r=0; r<requiredRows; r++) {
                for (let x=xInc; x<vars.canvas.width; x+=xInc) { // build the landing array
                    landingPositions.push([x,y]);
                }
                y-=40;
            }

            vars.enemies.landingPositions = landingPositions;
        },

        setEnemyBulletDamage: function() {
            let wave = vars.levels.wave;
            let eV = vars.enemies;
            if (eV.bulletDamage<2 && wave%2===0) {
                eV.bulletDamage += 0.2;
            }
        },

        shootTimeoutDo: function() { // this is for standard enemies only! ie not bosses!
            let eV = vars.enemies;
            if (eV.isLanding===false) {
                if (eV.shootTimeout[0]>0) {
                    eV.shootTimeout[0]--;
                } else {
                    // reset the timeout
                    eV.shootTimeout[0] = eV.shootTimeout[1];
                    // get random enemy
                    let randomEnemy = enemyGetRandom();
                    if (randomEnemy!==false) { // there may be no enemies to choose from is only 1 enemy is on screen AND its attacking, in which case the above function returns false
                        let xy = [parseInt(randomEnemy.x), parseInt(randomEnemy.y+25)];
                        let bullet = randomEnemy.getData('row')-1;
                        let scale = vars.game.scale+0.1;
                        let strength = vars.enemies.bulletDamage;
                        //console.log('    Spawning bullet for enemy: ' + randomEnemy.name + ' at ' + xy[0] + ',' + xy[1]);
                        eV.bulletPhysicsObject(xy,bullet,scale,strength);
                    }
                }
            }
        },

        spawn: function() {
            let eV = vars.enemies;
            eV.list = [];
            eV.speed = 50 + (vars.levels.wave*2);
            let xPos = vars.game.rowStartY;
            eV.moveDirectionPrevious = eV.moveDirectionCurrent = 'right';
            let nextWave = vars.levels.wave+1;

            // how many enemy rows are we showing?
            let rows = 5; // early levels
            if (nextWave>=20) { rows = 6; } // add cthulhu to the enemies

            // and how many columns?
            let cols=9; // early levels
            if (nextWave>=25) { cols = 10; }

            for (let row=1; row<=rows; row++) { // only five rows and 9 cols are visible at the start, but we create all of the enemies here
                for (let col=1; col<=cols; col++) {
                    eV.list.push(new enemy(0, row, col * xPos, col));
                }
            }
            // if wave >1 & <25 we modify the spawn positions of the enemies
            if (vars.levels.wave>1 && vars.levels.wave<25) {
                eV.spawnPositionsModify();
            }
        },

        spawnPositionsModify: function() {
            let mapChange=3;
            let eV = vars.enemies;
            let rA = eV.replaceArrays.counter;
            if (vars.levels.wave%(mapChange*rA)===3) {
                // do first map change
                eV.replaceMethodSelected = 1;
            } else if (vars.levels.wave%(mapChange*rA)===0) {
                // do 2nd map change
                eV.replaceMethodSelected = 2;
            }
            
            let cut = 9;
            let waveMod = eV.replaceArrays.methods;
            let method = waveMod[eV.replaceMethodSelected].replaceArray;
            let counter = -1;
            let lL = this.list.length;

            method.forEach( (a)=> {
                counter++;
                let cutA = lL - (cut * (counter+1));
                let cutB = lL - (cut * (counter));
                //console.log('Cutting from ' + cutA + ' to ' + cutB);
                let originalArray = this.list.slice(cutA, cutB); // grab the last row
                for (let id=0; id<originalArray.length; id++) {
                    let replaceWith = a[id];
                    let swapping = enemies.children.getArray()[replaceWith];
                    //console.log('Replacing ' + originalArray[id].name + ' with ' + swapping.name + ' (position ' + replaceWith + ')' );
                    // get the current frames for the enemies
                    let scale = vars.game.scale;
                    let original = [originalArray[id].x * scale, originalArray[id].y * scale];
                    let swap = [swapping.x, swapping.y];
                    // now swap them over
                    swapping.setPosition(original[0],original[1]);
                    // find the actual sprite that were moving
                    let lookingFor = originalArray[id].name;
                    let phaserObject = scene.children.getByName(lookingFor);
                    phaserObject.setPosition(swap[0], swap[1]);
                    // do we need to update any data?
                }
                //console.log('-------------- METHOD END --------------');
            })
        },

        spawnBoss: function() {
            let eV = vars.enemies;
            eV.bossSpawnTimeout[0] = eV.bossSpawnTimeout[1]; // reset the timeout

            // create a boss enemy
            let boss = new enemyBoss();
        },

        update: function() {
            let eV = vars.enemies;
            //this function was becoming unweildy so its been moved to enemy.js
            if (vars.levels.wave < 25) { // the first 25 levels
                enemiesMove();
                // now we check to see if the enemies should be shooting (only happens every few seconds)
                eV.shootTimeoutDo();
                eV.attackTimeoutDo();
                if (scene.groups.enemyAttackingGroup.children.size>0) {
                    eV.attackersFireUpdate(scene.groups.enemyAttackingGroup.children.size);
                }
            } else { // enemy movement after level 24
                // enemies after level 24 are controlled by
                // vars.enemies.availableAttackPatterns.pathPickNext();
                // the above function is instantiated in hideSmallEnemies()
            }
            
        }

    },

    game: {
        graphics: null,

        awaitingInput: true,
        bulletCheckTimeout: [fps/2, fps/2],
        bonusSpawnCount: [0,0,0,0,0,0,0,0,0,0], // basically used for debugging
        upgradeNames: ['  Hit Points: +25 hp','  Hit Points: +50 hp','  Hit Points: +75 hp','  Bullets - Double Fire Rate','  Bullets - Double Damage','  Points: +2000','  Points: +3000','  Points: +5000', 'Shade Field', 'Amstrad Defence Field'],
        lastChanceArray: [],
        fps: fps,
        paused: true,
        pausedReason: 'intro',
        pauseReasons: ['intro', 'betweenLevels', 'highlight'],
        started: false,
        storyVisible: false,
        rowStartY: 100,
        rowStartX: 20,
        scale: 0.4,
        scores: {
            current: 0,
            best: 0,
        },

        createWaterTweens: function() {
            // create the tweens in paused state (also invisible) as they arent used until wave 10
            scene.groups.wavesGroup.children.each( (c, i)=> {
                scene.tweens.add({
                    paused: false,
                    targets: c,
                    y: 960,
                    duration: 1000,
                    ease: 'Quad.easeInOut',
                    delay: i * 69,
                    yoyo: true,
                    repeat: -1
                });
            })
        },

        generateWaterWaves: function() {
            // create the waves (tweens are created when we reach wave 10)
            let yOffset = 940
            for (let i = 0; i < 45; i++) {
                let waterimage = scene.add.image(8 + i * 16, yOffset, 'waterGradient').setVisible(false);
                scene.groups.wavesGroup.add(waterimage);
            }
        },

        introStart: function() {
            if (vars.game.awaitingInput===true) {
                vars.game.awaitingInput=false;
                // fade out the loading screen
                let loadingImage = scene.children.getByName('loadingImage');
                let loaded = scene.children.getByName('loaded');
                let title = scene.children.getByName('title');
                scene.children.getByName('version').destroy();
                scene.tweens.add({ targets: [loadingImage, title], alpha: 0, ease: 'linear', duration: 1000 })
                scene.tweens.add({ targets: loaded, alpha: 0, ease: 'linear', duration: 1000, onComplete: vars.game.loadingImageDestroy })

                // make the logo invisible if it exists (it destroys itself)
                scene.groups.logoGroup.setVisible(false);

                // start the game
                if (vars.audio.isEnabled===true) {
                    scene.sound.play('intro', { loop: true });
                }

                vars.video.play();
                storyInit();
                player.setDepth(10);

                // init camera views
                vars.cameras.init();
                vars.cameras.ignore(cam2, player);

                // if debug is enabled add the debug overlay
                if (vars.DEBUGHIDE===false) {
                    vars.DEBUGTEXT = scene.add.text(0, 0, '', { font: '12px consolas', fill: '#ffffff' });
                    vars.DEBUGTEXT.setOrigin(0,0);
                    vars.DEBUGTEXT.setStroke(scene.consts.colours.black,4);
                }
            }
        },

        loadingImageDestroy: function() {
            scene.children.getByName('loadingImage').destroy();
            scene.children.getByName('loaded').destroy();
            scene.children.getByName('title').destroy();
        },

        pause: function() {
            scene.physics.pause();
            let vG = vars.game;
            vG.paused=true;
            enemies.children.each( function(c) {
                c.setVisible(false);
            })
            // destroy the scenery currently visible as were about to speed up the tween speed
            if (scene.groups.sceneryGroup.children.size>0) {
                scene.groups.sceneryGroup.children.each( (c)=>{
                    c.destroy();
                })
            }
            vars.canvas.setCursor('none');
            //player.anims.stop(); // player is no longer animated
        },

        pauseForHighlightedObject: function() {
            scene.physics.pause(); // this will pause player bullets, enemy bullets, standard enemies
            // doesnt stop: "attacking enemies", upgrades, bosses (as they are tweens). So lets do that now
            allTweens = scene.tweens.getAllTweens();
            allTweens.forEach( (c)=> {
                c.timeScale=0;
            })
            // setting the following variables modifies how main() works. Basically were stopping everything apart from the stars
            let gV = vars.game;
            gV.paused=true;
            gV.pausedReason = 'highlight';
            gV.awaitingInput=true;
            //scene.sys.canvas.style.cursor = 'default';
        },

        unpause: function() {
            scene.physics.resume();
            let vG = vars.game;
            vG.paused=false;
            // bring the enemies to the front and start them moving
            enemies.children.each( function(c) { c.setVisible(true).setVelocityX(vars.enemies.speed).setDepth(1); })
            vars.cameras.ignore(cam2, enemies);
            vars.levels.wavePopupVisible=false;
            vars.canvas.setCursor('cross');
        },

        unpauseAfterHighlight: function() {
            // enable physics
            scene.physics.resume();
            // enable tweens
            allTweens = scene.tweens.getAllTweens();
            allTweens.forEach( (c)=> {
                c.timeScale=1;
            })
            if (scene.tweens._pending.length>0) { // check for pending tweens (tweens created in the same frame as the paused setting set to true)
                scene.tweens._pending.forEach( (c)=> {
                    c.resume();
                })
            }
            // enable game vars
            let gV = vars.game;
            gV.paused=false;
            gV.pausedReason = '';
            gV.awaitingInput=false;
        }

    },

    intro: {
        loadingImageFadeIn: function() {
            // check if weve transitioned to playing the game
            if (scene.children.getByName('loadingImage')===null) {
                return false;
            }
            vars.cameras.flash('white',1250);
            // empty out the logo group
            if (scene.groups.logoGroup.children.entries.length!==0) {
                scene.groups.logoGroup.children.each( (c)=> {
                    c.destroy();
                })
                scene.groups.logoGroup.clear(); // ok so clearing out the group, doesnt actually destroy the children... because OF COURSE IT DOESNT... fukn Phaser.
            }
            // if we havent fade the loaded image back in
            let a = scene.children.getByName('loadingImage');
            let b = scene.children.getByName('title');
            scene.tweens.add({ delay: 500, targets: [a,b], alpha: 1, duration: 1000, yoyo: true, hold: 7500, onComplete: vars.intro.logoDraw })
        },

        logoDraw: function() {
            if (scene.children.getByName('loadingImage')===null) { // the game has started before calling this function, return false
                return false;
            }
            if (vars.game.awaitingInput===false) { // ignore this function if the game was started during the hold tween of loadingImage and title (loadingImageFadeIn())
                return false;
            }
            // before drawing the logo, we simply blink out the loading image and title
            scene.children.getByName('loadingImage').setAlpha(0.001);
            scene.children.getByName('title').setAlpha(0.001);
            vars.cameras.flash('white', 1250);
            let ofour = vars.intro.ofour;

            let startX = 120; let startY = 100;
            let xInc = yInc = 50; let tOffset = 150;
            let c = 0;
            for (row of ofour) {
                let y = startY + (c*yInc);
                c++;
                //console.log('NewRow');
                for (let p=0; p<row.length; p++) {
                    let x = startX + (p * xInc);
                    let pixel = row[p];
                    //console.log(' Pixel ' + pixel + ' at ' + x + ',' + y);
                    if (pixel===1) {
                        let a = scene.add.image(x,y,'pixel').setAlpha(0);
                        scene.tweens.add({ delay: c*tOffset+(p*tOffset), targets: a, alpha: 1, duration: 1000, yoyo: true, hold: 4000 })
                        scene.groups.logoGroup.add(a);
                    }
                }
            }

            let offeroGames = vars.intro.offeroGames;
            let scale=0.5; startX = 50; xInc = yInc = 25; tOffset = 75; startY = 550; c=0; let lastOne = false;
            for (row of offeroGames) {
                let y = startY + (c*yInc);
                c++;
                //console.log('NewRow');
                for (let p=0; p<row.length; p++) {
                    let x = startX + (p * xInc);
                    let pixel = row[p];
                    let onComplete = null;
                    if (p===row.length-1 && c===offeroGames.length-1) {
                        onComplete=vars.intro.loadingImageFadeIn;
                    }
                    //console.log(' Pixel ' + pixel + ' at ' + x + ',' + y);
                    if (pixel===1 || pixel===2 || lastOne===true) {
                        let a = scene.add.image(x,y,'pixel', pixel-1).setAlpha(0).setScale(scale);
                        scene.tweens.add({ delay: (c*tOffset)+(p*tOffset), targets: a, ease: 'Quad.easeIn', alpha: 1, duration: 1000, yoyo: true, hold: 4000, onComplete: onComplete })
                        scene.groups.logoGroup.add(a);
                    }
                }
            }
        },

        offeroGames: [
            [1,1,1,1,0,1,1,1,2,1,1,1,2,1,1,1,2,1,1,1,0,0,0,1,1,0],
            [1,0,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1,0,0,1],
            [1,0,1,1,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,1,0,0,1,0,0,1],
            [1,1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1,0,0,1],
            [1,0,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1,0,0,1],
            [1,1,1,1,2,1,0,0,0,1,0,0,0,1,1,1,0,1,0,0,1,2,2,1,1,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,1,1,1,0,0,1,1,1,0,0,1,0,0,0,1,0,1,1,1,1,0,1,1,1,1],
            [1,0,0,0,0,1,0,0,0,1,0,1,1,0,1,1,0,1,0,0,0,0,1,0,0,0],
            [1,0,1,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,0,0,1,1,1,1],
            [1,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,0,0,0,0,1],
            [1,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,0,1,0,0,1],
            [1,1,1,1,2,1,0,0,0,1,2,1,0,0,0,1,2,1,1,1,1,2,1,1,1,1]
        ],
        ofour: [
            [1,1,1,1,0,0,0,1,0,0],
            [1,0,0,1,0,0,1,0,0,0],
            [1,0,1,1,0,1,0,0,1,0],
            [1,1,0,1,0,1,1,1,1,1],
            [1,0,0,1,0,0,0,0,1,0],
            [1,1,1,1,0,0,0,0,1,0]
        ],
    },

    levels: {
        currentWaveBG: 'grass',
        waveBGs: {
            0: 'grass',
            10: 'water',
            20: 'space',
            25: 'nebula',
            30: 'stellar',
            35: 'alienCities',
            45: 'boss',
            51: 'final'
        },
        raining: false,
        rainCheck: [20*fps,20*fps],
        wave: 0,
        waveInitialisedList: {
            // filed by init()
        },
        wavePopupVisible: false,

        alienPlanetScroll: function(_tween, _object) {
            if (_tween===undefined) {
                // this is the first time weve entered this function
                // fade in the alien planet
                let alienBG = scene.children.getByName('alienBG');
                // fade in the background
                scene.tweens.add({ targets: alienBG, ease: 'Linear', alpha: 1, duration: 3000 })
                // fade in the alien planet
                scene.tweens.add({ targets: alienPlanetContainer, ease: 'Linear', alpha: 1, duration: 10000 })
            } else { // reset the alien planet
                alienPlanetContainer.y = vars.scenery.alienPlanet.height;
            }
            // scroll the alien planet
            scene.tweens.add({ targets: alienPlanetContainer, ease: 'Linear', y: 51, duration: 15000, onComplete: vars.levels.alienPlanetScroll })
        },

        changeBackground: function(_bgtype='grass') {
            switch (_bgtype) {
                case 'alienCities': // wave 35
                    // hide the stellar corona
                    vars.levels.stellarCorona();

                    // show the alien cities
                    scene.tweens.add({ targets: alienPlanetContainer, ease: 'Linear', alpha: 0.5, duration: 5000 })
                    scene.tweens.add({ targets: alienPlanetContainer, ease: 'Linear', y: 10000, duration: 180000 })
                break;

                case 'boss': // wave 45
                    // hide the alien cities

                    // show the boss background

                break;

                case 'nebula': // wave 25
                    // stop the space stars
                    vars.levels.starsSpace();

                    let sV = vars.scenery;

                    // generate a few galaxies
                    sV.generateNewGalaxy(null,null,8);

                    // add a nebula
                    sV.generateNewNebula(null,null,true);
                break;

                case 'space': // wave 20
                    // fade out the waves
                    scene.groups.wavesGroup.children.each( (c)=> {
                        scene.tweens.add({ paused: false, targets: c, alpha: 0, duration: 1000, ease: 'Quad.easeInOut' });
                    })

                    // hide the background image
                    let bg = scene.children.getByName('levelBG');
                    scene.tweens.add({ paused: false, targets: bg, alpha: 0, duration: 1000, ease: 'Quad.easeInOut' });

                    // make sure it isnt raining
                    if (scene.rain.visible===true) {
                        scene.rain.setActive(false).setVisible(false); scene.rain.destroy(); scene.rain = undefined;
                    }

                    // increase the max Y for the default star emitter
                    vars.scenery.starsMaxY = vars.canvas.height;

                    // enable the new space stars emitter
                    vars.levels.starsSpace();
                break;

                case 'stellar': // wave 30
                    // disable the old static stars emitter (we dont delete in as I may use them again after level 46)
                    starEmitter.remove();
                    // hide any nebulae & galaxies (we just hide them as they have callbacks that destroy them)
                    scene.groups.nebulaGroup.children.each( (c)=> {
                        scene.tweens.add({ targets: c, alpha: 0, ease: 'linear', duration: 3000 })
                    })

                    // show the stellar corona
                    vars.levels.stellarCorona();
                break;

                case 'water': // wave 10
                    vars.game.createWaterTweens();
                    scene.groups.wavesGroup.children.each( (c)=> {
                        c.setVisible(true);
                    });
                break;
            }
        },

        finalChecks: function() { // this happens after the wave pop up/fly by
            let lV = vars.levels;
            if (lV.waveInitialisedList['wave' + lV.wave].initialised===false) {
                // set the level to intialised
                lV.waveInitialisedList['wave' + lV.wave].initialised=true;

                console.log('Final Checks for wave ' + vars.levels.wave);
                if (lV.wave===25) {
                    vars.enemies.attackPatternsEnabled = true;
                    //fade out the enemies as they are going to be attached to a path instead of moving back and forth
                    vars.enemies.hideSmallEnemies();
                }
                vars.game.unpause();
                // if there are still bosses on screen, re-enable their hp bars
                let eB = scene.groups.enemyBossGroup;
                if (eB.children.size>0) {
                    eB.children.each( (c)=> {
                        let cName = c.name;
                        let enemyName = cName.replace('f_','');
                        scene.children.getByName('hpO_' + enemyName).setVisible(true);
                        scene.children.getByName('hpI_' + enemyName).setVisible(true);
                    })
                }
            }
        },

        init: function() {
            let lV = vars.levels;
            let type = lV.waveBGs[0];
            waveInitObject = lV.waveInitialisedList;
            for (let w=1; w<=51; w++) {
                if (lV.waveBGs[w]!==undefined) {
                    if (vars.DEBUG===true) { console.log('Changing BG type in waveInitObject to ' + vars.levels.waveBGs[w]); }
                    type = lV.waveBGs[w];
                }
                waveInitObject['wave' + w] = { initialised: false, type: type }
            }
        },

        levelBGChange: function() {
            let lV = vars.levels;
            let changeBackground = false;
            if (lV.wave===5) { // night time fade in
                lV.nightTimeFade('in');
            } else if (lV.wave===10) { // water
                lV.currentWaveBG = lV.waveBGs[lV.wave];
                scene.children.getByName('nightTimeMask').destroy();
                let nTMW = scene.add.image(vars.canvas.cX, vars.canvas.height,'nightTimeMaskWater').setOrigin(0.5,1).setAlpha(1).setName('nightTimeMask');
                vars.cameras.ignore(cam2, nTMW);
                changeBackground = true;
            } else if (lV.wave===15) { // night time fade out
                lV.nightTimeFade('out');
            } else if (lV.wave===20 || lV.wave===25 || lV.wave===30 || lV.wave===35 || lV.wave===45) { // space stars, nebula, corona, alien cities, boss
                lV.currentWaveBG = lV.waveBGs[lV.wave];
                changeBackground = true;
            }

            if (changeBackground === true) {
                let newBG = lV.currentWaveBG;
                lV.changeBackground(newBG);
            }
        },

        nightTimeFade: function(_inout='in') {
            let nightTimeMask = scene.children.getByName('nightTimeMask');
            let alpha = 0;
            if (_inout==='in') {
                alpha = 1;
            }
            scene.tweens.add({ targets: nightTimeMask, alpha: alpha, ease: 'linear', duration: 10000 })
        },

        rain: function(_init=false) {
            if (scene.rain===undefined) { // the rain effect hasnt been initialised yet.
                vars.levels.rainInit();
                if (_init===true) {
                    scene.rain.setActive(false).setVisible(false);
                    return true;
                }
            }
            if (scene.rain.visible===true) {
                //console.log('Rain OFF');
                scene.rain.setActive(false).setVisible(false);
            } else {
                //console.log('Rain ON!');
                scene.rain.setActive(true).setVisible(true);
            }
        },

        rainCheckReducto: function() {
            let lV = vars.levels;
            if (lV.rainCheck[0]<=0) {
                lV.rainCheck[0]=lV.rainCheck[1];
                let rainChange = Phaser.Math.RND.between(0,1)===1 ? true : false;
                if (rainChange===true) { vars.levels.rain(); }
            } else {
                lV.rainCheck[0]-=1;
            }
        },

        rainInit: function() {
            scene.rain = scene.add.particles('rain');
            scene.rain.createEmitter({
                frame: 'white',
                y: 10,
                x: { min: 5, max: 715 },
                lifespan: 750,
                tint: [ 0xDDDDDD, 0x4DD2FF, 0x4DA6FF, 0x4D7AFF],
                alpha: { min: 0.1, max: 0.2 },
                speedY: { min: 1000, max: 1400 },
                scaleX: { start: 0.02, end: 0.02 },
                scaleY: { start: 0.01, end: 0.2 },
                quantity: 4,
                blendMode: 'ADD'
            });
        },

        starsSpace: function(_init=false) {
            if (scene.spaceStars===undefined) { // the spaceStars effect hasnt been initialised yet.
                vars.levels.starsSpaceInit();
                if (_init===true) {
                    scene.spaceStars.setActive(false).setVisible(false);
                    return true;
                }
            }
            if (scene.spaceStars.visible===true) {
                //console.log('Space Stars OFF');
                scene.spaceStars.setActive(false).setVisible(false);
            } else {
                //console.log('Space Stars ON!');
                scene.spaceStars.setActive(true).setVisible(true);
            }
        },

        starsSpaceInit: function() {
            scene.spaceStars = scene.add.particles('rain');
            scene.spaceStars.createEmitter({
                frame: 'white',
                y: { min: -100, max: 800 },
                ease: 'Quad.InOut',
                x: { min: 5, max: 715 },
                lifespan: 4000,
                alpha: (function (p, k, t) { return Phaser.Math.Clamp(1 - 2 * Math.abs(t - 0.5), 0, 0.5); }),
                speedY: { min: 50, max: 100 },
                scaleX: 0.01,
                scaleY: { start: 0.1, end: 0.6 },
                quantity: 0.01,
                blendMode: 'ADD'
            });
        },

        stellarCorona: function(_init=false) {
            if (scene.stellarCorona===undefined) { // the rain effect hasnt been initialised yet.
                vars.levels.stellarCoronaInit();
                if (_init===true) {
                    scene.stellarCorona.setActive(false).setVisible(false);
                    return true;
                }
            }
            if (scene.stellarCorona.visible===true) {
                //console.log('Stellar Corona OFF');
                scene.stellarCorona.setActive(false).setVisible(false);
            } else {
                //console.log('Stellar Corona ON!');
                scene.stellarCorona.setActive(true).setVisible(true);
            }
        },

        stellarCoronaInit: function() {
            scene.stellarCorona = scene.add.particles('rain');
            scene.stellarCorona.createEmitter({
                frame: 'white',
                y: 10,
                x: { min: 5, max: 715 },
                lifespan: 750,
                tint: [ 0xFFFF00, 0xFFBF00, 0xFF8000],
                alpha: { min: 0.1, max: 0.2 },
                speedY: { min: 1000, max: 1400 },
                scaleX: { start: 0.02, end: 0.02 },
                scaleY: { start: 0.01, end: 0.2 },
                quantity: 8,
                blendMode: 'ADD'
            });
        },

        waveIncrement: function() {
            let lV = vars.levels;
            lV.wave++;
            // update the overlay
            scene.children.getByName('waveTextIntS').setText(lV.wave);
            scene.children.getByName('waveTextInt').setText(lV.wave);
            lV.wavePopupVisible=true;
            if (lV.wave===10) { // level 10 stops bosses being destroyed between waves
                vars.enemies.removeBosses=false;
            }

            vars.levels.levelBGChange(); // check if we should be changing the background
        }
    },

    particles: {
        currentEmitters: {},

        bossFireEmitter: function(_x=false,_y=false, _id=false, _boss) {
            if (_x===false || _y===false || _id===false || _boss===null) {
                console.error('Invalid x/y vars or no boss passed... halting');
                return false;
            }

            // THIS IS PRACTICALLY THE SAME AS THE generateFireEmitter EXCEPT IT FOLLOWS A BOSS
            // give the particle a random offset so they arent all in a line (max 15 px offset in any direction giving us a 5 pixel margin)
            _x += Phaser.Math.RND.between(-15,15); _y += Phaser.Math.RND.between(-15,15);
            let fire = scene.add.particles('fire').createEmitter({
                x: _x, // these are offsets, because of course they FUKN ARE!!!! DAMMIHNC$NYCB*N&*OT. "Thats obvious!" "No It ISNT!" I pass you the x,y. YOU figure out the offset...SHEESH!
                y: _y, // these need to be renamed to spriteXoffset etc :S Its fine! I know now :S Plus.. the effect IS awesome. Thank god etc
                speed: { min: 100, max: 200 },
                angle: { min: -85, max: -95 },
                scale: { start: 0.2, end: 0.4, ease: 'Back.easeOut' },
                alpha: { start: 0.4, end: 0, ease: 'Quart.easeOut' },
                blendMode: 'SCREEN',
                lifespan: 1000,
                follow: _boss,
            });
            fire.name = 'bfE_' + _boss.name + '_' + _id;
            vars.cameras.ignore(cam2, fire);

            vars.particles.currentEmitters[fire.name] = fire;
        },

        destroyFireEmitters: function() {
            // remove any lingering emitters
            let emitters = vars.particles.currentEmitters;
            for (emitterName in emitters) {
                let thisEmitter = emitters[emitterName];
                if (thisEmitter!==undefined) {
                    thisEmitter.remove();
                }
            }
            // empty the object
            vars.particles.currentEmitters = {};
        },

        generateFireEmitter: function(_enemy=null) {
            if (_enemy!==null) {
                let fire = scene.add.particles('fire').createEmitter({
                    x: enemy.x,
                    y: enemy.y,
                    speed: { min: 100, max: 200 },
                    angle: { min: -85, max: -95 },
                    scale: { start: 0.2, end: 0.4, ease: 'Back.easeOut' },
                    alpha: { start: 0.4, end: 0, ease: 'Quart.easeOut' },
                    blendMode: 'SCREEN',
                    lifespan: 1000,
                    follow: _enemy,
                });
                fire.name = 'fE_' + _enemy.name;
                //fire.reserve(100);
                vars.cameras.ignore(cam2, fire);

                _enemy.setDepth(1);
                vars.particles.currentEmitters[fire.name] = fire;
            }
        }
    },

    player: {
        isDead: false,
        scale: 1.0,
        hitpoints: 130,
        hitpointsMinMax: [125, 200],
        shield: 3,
        startPosition: {
            x: -1,
            y: -1,
        },

        bulletCheck: function() {
            bullets.children.each( function(c) {
                if (c.y<=-100) {
                    let bulletName = c.getData('name');
                    if (vars.DEBUG===true && vars.VERBOSE===true) { console.log('%cBullet with name: ' + bulletName + ' is off the screen, destroying it', vars.console.doing); }
                    c.destroy();
                }
            })
        },

        dead: function() {
            vars.player.hitpoints=0;
            vars.player.isDead=true;
            scene.sound.play('playerDeath');
            player.disableBody(true,true);
            enemies.children.each( (c) => {
                c.setVisible(true);
            })
            vars.player.destroyAllBullets();
        },

        destroyAllBullets: function() {
            bullets.children.each( function(c) {
                c.destroy();
            })
        },

        init: function() {
            console.log('      %c...player', vars.console.doing);
            let pV = vars.player;
            pV.startPosition.x = vars.canvas.cX;
            pV.startPosition.y = vars.canvas.height - (111*vars.game.scale)*3;

            console.log('    %cship... >', vars.console.callFrom);
            pV.ship.init();
        },

        increaseScore: function(_score=10) {
            let gV = vars.game;
            gV.scores.current += _score;

            //draw the score
            scene.children.getByName('scoreTextIntS').setText(gV.scores.current);
            scene.children.getByName('scoreTextInt').setText(gV.scores.current);
        },

        shieldChange: function(_upgrade=false) {
            //console.log('%c - Check for shield change', vars.console.callTo);
            let pV = vars.player;
            let sV = pV.ship;
            let bW = sV.bodyWidths;
            let upgrades = sV.upgrades;
            let playerShields = constsPS;
            let shieldChange = [false,0];

            // figure out if the shield needs to be changed
            let hp = vars.player.hitpoints;
            let shield = {};
            for (shield in playerShields) {
                let hpMin = constsPS[shield].hpLower;
                let hpMax = constsPS[shield].hpUpper;
                if (hp>=hpMin && hp<=hpMax) {
                    shield = constsPS[shield];
                    let shieldVar = shield.var;
                    if (shieldVar!==pV.shield) {
                        console.log('Setting shield to ' + shield);
                        player.setFrame(shield.frame + upgrades);
                        if (shield.strength!==undefined) { // undefined shield strength means the player has > 255 hp (ie shield extender)
                            shieldChange = [true, shield.strength]
                            player.setSize(bW[0][0],bW[0][1]);
                            pV.shield = shieldVar;
                        }
                    }
                    break;
                }
            }

            if (shieldChange[0]===true) { // the shield was changed. Fire sound effect for ...
                if (_upgrade===true) { // upgrades
                    scene.sound.play('speechShieldUpgrade');
                    setTimeout( function() { scene.sound.play('speechShield100'); }, 1200);
                } else { // drop in power
                    scene.sound.play('speechShield' + shieldChange[1]);
                    scene.sound.play('playerShieldDrop');
                    vars.cameras.shake();
                }
            }
        },

        ship: {
            bodyWidths: [
                [30,50],
                [30,50],
                [55,50],
                [80,50],
            ],
            upgrades: 0,

            cannonSlots: {
                centre: {
                    bulletSpeed: 1200,
                    currentWait: -1,
                    currentWaitMax: -1,
                    firespeed: 20,
                    enabled: true,
                    bulletCount: -1,
                    damage: 1,
                    bulletOffset: 0,
                    ready: false,

                    fire: function() {
                        let ssV = vars.player.ship.special;
                        this.currentWait = this.currentWaitMax;
                        this.ready = false;
                        let damage = this.damage;
                        if (ssV.doubleDamageEnabled===true) { damage*=2; }
                        new bullet(0, this.bulletOffset, this.bulletSpeed, damage, 'centre');
                    },

                    update: function() {
                        // first update the bullet wait time
                        let ssV = vars.player.ship.special;
                        let reductio=1;
                        if (this.currentWait>0) {
                            if (ssV.doubleFireRate===true) { reductio*=2; }
                            this.currentWait-=reductio;
                        } else if (this.currentWait<=0 && this.ready===false) {
                            // allow the gun to fire
                            if (vars.DEBUG===true && vars.VERBOSE===true) { console.log('%cCentre cannon is ready to fire!', vars.console.doing); }
                            this.ready=true;
                        }
                    }
                },
                l1r1: {
                    bulletSpeed: 1200,
                    currentWait: -1,
                    currentWaitMax: -1,
                    firespeed: 10,
                    enabled: false,
                    bulletCount: -1,
                    damage: 0.6, // this is basically doubled as we have two of these cannons
                    bulletOffset: 60 * gameScale,
                    ready: false,

                    fire: function() {
                        this.currentWait = this.currentWaitMax;
                        this.ready = false;
                        let damage = this.damage;
                        new bullet(1, this.bulletOffset, this.bulletSpeed, damage, 'l1r1');
                    },

                    update: function() {
                        if (this.enabled===true) {
                            // first, update the bullet wait time
                            let reductio=1;
                            if (this.currentWait>0) {
                                this.currentWait-=reductio;
                            } else if (this.currentWait<=0 && this.ready===false) {
                                // allow the gun to fire
                                if (vars.DEBUG===true && vars.VERBOSE===true) { console.log('%cL1R1 cannon is ready to fire!', vars.console.doing); }
                                this.ready=true;
                            }
                        }
                    }
                },
                l2r2: {
                    bulletSpeed: 300,
                    currentWait: -1,
                    currentWaitMax: -1,
                    firespeed: 0.66,
                    enabled: false,
                    bulletCount: -1,
                    damage: 10,
                    bulletOffset: 96*gameScale,
                    ready: false,

                    fire: function() {
                        this.currentWait = this.currentWaitMax;
                        this.ready = false;
                        let damage = this.damage;
                        new bullet(2, this.bulletOffset, this.bulletSpeed, damage, 'l2r2');
                    },

                    update: function() {
                        if (this.enabled===true) {
                            // first, update the bullet wait time
                            let reductio=1;
                            if (this.currentWait>0) {
                                this.currentWait-=reductio;
                            } else if (this.currentWait<=0 && this.ready===false) {
                                // allow the gun to fire
                                if (vars.DEBUG===true && vars.VERBOSE===true) { console.log('%cL2R2 cannon is ready to fire!', vars.console.doing); }
                                this.ready=true;
                            }
                        }
                    }
                },
            },

            special: {
                doubleDamageEnabled: false,
                doubleFireRate: false,
                ADIUpgrade: false,
                SHADEUpgrade: false,
                ADI: {
                    onScreen: false,
                    collected: false,
                    timeOut: 5*fps,
                    timeOutMax: 5*fps,

                    seenBefore: false,
                },
                SHADE: {
                    onScreen: false,
                    collected: false,
                    timeOut: 5*fps,
                    timeOutMax: 5*fps,

                    seenBefore: false,
                },
                upgradeOnScreen: false, // these are standard upgrades
                upgradeTimeout: [3*fps, 3*fps],

                ADISpawn: function(_xy) {
                    let ssV = vars.player.ship.special;
                    ssV.ADIUpgrade=true;
                    ssV.ADI.onScreen = true;
                    ssV.ADI.collected = false;
                    let x = _xy[0]; let y = _xy[1];
                    let upG = scene.physics.add.sprite(x,y,'upgradesS').setScale(0.4).anims.play('amstradField');
                    upG.setData('upgrade', 'fx_ADI');
                    scene.groups.shipPowerUpGroup.add(upG);
                    let paused = false;
                    console.log('ADDING TWEEN');
                    if (ssV.ADI.seenBefore===false) {
                        ssV.ADI.seenBefore = true;
                        paused = true;
                        // highlight the bonus
                        vars.UI.highlightEnabled = true;
                        vars.UI.highlightObject(upG,0);
                    }
                    scene.tweens.add({
                        paused: paused,
                        targets: upG,
                        y: 1000,
                        duration: 2000,
                    })
                },

                ADIPickUp: function() {
                    let ssV = vars.player.ship.special;
                    if (ssV.ADI.collected===false) { // first time weve entered the loop
                        ssV.ADI.collected=true;
                        ssV.ADI.onScreen=false;
                        // enable the green screen effect
                        shaderType('green',1);
                        scene.children.getByName('UI_ADI').setVisible(true);
                    } else {
                        // reduce the counter
                        if (ssV.ADI.timeOut>0) {
                            // reduce it by 1 and leave
                            ssV.ADI.timeOut-=1;
                            return false;
                        } else { // the ADI counter has hit 0
                            // set default vars back to false and reset counter
                            ssV.ADIUpgrade=false;
                            ssV.ADI.collected=false;
                            ssV.ADI.timeOut = ssV.ADI.timeOutMax;
                            // disable the shader
                            shaderType();
                            scene.children.getByName('UI_ADI').setVisible(false);
                        }
                    }
                },

                SHADESpawn: function(_xy) {
                    let ssV = vars.player.ship.special;
                    ssV.SHADEUpgrade=true;
                    ssV.SHADE.onScreen = true;
                    ssV.SHADE.collected = false;
                    let x = _xy[0]; let y = _xy[1];
                    let upG = scene.physics.add.sprite(x,y,'upgradesS').setScale(0.4).anims.play('shadeField');
                    upG.setData('upgrade', 'fx_SHADE');
                    scene.groups.shipPowerUpGroup.add(upG);
                    let paused = false;
                    if (ssV.SHADE.seenBefore===false) {
                        ssV.SHADE.seenBefore = true;
                        paused=true;
                        // highlight the bonus
                        vars.UI.highlightObject(upG,2);
                    }
                    scene.tweens.add({ paused: paused, targets: upG, y: 1000, duration: 2000 })
                },

                SHADEPickUp: function() {
                    let ssV = vars.player.ship.special;
                    if (ssV.SHADE.collected===false) { // first time weve entered the loop
                        ssV.SHADE.collected=true;
                        ssV.SHADE.onScreen=false;
                        // enable the green screen effect
                        shaderType('gray',1);
                        scene.children.getByName('UI_SHADE').setVisible(true);
                    } else {
                        // reduce the counter
                        if (ssV.SHADE.timeOut>0) {
                            // reduce it by 1 and leave
                            ssV.SHADE.timeOut-=1;
                            return false;
                        } else { // the ADI counter has hit 0
                            // set default vars back to false and reset counter
                            ssV.SHADEUpgrade=false;
                            ssV.SHADE.collected=false;
                            ssV.SHADE.timeOut = ssV.SHADE.timeOutMax;
                            // disable the shader
                            shaderType('default',1);
                            scene.children.getByName('UI_SHADE').setVisible(false);
                        }
                    }
                },

                resetVars: function() {
                    let ssV = vars.player.ship.special;
                    ssV.upgradeTimeout[0]=ssV.upgradeTimeout[1];
                    if (ssV.doubleDamageEnabled===true) {
                        ssV.doubleDamageEnabled=false;
                        scene.children.getByName('UI_bulletTypeDD').setVisible(false);
                    }
                    if (ssV.doubleFireRate===true) {
                        ssV.doubleFireRate=false;
                        scene.children.getByName('UI_bulletTypeDFR').setVisible(false);
                    }
                    scene.children.getByName('UI_bulletTypeN').setVisible(true);
                    ssV.upgradeOnScreen=false;
                    // change the ui bullet image back to normal bullets
                }
            },

            init: function() {
                console.log('      %c...init ship...', vars.console.doing);
                let ship = vars.player.ship;
                for (cS in ship.cannonSlots) {
                    console.log('       %c... for ' + cS + ' cannon', vars.console.doing);
                    let currentSlot = ship.cannonSlots[cS];
                    currentSlot.currentWait = currentSlot.currentWaitMax = fps/currentSlot.firespeed;
                }
            },

            shipDowngradeCheck: function() {
                let pV = vars.player;
                let cV = pV.ship.cannonSlots;
                let upgradeChange = false;
                if (pV.hitpoints<=constsPS.ORANGE_SHIELD.hpLower && pV.hitpoints>=constsPS.NO_SHIELD.hpLower && pV.ship.upgrades!==1) {
                    console.log('%cPLAYER >> Dropping upgrades to 1', vars.console.doing);
                    pV.ship.upgrades=1;
                    cV.l2r2.enabled=false;
                    upgradeChange = true;
                } else if (pV.hitpoints<constsPS.NO_SHIELD.hpLower && pV.ship.upgrades!==0) {
                    console.log('%cPLAYER >> Dropping upgrades to 0', vars.console.doing);
                    pV.ship.upgrades=0;
                    cV.l1r1.enabled=false;
                    cV.l2r2.enabled=false;
                    upgradeChange = true;
                }

                if (upgradeChange===true) { // if we have changed the upgrade number of the player ship we have to check if there are any ship upgrades on screen
                    if (scene.groups.shipUpgradeGroup.children.size!==0) {
                        let sUpGG = scene.groups.shipUpgradeGroup;
                        sUpGG.children.each( (c)=> { // this should also work if we increase the amount of possible ship upgrades from 2 to 3 ++ etc
                            let currentUpG = parseInt(c.getData('upgrade')); // Im gonna parse int this just to make sure the int isnt contained in a string
                            let newUpG = currentUpG-1;
                            c.setData(newUpG);
                            c.anims.play('shipGrade' + newUpG);
                        })
                    }
                }
            }
        },

        powerUps: {
            invinclible: {
                special: {
                    timeout: 10 * fps,

                    enable: function() {
                        
                    }
                }
            }
        },
    },

    scenery: {
        alienPlanet: {
            height: -1,
        },
        asteroidXArray: [],
        asteroidsRunning: false,
        boatsMaxY: 1400,
        pieceConnectors: {
            0: [1,2],
            1: [3],
            2: [4],
            3: [0,1,2],
            4: [0,1,2],
        },
        shipsRunning: false,
        spawnPositions: [],
        spawnMinMax: [],
        spawnScale: 0.01,
        spawnTypes: ['trees','barns'],
        starsMaxY: 725,
        starsMaxYOptions: [725, 1070],
        tweenDurations: [2500,750],
        yPosition: 800,
        barns: {
            timeouts: {
                current: 'sparse',
                sparse: [180,180],
            }
        },
        trees: {
            timeouts: {
                current: 'sparse',
                sparse: [10,10], // in frames
                forrest: [2,2],
            },
        },

        asteroidGenerate: function(_tween, _asteroid) {
            let setDepth=false;
            if (vars.scenery.asteroidsRunning===false) { vars.scenery.asteroidsRunning=true; setDepth=true; }
            let count=16;
            if (_asteroid!==undefined) {
                _asteroid[0].destroy();
                count=1;
            }
            
            if (vars.levels.wave<20 || vars.levels.wave>29) { return false; } // make sure we should be generating new asteroids
            
            let sV = vars.scenery;
            if (sV.asteroidXArray.length===0) {
                sV.asteroidInit();
            }

            let defaultStartY = -100;
            let defaultEndY = vars.canvas.height+100;
            let layerSpeeds = [null,8131,4267,119]; // these offsets make the asteroids more "random" without the overhead of generating a random ms offset
            let layerTints = [null,0x454545,0x696969,0xbbbbbb];

            for (let a=0; a<count; a++) {
                let x = Phaser.Math.RND.pick(sV.asteroidXArray);
                let anim = Phaser.Math.RND.pick(['asteroid1a','asteroid1b','asteroid2a']);
                let layer = Phaser.Math.RND.between(1, 3);
                let delay = 1000*a;
                // set the duration based on the layer (basically the sprites size)
                let duration = 8000 + layerSpeeds[layer];
                let scale = layer/9; // this gives us a scale between 0.1 and 0.3
                let tint = layerTints[layer];
                let angle = Phaser.Math.RND.angle();
                //console.log('Layer: ' + layer + ', Duration: ' + duration + ', Scale: ' + scale + ', Angle: ' + angle + ', tint: #' + tint.toString(16));
                let asteroid = scene.add.sprite(x,defaultStartY,'asteroid1','a1frame1').setScale(scale).setDepth(-1).setTint(tint).setRotation(angle);
                vars.cameras.ignore(cam2, asteroid);
                scene.groups.sceneryGroup.add(asteroid);
                asteroid.anims.play(anim);
                scene.tweens.add({ targets: asteroid, delay: delay, y: defaultEndY, duration: duration, ease: 'Linear', onComplete: vars.scenery.asteroidGenerate })
            }
        },

        asteroidInit: function() {
            /*
            let wOC = vars.canvas.width-100;
            let points = wOC/10;
            console.log(points);
            let xArray = []
            for (let x=0; x<=wOC; x+=points) {
                xArray.push((x/points*points)+points/2);
            }
            xArray.push(wOC+100-points);
            */
           // The code above creates this Array.name.. its static so no point of generating it every time
           console.log('%cInitialising Asteroid Field', vars.console.callTo);
           vars.scenery.asteroidXArray = [31, 93, 155, 217, 279, 341, 403, 465, 527, 589, 651, 658];
        },

        carrierGenerate: function(_tween, _carrier) {
            let sV = vars.scenery;
            sV.shipsRunning=true;
            let startY = sV.yPosition-30;
            let maxY = sV.boatsMaxY;
            // i originally only had _carriers but now they should really be called something like boats or ships (although ships would be confusing)
            if (_carrier!==undefined) {
                _carrier[0].destroy();
            }
            if (vars.levels.wave>19) { return false; }
            let x = Phaser.Math.RND.between(vars.canvas.cX-100,vars.canvas.cX+100);
            let xChange = [200,250,300,350,400,450,500];
            let xMod = 1;
            let selectedType = ['ships', 'ship'];
            let frameArray = [];
            let finalScale = vars.game.scale;

            // choose between carriers and ships
            if (Phaser.Math.RND.sign()===1) {
                selectedType = ['carriers', 'carrier'];
                frameArray = [1,2,3,4];
                finalScale*=1;
            } else { // rnd sign was -1
                frameArray = [4,5,6,8];
                if (x<vars.canvas.cX) {
                    frameArray = [1,2,3,7];
                }
                //console.log('x: ' + x + ', xChange: ' + xChange);
            }
            if (x<vars.canvas.cX) {
                xMod = -1;
            }
            xChange = Phaser.Math.RND.pick(xChange) * xMod;
            let frame = Phaser.Math.RND.pick(frameArray).toString();
            // due to the type of ease in (to simulate forward momentum/speed) the startY is modified slightly (from the grass levels). Basically I take 100 off here even though the bottom of the waves are ~792px
            let carrier = scene.add.image(x, startY, selectedType[0], selectedType[1] + frame).setScale(0.0);

            scene.groups.sceneryGroup.add(carrier);
            vars.cameras.ignore(cam2, carrier);
            scene.tweens.add({
                targets: carrier,
                y: maxY,
                x: x+xChange,
                scale: finalScale,
                duration: 7000,
                ease: 'Cubic.easeIn',
                onComplete: vars.scenery.carrierGenerate,
            })
        },

        generateAlienPlanet: function() {
            // this generates a map 4(rows)x100(col)
            scene.add.image(vars.canvas.cX, vars.canvas.cY, 'alienBG').setScale(vars.canvas.width, vars.canvas.height).setName('alienBG').setAlpha(0);
            let pieceConnectors = vars.scenery.pieceConnectors;
            let pieceCount = 4;
            // the finished arrays will be 100 in length... this is actually the height of the map
            let rMax = 4;
            let cMax = 100;
            let randomPiece = -1;
            let colData = { 0: [], 1: [], 2: [], 3: [] }
            for (let r=0; r<rMax; r++) {
                for (let c=0; c<cMax; c++) {
                    if (randomPiece===-1) { // this is the first piece, pick a random one
                        randomPiece = Phaser.Math.RND.between(0,pieceCount);
                    } else { // this piece is based on the previous one
                        randomPiece = Phaser.Math.RND.pick(pieceConnectors[randomPiece]);
                    }
                    colData[r].push(randomPiece);
                }
            }
            vars.scenery.alienPlanet = colData;
            // now we have to create the background
            let pieceWidth = 201; let pieceHeight = 101;
            for (let c=0; c<cMax; c++) {
                let y = c * pieceHeight;
                //console.log('Row: ' + c);
                for (let r=0; r<rMax; r++) { // draw each row (consisting of 4 pieces side by side)
                    let x = r * pieceWidth;
                    //console.log('Placing piece at: ' + x + ',' + y);
                    let piece = scene.add.image(x,y, 'alienPlanet', colData[r][c]).setName('alienPlanetPiece_r' + r + '_c' + c);
                    alienPlanetContainer.add(piece);
                    vars.cameras.ignore(cam2, piece);
                }
            }
            // offset the y
            let yOffset = ~(cMax*pieceHeight-(pieceHeight/2));
            vars.scenery.alienPlanet.height = yOffset;
            alienPlanetContainer.setDepth(1).setPosition(50, yOffset).setAlpha(0);
        },

        generateNewGalaxy: function(_tween=null, _object=null, _count=1) {
            if (_tween!==null) { // did we enter here from the tween complete? If so, delete it
                _object[0].destroy();
            }
            if (vars.levels.wave<25 || vars.levels.wave>29) { // make sure we should still be spawning the galaxies
                return false;
            }

            let delay = 0;
            for (let g=0; g<_count; g++) {
                if (_count!==1) {
                    delay = Phaser.Math.RND.between(5, 15) * 1000; // ie between 15s and 25s
                }
                let duration = Phaser.Math.RND.between(55,75) * 1000;
                let scaleOffset = Phaser.Math.RND.between(0,3);
                let speed = (scaleOffset + 1) * 0.3;
                scaleOffset /= 10;

                // the galaxy rotates 5 degrees during its tween
                let angle = Phaser.Math.DegToRad(Phaser.Math.RND.between(0,35)*10);
                rotation = 20;
                angleChange = Phaser.Math.RND.between(0,1) === 0 ? -1 : 1;
                rotation *= angleChange;
                finalAngle = angle + rotation;

                let x = Phaser.Math.RND.between(1, 7) * 100;
                let frame = Phaser.Math.RND.between(0,2);
                let nG = scene.add.image(x, -100, 'galaxies', frame).setScale(0.4+scaleOffset).setAlpha(0.2).setRotation(angle).setDepth(-1).setName('gxy_' + generateRandomID());
                scene.groups.nebulaGroup.add(nG);
                vars.cameras.ignore(cam2, nG);

                // larger galaxies move faster to emulate distance from camera onComplete: vars.scenery.generateNewGalaxy, 
                scene.tweens.add({ targets: nG, delay: g*delay, y: 1180, angle: finalAngle, ease: 'linear', blendMode: 'MULTIPLY', duration: duration/speed })
            }
        },

        generateNewNebula: function(_tween=null, _image=null, _init=false) {
            if (vars.levels.wave<25 || vars.levels.wave>29) {
                return false;
            }
            let x = vars.canvas.cX;
            let y = 0;
            let duration = 75000;

            if (_init===false) {
                _image[0].destroy(); // destroy the old nebula sprite
                // and replace it with a new one
                let frame = Phaser.Math.RND.between(0,5);
                let nO0 = scene.add.image(x, -1080, 'nebulae', frame).setAlpha(0.75).setDepth(-1);
                vars.cameras.ignore(cam2, nO0);
                scene.groups.nebulaGroup.add(nO0);

                scene.tweens.add({ delay: duration/2, targets: nO0, ease: 'linear', y: vars.canvas.height+1080, duration: duration*1.5, onComplete: vars.scenery.generateNewNebula })
            } else {
                // we need to join two nebulae together
                let frames = [Phaser.Math.RND.between(0,5),Phaser.Math.RND.between(0,5)];
                let nO0 = scene.add.image(x, y, 'nebulae', frames[0]).setAlpha(0.75).setDepth(-1);
                let nO1 = scene.add.image(x, y-1080, 'nebulae', frames[1]).setAlpha(0.75).setDepth(-1);
                scene.groups.nebulaGroup.addMultiple([nO0, nO1]);
                vars.cameras.ignore(cam2, nO0); vars.cameras.ignore(cam2, nO1);

                scene.tweens.add({ targets: nO0, y: vars.canvas.height+1080, ease: 'linear', duration: duration, onComplete: vars.scenery.generateNewNebula })
                scene.tweens.add({ delay: duration/2, targets: nO1, ease: 'linear', y: vars.canvas.height+1080, duration: duration*1.5, onComplete: vars.scenery.generateNewNebula })
            }
        },

        init: function() {
            console.log('      %c...scenery', vars.console.doing);
            let sV = vars.scenery;
            let cX = vars.canvas.cX;
            let min = cX - (cX/2);
            let stepSize = min/4;
            let spawnsX = sV.spawnPositions;
            for (let i=min; i<=cX+min; i+=stepSize) {
                spawnsX.push([i, i-(cX-i)]);
            }
            vars.scenery.spawnMinMax = [vars.canvas.cX-vars.canvas.cX/8,vars.canvas.cX+vars.canvas.cX/8];
        },

        update: function() {
            let sV = vars.scenery;
            if (vars.levels.wave<10) { // grass scenery - as you can see below ive changed the way scenery is created and destroyed, it would be a good idea to update this function too TODO
                let sT = sV.spawnTypes; // scenery types
                
                for (let s=0; s<sT.length; s++) {
                    let current = sV[sT[s]].timeouts.current;
                    let timeout = sV[sT[s]].timeouts[current][0];
                    if (timeout>0) {
                        sV[sT[s]].timeouts[current][0]--;
                    } else {
                        // reset the timeout
                        sV[sT[s]].timeouts[current][0]=sV[sT[s]].timeouts[current][1];
                        if (sT[s]==='trees') {// spawn the tree
                            new scenery('trees');
                        } else if (sT[s]==='barns') {// spawn the tree
                            new scenery('barns');
                        }
                    }
                }
            } else if (vars.levels.wave<20) { // water scenery
                // these should only fire once!
                if (sV.shipsRunning===false) {
                    sV.carrierGenerate();
                }
            } else if (vars.levels.wave<30) { // space and nebula scenery
                // these should only fire once!
                if (sV.asteroidsRunning===false) {
                    sV.asteroidGenerate();
                }
            }
        }
    },

    shader: {
        current: 'default',
    },

    story: {
        // populated from text.js
    },

    UI: {
        highlightEnabled: false,

        highlightObject: function(_phaserObject, _frame=-1) {
            let w = _phaserObject.width;
            let h = _phaserObject.height;
            let x = _phaserObject.x;
            let y = _phaserObject.y;
            let scale = _phaserObject.scale + 0.2;
            let gameScale = vars.game.scale;
            let gV = vars.game;
            gV.graphics = scene.add.graphics();
            gV.graphics.lineStyle(2, scene.consts.colours.white, 1);

            // sanity check
            if (_frame===-1) {
                console.error('INVALID FRAME NUMBER when highlighting the object.');
            }

            // the box containing the upgrade
            gV.graphics.strokeRoundedRect(x-(w/2*scale), y-(h/2*scale), w*scale, h*scale, 10);

            if (x<=vars.canvas.cX) { // spawn the highlight to the right of the upgrade
                // the line coming from the box to the info container
                scene.add.image(x, y, 'highlightsConnector', 1).setName('highlightConnector').setOrigin(-0.5,0);
                // info container
                let clickable = scene.add.image(x-w, y+h+10, 'highlights', _frame).setScale(gameScale*2).setOrigin(-0.16,0.16).setName('highlighted').setInteractive();
                clickable.on('pointerdown', vars.UI.highlightRemove);
            } else { // spawn the highlight to the left of the upgrade
                // the line coming from the box to the info container
                scene.add.image(x, y, 'highlightsConnector', 0).setName('highlightConnector').setOrigin(1.5,0);
                // info container
                let clickable = scene.add.image(x+w, y+h+10, 'highlights', _frame).setScale(gameScale*2).setOrigin(1.16,0.16).setName('highlighted').setInteractive();
                clickable.on('pointerdown', vars.UI.highlightRemove);
            }

            vars.game.pauseForHighlightedObject(); // pause all the things (except stars, coz that would be weird)
        },

        highlightRemove: function() {
            let gV = vars.game;
            gV.graphics.clear();
            scene.children.getByName('highlighted').destroy();
            scene.children.getByName('highlightConnector').destroy();
            // unpause all the things
            vars.game.unpauseAfterHighlight();
        },

        hpUpdate: function() {
            let hp = vars.player.hitpoints;
            scene.children.getByName('hpTextIntS').setText(hp);
            scene.children.getByName('hpTextInt').setText(hp);
            // update the hp bar
            let hpPercent=0; let shieldPercent = 0;
            if (hp>=constsPS.EXTRA_SHIELD.hpLower) { // extra visible
                scene.children.getByName('hpPBOrange').setAlpha(1);
                hpPercent=1; shieldPercent = 1;
            } else { // hp<=250
                if (hp>75) {
                    hpPercent=1;
                    shieldPercent = (hp-constsPS.NO_SHIELD.hpUpper)/(constsPS.GREEN_SHIELD.hpUpper-constsPS.NO_SHIELD.hpUpper);
                } else {
                    hpPercent=hp/constsPS.NO_SHIELD.hpUpper;
                    shieldPercent = 0;
                }
                scene.children.getByName('hpPBOrange').setAlpha(0.2); // hide the orange over shield
            }
            // set the scale of the hp and shield bars
            scene.children.getByName('hpPBRed').setScale(shieldPercent,1);
            scene.children.getByName('hpPBBlue').setScale(hpPercent,1);
        }
    },

    video: {
        play: function() {
            let video = scene.add.video(vars.canvas.cX, 1500, 'introVideo').setRotation(21*(Math.PI/180)).setVolume(0.01).setScale(1.5).setAlpha(0).setName('introVideo').setLoop(true);
            video.playWhenUnlocked=true;
            scene.tweens.add({ targets: video, delay: 3000, alpha: 0.04, ease: 'linear', duration: 10000, })
            scene.tweens.add({ targets: video, rotation: -21*(Math.PI/180), y: -300, ease: 'linear', duration: 35000, repeat: -1 })
        }
    },

    versionCheck: function() {
        if (vars.versionCheckResult===-1) {
            let lookingFor = '3.24.1';
            let thisVersion = Phaser.VERSION;
            if (thisVersion !== lookingFor) {
                let warning = '\n\nPhaser has been updated! (Looking for: ' + lookingFor + ' and found ' + thisVersion + ')\n\nIf the wave intro changes, this is probably why!\n(Also required by other functions, but this ones obvious)';
                console.warn(warning);
                alert(warning);
                vars.versionCheckResult = false;
            } else {
                vars.versionCheckResult = true;
            }
        } else {
            console.log('Version check has already been done. Result was ' + vars.versionCheckResult + '\nWhere false means failed');
        }
    }
}

function init() {
    console.log('  >%cInitialising', vars.console.callTo);

    console.log('    %cCanvas >', vars.console.callFrom);
    vars.canvas.init();
    console.log('    %cPlayer >', vars.console.callFrom);
    vars.player.init();
    console.log('    %cEnemies >', vars.console.callFrom);
    vars.enemies.init();
    console.log('    %cScenery >', vars.console.callFrom);
    vars.scenery.init();
}