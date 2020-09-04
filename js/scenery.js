class scenery {
    constructor(_type) {
        switch(_type) {
            case 'trees': 
                this.name = this.type ='trees';
            break;

            case 'barns':
                this.name = this.type ='barn';
            break;
        }

        let sV = vars.scenery;
        this.name += '_' + generateRandomID();
        this.selectedSpawn = this.randomiseStartPosition();
        let startX = this.selectedSpawn[0];
        let endX = this.selectedSpawn[1];
        this.spawPosition = Phaser.Math.RND.between(startX, endX);

        // this is set depending whats on screen... wave popup or just playing the game
        let duration = 2500
        if (vars.levels.wavePopupVisible===true) {
            duration = 750;
        }

        // are we spawning a tree or a barn?
        let frame=-1;
        let finalScale = -1;
        if (this.type==='trees') {
            let maxFrame = 3;
            frame = Phaser.Math.RND.between(0,maxFrame);
            finalScale = vars.game.scale+0.1;
        } else if (this.type==='barn') {
            let barnType = Phaser.Math.RND.between(1,2); // select a random barn
            this.type+=barnType.toString();
            let maxFrame = 0;
            if (barnType===1) { // this has 4 frames. ie we need a frame between 0 and 3
                maxFrame = 3;
            } else if (barnType===2) { // this has 3 frames
                maxFrame = 2;
            }
            frame = Phaser.Math.RND.between(0, maxFrame);
            finalScale = vars.game.scale/3;
        }


        // add the object to the game
        if (frame !==-1) {
            this.sceneryObject = scene.add.image(startX, sV.yPosition, this.type, frame).setScale(sV.spawnScale).setName(this.name);

            // add object to the scenery group
            sceneryGroup.add(this.sceneryObject);

            // add tween to this new scenery object
            scene.tweens.add({
                targets: this.sceneryObject,
                scale: finalScale,
                x: endX,
                y: 1200,
                ease: 'Cubic.In',
                duration: duration,
                onComplete: destroySceneryObject,
            }, this)
        } else {
            console.warn('Invalid frame number (-1). Scenery object was not created!');
        }

    }

    randomiseStartPosition() {
        let sV = vars.scenery;
        let spawnPositions = sV.spawnPositions;
        return spawnPositions[Phaser.Math.RND.between(0, spawnPositions.length-1)];
    }
}




function destroySceneryObject(_tween) {
    _tween.targets[0].destroy();
}
