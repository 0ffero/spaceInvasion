function main() {
    if (vars.game.started===true && vars.game.paused===false) {
        // deal with the weapons
        let cannons = vars.player.ship.cannonSlots;
        for (c in cannons) {
            if (cannons[c].enabled===true && cannons[c].ready===false) {
                cannons[c].update();
            }
        }

        let gV = vars.game;
        if (gV.bulletCheckTimeout[0]>0) { // we only do bullet checks every half second as its basically only destroying bullets that have left the screen
            gV.bulletCheckTimeout[0]--;
        } else {
            gV.bulletCheckTimeout[0] = gV.bulletCheckTimeout[1];
            // now check if the bullets are off the screen
            for (c in cannons) { // this really doesnt have to happen every frame TODO
                cannons[c].bulletCheck();
            }

            enemyBullets.children.each( (c)=> {
                if (c.y>vars.canvas.height+100) { // just making sure its well out of the screen
                    c.destroy();
                }
            })
        }

        if (vars.player.isDead===false) {
            let mP = scene.input.mouse.manager.mousePointer;
            if (mP.buttons===consts.mouse.left) {
                let cannons = vars.player.ship.cannonSlots;
                for (c in cannons) { // loop thru each of the cannons
                    if (cannons[c].ready===true) { // is this cannon ready to fire?
                        cannons[c].fire();
                    }
                }
            }
        }

        // update the enemies
        if (vars.enemies.isLanding !== true) {
            vars.enemies.update();
        }
        // update any bosses (even if the player is dead the boss will continue to animate)
        if (enemyBossGroup.children.size>0) {
            enemyBossGroup.children.each( (c)=> {
                enemyBossUpdate(c);
            })
        }
    }

    // update the scenery
    // this happens when the player hasnt died (including wave pop up screens...)
    if (vars.player.isDead===false && vars.game.started===true) {
        vars.scenery.update();
    }

    // create a random star
    if (vars.game.started===true) {
        let x = Phaser.Math.RND.between(5, vars.canvas.width-10);
        let y = Phaser.Math.RND.between(55, 725);
        starEmitter.emitParticleAt(x,y);
    }

    if (vars.game.started===true) {
        let ssV = vars.player.ship.special;
        if (ssV.doubleDamageEnabled===true || ssV.doubleFireRate===true) {
            ssV.upgradeTimeout[0]-=1;
            if (ssV.upgradeTimeout[0]<=0) {
                ssV.resetVars();
            }
        }
    }

    if (vars.DEBUGHIDE===false) {
        debugTextDraw();
    }
}

function startGame() {
    // set up the score text
    scene.children.getByName('levelBG').setVisible(true);
    vars.game.started=true;
    scene.add.bitmapText(10, 20, 'azo', 'Score:', 24).setOrigin(0);
    scene.add.bitmapText(120, 20, 'azo', vars.game.scores.current, 24).setOrigin(0).setName('scoreTextInt');

    vars.enemies.spawn();

    wavePopUp();
}