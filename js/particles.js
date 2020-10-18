function particlesInit() {
    vars.levels.rain(true);
    vars.levels.stellarCorona(true);
    vars.levels.starsSpace(true);

    bulletHitEnemy = particles.createEmitter({
        name: 'bulletHitEnemy',
        frame: [ 'smoke-puff', 'cloud', 'smoke-puff' ],

        alpha: { start: 0.3, end: 0 },
        angle: { min: 240, max: 300 },
        scale: { start: 0.3, end: vars.game.scale },
        speed: { min: 50, max: 100 },

        quantity: 3,
        lifespan: 300,

        on: false
    });

    enemyPieceParticle = particles.createEmitter();
    enemyPieceParticle.fromJSON({
        frame: [ 'enemyPiece' ],
        x: 400,
        y: 300,
        quantity: 4,
        speed: 800,
        scale: { start: 0.5, end: 0.1 },
        alpha: { start: 1, end: 0 },
        lifespan: 1000,
        blendMode: 'ADD',
        on: false,
    });

    playerMuzzleFlash = particles.createEmitter({
        name: 'playerMuzzleFlash',
        frame: 'muzzleflash7',

        alpha: { start: 0.3, end: 0 },
        rotate: { start: 0, end: 45 },
        scale: { start: 0.3, end: 0 },

        lifespan: 200,

        on: false
    });

    starEmitter = particles.createEmitter({
        name: 'starEmitter',
        frame: 'star',

        alpha: { start: 0.7, end: 0 },
        scale: { start: 0.4, end: 0 },

        lifespan: 2000,
        on: false,
    })
}
