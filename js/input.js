function inputInit() {
    scene.input.on('pointermove', function (pointer) {
        if (vars.game.paused===false) {
            if (vars.player.isDead===false) {
                player.setPosition(pointer.x, player.y);
            }
        }
    });
}