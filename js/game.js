function cam2Ignore(_object) {
    //cam2.ignore(_object);
}

function gameLevelNext() {
    vars.player.destroyAllBullets();
    vars.enemies.destroyAllBullets();
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


function startGame() {
    // set up the score text
    scene.children.getByName('levelBG').setVisible(true);
    vars.game.started=true;
    let scoreTitle = scene.add.bitmapText(10, 20, 'azo', 'Score:', 24).setOrigin(0);
    let score = scene.add.bitmapText(120, 20, 'azo', vars.game.scores.current, 24).setOrigin(0).setName('scoreTextInt');
    scoreGroup.addMultiple([scoreTitle, score]);
    
    // delete the intro music
    scene.sound.sounds.forEach( (c)=> {
        console.log(c.key);
        if (c.key==='intro') { c.destroy(); }
    })

    vars.enemies.spawn();
    wavePopUp();
}