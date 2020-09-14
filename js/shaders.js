var GrayscalePipeline = new Phaser.Class({

    Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

    initialize:

    function GrayscalePipeline (game)
    {
        Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
            game: game,
            renderer: game.renderer,
            fragShader:`
                precision mediump float;
                uniform sampler2D uMainSampler;
                varying vec2 outTexCoord;
                void main(void) {
                vec4 color = texture2D(uMainSampler, outTexCoord);
                float gray = dot(color.rgba, vec4(0.299, 0.587, 0.114, 0.0));
                gl_FragColor = vec4(vec3(gray), 1);
                }`
        });
    } 
});

var GrayScanlinePipeline = new Phaser.Class({

    Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

    initialize:

    function GrayScanlinePipeline (game)
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

                pos -= (distortion * distortion) * 0.1;

                float c = sin(pos * 800.0) * 0.4 + 0.4;
                c = pow(c, 0.2);
                c *= 0.2;

                float band_pos = fract(time * 0.1) * 3.0 - 1.0;
                c += clamp( (1.0 - abs(band_pos - pos) * 10.0), 0.0, 1.0) * 0.1;

                c += distortion * 0.08;
                // noise
                c += (noise(gl_FragCoord.xy) - 0.5) * (0.09);

                vec4 pixel = texture2D(uMainSampler, outTexCoord);

                gl_FragColor = pixel + vec4( c, c, c, 1.0 );
            }`
        });
    } 

});

// FUNCTIONS
function shaderType(_shaderName='gray', _cam=2) {
    switch (_shaderName) {
        case 'scan': 
            if (_cam===2) {
                cam2.setRenderToTexture(scene.gSPipeline);
            } else {
                cam1.setRenderToTexture(scene.gSPipeline);
                cam1.ignore(storyText);
                cam2.setAlpha(1);
            }
        break;
        
        case 'gray': case 'grey':
            if (_cam===2) {
                cam2.setRenderToTexture(scene.gsPipeline);
            } else {
                cam1.setRenderToTexture(scene.gsPipeline);
            }
        break;

        case 'none': case 'disable':
            if (_cam===2) {
                cam2.clearRenderToTexture();
            } else {
                cam1.clearRenderToTexture();
                cam2.setAlpha(0);
            }
        break;
    }
}
