/*
   █████ █   █ █████ █████ █   █    █████ █████ █████ █████ █████ █   █    █████ █████ █████ █████ █████ ████  █   █ █████ 
   █     ██  █ █     █ █ █ █   █    █   █   █     █   █   █ █     █  █     █   █ █   █   █     █   █     █   █ ██  █ █     
   ████  █ █ █ ████  █ █ █  ███     █████   █     █   █████ █     ███      █████ █████   █     █   ████  ████  █ █ █ █████ 
   █     █  ██ █     █ █ █   █      █   █   █     █   █   █ █     █  █     █     █   █   █     █   █     █   █ █  ██     █ 
   █████ █   █ █████ █ █ █   █      █   █   █     █   █   █ █████ █   █    █     █   █   █     █   █████ █   █ █   █ █████ 
*/

function enemyBossPatternsCreate() { // these are built at runtime as they are static in nature, unlike the standard enemy patterns which start at the enemies xy position
    console.log('Building Enemy Boss Paths!');
    let start = [50,400];
    let paths = ['bezier1','bezier2','horizontal','circle','ellipse']

    for (path=0; path<paths.length; path++) {
        let newpath = null;
        let pathName = paths[path];
        switch (paths[path]) {
            case 'bezier1': case 'bezier2': // bezier wave (horizontal and vertical movement)
                let xInc = 150;
                let yDif = 50;
                let pathVersion=0;
                let pathPositions = [];
                for (let p=1; p<=4; p++) {
                    if (p===1) {
                        xPos = start[0];
                    }
                    xPos += xInc;
                    if (paths[path]==='bezier1') {
                        yPos = p%2===0? start[1]-yDif : start[1]+yDif;
                    } else {
                        if (pathVersion===0) { pathVersion=1; }
                        yPos = p%2===0? start[1]+yDif : start[1]-yDif;
                    }
                    pathPositions.push(xPos, yPos);
                }

                if (pathVersion===0) {
                    newpath = new Phaser.Curves.Path(start[0], start[1]-yDif).splineTo(pathPositions);
                } else {
                    newpath = new Phaser.Curves.Path(start[0], start[1]+yDif).splineTo(pathPositions);
                }
                
            break;
            case 'horizontal': // basic left right movement
                newpath = new Phaser.Curves.Path(start[0], start[1]).lineTo(vars.canvas.width-start[0]*2, start[1]);
            break;
            case 'circle':  // basic circular movement
                newpath = new Phaser.Curves.Path(vars.canvas.cX+vars.canvas.cX/2, vars.canvas.cY-vars.canvas.cY/4).circleTo(vars.canvas.cX*0.5);
            break;
            case 'ellipse': // ellipse movement
                newpath = new Phaser.Curves.Path(vars.canvas.width - vars.canvas.cX/4, start[1]).ellipseTo(vars.canvas.cX-100, 150);
            break;
        }
        newpath.name = pathName;
        vars.enemies.bossPaths.push([pathName, newpath])
    }
    console.log('  ... finished setting up the boss paths.');
}

