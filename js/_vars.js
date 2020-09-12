var fps = 60;
var gameScale = 0.4;

const constsM = {
    mouse: {
        left: 1,
        right: 2,
        middle: 4,
        mouse4: 8,
        mouse5: 16,
    }
}


var vars = {
    cameras: {
        init: false,
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

    audio: {
        currentTrack: 0,
        gameTracks: ['gamemusic1', 'gamemusic2'],
        isEnabled: false,
        getNext: function() {
            let aV = vars.audio;
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
                aV.stop();
                let currentTrack = aV.gameTracks[aV.currentTrack];
                let gM = scene.sound.add(currentTrack);
                gM.play();
                gM.once('complete', function() {
                    aV.getNext();
                })
                // unpause the game
            }
            vars.game.unpause();
        },

        stop: function() {
            let aV = vars.audio;
            if (aV.isEnabled===true) {
                let currentTrack = aV.gameTracks[aV.currentTrack];
                scene.sound.stopByKey(currentTrack);
            }
        }
    },

    enemies: {
        attackTimeout: [10*fps,10*fps],
        bossSpawnTimeout: [25,25], // [0] = current counter [1] = reset to ie every 10 enemy deaths a boss spawns
        bossSpawnCount: 0,
        bossFireRates: [],
        bossFireRatesResets: [],
        bossLimit: 1,
        bossNext: -1,
        bulletDamage: 1,
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
                                console.log('Firing!');
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
                                        let strength = vars.enemies.bulletDamage * 1.2;
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
                    // theres currently only 1 path, but this will eventually be randomised TODO
                    let selectedPath = 'alpha';
                    if (enemy.x>vars.canvas.cX) { selectedPath+='Reversed'; }
                    let fireTimings = vars.enemies.enemyPatterns.splines[selectedPath].fireTimings;

                    // build the spline attack pattern
                    let path = vars.enemies.enemyPatterns.convertPatternToSpline(selectedPath,[enemy.x,enemy.y])
                    let enemyXY = [enemy.x, enemy.y];
                    let enemyName = enemy.name; // needed to re-enable the real enemy sprite
                    let enemySpriteFrame = enemy.frame.name%vars.enemies.spriteCount;
                    let attackingEnemy = scene.add.follower(path, enemyXY[0], enemyXY[1], 'enemies', enemySpriteFrame).setName('f_' + enemyName).setScale(vars.game.scale);
                    enemyAttackingGroup.add(attackingEnemy);
                    cam2Ignore(attackingEnemy);
                    let resets = [fireTimings.bulletCount, fireTimings.bulletSpacing, fireTimings.fireSpacing ];
                    attackingEnemy.setData( { initialWait: fireTimings.initialWait, bulletCount: fireTimings.bulletCount, bulletSpacing: 0, fireSpacing: fireTimings.fireSpacing, resets: resets } );

                    attackingEnemy.startFollow({
                        positionOnPath: true,
                        duration: 6000,
                    });
                }
            }
        },

        bossFireRatesInit: function() {
            let eV = vars.enemies;
            // all values are in frames
            let fps = vars.game.fps;
            eV.bossFireRates = [ {firetimeout: fps*2, bullettimeout: 1, bulletsperframe: 1, bulletcount: 10 }, {firetimeout: fps*2, bullettimeout: 2, bulletsperframe: 1, bulletcount: 10}, {firetimeout: fps*2, bullettimeout: 3, bulletsperframe: 1, bulletcount: 10}, {firetimeout: fps*3, bullettimeout: 2, bulletsperframe: 2, bulletcount: 15} ];
            let tempResets = [];
            for (let fr=0; fr<eV.bossFireRates.length; fr++) {
                eV.bossFireRatesResets.push({firetimeout: eV.bossFireRates[fr].firetimeout, bullettimeout: eV.bossFireRates[fr].bullettimeout, bulletsperframe: eV.bossFireRates[fr].bulletsperframe, bulletcount: eV.bossFireRates[fr].bulletcount })
            }
            //eV.bossFireRatesResets = [ {firetimeout: fps*2, bullettimeout: 1, bulletsperframe: 1, bulletcount: 10 }, {firetimeout: fps*2, bullettimeout: 2, bulletsperframe: 1, bulletcount: 10}, {firetimeout: fps*2, bullettimeout: 3, bulletsperframe: 1, bulletcount: 10}, {firetimeout: fps*3, bullettimeout: 2, bulletsperframe: 2, bulletcount: 15} ];
        },

        bossFireRateGetRandom: function() {
            let eV = vars.enemies;
            let randomShootPattern = Phaser.Math.RND.between(0, eV.bossFireRates.length-1);
            let returnData = eV.bossFireRates[randomShootPattern];
            return [returnData, randomShootPattern];
        },

        bulletGetStrength: function() {

        },

        bulletPhysicsObject: function(_xy, _bullet=0, _scale=0.4, _strength=1, _speed=600, _cam2Ignore=true) {
            if (_scale===0.4 && vars.game.scale!==0.4) { _scale = vars.game.scale; }
            let theBullet = scene.physics.add.sprite(_xy[0], _xy[1], 'bulletPrimaryEnemy', _bullet).setScale(_scale);
            theBullet.setName('bullet_' + generateRandomID());
            theBullet.setData('hp',_strength);
            enemyBullets.add(theBullet);
            if (_cam2Ignore===true) {
                cam2Ignore(theBullet);
            }
            theBullet.setVelocityY(_speed);
        },

        debugBossPatterns: function() {
            let graphics = scene.add.graphics();
            graphics.lineStyle(1, 0xffffff, 1);
            let bP = vars.enemies.bossPaths;
            for (let path=0; path<bP.length; path++){
                bP[path][1].draw(graphics, 128);
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
                    //console.log('Getting a random enemy...');
                    // get random enemy
                    let randomEnemy = enemyGetRandom();
                    let xy = [parseInt(randomEnemy.x), parseInt(randomEnemy.y+25)];
                    let bullet = randomEnemy.getData('row')-1;
                    let scale = vars.game.scale+0.1;
                    let strength = vars.enemies.bulletDamage;
                    //console.log('    Spawning bullet for enemy: ' + randomEnemy.name + ' at ' + xy[0] + ',' + xy[1]);
                    eV.bulletPhysicsObject(xy,bullet,scale,strength);
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
        bulletCheckTimeout: [fps/2, fps/2],
        bonusSpawnCount: [0,0,0,0,0,0,0,0], // basically used for debugging
        upgradeNames: ['  Hit Points: +25 hp','  Hit Points: +50 hp','  Hit Points: +75 hp','  Bullets - Double Fire Rate','  Bullets - Double Damage','  Points: +2000','  Points: +3000','  Points: +5000'],
        lastChanceArray: [],
        fps: fps,
        paused: true,
        started: false,
        storyVisible: false,
        rowStartY: 100,
        rowStartX: 20,
        scale: 0.4,
        scores: {
            current: 0,
            best: 0,
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
            //player.anims.stop();
        },

        unpause: function() {
            scene.physics.resume();
            let vG = vars.game;
            vG.paused=false;
            player.setVisible(true); //.setFrame(0);
            enemies.children.each( function(c) {
                c.setVisible(true).setVelocityX(50);
            })
            vars.levels.wavePopupVisible=false;
            //player.anims.play('hover');
        }
    },

    levels: {
        wave: 0,
        wavePopupVisible: false,

        waveIncrement: function() {
            vars.levels.wave++;
            vars.levels.wavePopupVisible=true;
            if (vars.levels.wave===10) {
                vars.enemies.removeBosses=false;
            }
        }
    },

    player: {
        isDead: false,
        scale: 1.0,
        hitpoints: 125,
        hitpointsMinMax: [125, 200],
        shield: 3,
        startPosition: {
            x: -1,
            y: -1,
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

        ship: {
            bodyWidths: [
                [30,50],
                [55,50],
                [80,50],
            ],
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

                    bulletCheck: function() {
                        bullets.children.each( function(c) {
                            if (c.y<=-100) {
                                let bulletName = c.getData('name');
                                if (vars.DEBUG===true && vars.VERBOSE===true) { console.log('%cBullet with name: ' + bulletName + ' is off the screen, destroying it', vars.console.doing); }
                                c.destroy();
                            }
                        })
                    },

                    fire: function() {
                        let ssV = vars.player.ship.special;
                        this.currentWait = this.currentWaitMax;
                        this.ready = false;
                        let damage = this.damage;
                        if (ssV.doubleDamageEnabled===true) { damage*=2; }
                        let thisBullet = new bullet(0, this.bulletOffset, this.bulletSpeed, damage, 'centre');
                        thisBullet.physicsObject.setVelocityY(-this.bulletSpeed);
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
                    currentWait: -1,
                    currentWaitMax: -1,
                    firespeed: 5,
                    enabled: false,
                    bulletCount: -1,
                    damage: 2,
                    bulletOffset: [60 * gameScale],

                    bulletCheck: function() {

                    },

                    fire: function() {

                    },

                    update: function() {

                    }
                },
                l2r2: {
                    currentWait: -1,
                    currentWaitMax: -1,
                    firespeed: 0.25,
                    enabled: false,
                    bulletCount: -1,
                    damage: 50,
                    bulletOffset: [96*gameScale],

                    bulletCheck: function() {

                    },

                    fire: function() {

                    },

                    update: function() {

                    }
                },
            },

            special: {
                doubleDamageEnabled: false,
                doubleFireRate: false,
                upgradeOnScreen: false,
                upgradeTimeout: [3*fps, 3*fps],

                resetVars: function() {
                    let ssV = vars.player.ship.special;
                    ssV.upgradeTimeout[0]=ssV.upgradeTimeout[1];
                    ssV.doubleDamageEnabled=false;
                    ssV.doubleFireRate=false;
                    ssV.upgradeOnScreen=false;
                }
            },

            upgrades: 0,

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

    story: {

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