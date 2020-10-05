function healthBulletUpgradeSpawn(_spawnXY,_fU='') {
    if (_fU!=='') { // upgrade type has been forced!
        if (_fU==='SHADE') { // The Chulhu boss has just died
            vars.player.ship.special.SHADESpawn(_spawnXY);
        }
    } else {
        let vP = vars.player;
        let healthUpgrades = [25,50,75,5,4,2000,3000,5000]; // health upgrades now include bullet upgrades
        let hpChances = [0,0,0,0,0,0,0,0];
        if (vP.hitpoints>=150) {
            // this player has a lot of health
            // max increase is 3
            hpChances[0] +=1; hpChances[1] +=0; hpChances[2] +=0;   // hp upgrades
            hpChances[3] +=3; hpChances[4] +=1;                     // bullet upgrades
            hpChances[5] +=2; hpChances[6] +=3; hpChances[7] +=2;   // points
        } else if (vP.hitpoints>=125) {
            hpChances[0] +=1; hpChances[1] +=1; hpChances[2] +=0;
            hpChances[3] +=2; hpChances[4] +=2;
            hpChances[5] +=2; hpChances[6] +=3; hpChances[7] +=2;
        } else if (vP.hitpoints>=100) {
            hpChances[0] +=1; hpChances[1] +=1; hpChances[2] +=0;
            hpChances[3] +=1; hpChances[4] +=1;
            hpChances[5] +=3; hpChances[6] +=2; hpChances[7] +=1;
        } else if (vP.hitpoints>=75) {
            hpChances[0] +=1; hpChances[1] +=2; hpChances[2] +=1;
            hpChances[3] +=2; hpChances[4] +=2;
            hpChances[5] +=2; hpChances[6] +=1; hpChances[7] +=0;
        } else { // below 75hp
            // this player really needs health, increase the chance of that happening (especially high hp bumps currently 50 and 75)
            hpChances[0] +=1; hpChances[1] +=3; hpChances[2] +=2;
            hpChances[3] +=1; hpChances[4] +=3;
            hpChances[5] +=1; hpChances[6] +=0; hpChances[7] +=0;
        }

        let ssV = vP.ship.special;
        if (ssV.upgradeOnScreen===true) { // we already have a bullet upgrade, so 0 them out
            hpChances[3] =0;
            hpChances[4] =0;
        }

        let chanceArray = [];
        for (let h=0; h<hpChances.length; h++) {
            for (let c=0; c<hpChances[h]; c++) {
                chanceArray.push(h);
            }
        }

        shuffle(chanceArray);

        let error = false;
        let rnd = Phaser.Math.RND.between(0, chanceArray.length-1);
        vars.game.bonusSpawnCount[chanceArray[rnd]]+=1;
        let randomPick = healthUpgrades[chanceArray[rnd]];

        // update the debug var that keeps track of spawned upgrades
        // DEBUG
        let chanceArrayDebug = [];
        chanceArrayDebug.push('HP: ' + vP.hitpoints)
        for (let i=0; i<chanceArray.length; i++) {
            if (i===rnd) {
                chanceArrayDebug.push('**' + chanceArray[i] + '**');
            } else {
                chanceArrayDebug.push(chanceArray[i]);
            }
        }
        chanceArrayDebug.push('Selected: ' + randomPick);
        vars.game.lastChanceArray = chanceArrayDebug;
        // end
        let hpU;

        if (randomPick===25 ||randomPick===50 ||randomPick===75) {
            hpU = scene.physics.add.sprite(_spawnXY[0],_spawnXY[1],'upgradesH').setScale(0.4);
            hpU.setData('upgrade', 'hp_' + randomPick);
            hpU.anims.play('hp' + randomPick);
        } else if (randomPick===4 || randomPick===5) {
            ssV.upgradeOnScreen=true;
            hpU = scene.physics.add.sprite(_spawnXY[0],_spawnXY[1],'upgradesB').setScale(0.4);
            hpU.setData('upgrade', 'b_' + (randomPick-4));
            if (randomPick===4) {
                hpU.anims.play('bulletStrength');
            } else if (randomPick===5) {
                hpU.anims.play('bulletRate');
            }
        } else if (randomPick===2000 || randomPick===3000 || randomPick===5000) { 
            hpU = scene.physics.add.sprite(_spawnXY[0],_spawnXY[1],'upgradesP').setScale(0.4);
            hpU.setData('upgrade', 'score_' + randomPick);
            hpU.anims.play('score_' + randomPick);
        } else {
            console.warn('%cRandom Upgrade ' + randomPick + ' is unknown!\nrnd is: ' + rnd + '\nChance Array is: ', 'font-size: 24px');
            console.warn('%c' + chanceArray, 'font-size: 24px');
            console.warn('%cCheck that ' + randomPick + ' exists in the array!', 'font-size: 24px');
            error=true;
            debugger;
        }

        if (error===false) {
            shipPowerUpGroup.add(hpU);
            vars.cameras.ignore(cam2, hpU);
            scene.tweens.add({
                targets: hpU,
                y: 1000,
                duration: 2000,
            })
        }
    }
}