vars.enemies.enemyPatterns = { // these patterns are dynamic and are based on the selected enemies xy start position
    splines: {
        alpha: {
            positions: [
                ['canvasWidth-220', 30],
                ['canvasWidth-30', 250],
                [0+100, 'enemyStartY+300'],
                [0+100, 'enemyStartY+500'],
                ['canvasWidth+50', 'enemyStartY+400'],
            ],
            fireTimings: {
                initialWait: 60, // in frames
                bulletCount: 5,
                bulletSpacing: 4, // frames
                fireSpacing: 30,
            },
        },
        alphaReversed: {
            positions: [
                [0+220, 30],
                [0+30, 250],
                ['canvasWidth-100', 'enemyStartY+300'],
                ['canvasWidth-100', 'enemyStartY+500'],
                [0-50, 'enemyStartY+400'],
            ],
            fireTimings: {
                initialWait: 60, // in frames
                bulletCount: 5,
                bulletSpacing: 4, // frames
                fireSpacing: 30,
            },
        },
    },

    convertPatternToSpline: function(_spline='alpha',_enemyPos=[]) {
        if (_enemyPos.length!=2) {
            console.error('You must send the enemies position to this function or the output will mean nothing\n(as the enemy position would always be 0,0');
            debugger;
            return false;
        }

        let epV = vars.enemies.enemyPatterns;
        let sV = epV.splines;
        let splineArray = [];

        let positions = sV[_spline].positions;
        for (let s=0; s<positions.length; s++) {
            //console.log(positions[s]);
            let xPos=-1; let yPos=-1;
            if (typeof positions[s][0]!=='number' || typeof positions[s][1]!=='number') {
                if (typeof positions[s][0]!=='number') {
                    //console.log('String found on X axis... converting it');
                    xPos = epV.patternStringToInt(positions[s][0],_enemyPos);
                }
                if (typeof positions[s][1]!=='number') {
                    //console.log('String found on Y axis... converting it');
                    yPos = epV.patternStringToInt(positions[s][1],_enemyPos);
                }
                if (xPos===-1) { xPos = positions[s][0]; }
                if (yPos===-1) { yPos = positions[s][1]; }
            } else {
                xPos = positions[s][0]; yPos = positions[s][1];
            }
            splineArray.push(xPos); splineArray.push(yPos); // this is the format that Phaser uses (ie [x,y,x,y,x,y...])
        }
        //console.log(splineArray);
        //console.log('Enemy Start from: ' + _enemyPos[0] + ',' + _enemyPos[1]);
        
        // create the path
        let path1 = new Phaser.Curves.Path(_enemyPos[0], _enemyPos[1]).splineTo(splineArray);
        // DEBUG
        if (vars.DEBUG===true) {
            // draw it so we can make sure it looks ok
            graphics = scene.add.graphics();
            graphics.lineStyle(1, 0xffffff, 1);
            path1.draw(graphics, 128);
        }
        // END
        return path1;
    },

    patternStringToInt: function(_positionAsText,_enemyXY) {
        let regex=/(\w+)([-,+])(\w+)/;
        if (typeof _positionAsText==='string') {
            let found = _positionAsText.match(regex);
            let what = found[1];
            let operator = found[2];
            let value = found[3];

            let OKCount = 0;
            // make sure the what is a valid string
            if (typeof what === 'string') {
                //console.log('Valid "what" found.');
                OKCount++;
            } else {
                console.error('ERROR: Invalid "what" found.')
            }
            // make sure the operator is valid
            if (operator==='+' || operator==='-') {
                //console.log('Valid operator found.');
                OKCount++;
            } else {
                console.error('ERROR: Invalid operator found.')
            }
            // make sure the value is actually a value
            if (isNaN(parseInt(value))) {
                console.error('ERROR: Value is not a number!');
            } else {
                //console.log('This is a number.');
                OKCount++;
                value = parseInt(value);
            }

            if (OKCount===3) { // everything looks fine, do the calculation
                let outValue=-1;
                if (what.includes('canvas')) {
                    let cV = vars.canvas;
                    let dimension = what.replace('canvas','').toLowerCase();
                    let calcValue = cV[dimension];
                    if (operator==='+') {
                        //console.log(calcValue + '+' + value);
                        outValue = calcValue + value;
                    } else {
                        //console.log(calcValue + '-' + value);
                        outValue = calcValue - value;
                    }
                    //console.log('OutValue = ' + outValue); // this will be the integer after
                } else if (what.includes('enemy')) {
                    let dimension = what.replace('enemyStart','').toLowerCase();
                    dimension = dimension==='x' ? 0 : 1;
                    let calcValue = _enemyXY[dimension];
                    if (operator==='+') {
                        //console.log('Enemy ' + calcValue + '+' + value);
                        outValue = calcValue + value;
                    } else {
                        //console.log('Enemy ' + calcValue + '-' + value);
                        outValue = calcValue - value;
                    }
                } else {
                    console.log('The "what" variable contains an invalid reference.\nReferences accepted so far: enemy, canvas');
                }

                if (outValue!==-1) {
                    return outValue;
                } else {
                    console.error('The The outValue is still -1!\nThis is a real problem!');
                    debugger;
                    return false;
                }
            } else {
                console.error('The OK Count was NOT 3!\nPassed variable was: ' + _positionAsText + '\nIf you have the console enabled you should jump to\nthis line as theres a debugger call on the next line.');
                debugger;
                return false;
            }
        }
    },
}


