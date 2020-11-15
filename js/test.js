vars.test.bossSpinnerTest = function() {
    shaders = ['Blue','Green','Purple','Purple2','Red','Yellow']
    sTest = setInterval( function() {
        shaderType('none'); if (shaders.length>0) { let cS = shaders.pop(); shaderType('boss' + cS,1); } else { clearInterval(sTest); }
    }, 3000)
}

function clampetyClampClampetyClampClampetyClampClampetyClamp(_val,_min,_max) { // to the tune of blankety blank (obviously)
    return Phaser.Math.Clamp(_val,_min,_max);
}

vars.test.glass = function() {
    scene.add.image(400,300,'bossShield','innerRed_frame1').setScale(0.4,0.2);
    scene.add.image(400,300,'bossShield','outer').setScale(0.4,0.2);
    scene.add.image(400,370,'bossShield','innerGreen_frame1').setScale(0.4,0.2);
    scene.add.image(400,370,'bossShield','outer').setScale(0.4,0.2);
    scene.add.image(400,440,'bossShield','innerDarkBlue_frame1').setScale(0.4,0.2);
    scene.add.image(400,440,'bossShield','outer').setScale(0.4,0.2);
    scene.add.image(470,300,'bossShield','innerLightBlue_frame1').setScale(0.4,0.2);
    scene.add.image(470,300,'bossShield','outer').setScale(0.4,0.2);
    scene.add.image(470,370,'bossShield','innerYellow_frame1').setScale(0.4,0.2);
    scene.add.image(470,370,'bossShield','outer').setScale(0.4,0.2);
    scene.add.image(470,440,'bossShield','innerPurple_frame1').setScale(0.4,0.2);
    scene.add.image(470,440,'bossShield','outer').setScale(0.4,0.2);
    scene.add.image(540,440,'bossShield','innerDefault_frame1').setScale(0.4,0.2);
    scene.add.image(540,440,'bossShield','outer').setScale(0.4,0.2);
}

vars.test.initiateLevel25 = function() {
    vars.cheats.levelSkipTo(25);
    vars.enemies.availableAttackPatterns.pathPickNext();
}

vars.test.test3DSpritesFullSize = function() {
    scene.add.sprite(360,400,'3DRed').anims.play('3DRed');
    scene.add.sprite(360,640,'3DGreen').anims.play('3DGreen');
}

vars.test.test3DSpritesMini = function() {
    scene.add.sprite(vars.canvas.cX - 30,1025,'3DGreen').setScale(0.2).setName('3DGreen').anims.play('3DGreen');
    scene.add.sprite(vars.canvas.cX + 30,1025,'3DRed').setScale(0.2).setName('3DRed').anims.play('3DRed');
}