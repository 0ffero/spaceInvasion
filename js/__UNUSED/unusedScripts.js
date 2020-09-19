bossBulletSpread: function(_enemyBoss) {
    if (vars.levels.wave>1) {
        // get the angle between the boss and the player (in degrees, coz its easier for me to manipulate in my head)
        let angleToPlayer = Phaser.Math.Angle.Between(_enemyBoss.x, _enemyBoss.y, player.x, player.y)*180/Math.PI;
        // now how wide a spread are we going with (based on player hp)
        // obviously a higher degree spread (up to 90) would be more dangerous, so base it on that
        let pV = vars.player;
        let spread = { min: -1, max: -1 };
        if (pV.hitpoints>125) {
            spread =  { min: 60, max: 90 };
        } else if (pV.hitpoints>100) {
            spread =  { min: 35, max: 60 };
        } else if (pV.hitpoints>75) {
            spread =  { min: 20, max: 45 };
        } else if (pV.hitpoints>50) {
            spread =  { min: 10, max: 20 };
        } else if (pV.hitpoints>30) {
            spread =  { min: 1, max: 10 };
        } else {
            spread =  { min: 0, max: 0 };
        }

        spread.angleToPlayer = parseInt(angleToPlayer);
        return spread;
    } else {
        return false;
    }
}