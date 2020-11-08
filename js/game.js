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
    } else { // if the bosses arent destroyed between waves (eg wave 10+) then we should hide the hp bar as the bosses keep moving between waves
        let eB = scene.groups.enemyBossGroup;
        if (eB.children.size>0) {
            eB.children.each( (c)=> {
                let cName = c.name;
                let enemyName = cName.replace('f_','');
                scene.children.getByName('hpO_' + enemyName).setVisible(false);
                scene.children.getByName('hpI_' + enemyName).setVisible(false);
            })
        }
    }

    // were moving on to a new wave, increase the bullet damage
    vars.enemies.setEnemyBulletDamage();

    // generate the next wave
    vars.enemies.spawn();

    vars.game.pause();
    wavePopUp(); // show the wave pop up
}

function photoSWarningShow() {
    scene.add.image(vars.canvas.cX,vars.canvas.cY,'photoSScreen').setName('photosMain');
    scene.add.image(vars.canvas.cX,700,'photoSButtons', 'normal').setName('photoSNormal');
    scene.add.image(vars.canvas.cX,940,'photoSButtons', 'limit').setName('photoSLimit');
}

function photoSWarningHide() {
    scene.children.getByName('photosMain').destroy();
    scene.children.getByName('photoSNormal').destroy();
    scene.children.getByName('photoSLimit').destroy();
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
    storyText = scene.add.bitmapText(0, vars.canvas.height, 'azoRed', vars.story.introText, 48).setCenterAlign().setAlpha(0).setMaxWidth(vars.canvas.width-20).setName('introStory');
    storyText.x=10;
    let scrollHeight = storyText.height;
    let duration = scrollHeight*15;

    scene.tweens.add({
        targets: storyText,
        delay: 0,
        alpha: 0.7,
        ease: 'Cubic.easeIn',
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

    // UI
    // text shadows
    let shadowOffset = sO = [5,3];
    let alpha = 0.3;
    let scoreTitleShadow = scene.add.bitmapText(10+sO[0], 5+sO[1], 'azo', 'Score:', 24).setOrigin(0).setTint(0x000000).setAlpha(alpha);
    let scoreShadow = scene.add.bitmapText(120+sO[0], 5+sO[1], 'azo', vars.game.scores.current, 24).setOrigin(0).setName('scoreTextIntS').setTint(0x000000).setAlpha(alpha);
    let waveTitleShadow = scene.add.bitmapText(vars.canvas.width*0.69+sO[0], 5+sO[1], 'azo', 'Wave:', 24).setOrigin(0).setTint(0x000000).setAlpha(alpha);
    let waveShadow = scene.add.bitmapText(vars.canvas.width*0.69+105+sO[0], 5+sO[1], 'azo', vars.levels.wave+89865, 24).setOrigin(0).setName('waveTextIntS').setTint(0x000000).setAlpha(alpha);
    let deathsTitleShadow = scene.add.bitmapText(vars.canvas.width*0.4+sO[0], 1080-29+sO[1], 'azo', 'Enemies destroyed:', 24).setOrigin(0).setTint(0x000000).setAlpha(alpha);
    let deathsShadow = scene.add.bitmapText(vars.canvas.width*0.4+300+sO[0], 1080-29+sO[1], 'azo', vars.enemies.deathTotal, 24).setOrigin(0).setName('deathTextIntS').setTint(0x000000).setAlpha(alpha);
    let hpTitleShadow = scene.add.bitmapText(5+sO[0], 1080-30+sO[1], 'azo', 'HP:', 24).setOrigin(0).setTint(0x000000).setAlpha(alpha);
    let hpShadow = scene.add.bitmapText(60+sO[0], 1080-30+sO[1], 'azo', vars.player.hitpoints, 24).setOrigin(0).setName('hpTextIntS').setTint(0x000000).setAlpha(alpha);
    scene.groups.scoreGroup.addMultiple([scoreTitleShadow, scoreShadow, waveTitleShadow, waveShadow, deathsTitleShadow, deathsShadow, hpTitleShadow, hpShadow]);

    // actual text
    let scoreTitle = scene.add.bitmapText(10, 5, 'azo', 'Score:', 24).setOrigin(0);
    let score = scene.add.bitmapText(120, 5, 'azo', vars.game.scores.current, 24).setOrigin(0).setName('scoreTextInt');
    let waveTitle = scene.add.bitmapText(vars.canvas.width*0.69, 5, 'azo', 'Wave:', 24).setOrigin(0);
    let wave = scene.add.bitmapText(vars.canvas.width*0.69+105, 5, 'azo', vars.levels.wave+89865, 24).setOrigin(0).setName('waveTextInt');
    let deathsTitle = scene.add.bitmapText(vars.canvas.width*0.4, 1080-29, 'azo', 'Enemies destroyed:', 24).setOrigin(0);
    let deaths = scene.add.bitmapText(vars.canvas.width*0.4+300, 1080-29, 'azo', vars.enemies.deathTotal, 24).setOrigin(0).setName('deathTextInt');
    let hpTitle = scene.add.bitmapText(5, 1080-30, 'azo', 'HP:', 24).setOrigin(0);
    let hp = scene.add.bitmapText(60, 1080-30, 'azo', vars.player.hitpoints, 24).setOrigin(0).setName('hpTextInt');
    scene.groups.scoreGroup.addMultiple([scoreTitle, score, waveTitle, wave, deathsTitle, deaths, hpTitle, hp]);


    // draw the hp/shield bar
    let y = vars.canvas.height;
    let a = scene.add.image(116,y-24, 'hpBarPlayer', 'BG').setOrigin(0,0);
    let b = scene.add.image(117,y-23, 'hpBarPlayer', 'Red').setOrigin(0,0).setName('hpPBRed'); // we need to access these 3 when shields/hp change
    let c = scene.add.image(117,y-12, 'hpBarPlayer', 'Blue').setOrigin(0,0).setName('hpPBBlue');
    let d = scene.add.image(208,y-23, 'hpBarPlayer', 'Orange').setOrigin(0,0).setName('hpPBOrange').setAlpha(0.2);
    // add them to the group
    scene.groups.scoreGroup.addMultiple([a, b, c, d]);
    // draw the upgrades box
    let e = scene.add.image(233,y-24, 'upgradesBar', 'BG').setOrigin(0,0);
    let f = scene.add.image(234,y-23, 'upgradesBar', 'uB_bulletsNormal').setOrigin(0,0).setName('UI_bulletTypeN');
    let g = scene.add.image(234,y-23, 'upgradesBar', 'uB_bulletsDoubleDamage').setOrigin(0,0).setName('UI_bulletTypeDD').setVisible(false);
    let h = scene.add.image(234,y-23, 'upgradesBar', 'uB_bulletsDoubleFireRate').setOrigin(0,0).setName('UI_bulletTypeDFR').setVisible(false);
    let i = scene.add.image(234+25,y-23, 'upgradesBar', 'uB_ADI').setOrigin(0,0).setName('UI_ADI').setVisible(false);
    let j = scene.add.image(234+25,y-23, 'upgradesBar', 'uB_SHADE').setOrigin(0,0).setName('UI_SHADE').setVisible(false);
    scene.groups.scoreGroup.addMultiple([e,f,g,h,i,j]);

    cam1.ignore(scene.groups.scoreGroup);

    // delete the intro music
    scene.sound.sounds.forEach( (c)=> {
        if (c.key==='intro') { c.destroy(); }
    })

    //show the player
    player.setVisible(true);
    vars.enemies.spawn();
    wavePopUp();
}