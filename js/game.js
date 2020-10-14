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


function startGame() {
    // stop the intro video
    scene.children.getByName('introVideo').destroy();
    // set up the score text
    scene.children.getByName('levelBG').setVisible(true);
    vars.game.started=true;
    let scoreTitle = scene.add.bitmapText(10, 20, 'azo', 'Score:', 24).setOrigin(0);
    let score = scene.add.bitmapText(120, 20, 'azo', vars.game.scores.current, 24).setOrigin(0).setName('scoreTextInt');
    let waveTitle = scene.add.bitmapText(vars.canvas.width*0.69, 20, 'azo', 'Wave:', 24).setOrigin(0);
    let wave = scene.add.bitmapText(vars.canvas.width*0.69+105, 20, 'azo', vars.levels.wave+89865, 24).setOrigin(0).setName('waveTextInt');
    scoreGroup.addMultiple([scoreTitle, score, waveTitle, wave]);
    cam1.ignore(scoreGroup);

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