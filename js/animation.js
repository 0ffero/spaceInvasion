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

    if (selectedSprite==='upgrades') {
        console.log('Setting Up Health Pickup Animations');
        let inc = 25;
        let sC = 3*inc;
        let fC = 6; // frame count for each animation
        let hpUpgrade = 0;
        for (let s=inc; s<=sC; s+=inc) {
            scene.anims.create({
                key: 'hp' + s,
                frames: scene.anims.generateFrameNumbers('health', { start: hpUpgrade*fC, end: hpUpgrade*fC+fC-1 } ),
                frameRate: fC*1.5,
                repeat: -1
            });
            hpUpgrade++;
        }
    }
}