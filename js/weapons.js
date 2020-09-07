class bullet {
    constructor(weaponSlot=0, bulletOffset=0, bulletSpeed=-1, bulletStrength=-1, weaponSlotName='centre') {
        let playerXPosition = player.x;
        this.weaponSlot = weaponSlot;
        this.weaponSlotName = weaponSlotName;

        if (bulletStrength===-1 || bulletSpeed===-1) {
            console.error('%c !!! Invalid bullet strength or speed !!!', 'font-weight: bold; color: white; blackground-color: red;')
        } else {
            this.name = 'playersBullet_' + generateRandomID();
            if (bulletSpeed>0) {
                this.bulletSpeed = -bulletSpeed;
            } else {
                this.bulletSpeed = bulletSpeed;
            }

            this.bulletStrength = bulletStrength;
            if (this.bulletStrength===undefined) {
                console.error('THE BULLET STRENGTH IS INVALID!')
            }
            if (weaponSlot===0) {
                this.x1 = bulletOffset + playerXPosition;
                this.x2 = -1;
            } else {
                this.x1 = -bulletOffset + playerXPosition;
                this.x2 = bulletOffset + playerXPosition;
            }


            this.create();
        }
    }

    create() {
        this.physicsObject = scene.physics.add.sprite(this.x1, player.y-40, 'bulletPrimary').setScale(vars.game.scale*this.bulletStrength).setName('bullet_' + this.name).setVelocityY(this.bulletSpeed);
        this.physicsObject.setData({ name: this.name, hp: this.bulletStrength, weaponSlot: this.weaponSlot, weaponSlotName: this.weaponSlotName })
        bullets.add(this.physicsObject);
        playerMuzzleFlash.emitParticleAt(player.x,player.y-27);
        scene.sound.play('playerGun1');
    }
}


class weaponUpgrade {

}