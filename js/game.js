function gameLevelNext() {
    // remove all player bullets
    vars.player.destroyAllBullets();

    // remove all enemy bullets, attackers and fire particles
    vars.enemies.destroyAllAttackers();
    vars.enemies.destroyAllBullets();
    vars.particles.destroyFireEmitters();

    // remove all bosses on the screen if wave is less than 10
    if (vars.enemies.removeBosses===true) {
        vars.enemies.destroyAllBosses();
    }

    // were moving on to a new wave, increase the bullet damage
    vars.enemies.setEnemyBulletDamage();

    // generate the next wave
    enemiesGenerate();

    vars.game.pause();
    wavePopUp(); // show the wave pop up
}

function powerUpUpdate() {
    // check to see if we should spawn a power up
    let eV = vars.enemies;
    eV.deadSinceLastPowerup++;
    if (eV.deadSinceLastPowerup===10) {
        healthBulletUpgradeSpawn([enemy.x, enemy.y],'');
        eV.deadSinceLastPowerup=0;
    }
}

function storyInit() {
    console.log('Checking version of phaser');
    vars.versionCheck();
    vars.canvas.setCursor('none');

    // START THE STORY SCROLLER
    vars.game.storyVisible = true;
    storyText = scene.add.bitmapText(0, vars.canvas.height, 'azo', vars.story.introText, 48).setCenterAlign().setAlpha(0).setMaxWidth(vars.canvas.width-20).setName('introStory');
    storyText.x=10;
    let scrollHeight = storyText.height;
    let duration = scrollHeight*15;

    scene.tweens.add({
        targets: storyText,
        delay: 0,
        alpha: 0.7,
        ease: 'Quad.easeIn',
        duration: 7000,
    })

    scene.tweens.add({
        targets: storyText,
        y: -scrollHeight,
        ease: 'linear',
        duration: duration,
        onComplete: startGame,
    })

    // we fade out the loading image on click, so we need to set up a slight pause (3s) before enabling the intro skip
    setTimeout( function() { storySkipEnable(); }, 5000)
}

function storySkipEnable() {
    window.onmousedown = function(e) {
        if (vars.game.storyVisible===true) {
            let iV = scene.children.getByName('introVideo');
            scene.tweens.add({
                targets: [storyText, iV],
                alpha: 0,
                duration: 3000,
                onComplete: storyTextSpeedUp,
            })
            vars.game.storyVisible = false;
        }
    }
}

function storyTextSpeedUp() {
    vars.game.storyVisible = false;
    tw = scene.tweens.getTweensOf(storyText);
    tw[0].setTimeScale(1000);
}

function startGame() {
    // stop the intro video
    scene.children.getByName('introVideo').destroy();
    // set up the score text
    scene.children.getByName('levelBG').setVisible(true);
    vars.game.started=true;

    // text shadows
    let shadowOffset = sO = [5,3];
    let alpha = 0.3;
    let scoreTitleShadow = scene.add.bitmapText(10+sO[0], 5+sO[1], 'azo', 'Score:', 24).setOrigin(0).setTint(0x000000).setAlpha(alpha);
    let scoreShadow = scene.add.bitmapText(120+sO[0], 5+sO[1], 'azo', vars.game.scores.current, 24).setOrigin(0).setName('scoreTextIntS').setTint(0x000000).setAlpha(alpha);
    let waveTitleShadow = scene.add.bitmapText(vars.canvas.width*0.69+sO[0], 5+sO[1], 'azo', 'Wave:', 24).setOrigin(0).setTint(0x000000).setAlpha(alpha);
    let waveShadow = scene.add.bitmapText(vars.canvas.width*0.69+105+sO[0], 5+sO[1], 'azo', vars.levels.wave+89865, 24).setOrigin(0).setName('waveTextIntS').setTint(0x000000).setAlpha(alpha);
    let deathsTitleShadow = scene.add.bitmapText(vars.canvas.width*0.35+sO[0], 1080-30+sO[1], 'azo', 'Enemies destroyed:', 24).setOrigin(0).setTint(0x000000).setAlpha(alpha);
    let deathsShadow = scene.add.bitmapText(vars.canvas.width*0.35+300+sO[0], 1080-30+sO[1], 'azo', vars.enemies.deathTotal, 24).setOrigin(0).setName('deathTextIntS').setTint(0x000000).setAlpha(alpha);
    let hpTitleShadow = scene.add.bitmapText(10+sO[0], 1080-30+sO[1], 'azo', 'HP:', 24).setOrigin(0).setTint(0x000000).setAlpha(alpha);
    let hpShadow = scene.add.bitmapText(65+sO[0], 1080-30+sO[1], 'azo', vars.player.hitpoints, 24).setOrigin(0).setName('hpTextIntS').setTint(0x000000).setAlpha(alpha);
    scene.groups.scoreGroup.addMultiple([scoreTitleShadow, scoreShadow, waveTitleShadow, waveShadow, deathsTitleShadow, deathsShadow, hpTitleShadow, hpShadow]);

    // actual text
    let scoreTitle = scene.add.bitmapText(10, 5, 'azo', 'Score:', 24).setOrigin(0);
    let score = scene.add.bitmapText(120, 5, 'azo', vars.game.scores.current, 24).setOrigin(0).setName('scoreTextInt');
    let waveTitle = scene.add.bitmapText(vars.canvas.width*0.69, 5, 'azo', 'Wave:', 24).setOrigin(0);
    let wave = scene.add.bitmapText(vars.canvas.width*0.69+105, 5, 'azo', vars.levels.wave+89865, 24).setOrigin(0).setName('waveTextInt');
    let deathsTitle = scene.add.bitmapText(vars.canvas.width*0.35, 1080-30, 'azo', 'Enemies destroyed:', 24).setOrigin(0);
    let deaths = scene.add.bitmapText(vars.canvas.width*0.35+300, 1080-30, 'azo', vars.enemies.deathTotal, 24).setOrigin(0).setName('deathTextInt');
    let hpTitle = scene.add.bitmapText(10, 1080-30, 'azo', 'HP:', 24).setOrigin(0);
    let hp = scene.add.bitmapText(65, 1080-30, 'azo', vars.player.hitpoints, 24).setOrigin(0).setName('hpTextInt');
    scene.groups.scoreGroup.addMultiple([scoreTitle, score, waveTitle, wave, deathsTitle, deaths, hpTitle, hp]);

    cam1.ignore(scene.groups.scoreGroup);

    // delete the intro music
    scene.sound.sounds.forEach( (c)=> {
        console.log(c.key);
        if (c.key==='intro') { c.destroy(); }
    })

    //show the player
    player.setVisible(true);
    vars.enemies.spawn();
    wavePopUp();
}