function playerHit(_player, _bullet) {
    let _bulletStrength;
    if (_bullet!==0) {
        _bulletStrength = _bullet.getData('hp');
        _bullet.destroy();
    } else {
        _bulletStrength = 0;
    }
    let pV = vars.player;
    let cV = pV.ship.cannonSlots;

    if (pV.hitpoints-(_bulletStrength*3)>_bulletStrength*3) {
        pV.hitpoints=~~(pV.hitpoints - _bulletStrength*3);
        vars.cameras.flash('red', 500);
        scene.sound.play('playerHit');
        //console.log('HP: ' + pV.hitpoints + ', bulletStrength: ' + _bulletStrength);
        // first, we reset the upgrades if the player has less than 100 hp
        if (pV.hitpoints<=115 && pV.hitpoints>=100 && pV.ship.upgrades!==1) {
            console.log('Dropping upgrades to 1');
            pV.ship.upgrades=1;
            cV.l2r2.enabled=false;
        } else if (pV.hitpoints > 0 && pV.hitpoints<100 && pV.ship.upgrades!==0) {
            console.log('Dropping upgrades to 0');
            pV.ship.upgrades=0;
            cV.l1r1.enabled=false;
            cV.l2r2.enabled=false;
        }

        // now we set the shield colour
        console.log('Setting the shield colour');
        vars.player.shieldChange(false);

    } else { // player is dead
        console.log('%cPLAYER IS DEAD', 'background-color: red; color: black');
        vars.cameras.shake(cam1, 750);
        /* vars.game.pause(); */
        vars.game.started=false; // this tells us that we have died, now using the variable pV.isDead
        vars.player.dead();
        enemiesLand();
    }
}

function shipPowerUpPickUp(_upgrade) {
    let pV = vars.player;
    let ssV = pV.ship.special;
    let upgrade = _upgrade.getData('upgrade');
    let split = upgrade.split('_');
    let upgradeType=split[0];
    let upgradeValue=split[1];
    if (!isNaN(split[1])) {
        upgradeValue = parseInt(upgradeValue);
    }

    if (upgradeType==='hp') {
        console.log('%cUpgrade HP: +' + upgradeValue, vars.console.playerUpgrade);
        scene.sound.play('speechHP');
        pV.hitpoints+=upgradeValue;
        pV.shieldChange(true);
        // upgrade the ship frame TODO
        // we can probably use player hit to set the shield colour
    } else if (upgradeType==='b') { // bullet upgrades last for 5 seconds
        if (upgradeValue===0) { // double damage
            console.log('%cUpgrade Bullet: Double Damage', vars.console.playerUpgrade);
            scene.sound.play('speechDoubleDamage');
            ssV.doubleDamageEnabled = true;
        } else if (upgradeValue===1) { // double fire rate
            console.log('%cUpgrade Bullet: Double Fire Rate. Setting Timeout to 5 seconds instead of 3', vars.console.playerUpgrade);
            scene.sound.play('speechDoubleFireRate');
            ssV.doubleFireRate = true;
            ssV.upgradeTimeout[0] = 5*vars.game.fps;
        } else {
            console.warn('%cUnknown bullet upgrade picked up: ' + upgrade, 'font-size: 24px;');
        }
    }  else if (upgradeType==='score') { // points upgrade
        vars.player.increaseScore(upgradeValue);
        scene.sound.play('speechBonusPoints');
    } else if (upgradeType==='fx') { // shade of amstrad field
        if (upgradeValue==='ADI') {
            ssV.ADIPickUp();
        } else if (upgradeValue==='SHADE') {
            ssV.SHADEPickUp();
        }
    } else {
        console.warn('%cUnknown upgrade picked up: ' + upgrade, 'font-size: 24px;');
        error=true;
        debugger;
    }
    _upgrade.destroy();
}

class shipUpgrade { // these are created when a boss is killed
    constructor (_spawnXY=[-1,-1], _bossType=-1) {
        let sV = vars.player.ship;
        this.spawnX = _spawnXY[0];
        this.spawnY = _spawnXY[1];
        let forceUpgrade = '';
        if (_bossType!==-1) {
            if (_bossType===5) { // cthulhu upgrade
                forceUpgrade='SHADE';
            }
        }

        let spawnHealth = false;
        sV.upgrades<2? sV.upgrades++ : spawnHealth=true;

        if (spawnHealth===true) { // player has fully upgraded ship, spawn them some health or better bullets instead
            healthBulletUpgradeSpawn(_spawnXY,forceUpgrade);
        } else { // the player hasnt fully upgraded their ship, spawn ship upgrade crate
            let upgradeBox = scene.physics.add.sprite(this.spawnX, this.spawnY, 'upgradeBox', 0).setScale(1).setData('upgrade', sV.upgrades);
            upgradeBox.anims.play('shipGrade' + sV.upgrades);
            shipUpgradeGroup.add(upgradeBox);
            vars.cameras.ignore(cam2, upgradeBox);
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
    let pV = vars.player;
    let cV = pV.ship.cannonSlots;
    scene.sound.play('pickUpStandard');
    let upgradeTo = _pickup.getData('upgrade');
    _pickup.destroy();
    player.setFrame(upgradeTo);
    pV.hitpoints+=30*upgradeTo; // player gets a boost to hp based on upgrade type
    if (pV.hitpoints<115 && upgradeTo===1) { // upgrade 1: does the player still have less than 115 hp?
        pV.hitpoints=115; // minimum upgrade takes us to 115 hp. Same for upgrade 2 below
    } else if (pV.hitpoints<130 && upgradeTo===2) { // upgrade 2: does the player still have less than 130 hp?
        pV.hitpoints=130; // minimum upgrade takes us to 130 hp.
    }

    // enable the upgrades guns slot
    if (upgradeTo===1) {
        cV.l1r1.enabled=true;
        cV.l2r2.enabled=false; // this shouldnt register but left it here just in case.
    } else if (upgradeTo===2) {
        cV.l1r1.enabled=true;
        cV.l2r2.enabled=true;
    } // we are only dealing with upgrades here so we dont have to deal with a drop to upgrade 0

    let bW = pV.ship.bodyWidths;
    player.setSize(bW[upgradeTo][0],bW[upgradeTo][1]);
}