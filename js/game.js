function cam2Ignore(_object) {
    cam2.ignore(_object);
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