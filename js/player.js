function healthUpgradeSpawn(_spawnXY) {
    let vP = vars.player;
    let healthUpgrades = [25,50,75]
    let hpChances = [0,0,0];
    if (vP.hitpoints>=100) {
        hpChances[0] +=3;
        hpChances[1] +=2;
        hpChances[2] +=1;
    } else if (vP.hitpoints>=75) {
        hpChances[0] +=1;
        hpChances[1] +=3;
        hpChances[2] +=2;
    } else {
        hpChances[0] +=1;
        hpChances[1] +=2;
        hpChances[2] +=3;
    }

    let chanceArray = [];
    for (let h=0; h<hpChances.length; h++) {
        for (let c=0; c<hpChances[h]; c++) {
            chanceArray.push(h);
        }
    }
    shuffle(chanceArray);
    let rnd = Phaser.Math.RND.between(0, chanceArray.length-1);
    let randomPick = healthUpgrades[chanceArray[rnd]];
    let hpU = scene.physics.add.sprite(_spawnXY[0],_spawnXY[1],'health').setScale(0.4);
    hpU.setData('upgrade', 'hp_' + randomPick);
    hpU.anims.play('hp' + randomPick);
    shipPowerUpGroup.add(hpU);
    scene.tweens.add({
        targets: hpU,
        y: 1000,
        duration: 2500,
    })
}

function playerHit(_player, _bullet) {
    let _bulletStrength = _bullet.getData('hp');
    _bullet.destroy();
    let pV = vars.player;
    let sV = pV.ship;

    // check for shield
    // we used to allow the player ship to be upgraded but have something other than a green shield but
    // to make the game more "fun" Ive decided that the upgrades are broken if you drop below the green
    // shield. To help with this Ive given the player at least 115 hp when they pick up a ship upgrade
    // note: every shield still takes into consideration what upgrades you currently have, however
    // I have modified the code to reset the upgrades if the hp < 100. So shield changes automatically
    // have no upgrades
    if (pV.hitpoints>_bulletStrength) {
        pV.hitpoints-=_bulletStrength*5;
        console.log('HP: ' + pV.hitpoints + ', bulletStrength: ' + _bulletStrength);
        // first, we reset the upgrades if the player has less than 100 hp
        if (pV.hitpoints<=115 && pV.hitpoints>=100 && pV.ship.upgrades!==1) {
            console.log('Dropping upgrades to 1');
            pV.ship.upgrades=1;
        } else if (pV.hitpoints > 0 && pV.hitpoints<100 && pV.ship.upgrades!==0) {
            console.log('Dropping upgrades to 0');
            pV.ship.upgrades=0;
        }

        let upgrades = sV.upgrades;
        // now we set the shield colour
        if (pV.hitpoints>=100) {        // green shield
            if (pV.shield!==3) {
                console.log('%cGreen Shield Enabled', 'color: green');
                pV.shield=3;
                player.setFrame(0+upgrades);
            }
        } else if (pV.hitpoints>75) {  // orange shield
            if (pV.shield!==2) {
                console.log('%cOrange Shield Enabled', 'color: orange');
                pV.shield=2;
                player.setFrame(3+upgrades);
            }
        } else if (pV.hitpoints>25) {  // red shield
            if (pV.shield!==1) {
                console.log('%cRed Shield Enabled', 'color: red');
                pV.shield=1;
                player.setFrame(6+upgrades);
            }
        } else if (pV.hitpoints>0) {   // no shield
            if (pV.shield!==0) {
                console.log('%cNO Shield!', 'color: white');
                pV.shield=0;
                player.setFrame(9+upgrades);
            }
        }

    } else { // player is dead
        console.log('%cPLAYER IS DEAD', 'background-color: red; color: black');
        vars.player.isDead=true;
        player.disableBody(true,true);
        /* vars.game.pause();
        vars.game.started=false; // this tells us that we have died
        vars.player.dead(); */

        enemiesLand();
    }
}

function shipPowerUpPickUp(_upgrade) {
    let upgrade = _upgrade.getData('upgrade');
    let split = upgrade.split('_');
    if (split[0]==='hp') {
        vars.player.hitpoints+=parseInt(split[1]);
        // upgrade the ship frame TODO
        // we can probably use player hit to set the shield colour
    }
    _upgrade.destroy();
}

class shipUpgrade { // these are created when a boss is killed
    constructor (_spawnXY=[-1,-1]) {
        let sV = vars.player.ship;
        this.spawnX = _spawnXY[0];
        this.spawnY = _spawnXY[1];

        let spawnHealth = false;
        sV.upgrades<2? sV.upgrades++ : spawnHealth=true;

        if (spawnHealth===true) { // player has fully upgraded ship, spawn them some health instead
            console.log('Spawning Health ::: TODO');
            healthUpgradeSpawn(_spawnXY);
        } else { // the player hasnt fully upgraded their ship, spawn ship upgrade crate
            console.log('Spawning Ship Part ::: TODO');
            let frame = -1;
            if (sV.upgrades===1) {
                frame = 0;
            } else if (sV.upgrades===2) {
                frame = 4;
            }
            let upgradeBox = scene.physics.add.image(this.spawnX,this.spawnY,'upgradeBox', frame).setScale(vars.game.scale).setData('upgrade', sV.upgrades);
            shipUpgradeGroup.add(upgradeBox);
            scene.tweens.add({
                targets: upgradeBox,
                y: 1000,
                duration: 2500,
            })
        }
    }
}

function shipUpgradePickUp(_pickup) {
    //console.log(_pickup);
    let upgradeTo = _pickup.getData('upgrade');
    _pickup.destroy();
    player.setFrame(upgradeTo);
    vars.player.hitpoints+=30*upgradeTo; // player gets a boost to hp based on upgrade type
    if (vars.player.hitpoints<115 && upgradeTo===1) { // upgrade 1: does the player still have less than 115 hp?
        vars.player.hitpoints=115; // minimum upgrade takes us to 115 hp. Same for upgrade 2 below
    } else if (vars.player.hitpoints<130 && upgradeTo===2) { // upgrade 2: does the player still have less than 130 hp?
        vars.player.hitpoints=130; // minimum upgrade takes us to 130 hp.
    }
}