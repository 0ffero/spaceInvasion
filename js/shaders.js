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



// FUNCTIONS
function shaderType(_shaderName='gray', _cam=2) {
    switch (_shaderName) {
        case 'gray': case 'grey':
            if (_cam===2) {
                cam2.setRenderToTexture(scene.grayscalePipeline);
            } else {
                cam1.setRenderToTexture(scene.grayscalePipeline);
            }
        break;

        case 'none': case 'disable':
            if (_cam===2) {
                cam2.clearRenderToTexture();
            } else {
                cam1.clearRenderToTexture();
            }
        break;
    }
}


