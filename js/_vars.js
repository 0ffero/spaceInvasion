var fps = 60;
var gameScale = 0.4;

const consts = {
    mouse: {
        left: 1,
        right: 2,
        middle: 4,
        mouse4: 8,
        mouse5: 16,
    }
}


var vars = {
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
        bossSpawnTimeout: [10,10], // [0] = current counter [1] = reset to ie every 10 enemy deaths a boss spawns
        bossSpawnCount: 0,
        bossFireRates: [],
        bossFireRatesResets: [],
        bossLimit: 1,
        bossNext: -1,
        deadSinceLastPowerup: 0,

        bossPaths: [], // these are built at run time. All boss paths are set, unlike standard enemy attack paths which start at the enemy xy
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

        bulletPhysicsObject: function(_xy, _bullet=0, _scale=0.4, _strength=1) {
            if (_scale===0.4 && vars.game.scale!==0.4) { _scale = vars.game.scale; }
            let theBullet = scene.physics.add.sprite(_xy[0], _xy[1], 'bulletPrimaryEnemy', _bullet).setScale(_scale);
            theBullet.setName('bullet_' + generateRandomID());
            theBullet.setData('hp',_strength);
            enemyBullets.add(theBullet);
            theBullet.setVelocityY(600);
        },

        debugBossPatterns: function() {
            let graphics = scene.add.graphics();
            graphics.lineStyle(1, 0xffffff, 1);
            let bP = vars.enemies.bossPaths;
            for (let path=0; path<bP.length; path++){
                bP[path][1].draw(graphics, 128);
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

        shootTimeoutDo: function() {
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
                    //console.log('    Spawning bullet for enemy: ' + randomEnemy.name + ' at ' + xy[0] + ',' + xy[1]);
                    eV.bulletPhysicsObject(xy,bullet,scale);
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
            let boss = new enemyBoss(5);
        },

        update: function() {
            //this function was becoming unweildy so its been moved to enemy.js
            enemiesMove();
            // now we check to see if the enemies should be shooting (only happens every few seconds)
            vars.enemies.shootTimeoutDo();
        }


    },

    game: {
        bulletCheckTimeout: [fps/2, fps/2],
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
            enemies.children.each( (c) => {
                c.setVisible(true);
            })
            vars.player.destroyAllBullets();
            enemiesLand();
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
            scoreText = scene.children.getByName('scoreTextInt').setText(gV.scores.current);
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
                upgradeTimeout: [3*fps, 3*fps],
            },

            upgrades: 0,
            upgradePickup: function() {
                // originally I was just gonna upgrade the ship, but now I give the player full health
                let sV = vars.player.ship;
                let newFrame = player.frame.name;
                // update the frame
                if (newFrame < 2) {
                    newFrame++;
                    player.setFrame(newFrame);
                    player.setSize(sV.bodyWidths[newFrame][0], sV.bodyWidths[newFrame][1]);
                } else { // I may eventually add code to allow upgrades beyond 2 so the "else" stays

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