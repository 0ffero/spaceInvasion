var fps = 60;
var gameScale = 0.4;

const constsM = { // mouse buttons
    mouse: {
        left: 1,
        right: 2,
        middle: 4,
        mouse4: 8,
        mouse5: 16,
    }
}

const constsPS = { // player shields frames
    NO_SHIELD:    12,
    LOW_SHIELD:    9,
    RED_SHIELD:    6,
    ORANGE_SHIELD: 3,
    GREEN_SHIELD:  0,
}

const constsD = { // depth of sprite groups
    BG: 1,
    SCENERY: 20,
    MAIN: 50
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
            //scene.cameras.main.ignore([ scoreGroup ]);
            cam1 = scene.cameras.main;
            cam2 = scene.cameras.add(0, 0, vars.canvas.width, vars.canvas.height); // used for switching between shaders smoothly
            cam2.setAlpha(0);
            // theres no point in adding these yet as there are no bodies at the start of the game
            // shipUpgradeGroup, shipPowerUpGroup, bullets, enemyBossGroup, enemyBullets, enemyAttackingGroup, sceneryGroup
            // basically when each of these are created (each bullet, each tree etc) you have to specifically tell phaser that cam2 cant see them
            // due to the way this works theres now a function called cam2Ignore() in game.js
            cam2.ignore([ bG, enemies, wavesGroup ]);

            shaderType('colour',1);
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
        }
    },

    cheats: {
        annihilate: function() {
            let first=true;
            enemies.children.each( (c)=> {
                console.log(c.name);
                if (first===true) {
                    first=false;;
                } else {
                    c.destroy();
                }
            })
        },
        bossSpawn: function() {
            vars.enemies.spawnBoss();
        },
        
        bossSpawnCthulhu: function() {
            vars.levels.wave=3
            vars.enemies.bossNext=4
            vars.cheats.bossSpawn()
        }
    },

    console: {
        callFrom: 'font-size: 12px; color: green',
        callTo: 'font-size: 14px; color: green',
        doing: 'font-size: 10px; color: yellow',
        playerUpgrade: 'font-size: 14px; color: green; background-color: white;',
    },

    DEBUG: false,
    VERBOSE: false,

    DEBUGHIDE: false,
    DEBUGTEXT: '',

    input: {
        init: function() {
            let musicKey = scene.input.keyboard.addKey('M');
            musicKey.on('up', vars.audio.musicEnableDisable);
        }
    },


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
            vars.game.unpause();
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
        bossSpawnTimeout: [25,25], // [0] = current counter [1] = reset to ie every 10 enemy deaths a boss spawns
        bossSpawnCount: 0,
        bossFireRates: [],
        bossFireRatesResets: [],
        bossLimit: 1,
        bossNext: -1,
        bulletDamage: 1,
        cthulhuSpotted: false,
        deadSinceLastPowerup: 0,

        bossPaths: [], // these are built at run time. All boss paths are set, unlike standard enemy attack paths which start at the enemy xy
        colours: [
            ['red', 0xFF0000],
            ['green', 0x00FF00],
            ['blue', 0x00BFFF],
            ['purple', 0xC926FF],
            ['yellow', 0xFFFF00],
            ['purple2', 0xC926FF] // cthulhu's bullets
        ]
        ,
        list: [],
        isLanding: false,
        moveDirectionCurrent: 'right',
        moveDirectionPrevious: 'down',
        removeBosses: true,

        replaceArrays: {
            method1: {
                replaceArray: [
                    [3,4,5,12,13,14,21,22,23]
                ],
            },
            method2: {
                replaceArray: [
                    [0,1,2,9,10,11,18,19,20],
                    [6,7,8,15,16,17,24,25,26]
                ]
            }
        },

        shootTimeout: [fps*0.5, fps*0.5],
        speed: 50,
        speeds: {
            min: 50,
            max: 100,
        },

        spriteCount: -1,

        // these positions are used to determine when the enemies should move
        // down after moving left or right and hitting the edge of the screen
        bounds: {
            left: -1,
            right: -1,
            bottom: 10,
        },
        updateTimeout: 10, // in frames. We use this to update the enemies velocity
        updateTimeoutMax: 10,
        width: -1,

        attackersFireUpdate: function(_enemyCount) {
            enemyAttackingGroup.children.each( (c)=> {
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
                    enemyAttackingGroup.add(attackingEnemy);
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
            enemyBullets.add(theBullet);
            if (_cam2Ignore===true) {
                vars.cameras.ignore(cam2, theBullet);
            }
            if (_xSpeed!==0 && vars.DEBUG===true) { // if x speed isnt 0 - this is only used by bosses after wave 1
                console.log('Boss Bullet - Setting xSpeed: ' + _xSpeed);
            }
            theBullet.setVelocity(_xSpeed, _speed);
        },

        debugBossPatterns: function() {
            let graphics = scene.add.graphics();
            graphics.lineStyle(1, 0xffffff, 1);
            let bP = vars.enemies.bossPaths;
            for (let path=0; path<bP.length; path++){
                bP[path][1].draw(graphics, 128);
            }
        },

        destroyAllAttackers: function() {
            if (enemyAttackingGroup.children.size>0) {
                enemyAttackingGroup.children.each( (c)=> {
                    c.destroy();
                })
            }
        },

        destroyAllBullets: function() {
            enemyBullets.children.each( (c)=> {
                c.destroy();
            })
        },

        destroyAllBosses: function() {
            if (enemyBossGroup.children.size>0) {
                enemyBossGroup.children.each( (c)=> {
                    c.destroy();
                })
            }
        },
        
        increaseEnemySpeed() {
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
        },

        setEnemyBulletDamage: function() {
            let wave = vars.levels.wave;
            let eV = vars.enemies;
            if (eV.bulletDamage<2 && wave%2===0) {
                eV.bulletDamage += (wave - 1) * 0.2; // add 20% to the damage
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
            eV.speed = 50 + (vars.levels.wave*2);
            let xPos = vars.game.rowStartY;
            eV.moveDirectionPrevious = eV.moveDirectionCurrent = 'right';
            for (let row=1; row<=5; row++) {
                for (let col=1; col<=9; col++) {
                    this.list.push(new enemy(0, row, col * xPos, col));
                }
            }
            // if wave isnt 1 we modify the spawn positions of the enemies
            if (vars.levels.wave>1) {
                eV.spawnPositionsModify();
            }
        },

        spawnPositionsModify: function() {
            let cut = 9;
            let waveMod = vars.enemies.replaceArrays;
            let method = waveMod.method2.replaceArray;
            let counter = -1;
            let lL = this.list.length;

            method.forEach( (a)=> {
                counter++;
                let cutA = lL - (cut * (counter+1));
                let cutB = lL - (cut * (counter));
                console.log('Cutting from ' + cutA + ' to ' + cutB);
                let originalArray = this.list.slice(cutA, cutB); // grab the last row
                for (let id=0; id<originalArray.length; id++) {
                    let replaceWith = a[id];
                    let swapping = enemies.children.getArray()[replaceWith];
                    console.log('Replacing ' + originalArray[id].name + ' with ' + swapping.name + ' (position ' + replaceWith + ')' );
                    // get the current frames for the enemies
                    let scale = vars.game.scale;
                    let original = [originalArray[id].x * scale + 20, originalArray[id].y * scale];
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
            enemiesMove();
            // now we check to see if the enemies should be shooting (only happens every few seconds)
            eV.shootTimeoutDo();
            eV.attackTimeoutDo();
            if (enemyAttackingGroup.children.size>0) {
                eV.attackersFireUpdate(enemyAttackingGroup.children.size);
            }
        }


    },

    game: {
        graphics: null,

        awaitingInput: false,
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
            wavesGroup.children.each( (c, i)=> {
                scene.tweens.add({
                    paused: false,
                    targets: c,
                    y: 960,
                    duration: 1000,
                    ease: 'Quad.easeInOut',
                    delay: i * 62.5,
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
                wavesGroup.add(waterimage);
            }
        },

        pause: function() {
            scene.physics.pause();
            let vG = vars.game;
            vG.paused=true;
            player.setVisible(false);
            enemies.children.each( function(c) {
                c.setVisible(false);
            })
            // destroy the scenery currently visible as were about to speed up the tween speed
            if (sceneryGroup.children.size>0) {
                sceneryGroup.children.each( (c)=>{
                    c.destroy();
                })
            }
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
            player.setVisible(true); //.setFrame(0);
            enemies.children.each( function(c) {
                c.setVisible(true).setVelocityX(50);
            })
            vars.cameras.ignore(cam2, enemies);
            vars.levels.wavePopupVisible=false;
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
            //scene.sys.canvas.style.cursor = 'none';
        }

    },

    levels: {
        currentWaveBG: 'grass',
        waveBGs: {
            0: 'grass',
            10: 'water',
            20: 'space',
        },
        wave: 0,
        
        wavePopupVisible: false,

        changeBackground(_bgtype='grass') {
            switch (_bgtype) {
                case 'water':
                    vars.game.createWaterTweens();
                    wavesGroup.children.each( (c)=> {
                        c.setVisible(true);
                    });
                break;

                case 'space':
                    // fade out the waves and background image
                    wavesGroup.children.each( (c)=> {
                        scene.tweens.add({
                            paused: false,
                            targets: c,
                            alpha: 0,
                            duration: 1000,
                            ease: 'Quad.easeInOut',
                        });
                    })
                    let bg = scene.children.getByName('levelBG');
                    scene.tweens.add({
                        paused: false,
                        targets: bg,
                        alpha: 0,
                        duration: 1000,
                        ease: 'Quad.easeInOut',
                    });

                    // increase the stars max y position
                    let sV = vars.scenery;
                    sV.starsMaxY = sV.starsMaxYOptions[1];
                break;
            }
        },

        waveIncrement: function() {
            let lV = vars.levels;
            lV.wave++;
            // update the overlay
            let waveText = scene.children.getByName('waveTextInt').setText(lV.wave);
            lV.wavePopupVisible=true;
            let changeBackground = false;
            let BG = lV.currentWaveBG;
            if (lV.wave===10) { // level 10 stops bosses being destroyed between waves AND changes the scenery to waves
                vars.enemies.removeBosses=false;
                lV.currentWaveBG = lV.waveBGs[lV.wave];
                changeBackground = true;
            } else if (lV.wave===20) {
                lV.currentWaveBG = lV.waveBGs[lV.wave];
                changeBackground = true;
            }

            if (changeBackground === true) {
                let newBG = lV.currentWaveBG;
                lV.changeBackground(newBG);
            }
        }
    },

    player: {
        isDead: false,
        scale: 1.0,
        hitpoints: 125,
        hitpointsMinMax: [125, 200],
        shield: 4,
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
            let scoreText = scene.children.getByName('scoreTextInt').setText(gV.scores.current);
        },

        shieldChange: function(_upgrade=false) {
            console.log('%c - Check for shield change', vars.console.callTo);
            let pV = vars.player;
            let sV = pV.ship;
            let bW = sV.bodyWidths;
            let upgrades = sV.upgrades;
            let playerShields = constsPS;
            let updateSize = false;
            let shieldChange = [false,0];

            if (pV.hitpoints>=100) {  // green shield
                if (pV.shield!==4) {
                    console.log('%Green Shield Enabled', 'color: green');
                    shieldChange = [true,100];
                    pV.shield=4;
                    player.setFrame(playerShields.GREEN_SHIELD + upgrades);
                    updateSize=true;
                }
            } else if (pV.hitpoints<=25) {  // no shield
                if (pV.shield!==0) {
                    console.log('%No Shield Enabled', 'color: white');
                    shieldChange = [true,0];
                    pV.shield=0;
                    player.setFrame(playerShields.NO_SHIELD + upgrades);
                    updateSize=true;
                }
            } else if (pV.hitpoints<50) {  // low shield
                if (pV.shield!==1) {
                    console.log('%cLow Shield Enabled', 'color: pink');
                    shieldChange = [true,25];
                    pV.shield=1;
                    player.setFrame(playerShields.LOW_SHIELD + upgrades);
                    updateSize=true;
                }
            } else if (pV.hitpoints<75) {   // red shield
                if (pV.shield!==2) {
                    console.log('%cRed Shield Enabled', 'color: red');
                    shieldChange = [true,50];
                    pV.shield=2;
                    player.setFrame(playerShields.RED_SHIELD + upgrades);
                    updateSize=true;
                }
            } else if (pV.hitpoints<100) { // orange shield
                if (pV.shield!==3) {
                    console.log('%cOrange Shield!', 'color: orange');
                    shieldChange = [true,75];
                    pV.shield=3;
                    player.setFrame(playerShields.ORANGE_SHIELD + upgrades);
                    updateSize=true;
                }
            }
            
            // do we need to modify the hit box of the player?
            if (updateSize===true) {
                player.setSize(bW[0][0],bW[0][1]);
            }

            if (shieldChange[0]===true) { // the shield was changed. Fire sound effect for ...
                if (_upgrade===true) {                                             // upgrades
                    scene.sound.play('speechShieldUpgrade');
                    setTimeout( function() {
                        scene.sound.play('speechShield100'); // this always plays so we dont have to worry about stopping it on wave transition etc
                    }, 1200);
                } else {                                                           // drop in power
                    switch (shieldChange[1]) {
                        // case 100: scene.sound.play('speechShield100'); break; // removed because this shouldnt fire! You can only upgrade to full shields
                        case  75: scene.sound.play('speechShield75'); break;
                        case  50: scene.sound.play('speechShield50'); break;
                        case  25: scene.sound.play('speechShield25'); break;
                        case   0: scene.sound.play('speechShieldDestroyed'); break;
                    }
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
                    shipPowerUpGroup.add(upG);
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
                            shaderType('default',1);
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
                    shipPowerUpGroup.add(upG);
                    let paused = false;
                    if (ssV.SHADE.seenBefore===false) {
                        ssV.SHADE.seenBefore = true;
                        paused=true;
                        // highlight the bonus
                        vars.UI.highlightObject(upG,2);
                    }
                    scene.tweens.add({
                        paused: paused,
                        targets: upG,
                        y: 1000,
                        duration: 2000,
                    })
                },

                SHADEPickUp: function() {
                    let ssV = vars.player.ship.special;
                    if (ssV.SHADE.collected===false) { // first time weve entered the loop
                        ssV.SHADE.collected=true;
                        ssV.SHADE.onScreen=false;
                        // enable the green screen effect
                        shaderType('gray',1);
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
                        }
                    }
                },

                resetVars: function() {
                    let ssV = vars.player.ship.special;
                    ssV.upgradeTimeout[0]=ssV.upgradeTimeout[1];
                    ssV.doubleDamageEnabled=false;
                    ssV.doubleFireRate=false;
                    ssV.upgradeOnScreen=false;
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
            gV.graphics.lineStyle(2, 0xffffff, 1);

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
        }
    },

    video: {
        play: function() {
            let video = scene.add.video(vars.canvas.cX, 1500, 'introVideo').setRotation(21*(Math.PI/180)).setVolume(0.01).setScale(1.5).setAlpha(0.07).setName('introVideo').setLoop(true);
            video.playWhenUnlocked=true;
            scene.tweens.add({
                targets: video,
                rotation: -21*(Math.PI/180),
                y: -300,
                ease: 'linear',
                duration: 35000,
                repeat: -1,
            })
        }
    },

    versionCheck: function() {
        if (Phaser.VERSION !== '3.24.1') {
            console.warn('\n\nPhaser has been updated!\n\nIf the wave intro changes, this is probably why!\n\n')
            alert('Phaser version has changed!\nIf the wave animation looks\nwrong, this will be why!');
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