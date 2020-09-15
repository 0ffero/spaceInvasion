var greenScanline = new Phaser.Class({

    Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

    initialize:

    function greenScanline (game)
    {
        Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
            game: game,
            renderer: game.renderer,
            fragShader: `
            precision mediump float;
            uniform float     time;
            uniform vec2      resolution;
            uniform sampler2D uMainSampler;
            uniform vec2      mouse;
            varying vec2 outTexCoord;

            float noise(vec2 pos) {
                return fract(sin(dot(pos, vec2(12.9898 - time,78.233 + time))) * 43758.5453);
            }

            void main( void ) {
                vec2 normalPos = outTexCoord;
                vec2 pointer = mouse / resolution;
                float pos = (gl_FragCoord.y / resolution.y);
                float mouse_dist = length(vec2((pointer.x - normalPos.x) * (resolution.x / resolution.y), pointer.y - normalPos.y));
                float distortion = clamp(1.0 - (mouse_dist + 0.1) * 4.0, 0.0, 1.0);

                pos -= (distortion * distortion) * 0.05;

                float c = sin(pos * 800.0) * 0.4 + 0.4;
                c = pow(c, 0.2);
                c *= 0.2;

                float band_pos = fract(time * 0.1) * 5.0 - 0.5;
                c += clamp( (1.0 - abs(band_pos - pos) * 10.0), 0.0, 0.3) * 0.1;

                c += distortion * 0.01;
                // noise
                c += (noise(gl_FragCoord.xy) - 0.5) * (0.1);

                vec4 pixel = texture2D(uMainSampler, outTexCoord);
                //float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));

                gl_FragColor = dot(pixel, vec4(0.299, 0.587, 0.114, 0.0)) + vec4( c, c, c, 0.0 );
            }`
        });
    } 

});

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 1000,
    backgroundColor: '#000000',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


var game = new Phaser.Game(config);

function preload ()
{
    this.time = 0;
    this.load.image('volcano', 'assets/pics/the-end-by-iloe-and-made.jpg');

    gsPipeline = game.renderer.addPipeline('gScan', new greenScanline(game));
    gsPipeline.setFloat2('resolution', game.config.width, game.config.height);
    gsPipeline.setFloat2('mouse', 0.0, 0.0);
}

function create ()
{
    let pic1 = this.add.image(400, 300, 'volcano').setAlpha(1);
    
    this.cameras.main.setRenderToTexture(gsPipeline);
    this.input.on('pointermove', function (pointer) { gsPipeline.setFloat2('mouse', pointer.x, pointer.y); });
    let pic2 = this.add.image(400, 300, 'volcano').setAlpha(1.0).setScale(0.3).setRotation(0.4);
    this.cameras.main.ignore(pic2);
    cam2 = this.cameras.add(0,0,800,1000);
    cam2.ignore(pic1);
}

function update () {
    gsPipeline.setFloat1('time', this.time);
    this.time += 0.03;
}
