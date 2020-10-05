class bullet {
    constructor(weaponSlot=0, bulletOffset=0, bulletSpeed=-1, bulletStrength=-1, weaponSlotName='centre') {
        let playerXPosition = player.x;
        this.bulletStrength = bulletStrength;
        this.weaponSlot = weaponSlot;
        if (weaponSlot===0) {
            this.x1 = bulletOffset + playerXPosition;
            this.x2 = -1;
        } else {
            this.x1 = -bulletOffset + playerXPosition;
            this.x2 = bulletOffset + playerXPosition;
        }
        this.weaponSlotName = weaponSlotName;

        if (bulletStrength===-1 || bulletSpeed===-1) {
            console.error('%c !!! Invalid bullet strength or speed !!!', 'font-weight: bold; color: white; blackground-color: red;');
        } else { // bullet strength IS valid, create the object
            if (this.weaponSlot===2) { // this is a special case (it creates rockets that home in on the closest target)
                this.name = 'playersRocket_' + generateRandomID();
                this.createRocket();
            } else { // standard bullets (centre and l1r1 slots)
                this.name = 'playersBullet_' + generateRandomID();
                if (bulletSpeed>0) {
                    this.bulletSpeed = -bulletSpeed;
                } else {
                    this.bulletSpeed = bulletSpeed;
                }

                this.create();
            }
        }
    }

    create() {
        this.physicsObject = scene.physics.add.sprite(this.x1, player.y-40, 'bulletPrimary').setScale(vars.game.scale*this.bulletStrength).setName('bullet_' + this.name);
        this.physicsObject.setData({ name: this.name, hp: this.bulletStrength, weaponSlot: this.weaponSlot, weaponSlotName: this.weaponSlotName })
        bullets.add(this.physicsObject);
        this.physicsObject.setVelocityY(this.bulletSpeed);
        vars.cameras.ignore(cam2, this.physicsObject);
        playerMuzzleFlash.emitParticleAt(this.x1,player.y-27);
        if (this.x2!==-1) { // this is either l1r1 or l2r2 (which have 2 guns, hence 2 bullets)
            this.physicsObject2 = scene.physics.add.sprite(this.x2, player.y-40, 'bulletPrimary').setScale(vars.game.scale*this.bulletStrength).setName('bullet_' + this.name + '_2');
            this.physicsObject2.setData({ name: this.name, hp: this.bulletStrength, weaponSlot: this.weaponSlot, weaponSlotName: this.weaponSlotName })
            bullets.add(this.physicsObject2);
            this.physicsObject2.setVelocityY(this.bulletSpeed);
            vars.cameras.ignore(cam2, this.physicsObject2);
            playerMuzzleFlash.emitParticleAt(this.x2,player.y-27);
        }
        scene.sound.play('playerGun1');
    }

    createRocket() {
        this.rocketSplinesCreate();
    }

    rocketSplinesCreate() {
        // BUILD THE PATH
        let path = { t: 0, vec: new Phaser.Math.Vector2() };

        let x1= this.x1; let x2=this.x2;
        let y=player.y-40;
        let curve = [
            x1-50,y-90,
            x1-150,y,
            x1+50,y-300,
            x1+300,0-100
        ];
        let curve2 = [
            x2+50,y-90,
            x2+150,y,
            x2-50,y-300,
            x2-300,0-100
        ];

        let path1 = new Phaser.Curves.Path(x1, y).splineTo(curve);
        let path2 = new Phaser.Curves.Path(x2, y).splineTo(curve2);

        if (vars.DEBUG===true) {
            let graphics = scene.add.graphics();
            graphics.lineStyle(1, 0xffff00, 1);
            path1.draw(graphics, 128);
            graphics.lineStyle(1, 0xff1010, 1);
            path2.draw(graphics, 128);
        }
    
        // Create Rocket 1
        let rocket1 = scene.add.follower(path1, 0, 0, 'rocket').setScale(vars.game.scale*0.8);
        bullets.add(rocket1);
        rocket1.setData({ name: this.name + 'rkt_1', hp: this.bulletStrength, weaponSlot: this.weaponSlot, weaponSlotName: this.weaponSlotName });

        // Create Rocket 2
        let rocket2 = scene.add.follower(path2, 0, 0, 'rocket').setScale(vars.game.scale*0.8);
        bullets.add(rocket2);
        rocket2.setData({ name: this.name + '_rkt_2', hp: this.bulletStrength, weaponSlot: this.weaponSlot, weaponSlotName: this.weaponSlotName });
    
        rocket1.startFollow({
            rotationOffset: 90,
            positionOnPath: true,
            duration: 2000,
            yoyo: false,
            rotateToPath: true,
            ease: 'Quad.easeIn',
        });
        rocket2.startFollow({
            rotationOffset: 90,
            positionOnPath: true,
            duration: 2000,
            yoyo: false,
            rotateToPath: true,
            ease: 'Quad.easeIn',
        });
    }
}
