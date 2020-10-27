function animationInit(_spriteName) {
    let selectedSprite = _spriteName;

    if (selectedSprite==='asteroids') {
        selectedSprite = 'asteroid1';
        console.log('%cSetting Up Asteroid 1 Animations', vars.console.animSetUp);
        // build the frame names
        let frameNames = Phaser.Utils.Array.NumberArray(1,12,'a1frame');
        scene.anims.create({
            key: 'asteroid1a',
            frames: scene.anims.generateFrameNumbers(selectedSprite, { frames: frameNames }),
            frameRate: 6,
            repeat: -1
        });
        
        frameNames = Phaser.Utils.Array.NumberArray(13,24,'a1frame');
        scene.anims.create({
            key: 'asteroid1b',
            frames: scene.anims.generateFrameNumbers(selectedSprite, { frames: frameNames }),
            frameRate: 6,
            repeat: -1
        });

        selectedSprite = 'asteroid2';
        console.log('%cSetting Up Asteroid 2 Animations', vars.console.animSetUp);
        // build the frame names
        frameNames = Phaser.Utils.Array.NumberArray(1,12,'a2frame');
        scene.anims.create({
            key: 'asteroid2a',
            frames: scene.anims.generateFrameNumbers(selectedSprite, { frames: frameNames }),
            frameRate: 6,
            repeat: -1
        });
    }

    if (selectedSprite==='enemies') {
        console.log('%cSetting Up Player Animations', vars.console.animSetUp);
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

    if (selectedSprite==='shipUpgrades') {
        selectedSprite = 'upgradeBox';
        console.log('%cSetting Up Ship Upgrade Animations', vars.console.animSetUp);
        let fC = 2;
        scene.anims.create({
            key: 'shipGrade1',
            frames: scene.anims.generateFrameNumbers(selectedSprite, { start: 0, end: 1 } ),
            frameRate: fC*1.5,
            repeat: -1
        });
        scene.anims.create({
            key: 'shipGrade2',
            frames: scene.anims.generateFrameNumbers(selectedSprite, { start: 2, end: 3 } ),
            frameRate: fC*1.5,
            repeat: -1
        });
    }

    if (selectedSprite==='upgrades') {
        console.log('%cSetting Up Health Pickup Animations', vars.console.animSetUp);
        let inc = 25;
        let sC = 3*inc;
        let fC = 2; // frame count for each animation
        let hpUpgrade = 0;
        for (let s=inc; s<=sC; s+=inc) {
            scene.anims.create({
                key: 'hp' + s,
                frames: scene.anims.generateFrameNumbers('upgradesH', { start: hpUpgrade*fC, end: hpUpgrade*fC+fC-1 } ),
                frameRate: fC*1.5,
                repeat: -1
            });
            hpUpgrade++;
        }

        console.log('%cSetting Up Bullet Pickup Animations', vars.console.animSetUp);
        scene.anims.create({
            key: 'bulletRate',
            frames: scene.anims.generateFrameNumbers('upgradesB', { start: 0, end: 1 } ),
            frameRate: fC*1.5,
            repeat: -1
        });
        scene.anims.create({
            key: 'bulletStrength',
            frames: scene.anims.generateFrameNumbers('upgradesB', { start: 2, end: 3 } ),
            frameRate: fC*1.5,
            repeat: -1
        });

        console.log('%cSetting Up Bonus Points Pickup Animations', vars.console.animSetUp);
        scene.anims.create({
            key: 'score_2000',
            frames: scene.anims.generateFrameNumbers('upgradesP', { start: 0, end: 1 } ),
            frameRate: fC*1.5,
            repeat: -1
        });
        scene.anims.create({
            key: 'score_3000',
            frames: scene.anims.generateFrameNumbers('upgradesP', { start: 2, end: 3 } ),
            frameRate: fC*1.5,
            repeat: -1
        });
        scene.anims.create({
            key: 'score_5000',
            frames: scene.anims.generateFrameNumbers('upgradesP', { start: 4, end: 5 } ),
            frameRate: fC*1.5,
            repeat: -1
        });

        console.log('%cSetting Up Field Animations', vars.console.animSetUp);
        // fields
        scene.anims.create({
            key: 'amstradField',
            frames: scene.anims.generateFrameNumbers('upgradesS', { start: 0, end: 1 } ),
            frameRate: fC*1.5,
            repeat: -1
        });
        scene.anims.create({
            key: 'shadeField',
            frames: scene.anims.generateFrameNumbers('upgradesS', { start: 2, end: 3 } ),
            frameRate: fC*1.5,
            repeat: -1
        });
    }
}