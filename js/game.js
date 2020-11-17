function gameLevelNext() {
    // first move the logs
    if (vars.localStorage.working===true) {
        vars.localStorage.logMove();
    }
    vars.localStorage.logClear();
    if (cam3.alpha!==0) { vars.cameras.cam3alpha(); }
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
    scene.add.image(vars.canvas.cX, vars.canvas.cY, 'photoSScreen').setName('photosMain');
    scene.add.image(vars.canvas.cX, vars.canvas.cY+160, 'photoSButtons', 'normal').setName('photoSNormal');
    scene.add.image(vars.canvas.cX, vars.canvas.cY+400, 'photoSButtons', 'limit').setName('photoSLimit');
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
