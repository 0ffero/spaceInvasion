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
            if (vP.hitpoints>=225) { // players max hp = 250 so health doesnt drop after 224hp
                hpChances[0] +=0;
            } else {
                hpChances[0] +=1;
            }
                              hpChances[1] +=0; hpChances[2] +=0;   // hp upgrades
            hpChances[3] +=2; hpChances[4] +=1;                     // bullet upgrades
            hpChances[5] +=1; hpChances[6] +=2; hpChances[7] +=3;   // points
        } else if (vP.hitpoints>=125) {
            hpChances[0] +=1; hpChances[1] +=1; hpChances[2] +=0;
            hpChances[3] +=2; hpChances[4] +=2;
            hpChances[5] +=2; hpChances[6] +=3; hpChances[7] +=2;
        } else if (vP.hitpoints>=100) {
            hpChances[0] +=1; hpChances[1] +=1; hpChances[2] +=0;
            hpChances[3] +=1; hpChances[4] +=1;
            hpChances[5] +=2; hpChances[6] +=3; hpChances[7] +=1;
        } else if (vP.hitpoints>=75) {
            if (vars.levels.wave>=20) {
                hpChances[0] +=1; hpChances[1] +=3; hpChances[2] +=2;
                hpChances[3] +=1; hpChances[4] +=1;
                hpChances[5] +=1; hpChances[6] +=0; hpChances[7] +=0;
            } else {
                hpChances[0] +=1; hpChances[1] +=2; hpChances[2] +=2;
                hpChances[3] +=2; hpChances[4] +=2;
                hpChances[5] +=2; hpChances[6] +=1; hpChances[7] +=0;
            }
        } else { // below 75hp
            // this player really needs health, increase the chance of that happening (especially high hp bumps currently 50 and 75)
            if (vars.levels.wave>=20) { // its starting to get difficult now... give the player an hp upgrade
                hpChances[0] +=1; hpChances[1] +=2; hpChances[2] +=4;
                hpChances[3] +=0; hpChances[4] +=0;
                hpChances[5] +=0; hpChances[6] +=0; hpChances[7] +=0;
            } else {
                hpChances[0] +=0; hpChances[1] +=2; hpChances[2] +=3;
                hpChances[3] +=2; hpChances[4] +=3;
                hpChances[5] +=1; hpChances[6] +=0; hpChances[7] +=0;
            }
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
            scene.groups.shipPowerUpGroup.add(hpU);
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
    let pV = vars.player;
    let cV = pV.ship.cannonSlots;
    let sV = vars.player.ship;
    let ssV = vars.player.ship.special;

    let _bulletStrength=0;
    let _boss = false;
    if (_bullet!==0) {
        _bulletStrength = _bullet.getData('hp');
        _boss = _bullet.getData('boss');
        _bullet.destroy();
    }

    if (_boss!==false && _boss!==true) { // sanity check
        console.error('BOSS VAR ISNT TRUE OR FALSE!');
    }

    // SET UP THE BULLET DAMAGE MULTIPLIER
    let mult = 1; let max = 3;
    if (_boss===true) { // boss bullet?
        mult += 0.2; max=5;
    }
    if (vars.levels.wave>=7) { // wave 7 or above, bullets increase in damage
        mult += 0.1 + ((vars.levels.wave-7)*0.05); // I cant be bothered to make sure that js will always use PE/BOMDAS so Im using brackets
    } // wave is < 7 (we dont add any extra damage)

    // check if the SHADE effect is running. if it is the bullet damage and mult are set to 1
    if (ssV.SHADE.collected===true) {
        console.log('SHADE field active. Reducing damage and multiplier to 1.');
        mult=1;
        _bulletStrength=1;
    }

    if (ssV.ADI.collected===false) { // if the ADI field ISNT active the player WILL take damage
        // fix the bullet damage.. nothing should do more than 5 damage per hit (Ive tested this.. by level 20 the bullet damage was 9 and was way too strong)
        _bulletStrength =  Phaser.Math.Clamp(_bulletStrength*mult,1,max);
        if (pV.hitpoints-_bulletStrength>0) { // after removing the bullet strength is the players hp>0? If it is, do the hit
            console.log('Damage done to player (' + pV.hitpoints + '): ' + _bulletStrength);
            pV.hitpoints=~~(pV.hitpoints - _bulletStrength);
            vars.UI.hpUpdate();
            vars.cameras.flash('red', 250);
            scene.sound.play('playerHit');
            //console.log('HP: ' + pV.hitpoints + ', bulletStrength: ' + _bulletStrength);
            sV.shipDowngradeCheck(); // eg ship upgrades may have been damaged due to players hp

            // now we set the shield colour
            console.log('%cPLAYER >> Setting the shield colour', vars.console.callFrom);
            pV.shieldChange(false);

        } else { // hp<=0 ie player is dead
            console.log('%cPLAYER IS DEAD', 'background-color: red; color: black');
            scene.children.getByName('hpTextIntS').setText('Destroyed!');
            scene.children.getByName('hpTextInt').setText('Destroyed!');
            vars.cameras.shake(cam1, 750);
            enemiesLand();
            vars.game.started=false; // this tells us that we have died, now using the variable pV.isDead
            pV.dead();
            vars.localStorage.saveHighScore(); // chack for high score
        }
    } // else the ADI field is in effect, player takes no damage.
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
        if (vars.DEBUG===true) { console.log('%cUpgrade HP: +' + upgradeValue, vars.console.playerUpgrade); }
        scene.sound.play('speechHP');
        pV.hitpoints+=upgradeValue;
        vars.UI.hpUpdate();
        pV.shieldChange(true);
    } else if (upgradeType==='b') { // bullet upgrades last for 5 seconds
        if (upgradeValue===0) { // double damage
            if (vars.DEBUG===true) { console.log('%cUpgrade Bullet: Double Damage', vars.console.playerUpgrade); }
            scene.sound.play('speechDoubleDamage');
            ssV.doubleDamageEnabled = true;
            // swap the current bullet on ui
            scene.children.getByName('UI_bulletTypeN').setVisible(false);
            scene.children.getByName('UI_bulletTypeDD').setVisible(true);
        } else if (upgradeValue===1) { // double fire rate
            if (vars.DEBUG===true) { console.log('%cUpgrade Bullet: Double Fire Rate. Setting Timeout to 5 seconds instead of 3', vars.console.playerUpgrade); }
            scene.sound.play('speechDoubleFireRate');
            ssV.doubleFireRate = true;
            ssV.upgradeTimeout[0] = 5*vars.game.fps;
            scene.children.getByName('UI_bulletTypeN').setVisible(false);
            scene.children.getByName('UI_bulletTypeDFR').setVisible(true);
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
        let shipUpgrade = false;
        sV.upgrades<2? shipUpgrade=true : spawnHealth=true;

        if (spawnHealth===true) { // player has fully upgraded ship, spawn them some health or better bullets instead
            healthBulletUpgradeSpawn(_spawnXY,forceUpgrade);
        } else if (shipUpgrade===true) { // the player hasnt fully upgraded their ship, spawn ship upgrade crate
            let upgradeBox = scene.physics.add.sprite(this.spawnX, this.spawnY, 'upgradeBox', 0).setScale(1).setData('upgrade', sV.upgrades+1);
            upgradeBox.anims.play('shipGrade' + (sV.upgrades+1));
            scene.groups.shipUpgradeGroup.add(upgradeBox);
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
    scene.sound.play('pickUpStandard'); // play ship upgrade sound
    let pV = vars.player;
    let cV = pV.ship.cannonSlots;

    let upgradeTo = _pickup.getData('upgrade');

    // player gets a boost to hp based on upgrade type (1 or 2)
    pV.hitpoints+=30*upgradeTo;
    // update the UI
    vars.UI.hpUpdate();

    // enable guns for the ship upgrade and increase player to minimum health if necessary
    if (upgradeTo===1) { // ship upgrade 1
        // enable secondary guns
        pV.ship.upgrades = upgradeTo;
        cV.l1r1.enabled=true; cV.l2r2.enabled=false;
        // upgrade 1: automatic 'full' orange shield
        if (pV.hitpoints<constsPS.GREEN_SHIELD.hpLower-5) { pV.hitpoints=constsPS.GREEN_SHIELD.hpLower-5; }
        // set the frame based on hp
        if (pV.hitpoints>=constsPS.GREEN_SHIELD.hpLower) { player.setFrame(upgradeTo); } else { player.setFrame(upgradeTo+3); }
    } else if (upgradeTo===2) { // ship upgrade 2
        // enable all guns
        pV.ship.upgrades = upgradeTo;
        cV.l1r1.enabled=true; cV.l2r2.enabled=true;
        // automatic green shield
        if (pV.hitpoints < constsPS.GREEN_SHIELD.hpLower + 25) { pV.hitpoints=constsPS.GREEN_SHIELD.hpLower + 25; }
        player.setFrame(upgradeTo);
    }

    let bW = pV.ship.bodyWidths;
    player.setSize(bW[upgradeTo][0],bW[upgradeTo][1]);

    // destroy the pickup
    _pickup.destroy();
}