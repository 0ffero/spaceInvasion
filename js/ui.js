function loadingImageFadeIn() {
    // check if weve transitioned to playing the game
    if (scene.children.getByName('loadingImage')===null) {
        return false;
    }
    // empty out the logo group
    if (scene.groups.logoGroup.children.entries.length===0) {
        console.log('No children found');
    } else {
        scene.groups.logoGroup.clear();
    }
    // if we havent fade the loaded image back in
    let a = scene.children.getByName('loadingImage');
    scene.tweens.add({
        delay: 500,
        targets: a,
        alpha: 1,
        duration: 1000,
        yoyo: true,
        hold: 7500,
        onComplete: logo
    })
}

function logo() {
    if (scene.children.getByName('loadingImage')===null) {
        return false;
    }
    scene.children.getByName('loadingImage').setAlpha(0);
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
                scene.tweens.add({
                    delay: c*tOffset+(p*tOffset),
                    targets: a,
                    alpha: 1,
                    duration: 1000,
                    yoyo: true,
                    hold: 4000
                })
                scene.groups.logoGroup.add(a);
            }
        }
    }

    let offeroGames = vars.intro.offeroGames;
    let scale=0.5
    startX = 50;
    xInc = yInc = 25;
    tOffset = 75;
    startY = 550;
    c=0;
    let lastOne = false;
    for (row of offeroGames) {
        let y = startY + (c*yInc);
        c++;
        //console.log('NewRow');
        for (let p=0; p<row.length; p++) {
            let x = startX + (p * xInc);
            let pixel = row[p];
            let onComplete = null;
            if (p===row.length-1 && c===offeroGames.length-1) {
                onComplete=loadingImageFadeIn;
            }
            //console.log(' Pixel ' + pixel + ' at ' + x + ',' + y);
            if (pixel===1 || pixel===2 || lastOne===true) {
                let a = scene.add.image(x,y,'pixel', pixel-1).setAlpha(0).setScale(scale);
                scene.tweens.add({
                    delay: (c*tOffset)+(p*tOffset),
                    targets: a,
                    ease: 'Quad.easeIn',
                    alpha: 1,
                    duration: 1000,
                    yoyo: true,
                    hold: 4000,
                    onComplete: onComplete
                })
                scene.groups.logoGroup.add(a);
            }
        }
    }

}

function uiGameOver() {
    // save the high score if applicable
    let gV = vars.game;
    if (gV.scores.current>gV.scores.best) { console.log('High Score!'); gV.scores.best = gV.scores.current; }
    gV.scores.current = 0;

    // hide any upgrades left on the screen
    scene.groups.shipUpgradeGroup.setVisible(false);
    scene.groups.shipPowerUpGroup.setVisible(false);

    let gameOverText = scene.add.bitmapText(vars.canvas.cX, vars.canvas.cY, 'azo', 'Game Over!', 64).setOrigin(0.5).setAlpha(0);
    //console.log(' FADING IN GAME OVER');
    scene.tweens.add({
        targets: gameOverText,
        y: 200,
        alpha: 1,
        duration: 3500,
    }, this);
}

function wavePopUp() {
    vars.levels.waveIncrement();
    // stop the intro music
    let wave=vars.levels.wave;
    if (wave>1) {
        vars.player.increaseScore(5000);
        if (wave%7===0) { // every 7th wave
            // allow one more boss on screen at a time
            vars.enemies.bossLimit++;
        }
    }
    let myText = scene.add.bitmapText(vars.canvas.width-(vars.canvas.width/4), vars.canvas.cY, 'azo', 'Wave ' + vars.levels.wave, 12).setOrigin(0.5);
    // scaling bitmap text is totally weird in phaser 3.24.1
    // note that as Im scaling the text, im pushing it 860 pixels right.
    // This creates the 'wave' effect for my wave pop up.

    // This will probably be fixed in later versions of Phaser.
    // So be careful when updgrading to the newest release!

    // The check below will let me know if the phaser version has changed
    // (in case I move to a newer version for whatever reason)
    vars.versionCheck();

    // start the level music if applicable
    vars.audio.levelMusicStart();

    // tween the wave popup
    scene.tweens.add({
        targets: myText,
        scale: 9,
        x: myText.x+860,
        ease: 'linear',
        duration: 2500,
        onComplete: vars.levels.finalChecks
    });
    player.setDepth(1);
}