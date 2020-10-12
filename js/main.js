function main() {
    scene.t += scene.tIncrement; // increment the shader timer
    // in theory we can move these into the shaterType so theyre only updated when the shader is active
    // could be a decent speed up as these pipelines are specific and arent visible at other times. TODO?
    scene.gSPipeline.setFloat1('time', scene.t);
    scene.gSSPipeline.setFloat1('time', scene.t);
    scene.cSPipeline.setFloat1('time', scene.t);
    scene.warpPipeline.setFloat1('time', scene.t);


    if (vars.game.started===true && vars.game.paused===false) {
        // deal with the weapons
        let cannons = vars.player.ship.cannonSlots;
        for (c in cannons) {
            if (cannons[c].enabled===true && cannons[c].ready===false) {
                cannons[c].update();
            }
        }

        // DEAL WITH PLAYER & ENEMY BULLETS
        let gV = vars.game;
        if (gV.bulletCheckTimeout[0]>0) { // we only do bullet checks every half second as its basically only destroying bullets that have left the screen
            gV.bulletCheckTimeout[0]--;
        } else {
            gV.bulletCheckTimeout[0] = gV.bulletCheckTimeout[1]; // reset the timeout
            vars.player.bulletCheck(); // check if the players bullets are off the screen

            enemyBullets.children.each( (c)=> { // check each of the enemy bullets
                if (c.y>vars.canvas.height+100) { // just making sure its well out of the screen
                    c.destroy();
                }
            })
        }

        // FIRE PLAYER SHIP CANNONS
        if (vars.player.isDead===false) {
            let mP = scene.input.mouse.manager.mousePointer;
            if (mP.buttons===constsM.mouse.left) { // is the left mouse being pressed?
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
    } else if (vars.game.paused===true) { // game is paused
        // we dont have to do anything in here, but this will run when we (for example) pause to highlight an upgrade
        // the variable it uses is game.pausedReason
    }

    // update the scenery
    // this happens when the player hasnt died (including wave pop up screens...)
    if (vars.player.isDead===false && vars.game.started===true) {
        let pausedReason = vars.game.pausedReason;
        if (pausedReason!=='highlight') { // if we ARENT highlighting something, we let the scenery work as normal
            if (vars.levels.currentWaveBG==='grass') { // the grass has scenery (barns, trees)
                vars.scenery.update();
            }
        }
    }

    // create a random star
    if (vars.game.started===true) { // basically runs after the intro and cant be stopped
        let x = Phaser.Math.RND.between(5, vars.canvas.width-10);
        let y = Phaser.Math.RND.between(55, 725);
        starEmitter.emitParticleAt(x,y);
    }

    // decrease the timers for bullet upgrades (this continues between levels)
    if (vars.game.started===true) {
        let ssV = vars.player.ship.special;
        if (ssV.doubleDamageEnabled===true || ssV.doubleFireRate===true) {
            ssV.upgradeTimeout[0]-=1;
            if (ssV.upgradeTimeout[0]<=0) {
                ssV.resetVars();
            }
        }

        if (ssV.ADIUpgrade===true && ssV.ADI.collected===true) { // only one of these can be active at any time
            ssV.ADIPickUp();
        } else if (ssV.SHADEUpgrade===true && ssV.SHADE.collected===true) {
            ssV.SHADEPickUp();
        }
    }

    if (vars.DEBUGHIDE===false) {
        debugTextDraw();
    }
}