/*
   █████ █   █ █████ █████ █   █    █████ █     █████ █████ █████ 
   █     ██  █ █     █ █ █ █   █    █     █     █   █ █     █     
   ████  █ █ █ ████  █ █ █  ███     █     █     █████ █████ █████ 
   █     █  ██ █     █ █ █   █      █     █     █   █     █     █ 
   █████ █   █ █████ █ █ █   █      █████ █████ █   █ █████ █████ 
*/
class enemy {
    constructor(enemyType, row, xOffset, col) {
        this.enemyType = enemyType;
        this.name = 'enemy_' + generateRandomID();

        this.x = xOffset + (col*30);

        this.row = row;

        switch (this.row) { // we currently dont do anything with this variable, but its good to get an idea of the enemy colour (if needed)
            case 1: this.colour = 0xff0000; break;
            case 2: this.colour = 0x00ff00; break;
            case 3: this.colour = 0x0000ff; break;
            case 4: this.colour = 0xA300D9; break;
            case 5: this.colour = 0xffff00; break;

            default: this.colour = 0xffffff; break;
        }
        
        this.y = vars.game.rowStartY * this.row  + (row*30);

        this.addEnemy(this.enemyType);
    }

    addEnemy(eT) {
        switch(eT) {
            case 0: this.hp = 5; break;
            case 1: this.hp = 10; break;
            case 2: this.hp = 15; break;
        }
        this.points = this.hp * 10;

        this.sprite = this.row-1;
        
        
        let vgscale = vars.game.scale;
        let thisSprite = scene.physics.add.sprite(this.x * vgscale, this.y * vgscale, 'enemies', this.sprite).setScale(vgscale-0.1).setVisible(false).setName('boss_' + generateRandomID);
        thisSprite.setData({ hp: this.hp, row: this.row, enemyType: this.enemyType, dead: false, points: this.points, attacking: false, colour: this.colour }).setName(this.name);
        thisSprite.anims.play('e.hover' + this.sprite);
        enemies.add(thisSprite);
    }
}

class enemyBoss {
    constructor(enemyType) {
        let eV = vars.enemies;
        let cV = vars.canvas;

        eV.bossNext+1===eV.spriteCount ? eV.bossNext=0 : eV.bossNext++;
        if (vars.levels.wave<3 && eV.bossNext===5) { // for the first 2 waves we dont show the real enemy (cthulhu)
            eV.bossNext=0;
        }
        this.sprite = eV.bossNext;

        this.hp = 40 + (enemyType * 5);
        this.points = 2000 * (enemyType+1);
        this.scale = vars.game.scale*3;
        this.startPosition = [cV.cX, cV.cY];
        let firerate = eV.bossFireRateGetRandom();
        this.firerate = firerate[0];
        this.fireratepattern = firerate[1];

        let selectedPath = Phaser.Math.RND.between(0,eV.bossPaths.length-1);
        console.log('Selected boss path = ' + eV.bossPaths[selectedPath][0]);
        let boss = scene.add.follower(eV.bossPaths[selectedPath][1],0,0, 'enemies', this.sprite).setScale(this.scale);
        var thisSprite = scene.physics.add.sprite(this.startPosition[0], this.startPosition[1], 'enemies', this.sprite).setScale(this.scale).setAlpha(0);
        thisSprite.setData({ hp: this.hp, enemyType: this.sprite, dead: false, points: this.points, firerate: this.firerate, fireratepattern: this.fireratepattern });
        let thisSpriteBody = thisSprite.body;
        enemyBossGroup.add(boss);
        boss.body = thisSpriteBody;  // youll never guess this.. but you have to add the body
        boss.data = thisSprite.data; // and data after adding it to the group.. because Phaser :S
        scene.tweens.add({ // this doesnt fire for some reason, so TODO
            targets: boss,
            alpha: 1,
            //ease: 'linear',
            duration: 50,
            repeat: 8,
            yoyo: true,
        }, this);
        boss.startFollow({
            positionOnPath: true,
            duration: 5000,
            yoyo: true,
            repeat: -1,
            ease: 'Quad.easeInOut',
        });
        
    }
}

