function uiGameOver() {
    // save the high score if applicable
    let gV = vars.game;
    if (gV.scores.current>gV.scores.best) { console.log('High Score!'); gV.scores.best = gV.scores.current; }
    gV.scores.current = 0;

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

    // tween the wave popup
    scene.tweens.add({
        targets: myText,
        scale: 9,
        x: myText.x+860,
        ease: 'linear',
        duration: 2500,
        onComplete: vars.audio.levelMusicStart,
    });
    player.setDepth(1);
}