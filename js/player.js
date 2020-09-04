function playerHit(_player, _bullet) {
    let _bulletStrength = _bullet.getData('hp');
    _bullet.destroy();
    let pV = vars.player;
    let sV = pV.ship;
    let upgrades = sV.upgrades;

    // check for shield
    if (pV.hitpoints>_bulletStrength) {
        pV.hitpoints-=_bulletStrength*5;
        console.log('HP: ' + pV.hitpoints + ', bulletStrength: ' + _bulletStrength);
        if (pV.hitpoints>100) {        // green shield
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

class shipUpgrade { // these are created when a boss is killed
    constructor (_spawnXY=[-1,-1]) {
        let sV = vars.player.ship;
        this.spawnX = _spawnXY[0];
        this.spawnY = _spawnXY[1];

        let spawnHealth = false;
        sV.upgrades<2? sV.upgrades++ : spawnHealth=true;

        if (spawnHealth===true) { // player has fully upgraded ship, spawn them some health instead
            console.log('Spawning Health ::: TODO');
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
    vars.player.hitpoints+=50;
    if (vars.player.hitpoints<100) { // does the player still have less than 100 hp?
        vars.player.hitpoints=100; // minimum upgrade takes us to 100 hp
    }
}