function enemyBossHit(_bullet, _boss) {
    let bossPosition = [_boss.x, _boss.y];
    bulletHitEnemy.emitParticleAt(_bullet.x, _bullet.y-20);
    scene.sound.play('enemyBossHit');
    let bulletStrength = _bullet.getData('hp');
    _bullet.destroy();
    for (let d=0; d<5; d++) {
        enemyPieceParticle.emitParticleAt(bossPosition[0], bossPosition[1]);
    }
    let hp = _boss.getData('hp');
    let bossHP = hp-bulletStrength;
    let pV = vars.player;
    if (bossHP>0) {
        _boss.setData('hp', bossHP);
        console.log('Boss HP: ' + bossHP);
        pV.increaseScore(bulletStrength*50);
    } else {
        let lV = vars.levels;
        let eV = vars.enemies;
        console.log('The boss is dead! Make him to explody things...');
        let points = _boss.getData('points');
        pV.increaseScore(points);
        if (lV.wave===1) { // on wave 1 we take it easy on the player by resetting the enemy death count to max
            eV.bossSpawnTimeout[0]=eV.bossSpawnTimeout[1];
        } else if (lV.wave===2) { // wave 2 sets the spawn timeout back to 5 giving the player a short time before the next boss
            eV.bossSpawnTimeout[0]=eV.bossSpawnTimeout[1]/2;
        } else { // for waves 3 and up we only allow a maximum of 2 enemy deaths before spawning the next boss
            eV.bossSpawnTimeout[0];
        }
        // then spawn a ship upgrade
        new shipUpgrade(bossPosition); // player.js
        _boss.destroy();
    }
}

function enemyBossUpdate(_boss) {
    let firerate = _boss.getData('firerate');
    if (firerate.firetimeout>0) {
        _boss.data.list.firerate.firetimeout--;
        return;
    } else {
        // get the bulletcount
        let bCount = firerate.bulletcount;// 10
        let bPF = firerate.bulletsperframe;// 1
        let bTimeout = firerate.bullettimeout;// 2

        if (bCount>0) {
            if (bTimeout>0) {
                _boss.data.list.firerate.bullettimeout--;
                return;
            } else {
                // fire the bullet(s)
                let damage = vars.enemies.bulletDamage*2; // boss bullets hit 2 times harder than a normal one!
                let bulletScale = vars.game.scale*2;
                for (let b=0; b<bPF; b++) {
                    //console.log('Firing Bullet');
                    let bulletSprite = Phaser.Math.RND.between(0,vars.enemies.spriteCount-1); // basically the colour of the bullet
                    vars.enemies.bulletPhysicsObject([_boss.x, _boss.y], bulletSprite, bulletScale, damage, 900, false);
                }
                _boss.data.list.firerate.bulletcount--;

                // then get ready to fire the next bullet
                let bossFirePatternNum = _boss.getData('fireratepattern');
                let pattern = vars.enemies.bossFireRatesResets[bossFirePatternNum];
                _boss.data.list.firerate.bullettimeout = pattern.bullettimeout;
            }
        } else {
            // boss has run out of bullets! reset the vars
            let defaults = vars.enemies.bossFireRatesResets[_boss.getData('fireratepattern')];
            // if we set the firerate data by using the selected firerate object it will be passed by reference. Any updates to the new object will filter to the original object IMPORTANT
            let defObject = { firetimeout: defaults.firetimeout, bullettimeout: defaults.bullettimeout, bulletsperframe: defaults.bulletsperframe, bulletcount: defaults.bulletcount };
            _boss.setData('firerate', defObject);
            return;
        }
    }
}


/*
   █████ █   █ █████ █████ █   █    █████ █   █ █   █ █████ █████ █████ █████ █   █ █████ 
   █     ██  █ █     █ █ █ █   █    █     █   █ ██  █ █       █     █   █   █ ██  █ █     
   ████  █ █ █ ████  █ █ █  ███     ███   █   █ █ █ █ █       █     █   █   █ █ █ █ █████ 
   █     █  ██ █     █ █ █   █      █     █   █ █  ██ █       █     █   █   █ █  ██     █ 
   █████ █   █ █████ █ █ █   █      █     █████ █   █ █████   █   █████ █████ █   █ █████ 
*/

function enemyAttackingHit(_enemy, _bullet) {
    console.log('Enemy attacker has been hit. Pausing...');
    let enemyName = _enemy.name.replace('f_','');
    let enemyPhaser = scene.children.getByName(enemyName);
    console.log(enemyPhaser);
    console.log(_bullet);
    enemyHit(_bullet, enemyPhaser);
    if (enemyPhaser===null) {
        _enemy.destroy();
    }
}

