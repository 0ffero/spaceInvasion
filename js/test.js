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

vars.test.test3DSprite = function() {
    let spinner = null;
    let enemyShadow = null;
    let namePlate = null;
    let realColour = null;
    let xy = {
        enemyShadow: { y: 1000, offsetX: 160, offsetY: 160 },
        namePlateShadow: { y: 1050 },
        namePlates: { y: 975 },
    }
    let esvar = xy.enemyShadow;
    let BG = null;
    if (scene.children.getByName('3DBG')===null) {
        realColour = scene.consts.colours.red[0];
        BG = scene.add.image(vars.canvas.cX, vars.canvas.cY,'3DBG').setTint(realColour).setName('3DBG');
        spinner = scene.add.sprite(vars.canvas.cX-esvar.offsetX,vars.canvas.cY-esvar.offsetY,'3DRed').anims.play('3DRed').setName('spin3D').setData('colour', 'red');
        enemyShadow = scene.add.image(vars.canvas.cX-esvar.offsetX, esvar.y,'3DBGShadow').setTint(realColour).setName('3DBGShadow').setAlpha(0.05).setScale(0.2);
        namePlate = scene.add.image(vars.canvas.cX, xy.namePlates.y, 'namePlates', 'rubyRedNamePlate').setName('namePlate');
        let nPS = scene.add.image(vars.canvas.cX, xy.namePlateShadow.y, 'namePlateShadow').setName('namePlateShadow').setAlpha(0.5);
        // add everything to a group so we can access it easily
        scene.groups.enemy3DGroup.addMultiple([BG, spinner, enemyShadow, namePlate, nPS]);
        scene.groups.enemy3DGroup.name='red';
    } else {
        //scene.children.getByName('3DBGShadow').destroy();
        //scene.children.getByName('namePlate').destroy();
        scene.children.getByName('3DBG').setVisible(true);
        scene.children.getByName('namePlateShadow').setVisible(true);
        let sC = scene.groups.enemy3DGroup.name;
        //spinner.destroy();
        let bgColour = null;
        switch (sC) {
            case 'red':    animName = '3DGreen';  bgColour = 'green';  enemyName = 'garryGreenNamePlate';  break;
            case 'green':  animName = '3DBlue';   bgColour = 'blue';   enemyName = 'brianBlueNamePlate';   break;
            case 'blue':   animName = '3DPurple'; bgColour = 'purple'; enemyName = 'peterPurpleNamePlate'; break;
            case 'purple': animName = '3DYellow'; bgColour = 'yellow'; enemyName = 'alexAmberNamePlate';   break;
            default:       animName = '3DRed';    bgColour = 'red';    enemyName = 'rubyRedNamePlate';     break;
        }
        realColour = scene.consts.colours[bgColour][0];
        scene.children.getByName('3DBG').setTint(realColour);
        spinner = scene.add.sprite(vars.canvas.cX-esvar.offsetX,vars.canvas.cY-esvar.offsetX, animName).anims.play(animName).setName('spin3D').setData('colour', bgColour);
        enemyShadow = scene.add.image(vars.canvas.cX-esvar.offsetX, esvar.y,'3DBGShadow').setTint(realColour).setName('3DBGShadow').setAlpha(0.05).setScale(0.2);
        namePlate = scene.add.image(vars.canvas.cX, xy.namePlates.y, 'namePlates', enemyName).setName('namePlate');
        scene.groups.enemy3DGroup.addMultiple([spinner, enemyShadow, namePlate]).setName(bgColour);
    }
    let duration = 3000;
    scene.tweens.add({ targets: spinner, x: vars.canvas.cX+esvar.offsetX, ease: 'Sine.easeInOut', duration: duration/4, yoyo: true, repeat: -1 })
    scene.tweens.add({ targets: spinner, y: 700, ease: 'Sine.easeInOut', duration: duration, yoyo: true, repeat: -1 })
    // enemy shadow movement
    scene.tweens.add({ targets: enemyShadow, x: vars.canvas.cX+esvar.offsetX, ease: 'Sine.easeInOut', duration: duration/4, yoyo: true, repeat: -1 })
    // shadow alpha and scale
    scene.tweens.add({ targets: enemyShadow, alpha: 0.5, ease: 'Sine.easeInOut', scale: 1.0, duration: duration, yoyo: true, repeat: -1 })
    //nameplate
    scene.tweens.add({ targets: namePlate, y: xy.namePlates.y+20, ease: 'Sine.easeInOut', scale: 1.0, duration: duration, yoyo: true, repeat: -1 })

}

vars.test.test3DSpritesFullSize = function() {
    scene.add.sprite(180,160,'3DBlue').anims.play('3DBlue');
    scene.add.sprite(180,640,'3DGreen').anims.play('3DGreen');
    scene.add.sprite(180,400,'3DRed').anims.play('3DRed');
}

vars.test.test3DSpritesMini = function() {
    scene.add.sprite(vars.canvas.cX - 60,1025,'3DBlue' ).setScale(0.2).setName('3DBlue' ).anims.play('3DBlue' );
    scene.add.sprite(vars.canvas.cX,     1025,'3DGreen').setScale(0.2).setName('3DGreen').anims.play('3DGreen');
    scene.add.sprite(vars.canvas.cX + 60,1025,'3DRed'  ).setScale(0.2).setName('3DRed'  ).anims.play('3DRed'  );
}