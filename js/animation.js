function animationInit(_spriteName='player') {
    let selectedSprite = _spriteName;
    /* if (selectedSprite==='player') {
        console.log('Setting Up Player Animations');
        scene.anims.create({
            key: 'hover',
            frames: scene.anims.generateFrameNumbers(selectedSprite, { start: 0, end: 0 }),
            frameRate: 2,
            repeat: -1
        });
    } */

    if (selectedSprite==='enemies') {
        console.log('Setting Up Player Animations');
        let sC = vars.enemies.spriteCount;
        for (let nme=0; nme<sC; nme++) {
            scene.anims.create({
                key: 'e.hover' + nme,
                frames: scene.anims.generateFrameNumbers(selectedSprite, { frames: [nme,nme+sC] }),
                frameRate: 2,
                repeat: -1
            });
        }
    }
}