function enemyDeath(enemy) {
    //console.log('Enemy has died, creating death tween...');
    enemy.disableBody(); // disable interaction with bullets
    enemy.setData('dead', true); // set the enemy to dead so it doesnt get counted in enemy win condition
    let xMove = Phaser.Math.RND.between(30,60);
    if (enemy.x>vars.canvas.cX) { xMove = -xMove; }
    xMove = enemy.x + xMove;
    scene.tweens.add({
        targets: enemy,
        y: 900,
        x: xMove,
        //ease: 'linear',
        duration: 1000,
        onComplete: enemyDestroy,
    }, this)

    // check to see if we should spawn a power up
    let eV = vars.enemies;
    eV.deadSinceLastPowerup++;
    if (eV.deadSinceLastPowerup===10) {
        healthBulletUpgradeSpawn([enemy.x, enemy.y])
        eV.deadSinceLastPowerup=0;
    }

    // check to see if we should spawn a boss yet
    eV.bossSpawnTimeout[0]--;
    if (eV.bossSpawnTimeout[0]===0) {
        if (enemyBossGroup.children.size<eV.bossLimit) {
            vars.enemies.spawnBoss();
        } else {
            eV.bossSpawnTimeout[0]++;
        }
    }
}

function enemyDestroy() {
    //console.log('Enemy Destroyed.');
    let enemy = this.targets[0];
    bulletHitEnemy.emitParticleAt(enemy.x, enemy.y); // explosion particle
    enemy.destroy(); // this = tween
    // check if there are any enemies left on screen
    if (enemies.children.entries.length===0) { // all enemies are dead!
        gameLevelNext();
    }
}

function enemiesGenerate() {
    vars.enemies.spawn();
}

function enemyGetRandom() {
    let enemyArray = enemies.children.getArray();
    let enemyChildCount = enemies.children.size;
    if (enemyChildCount===1) {
        selectedEnemy = enemyArray[0];
    } else {
        selectedEnemy = Phaser.Utils.Array.GetRandom(enemyArray);
        if (selectedEnemy.getData('attacking')===false) {
            //selectedEnemy.setData('attacking',true); TODO - reenable this
        } else {
            // TODO 
            // It would be better to search the array for the closest enemy thats not attacking
            // instead of just calling this function again.
            console.warn('...we randomly picked an enemy thats currently attacking :S'); // this will give me a decent idea how many times this is called
            enemyGetRandom();
        }
    }
    return selectedEnemy;
}

function enemyHit(bullet, enemy) {
    if (vars.DEBUG===true && vars.VERBOSE===true) { console.log('Hit!'); }
    let strength = bullet.getData('hp');
    if (strength===undefined) {
        if (vars.DEBUG===true && vars.VERBOSE===true) { console.warn('Invalid bullet strength, its probably being destroyed. This is due to the speed of our bullets'); }
        return false;
    }

    // destroy the bullet and remove it from the bullets array
    bullet.destroy();
    if (enemy!==null) {
        enemyPieceParticle.emitParticleAt(enemy.x, enemy.y)
        scene.sound.play('enemyHit');

        // single explosion
        bulletHitEnemy.emitParticleAt(enemy.x, enemy.y);

        // increase the players score
        let scoreTotal = 0;
        scoreTotal += strength * 10;

        // reduce enemy hp by bullet strength
        let enemyHP = enemy.getData('hp');
        if (vars.DEBUG===true && vars.VERBOSE===true) { console.log('hp: ' + enemyHP + ', bullet strength: ' + strength); }
        enemyHP -= strength;

        // check for enemy death
        if (enemyHP<=0) { // enemy is dead
            scoreTotal += enemy.getData('points'); // give the player the points for this enemy
            enemyDeath(enemy);
        } else {
            enemy.setData('hp', enemyHP); // enemy is fine, update its HP
            //console.log('enemy hp: ' + enemyHP);
        }

        vars.player.increaseScore(scoreTotal);
    }

    // enemy destroy has been moved to after its death animation: fn enemyDestroy

}

