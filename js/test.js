vars.test.glass = function() {
    scene.add.image(400,300,'bossShield','innerRed').setScale(0.4,0.2);
    scene.add.image(400,300,'bossShield','outer').setScale(0.4,0.2);
    scene.add.image(400,370,'bossShield','innerGreen').setScale(0.4,0.2);
    scene.add.image(400,370,'bossShield','outer').setScale(0.4,0.2);
    scene.add.image(400,440,'bossShield','innerDarkBlue').setScale(0.4,0.2);
    scene.add.image(400,440,'bossShield','outer').setScale(0.4,0.2);
    scene.add.image(470,300,'bossShield','innerLightBlue').setScale(0.4,0.2);
    scene.add.image(470,300,'bossShield','outer').setScale(0.4,0.2);
    scene.add.image(470,370,'bossShield','innerYellow').setScale(0.4,0.2);
    scene.add.image(470,370,'bossShield','outer').setScale(0.4,0.2);
    scene.add.image(470,440,'bossShield','innerPurple').setScale(0.4,0.2);
    scene.add.image(470,440,'bossShield','outer').setScale(0.4,0.2);
    scene.add.image(540,440,'bossShield','innerDefault').setScale(0.4,0.2);
    scene.add.image(540,440,'bossShield','outer').setScale(0.4,0.2);
}

vars.test.initiateLevel25 = function() {
    vars.cheats.levelSkipTo(25);
    vars.enemies.availableAttackPatterns.pathPickNext();
}