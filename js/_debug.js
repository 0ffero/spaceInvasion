function debugTextDraw() {
    let debugArray = [];
    let eV = vars.enemies;

    // AUDIO VARS
    debugArray.push('AUDIO');
    let aV = vars.audio;
    let currentTrack = '  Current Track            : ' + aV.gameTracks[aV.currentTrack];
    debugArray.push(currentTrack);
    let isEnabled    = '  Music Enabled            : ' + aV.isEnabled;
    debugArray.push(isEnabled + '\n');

    // PLAYER VARS
    debugArray.push('PLAYER');
    let pV = vars.player;
    let isDead =       '  Dead                     : ' + pV.isDead;
    debugArray.push(isDead);
    let hp     =       '  HP                       : ' + pV.hitpoints;
    debugArray.push(hp + '\n');
    
    debugArray.push('SHIP');
    let sV = vars.player.ship
    let bDD          = '  Bullets Double Damage    : ' + sV.special.doubleDamageEnabled;
    debugArray.push(bDD);
    let bDFR         = '  Bullets Double Fire Rate : ' + sV.special.doubleFireRate;
    debugArray.push(bDFR);
    let upgTimeout   = '  Upgrade Timeout          : ' + sV.special.upgradeTimeout[0];
    debugArray.push(upgTimeout);
    let dSU          = '  Deaths Since Upgrade     : ' + eV.deadSinceLastPowerup;
    debugArray.push(dSU);

    vars.DEBUGTEXT.setText(debugArray).setName('DEBUG_WINDOW');
    vars.DEBUGTEXT.setDepth(100);
}