function enemiesLand() {
    let eV = vars.enemies;
    eV.isLanding = true;

    let count=0;
    let yMinMax = [1200,0];
    enemies.children.each( (c) => {
        c.body.velocity.x=0;
        if (c.y<yMinMax[0]) {
            yMinMax[0]=c.y;
        }
        if (c.y>yMinMax[1]) {
            yMinMax[1]=c.y;
        }
    })
    let yDelta = (vars.canvas.height-30) - yMinMax[1];

    enemies.children.each( (c) => {
        let scaleDelta = 0.25 + ((c.y/yDelta)*0.25);
        thisYDelta = c.y+yDelta;
        if (count===0) {
            count=1;
            scene.tweens.add({
                targets: c,
                y: thisYDelta,
                scale: scaleDelta,
                //ease: 'linear',
                duration: 2500,
                onComplete: enemiesStopAnims,
            })
        } else {
            scene.tweens.add({
                targets: c,
                y: thisYDelta,
                scale: scaleDelta,
                //ease: 'linear',
                duration: 2500,
            })
        }
    })
}

function enemiesMove() {
    let eV = vars.enemies;
    //first we check for a change in direction
    if (eV.updateTimeout>0) {
        eV.updateTimeout--;
        return;
    } else {
        eV.updateTimeout=eV.updateTimeoutMax;
    }

    if (eV.moveDirectionCurrent==='right') {
        // get the right most enemy
        let maxX=0
        enemies.children.each( (c) => {
            if (c.x>maxX) { maxX = c.x; }
        })

        // has the right most enemy hit the canvas edge?
        if (maxX>= eV.bounds.right) {
            eV.moveDirectionPrevious = eV.moveDirectionCurrent;
            eV.moveDirectionCurrent='down';
            enemies.children.each( (c)=> {
                c.setVelocityX(0).setVelocityY(eV.speed);
            })
            eV.updateTimeout *= 4;
        }
    } else if (eV.moveDirectionCurrent==='left') {
        // get the left most enemy
        let minX=vars.canvas.width;
        enemies.children.each( (c) => {
            if (c.x<minX) { minX = c.x; }
        })

        // has the left most enemy hit the canvas edge?
        if (minX<= eV.bounds.left) {
            eV.moveDirectionPrevious = eV.moveDirectionCurrent;
            eV.moveDirectionCurrent='down';
            enemies.children.each( (c)=> {
                c.setVelocityX(0).setVelocityY(eV.speed);
            })
            eV.updateTimeout *= 4;
        }
    } else if (eV.moveDirectionCurrent==='down') {
        // test if the enemies have hit the lowest point before they win
        let lowest = 0;
        enemies.children.each( (c) => {
            if (c.getData('dead')===false) { // only check the alive enemies
                if (c.y>lowest) { lowest = c.y; }
            }
        })
        if (lowest>800) {
            console.log('DEAD!');
            vars.game.pause();
            vars.game.started=false; // this tells us that we have died
            vars.player.dead();
            return;
        }

        // update the speed of the enemies
        eV.increaseEnemySpeed();

        // get the previous direction before we moved the enemies down
        let oldDirection = eV.moveDirectionPrevious;
        if (oldDirection==='left') {
            eV.moveDirectionCurrent='right';
            enemies.children.each( (c)=> {
                c.setVelocityX(eV.speed).setVelocityY(0);
            })
        } else if (oldDirection==='right') {
            eV.moveDirectionCurrent='left';
            enemies.children.each( (c)=> {
                c.setVelocityX(-eV.speed).setVelocityY(0);
            })
        } else {
            console.error('Invalid old direction: ' + eV.moveDirectionPrevious);
        }
        eV.moveDirectionPrevious = 'down';
    }
}

function enemiesStopAnims() {
    vars.audio.stop();
    enemies.children.each( (c) => {
        c.anims.stop();
    })
    uiGameOver();
}




/*
█   █ █████ ████  █████    █████ ████   ████ █████ █████ █████    █████ █   █ █   █ █████ █████ █████ █████ █   █ █████ 
█   █ █   █ █   █ █        █   █ █   █     █ █     █       █      █     █   █ ██  █ █       █     █   █   █ ██  █ █     
█   █ █████ ████  █████    █   █ ████      █ ████  █       █      ███   █   █ █ █ █ █       █     █   █   █ █ █ █ █████ 
 █ █  █   █ █   █     █    █   █ █   █ █   █ █     █       █      █     █   █ █  ██ █       █     █   █   █ █  ██     █ 
  █   █   █ █   █ █████    █████ ████   ███  █████ █████   █      █     █████ █   █ █████   █   █████ █████ █   █ █████ 
*/
function enemiesInit() {
    vars.enemies.init();
}
function enemiesSpawn() {
    vars.enemies.spawn();
}
function enemiesUpdate() {
    vars.enemies.update();
}