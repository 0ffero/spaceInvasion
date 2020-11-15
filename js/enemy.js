/*
   █████ █   █ █████ █████ █   █    █████ █████ █████ █████ █████ █   █    █████ █████ █████ █████ █████ ████  █   █ █████ 
   █     ██  █ █     █ █ █ █   █    █   █   █     █   █   █ █     █  █     █   █ █   █   █     █   █     █   █ ██  █ █     
   ████  █ █ █ ████  █ █ █  ███     █████   █     █   █████ █     ███      █████ █████   █     █   ████  ████  █ █ █ █████ 
   █     █  ██ █     █ █ █   █      █   █   █     █   █   █ █     █  █     █     █   █   █     █   █     █   █ █  ██     █ 
   █████ █   █ █████ █ █ █   █      █   █   █     █   █   █ █████ █   █    █     █   █   █     █   █████ █   █ █   █ █████ 
*/

function enemyBossPatternsCreate() { // these are built at runtime as they are static in nature, unlike the standard enemy patterns which start at the enemies xy position
    if (vars.DEBUG===true) { console.log('      %cBuilding Enemy Boss Paths!', vars.console.doing); }
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
    if (vars.DEBUG===true) { console.log('%c        ... finished setting up the boss paths.',vars.console.doing); }
}

vars.enemies.enemyPatterns = { // these patterns are dynamic and are based on the selected enemies xy start position
    splines: {
        available: [ 'alpha', 'beta' ],

        alpha: {
            positions: [
                ['canvasWidth-220', 30],
                ['canvasWidth-30', 250],
                [0+100, 0+400],
                [0+100, 0+800],
                ['canvasWidth+50', 0+500],
            ],
        },
        alphaReversed: {
            positions: [
                [0+220, 30],
                [0+30, 250],
                ['canvasWidth-100', 0+400],
                ['canvasWidth-100', 0+800],
                [0-50, 0+500],
            ],
        },
        beta: {
            positions: [
                [500, 200],
                ['canvasWidth-100', 350],
                ['canvasWidth-100', 500],
                [100, 500],
                [100, 600],
                ['canvasWidth-100', 600],
                ['canvasWidth-100', 700],
                [100, 800],
                [100, 900],
                ['canvasWidth+50', 0+800],
            ],
        },
        betaReversed: {
            positions: [
                [220, 200],
                [100, 350],
                [100, 500],
                ['canvasWidth-100', 500],
                ['canvasWidth-100', 600],
                [100, 600],
                [100, 700],
                ['canvasWidth-100', 800],
                ['canvasWidth-100', 900],
                [-50, 0+800],
            ]
        },
        fireTimings: {
            initialWait: 60, // in frames
            bulletCount: 5,
            bulletSpacing: 4, // frames
            fireSpacing: 30,
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
        if (vars.DEBUG===true) { // draw the spline so we can make sure it looks ok
            graphics = scene.add.graphics();
            graphics.lineStyle(1, scene.consts.colours.white, 1);
            path1.draw(graphics, 128);
        }
        // END
        return path1;
    },

    modifyFireTimings: function(_timings) {
        if (vars.levels.wave<=3) {
            _timings.fireSpacing=60;
            _timings.bulletCount=3;
            _timings.bulletSpacing=2; // this makes the bullet group spread less
        } else if (vars.levels.wave>=7) {
            _timings.bulletCount=7;
            _timings.bulletSpacing=6; // this makes the bullet group spread more making it harder to dodge
        }
        return _timings;
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

function enemyAttackPatternsNonDynamic() { // these patterns are NOT dynamic. They are used when we get into space
    let cW = vars.canvas.width;
    let cCX = vars.canvas.cX;
    let cCY = vars.canvas.cY;

    //switch (selected) {
    scene.paths = {}
    let start = [-50,300]; let offsets = [150,50]; let yMinMax = [3,5];
    let positions = [];
    positions.push(cW/2-300, start[1]+offsets[1]); positions.push(cW-100, start[1]-offsets[1]); positions.push(cW-100, start[1]-offsets[1]+200); positions.push(100, start[1]-offsets[1]+400); positions.push(100, start[1]-offsets[1]+600); positions.push(cW+100, start[1]-offsets[1]+400);
    scene.paths.backAndForth = new Phaser.Curves.Path(cW-100,-50).splineTo(positions);//.setName('backAndForth');
    vars.enemies.attackPatternsNonDynamic.backAndForth = { maxOnPath: 10, duration: 6000, repeat: 1, delay: 200 };

    let sineWaves = ['sineWaveMinMax', 'sineWaveSlow', 'sineWaveFast', 'sineWaveClose'];
    for (let p=0; p<sineWaves.length; p++) {
        let defaultData = { maxOnPath: 10, duration: 6000, repeat: 1, delay: 333 }
        let selected = sineWaves[p];
        if (selected==='sineWaveSlow') { offsets = [200,50]; yMinMax = [3,5]; } else if (selected==='sineWaveFast') { offsets = [100,50]; yMinMax = [3,5]; } else if (selected==='sineWaveClose') { offsets = [150,50]; yMixMax = [1,3]; } else if (selected==='sineWaveMinMax') { offsets = [100,75]; yMinMax = [1,3]; }
        let positions = [];
        let y = start[1]; let counter=0;
        for (let x=start[0]; x<=cW+offsets[0]; x+=offsets[0]) { positions.push(x,y); counter++; if (counter%2===0) { y=start[1]+50; } else { y=start[1]-50; } }
        let lastPositionX = positions[positions.length-2];
        for (let x=lastPositionX; x>=0-offsets[0]; x-=offsets[0]) { counter++; if (counter%2===0) { positions.push(x,start[1]+offsets[1]*yMinMax[1]); } else { positions.push(x,start[1]+offsets[1]*yMinMax[0]); } }

        // create the sine wave
        x=positions.shift(); y=positions.shift();
        scene.paths[selected] = new Phaser.Curves.Path(x, y).splineTo(positions);//.setName(selected);

        if (selected==='sineWaveSlow') {
            defaultData.delay = 200;
            defaultData.duration = 5000;
        } else if (selected==='sineWaveFast') {
            defaultData.delay = 500;
            defaultData.duration = 8000;
        } else if (selected==='sineWaveMinMax') {
            defaultData.delay = 400;
            defaultData.duration = 7000;
        } else if (selected==='sineWaveClose') {
            defaultData.delay = 200;
            defaultData.duration = 6000;
        }
        vars.enemies.attackPatternsNonDynamic[selected]   = defaultData;
    }

    scene.paths.lineToCircle = new Phaser.Curves.Path(-40, cCY).lineTo(cCX+150, cCY).circleTo(150,true).circleTo(150,true).lineTo(cW+40, cCY);//.setName('lineToCircle');
    vars.enemies.attackPatternsNonDynamic['lineToCircle'] = { maxOnPath: 14, duration: 8000, repeat: 1, delay: 200 };

    scene.paths.simpleM = new Phaser.Curves.Path(-40, cCY+150).lineTo(cCX-(cCX/2), cCY-300).lineTo(cCX,cCY).lineTo(cCX+(cCX/2),cCY-300).lineTo(cW+50, cCY+150);//.setName('simpleM');
    vars.enemies.attackPatternsNonDynamic['simpleM']      = { maxOnPath: 10, duration: 4000, repeat: 1, delay: 200 };
    scene.paths.simpleMDeep = new Phaser.Curves.Path(-40, cCY+150).lineTo(cCX-(cCX/2), cCY-300).lineTo(cCX,cCY+250).lineTo(cCX+(cCX/2),cCY-300).lineTo(cW+50, cCY+150);//.setName('simpleMDeep');
    vars.enemies.attackPatternsNonDynamic['simpleMDeep']  = { maxOnPath: 10, duration: 5000, repeat: 1, delay: 200 };

    scene.paths.simpleW = new Phaser.Curves.Path(-40, cCY-150).lineTo(cCX-(cCX/2), cCY+250).lineTo(cCX,cCY).lineTo(cCX+(cCX/2),cCY+250).lineTo(cW+50, cCY-150);//.setName('simpleW');
    vars.enemies.attackPatternsNonDynamic['simpleW']      = { maxOnPath: 10, duration: 4000, repeat: 1, delay: 200 };
    scene.paths.simpleWHigh = new Phaser.Curves.Path(-40, cCY-450).lineTo(cCX-(cCX/2), cCY+50).lineTo(cCX,cCY-300).lineTo(cCX+(cCX/2),cCY+50).lineTo(cW+50, cCY-450);//.setName('simpleWHigh');
    vars.enemies.attackPatternsNonDynamic['simpleWHigh']  = { maxOnPath: 10, duration: 4000, repeat: 1, delay: 200 };

    scene.paths.simpleX = new Phaser.Curves.Path(-40, cCY).lineTo(cW-50, 100).lineTo(0+50,100).lineTo(cW+50,cCY);//.setName('simpleX');
    vars.enemies.attackPatternsNonDynamic['simpleX']      = { maxOnPath: 13, duration: 5000, repeat: 1, delay: 150 };
    scene.paths.simpleX2 = new Phaser.Curves.Path(-40, 100).lineTo(cW-50, cCY).lineTo(0+50,cCY).lineTo(cW+50,100);//.setName('simpleX2');
    vars.enemies.attackPatternsNonDynamic['simpleX2']     = { maxOnPath: 13, duration: 5000, repeat: 1, delay: 150 };

    // square wave
    start = [-50,600]; let inc = [100,200]; positions = []; positions.push(start);
    let x1 = start[0]; let y1 = start[1]; let yMod = 1; let p=0;
    while (x1<vars.canvas.width) {
        if (p%4===0 || p%4===2) { x1+=inc[0]; } else { yMod*=-1; y1+=yMod*inc[1] }
        positions.push([x1,y1]); p++;
    }
    scene.paths.squareWave = new Phaser.Curves.Path(start[0], start[1]);//.setName('squareWave');
    for (pos of positions) { scene.paths.squareWave.lineTo(pos[0], pos[1]); }
    vars.enemies.attackPatternsNonDynamic['squareWave']   = { maxOnPath: 28, duration: 7000, repeat: 1, delay: 250 };

    if (vars.DEBUG===true) { console.log('%cEnemy Attack Patterns: NON Dynamic - created. Stored in scene.paths', vars.console.callTo); }
    // add all the paths to the enemy var
    vars.enemies.availableAttackPatterns.init();

    /*
    EXAMPLE FOLLOWERS + HOW TO FIGURE OUT AMOUNT OF FOLLOWERS FOR LINE
    let delay = 333; let duration=8000;
    let totalFollowers = ~~(duration/delay);
    for (let f=0; f<totalFollowers; f++) {
        var lemming = this.add.follower(path1, 0, 0, 'lemming');

        lemming.startFollow({
            positionOnPath: true,
            delay: f*delay,
            duration: duration,
            repeat: 1,
        });
    }
    */

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
        if (this.row===6) { // cthulhu's row
            this.enemyType=1;
        }
        this.colour = vars.enemies.colours[this.row-1][2];
        this.colourName = vars.enemies.colours[this.row-1][0];

        // this following code was originally used to look up the actual colour of the sprite,
        // we now use 'colour' instead. Basically theres no point in doing a lookup every
        // time a sprite is hit when we can just use the colour var.
        this.colourIndex = this.row-1;
        this.y = vars.game.rowStartY * this.row + (row*30);

        let vgscale = vars.game.scale;
        this.scale = ~~((vgscale-0.1)*1000)/1000; // quicker parseInt
        this.xyScaled = [this.x*vgscale, this.y*vgscale];

        this.addEnemy(this.enemyType);
    }

    addEnemy(eT) {
        switch(eT) {
            case 0: this.hp = 5; break;
            case 1: this.hp = 10; break;
            case 2: this.hp = 15; break;
        }
        this.points = this.hp * 10;

        // level 25+ works differently. All enemies are attached to a path. In this state, enemies are too easy to kill, so we multiply their hp
        let nextWave = vars.levels.wave+1;
        if (nextWave>=25) { this.hp*=5; this.points*=2; }

        this.sprite = this.row-1;

        let thisSprite = scene.physics.add.sprite(this.xyScaled[0], this.xyScaled[1], 'enemies', this.sprite).setScale(this.scale).setVisible(false).setName('boss_' + generateRandomID);
        thisSprite.setData({ hp: this.hp, row: this.row, enemyType: this.enemyType, dead: false, points: this.points, attacking: false, colourName: this.colourName, colour: this.colour, colourIndex: this.colourIndex }).setName(this.name);
        thisSprite.anims.play('e.hover' + this.sprite);
        enemies.add(thisSprite);
    }
}

class enemyBoss {
    constructor() {
        let eV = vars.enemies;
        let cV = vars.canvas;

        eV.bossNext+1===eV.spriteCount ? eV.bossNext=0 : eV.bossNext++;
        if (vars.levels.wave<3 && eV.bossNext===5) { // for the first 2 waves we dont show the real enemy (cthulhu)
            eV.bossNext=0;
        }
        this.sprite = eV.bossNext;
        this.colour = vars.enemies.colours[this.sprite][2];
        this.colourName = vars.enemies.colours[this.sprite][0];

        this.hp = 40 + (vars.levels.wave*5) + (this.sprite * 5);

        let explosionOffset = this.hp/10;
        let explosionArray = []
        for (let i=0; i<9; i++) {
            explosionArray.push(0);
        }

        this.points = 2000 * (this.sprite+1);
        this.scale = vars.game.scale*3;
        this.startPosition = [cV.cX, cV.cY];
        let firerate = eV.bossFireRateGetRandom();
        this.firerate = firerate[0];
        this.fireratepattern = firerate[1];

        let selectedPath = Phaser.Math.RND.between(0,eV.bossPaths.length-1);
        let startPoint = eV.bossPaths[selectedPath][1].getStartPoint()
        //console.log('Selected boss path = ' + eV.bossPaths[selectedPath][0]);
        let bossName = 'eB_' + generateRandomID();
        let boss = scene.add.follower(eV.bossPaths[selectedPath][1],startPoint.x,startPoint.y, 'enemies', this.sprite).setScale(this.scale).setName('f_' + bossName);
        let hpO = scene.add.image(0,0,'hpBarOutline').setOrigin(0,0.5).setName('hpO_' + bossName).setVisible(false);
        let hpI = scene.add.image(1,0,'hpBarInner').setOrigin(0,0.5).setName('hpI_' + bossName).setVisible(false);
        vars.cameras.ignore(cam2,hpO); vars.cameras.ignore(cam2,hpI);

        var thisSprite = scene.physics.add.sprite(this.startPosition[0], this.startPosition[1], 'enemies', this.sprite).setScale(this.scale).setAlpha(0);
        thisSprite.setData({ name: bossName, hp: this.hp, hpOriginal: this.hp, damageSinceLastExplosion: 0, explosionOffset: explosionOffset, explosionArray: explosionArray, enemyType: this.sprite, colourName: this.colourName, colour: this.colour, colourIndex: this.sprite, dead: false, points: this.points, firerate: this.firerate, fireratepattern: this.fireratepattern });
        let thisSpriteBody = thisSprite.body;
        scene.groups.enemyBossGroup.add(boss);
        boss.body = thisSpriteBody;  // youll never guess this.. but you have to add the body
        boss.data = thisSprite.data; // and data after adding it to the group.. because Phaser :S
        vars.cameras.ignore(cam2, boss);
        boss.setVisible(false);
        boss.startFollow({
            positionOnPath: true,
            duration: 5000,
            yoyo: true,
            repeat: -1,
            ease: 'Quad.easeInOut',
        });

        // generate boss spinner shader
        vars.shader.bossSpinnerShowCam(this.colourName);

        // fade the boss in over 3 seconds
        scene.tweens.add({
            targets: thisSprite,
            alpha: 1,
            ease: 'Cubic.easeIn',
            duration: 1000,
            onComplete: enemyBossShow,
            yoyo: true,
            onCompleteParams: [boss],
        });
    }
}

function enemyBossExplosionCheck(__strength, __boss) {
    let damageSinceLastExplosion = __boss.getData('damageSinceLastExplosion');
    let explosionOffset = __boss.getData('explosionOffset');
    damageSinceLastExplosion+=__strength;
    if (damageSinceLastExplosion>=explosionOffset) {
        if (vars.DEBUG===true) { console.log('Adding Explosion'); }
        let foundPosition=-1; // this variable is used to track a valid quad.
        // Its required because I check the array from the requested explosion quad til the end of the array
        // if no valid quad was found, it will then start checking from the start of the array
        // get a random quadrant
        let Qs = __boss.getData('explosionArray');
        let rndQuad = Phaser.Math.RND.between(0,8); // this gives us the array position
        if (Qs[rndQuad]===0) { // valid position
            if (vars.DEBUG===true) { console.log('Explosion in quad ' + rndQuad); }
            // first, update the quads
            Qs[rndQuad]=1; __boss.setData('explosionArray', Qs);
            foundPosition = rndQuad;
        } else { // quad already has an explosion in it, find the next available quad
            if (vars.DEBUG===true) { console.log('%cQuad ' + rndQuad + ' already has an explosion in it, looking for the next available quad', vars.console.error); }

            // the reason Im doing all this below is because the other option may put
            // us into a massive loop for something as simple as an explosion site
            // THERES PROBABLY A WAY TO DO THIS WITH A MATRIX, POSSIBLE TODO

            if (rndQuad === 8) { // was the random quad position 8 of the array? (ie the last possible position)
                rndQuad=0; // if so, start the quad check at position 0
            }
            for (let q=rndQuad; q<=8; q++) { // check the remaining blocks after the randomly selected one
                if (Qs[q]===0) {
                    Qs[q]=1;
                    foundPosition=q;
                    break;
                }
            }
            if (foundPosition===-1) { // no blocks were found to be available after the requested block, so start from array position 0
                for (let q=0; q<=8; q++) {
                    if (Qs[q]===0) {
                        Qs[q]=1;
                        foundPosition=q;
                        break;
                    }
                }
            }
        }
        if (foundPosition===-1) { // this is a serious problem... we should have an available quad
            console.error('%cERROR: We were searching for a valid quad on the boss enemy, but all quads are set to 1 apparently... wtf?', vars.console.error);
        } else {
            if (vars.DEBUG===true) { console.log('%cOriginal quad wasnt available. Next available quad was at array position ' + foundPosition, vars.console.errorResolved); }
            // show the explosion in the empty quadrant
            bossMatrix = vars.enemies.bossMatrix;
            let bossInfo = [~~(__boss.x+0.5), ~~(__boss.y+0.5), ~~(__boss.displayWidth+0.5), ~~(__boss.displayHeight+0.5) ];
            bossVector = new Phaser.Math.Vector2(bossInfo[0], bossInfo[1]);
            // deep copy so we dont modify the matrix
            selectedMatrix = [bossMatrix[foundPosition][0],bossMatrix[foundPosition][1]];

            let test = true;
            let xMod = bossInfo[2]/3;
            let yMod = bossInfo[3]/3;
            selectedMatrix[0]*=xMod; selectedMatrix[1]*=yMod;
            if (test===false) { // if we ever needed the exact xy position, generally we only require the offset
                addVector = new Phaser.Math.Vector2(selectedMatrix[0],selectedMatrix[1]);
                if (vars.DEBUG===true) { console.log('Original xy: ' + bossVector.x + ', ' + bossVector.y); console.log('Add Vector - x: ' + addVector.x + ', y: ' + addVector.y); }
                bossVector.add(addVector);
                if (vars.DEBUG===true) { console.log('New xy: ' + bossVector.x + ', ' + bossVector.y); }
            } else { // offset only
                 // this sends the offsets only
                 vars.particles.bossFireEmitter(selectedMatrix[0], selectedMatrix[1], foundPosition, __boss);
            }
            //debugger;
        }
        damageSinceLastExplosion-=explosionOffset;
    }

    // update the bosses DSLE
    __boss.setData('damageSinceLastExplosion', damageSinceLastExplosion);
}

function enemyBossHit(_bullet, _boss) {
    if (_boss.visible===true) { // this stops the boss being hit when enternig the stage
        let eV = vars.enemies;
        let bossPosition = [_boss.x, _boss.y];
        bulletHitEnemy.emitParticleAt(_bullet.x, _bullet.y-20);
        scene.sound.play('enemyBossHit');
        let bulletStrength = _bullet.getData('hp');
        let tint = _boss.getData('colour');
        _bullet.destroy();
        for (let d=0; d<3; d++) {
            enemyPieceParticle.setTint(tint);
            enemyPieceParticle.emitParticleAt(bossPosition[0], bossPosition[1]);
        }
        let hp = _boss.getData('hp');
        let bossName = _boss.getData('name');
        let bossHP = hp-bulletStrength;
        let pV = vars.player;
        if (bossHP>0) {
            // update the hp bar
            let enemyHPOriginal = _boss.getData('hpOriginal');
            let hpI = scene.children.getByName('hpI_' + bossName);
            let hpBarWidth = bossHP/enemyHPOriginal;
            hpI.setScale(hpBarWidth, 1);

            // update the boss
            _boss.setData('hp', bossHP);
            enemyBossExplosionCheck(bulletStrength, _boss);

            // update the players score
            pV.increaseScore(bulletStrength*50);
        } else { // the boss is dead, long live the... oh wait
            let lV = vars.levels;
            // remove the hp bar
            scene.children.getByName('hpI_' + bossName).destroy();
            scene.children.getByName('hpO_' + bossName).destroy();
            // remove all the fire particles associated with the boss
            let partV = vars.particles;
            for (p in partV.currentEmitters) {
                //console.log(p);
                let pName = 'bfE_f_' + bossName;
                if (p.includes(pName)===true) {
                    if (vars.DEBUG===true) { console.log('Found particle associated with boss. Deleting it.'); }
                    partV.currentEmitters[p].remove();
                }
            }
            if (vars.DEBUG===true) { console.log('The boss is dead! Make him to explody things...'); }
            scene.sound.play('enemyBossExplode');
            vars.cameras.flash('white', 2500);
            let points = _boss.getData('points');
            let enemyType = _boss.getData('enemyType'); // 5 is the cthulhu boss
            if (vars.shader.current==='gray' || vars.shader.current==='grey' || vars.shader.current==='grayscan' || vars.shader.current==='greyscan') { // is the shade field running?
                if (enemyType===5) { // only switch it off if the boss that died was cthulhu
                    shaderType();
                }
            }
            pV.increaseScore(points);
            if (lV.wave===1) { // on wave 1 we take it easy on the player by resetting the enemy death count to max
                eV.bossSpawnTimeout[0]=eV.bossSpawnTimeout[1];
            } else if (lV.wave===2) { // wave 2 sets the spawn timeout back to 5 giving the player a short time before the next boss
                eV.bossSpawnTimeout[0]=eV.bossSpawnTimeout[1]/2;
            } else { // for waves 3 and up we only allow a maximum of 2 enemy deaths before spawning the next boss
                eV.bossSpawnTimeout[0];
            }
            // then spawn a ship upgrade
            new shipUpgrade(bossPosition, enemyType); // player.js
            _boss.destroy();
        }
    }
}

function enemyBossShow(_tween, _target, _boss) {
    _boss.setVisible(true);
    
    let bossName = _boss.getData('name');
    if (bossName===undefined) { // this can happen if the boss doesnt spawn before the wave ends
        return false;
    }
    if (vars.enemies.bossNext===5) { // this is the cthulhu boss, he has his own special camera filter
        //if (vars.shader.current.includes('boss')===true) {
            shaderType('gray',1); 
        //}
    } else {
        shaderType(); 
    }
    scene.children.getByName('hpO_' + bossName).setVisible(true);
    scene.children.getByName('hpI_' + bossName).setVisible(true);
    let bossType = _boss.getData('enemyType');
    _boss.play('e.hover' + bossType);
    if (vars.player.ship.special.ADI.collected===false && vars.player.ship.special.SHADE.collected===false ) { // make sure there isnt a shader already running due to a player upgrade
        if (bossType===5) { // cthulhu has his own shader which is only stopped upon his death
            // the cthulhu shader is started elsewhere
        } else {
            shaderType();
        }
    }
    if (vars.enemies.cthulhuSpotted===false && bossType===5) { // is this the first time cthulhu was spotted ?
        vars.enemies.cthulhuSpotted = true;
        // highlight the boss
        vars.UI.highlightObject(_boss, 1);
    }
}

function enemyBossUpdate(_boss) {
    // update the hp bar coordinates
    let bossName = _boss.getData('name');
    let xy = _boss.getTopCenter();
    scene.children.getByName('hpO_' + bossName).setPosition(xy.x-20, xy.y-10);
    scene.children.getByName('hpI_' + bossName).setPosition(xy.x-19, xy.y-10);

    // check if the boss should be shooting
    let firerate = _boss.getData('firerate');
    if (firerate.firetimeout>0) {  // is the countdown still happening?
        firerate.firetimeout--;
        return;
    } else { // fire! (this is called several times based on the bCount (bullet count))
        // get the bullet data
        let bCount = firerate.bulletcount;// 10
        let bPF = firerate.bulletsperframe;// 1
        let bTimeout = firerate.bullettimeout;// 2
        
        // first check to see if this is the first bullet by checking the enemies firespread var
        if (_boss.getData('currentSpeed')===undefined) { // set up the bullet spread angle
            let bulletSpreadObject = vars.enemies.bossBulletSpread(bCount);
            let startSpeed = bulletSpreadObject[0];
            let xI = bulletSpreadObject[1];
            _boss.setData({ currentSpeed: startSpeed-xI, xSpeedIncrement: xI });
        }

        if (bCount > -1) {
            if (bTimeout>0) {
                _boss.data.list.firerate.bullettimeout--;
                return;
            } else {
                // fire the bullet(s)
                let xSpeed = _boss.getData('currentSpeed');
                let xI = _boss.getData('xSpeedIncrement');
                xSpeed += xI; // our initial speed has a offset of -xI so that we dont have to check if this is the first bullet
                _boss.setData('currentSpeed', xSpeed); // update the xSpeed for the next bullet
                //console.log('Bullet xSpeed ' + xSpeed);

                let damage = vars.enemies.bulletDamage*1.2; // boss bullets hit 1.2 times harder than a normal one
                let bulletScale = vars.game.scale*1.5;
                for (let b=0; b<bPF; b++) {
                    //console.log('Firing Bullet');
                    let bulletSprite = Phaser.Math.RND.between(0,vars.enemies.spriteCount-1); // basically the colour of the bullet
                    let bulletSpeed = Phaser.Math.Clamp((vars.levels.wave-1)*10 + 600, 600, 800); // boss bullet speed is based on the wave (between 600 and 800)
                    let boss=true;
                    vars.enemies.bulletPhysicsObject([_boss.x, _boss.y], bulletSprite, bulletScale, damage, bulletSpeed, true, xSpeed, boss);
                }
                _boss.data.list.firerate.bulletcount--;

                // then get ready to fire the next bullet
                let bossFirePatternNum = _boss.getData('fireratepattern');
                let pattern = vars.enemies.bossFireRatesResets[bossFirePatternNum];
                _boss.data.list.firerate.bullettimeout = pattern.bullettimeout;
            }
        } else {
            // boss has run out of bullets! reset vars to defaults
            let defaults = vars.enemies.bossFireRatesResets[_boss.getData('fireratepattern')];
            // if we set the firerate data by using the selected firerate object it will be passed by reference. Any updates to the new object will filter to the original object IMPORTANT
            let defObject = { firetimeout: defaults.firetimeout, bullettimeout: defaults.bullettimeout, bulletsperframe: defaults.bulletsperframe, bulletcount: defaults.bulletcount };
            _boss.setData({ firerate: defObject, currentSpeed: undefined, xSpeedIncrement: undefined });
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
    if (vars.DEBUG===true) { console.log('Enemy attacker has been hit.'); }
    // get the original enemy (the one thats hidden)
    let enemyName = _enemy.name.replace('f_','');
    let enemyPhaser = scene.children.getByName(enemyName);
    let dead = enemyHit(_bullet, enemyPhaser, true);

    // ship part particle
    enemyPieceParticle.emitParticleAt(_enemy.x, _enemy.y);
    // single explosion
    bulletHitEnemy.emitParticleAt(_enemy.x, _enemy.y);
    scene.sound.play('enemyHit');

    if (dead===true) { _enemy.destroy(); }
    // if the original enemy (not this one) has already died, just destroy the dupe
    if (enemyPhaser===null) {
        _enemy.destroy();
    }
}

function enemy25Death(enemy) { // the real enemy is being passed in here (not the follower)
    console.log('Enemy25 has died, hiding and destroying...');

    // disable and hide the original enemy
    let eV = vars.enemies;
    let enemyName = enemy.name;
    enemy.setData('dead', true); // i dont think we even need this
    enemy.destroy();
    eV.deathCountIncrease();
    eV.alive25--;
    
    // sound
    scene.sound.play('enemyExplode');
    vars.cameras.flash('white', 100);
    
    // remove enemy from list var
    let i = 0; for (nme of vars.enemies.list) { if (nme.name===enemy.name) { vars.enemies.list.splice(i,1); break; }; i++; }
    
    // kill the follower
    let f = scene.children.getByName('f25_' + enemyName);
    f.stopFollow(); // this should call alive25MadeIt() - it doesnt! Glad I checked... fukn Phaser :S
    bulletHitEnemy.emitParticleAt(f.x, f.y); // explosion particle
    enemyUpgradeDrop(f);
    f.destroy();

    // check if there are any enemies left to attach to paths
    if (vars.enemies.alive25===0 && enemies.children.size>0) { 
        vars.enemies.availableAttackPatterns.pathPickNext(); 
    } else if (enemies.children.size===0) { 
        gameLevelNext(); return 'Next Wave'; 
    }

}


function enemy25Hit(_follower, _bullet) {
    if (_bullet!==null) {
        let fName = _follower.name;
        let position = [_follower.x, _follower.y];
        let enemyName = fName.replace('f25_','');
        let realEnemy = scene.children.getByName(enemyName);
        if (realEnemy===null) { console.log('Real enemy not found. Ignoring the call'); return false; }
        let tint = realEnemy.getData('colour');

        // particles
        //console.log('Particle XY: ' + position[0] + ',' + position[1] + '. Tint: ' + tint);
        enemyPieceParticle.setTint(tint);
        enemyPieceParticle.emitParticleAt(position[0], position[1]);
        bulletHitEnemy.emitParticleAt(position[0], position[1]);

        // sound
        scene.sound.play('enemyHit');

        // enemy hp
        let bulletStrength = _bullet.getData('hp');
        let hp = realEnemy.getData('hp');
        hp-=bulletStrength;
        if (hp<=0) { // enemy is dead
            enemy25Death(realEnemy); // make them explode
        } else { // enemy is still alive, update its hp
            realEnemy.setData('hp', hp);
        }
    }
}

function enemyDeath(enemy) {
    //console.log('Enemy has died, creating death tween...');
    let eV = vars.enemies;
    enemy.disableBody(); // disable interaction with bullets
    enemy.setData('dead', true); // set the enemy to dead so it doesnt get counted in enemy win condition
    eV.deathCountIncrease();
    scene.sound.play('enemyExplode');
    vars.cameras.flash('white', 100);

    let xMove = Phaser.Math.RND.between(30,100);
    if (enemy.x>vars.canvas.cX) { xMove = -xMove; }
    xMove = enemy.x + xMove;
    if (enemy.getData('attacking')===false) { // ignore attacking enemies
        vars.particles.generateFireEmitter(enemy);
    }
    scene.tweens.add({
        //ease: 'linear',
        targets: enemy, y: 900, x: xMove, duration: 1000, onComplete: enemyDestroy
    }, this);

    enemyUpgradeDrop(enemy);
}

function enemyDestroy(_tween, _sprite) {
    //console.log('Enemy Destroyed.');
    let enemy = _sprite[0]; // so, this refers to the tween
    let enemyName = enemy.name;

    // destroy the emitter is if exists level < 25
    if (vars.enemies.attackPatternsEnabled===false) {
        let thisEmitter = vars.particles.currentEmitters['fE_' + enemyName];
        if (thisEmitter!==undefined) { // looks like this emitter is already dead?
            thisEmitter.remove(); // destroy the fire emitter
            vars.particles.currentEmitters['fE_' + enemyName] = undefined;
        }
    }

    bulletHitEnemy.emitParticleAt(enemy.x, enemy.y); // explosion particle
    enemy.destroy();
    // check if there are any enemies left on screen
    if (enemies.children.entries.length===0) { // all enemies are dead!
        gameLevelNext();
    }
}

function enemyGetRandom() {
    let enemyArray = enemies.children.getArray();
    let enemyChildCount = enemies.children.size;
    if (enemyChildCount===1) {
        selectedEnemy = enemyArray[0];
    } else {
        let exit = false;
        while (exit===false) {
            selectedEnemy = Phaser.Utils.Array.GetRandom(enemyArray);
            if (selectedEnemy.getData('attacking')===false) {
                exit=true;
            }
        }
    }
    if (selectedEnemy.getData('attacking')===false) { // this test runs if theres only one enemy left as they might be attacking
        return selectedEnemy;
    } else {
        return false;
    }
}

function enemyHit(bullet, enemy, attacker=false) {
    if (enemy!==null) {
        if (enemy.visible===false && attacker===false) { // if the enemy isnt visible then we cant do damage to it
            // This is the invisible copy of the attacking enemy! Ignore the hit.
            return false;
        } else if (enemy.visible===false && attacker===true) {
            // this is an attacking enemy
        }
    }

    if (vars.DEBUG===true && vars.VERBOSE===true) { console.log('Hit!'); }

    let strength=0;
    if (bullet!==null) {
        bStrength = bullet.getData('hp');
        bullet.destroy();
        if (bStrength===undefined) {
            if (vars.DEBUG===true && vars.VERBOSE===true) { console.warn('Invalid bullet strength, its probably being destroyed. This is due to the speed of our bullets'); }
            return false;
        }
        strength = bStrength;
    }

    // first we need to check that this enemy is attacking
    // if it is we will have to set the explosion particle where the attacking version is, not the original
    let position = [-1,-1];
    
    // destroy the bullet and remove it from the bullets array
    if (enemy!==null) {
        let tint = enemy.getData('colour');
        enemyPieceParticle.setTint(tint);
        if (attacker===true) {
            let aE = scene.groups.enemyAttackingGroup.children.get('name', 'f_' + enemy.name);
            if (aE!==undefined) {
                position = [aE.x, aE.y];
            } else {
                position = [vars.canvas.cX, vars.canvas.cY];
            }
        } else {
            position = [enemy.x, enemy.y];
        }

        if (attacker===false) { // if the enemy is attacking we need to show the explosion at its position, no this position
            // ship part particle
            enemyPieceParticle.emitParticleAt(position[0], position[1]);
            // single explosion
            bulletHitEnemy.emitParticleAt(position[0], position[1]);
            scene.sound.play('enemyHit');
        }

        // increase the players score
        let scoreTotal = 0;
        scoreTotal += strength * 10;

        // reduce enemy hp by bullet strength
        let enemyHP = enemy.getData('hp');
        if (vars.DEBUG===true && vars.VERBOSE===true) { console.log('hp: ' + enemyHP + ', bullet strength: ' + strength); }
        enemyHP -= strength;

        // increase score
        vars.player.increaseScore(scoreTotal);

        // check for enemy death
        let retValue = false;
        if (enemyHP<=0) { // enemy is dead
            let eP = enemy.getData('points');
            scoreTotal += eP; // give the player the points for this enemy
            vars.enemies.logDeath(enemy, strength, eP);
            enemyDeath(enemy);
            retValue = true;
        } else {
            enemy.setData('hp', enemyHP); // enemy is fine, update its HP
            //console.log('enemy hp: ' + enemyHP);
        }
        if (attacker===true) { //
            return retValue;
        }
    }

    // enemy destroy has been moved to after its death animation: enemyDestroy()
}

function enemyUpgradeDrop(enemy) {
    let eV = vars.enemies;
    // check to see if we should spawn a power up
    eV.deadSinceLastPowerup++;
    if (eV.deadSinceLastPowerup===10) {
        healthBulletUpgradeSpawn([enemy.x, enemy.y],'')
        eV.deadSinceLastPowerup=0;
    }

    // check to see if we should spawn a boss yet
    eV.bossSpawnTimeout[0]--;
    let sSV = vars.player.ship.special;
    if (eV.bossSpawnTimeout[0]===2) { // warn that a boss is incoming
        scene.sound.play('speechIncomingBoss');
        if (sSV.ADI.collected===false && sSV.SHADE.collected===false) {
            shaderType('warp',1);
        }
    }
    if (eV.bossSpawnTimeout[0]<=0) {
        if (scene.groups.enemyBossGroup.children.size<eV.bossLimit) {
            //console.log('Spawning a Boss');
            eV.spawnBoss();
        } else {
            eV.bossSpawnTimeout[0]=1;
        }
    }
}

function enemiesLand() {
    let eV = vars.enemies;
    if (eV.isLanding === false) {
        eV.isLanding = true;

        enemies.children.each( (c) => {
            c.body.velocity.x=0;
        })

        let newScale = vars.game.scale*1.1;
        let count=0;
        enemies.children.each( (c) => {
            let xy = eV.landingPositions.shift();
            if (count===0) {
                count=1;
                scene.tweens.add({
                    targets: c,
                    x: xy[0],
                    y: xy[1],
                    scale: newScale,
                    ease: 'Quad.easeOut',
                    duration: 2500,
                    onComplete: enemiesStopAnims,
                })
            } else {
                scene.tweens.add({
                    targets: c,
                    x: xy[0],
                    y: xy[1],
                    scale: newScale,
                    ease: 'Quad.easeOut',
                    duration: 2500,
                })
            }
        })
    }
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

        // check if enemy has reached the max Y
        let playerDead = eV.checkForWinCondition(lowest);
        if (playerDead===true) {
            enemiesLand();
         } else {
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
}

function enemiesMoveLaterLevels() {
    // select a random attack pattern
    // TODO - Continue From Here
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

function enemiesUpdate() {
    vars.enemies.update();
}