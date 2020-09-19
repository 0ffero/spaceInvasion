var GrayScanlinePipeline = new Phaser.Class({

    Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

    initialize:

    function GrayScanlinePipeline (game)
    {
        Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
            game: game,
            renderer: game.renderer,
            fragShader:`
            precision mediump float;
            uniform float     time;
            uniform vec2      resolution;
            uniform sampler2D uMainSampler;
            uniform vec2      mouse;
            varying vec2      outTexCoord;

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
                c = pow(c, 0.2) * 0.2;

                float band_pos = fract(time * 0.1) * 5.0 - 0.5;
                c += clamp( (1.0 - abs(band_pos - pos) * 10.0), 0.0, 0.3) * 0.1;

                c += distortion * 0.01;
                c += (noise(gl_FragCoord.xy) - 0.5) * (0.1);

                vec4 pixel = texture2D(uMainSampler, outTexCoord);
                gl_FragColor = dot(pixel, vec4(0.299, 0.587, 0.114, 0.0)) + vec4( c, c, c, 0.0 );
            }`
        });
    } 
});

var ColourScanlinePipeline = new Phaser.Class({

    Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

    initialize:

    function ColourScanlinePipeline (game)
    {
        Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
            game: game,
            renderer: game.renderer,
            fragShader:`
            precision mediump float;
            uniform float     time;
            uniform vec2      resolution;
            uniform sampler2D uMainSampler;
            uniform vec2      mouse;
            varying vec2      outTexCoord;

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

                float c = sin(pos * 1000.0) * 0.4 + 0.4;
                c = pow(c, 0.2) * 0.1;

                float band_pos = fract(time * 0.1) * 5.0 - 0.5;
                c += clamp( (1.0 - abs(band_pos - pos) * 10.0), 0.0, 0.3) * 0.1;

                c += distortion * 0.01;
                c += (noise(gl_FragCoord.xy) - 0.5) * (0.1);

                vec4 pixel = texture2D(uMainSampler, outTexCoord);
                gl_FragColor = pixel + vec4( c, c, c, 0.0 );
            }`
        });
    } 
});

var GreenScreenScanlinePipeline = new Phaser.Class({

    Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

    initialize:

    function GreenScreenScanlinePipeline (game) {
        Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
            game: game,
            renderer: game.renderer,
            fragShader:`
            precision mediump float;
            uniform float     time;
            uniform vec2      resolution;
            uniform sampler2D uMainSampler;
            uniform vec2      mouse;
            varying vec2      outTexCoord;

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
                c = pow(c, 0.2) * 0.2;

                float band_pos = fract(time * 0.1) * 5.0 - 0.5;
                c += clamp( (1.0 - abs(band_pos - pos) * 10.0), 0.0, 0.3) * 0.1;

                c += distortion * 0.01;
                c += (noise(gl_FragCoord.xy) - 0.5) * (0.1);

                vec4 pixel = texture2D(uMainSampler, outTexCoord);
                gl_FragColor = dot(pixel, vec4(0.299, 0.587, 0.114, 0.0)) + vec4( 0.0, c, 0.0, 0.0 );
            }`
        });
    }

});

var EnemyBossWarpPipeline = new Phaser.Class({

    Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

    initialize:

    function EnemyBossWarpPipeline (game) {
        Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
            game: game,
            renderer: game.renderer,
            fragShader:`
            precision mediump float;

            uniform float     time;
            uniform vec2      resolution;
            uniform sampler2D uMainSampler;
            varying vec2      outTexCoord;

            #define MAX_ITER 5

            void main( void ) {
                vec2 v_texCoord = gl_FragCoord.xy / resolution;

                vec2 p =  v_texCoord * 8.0 - vec2(20.0);
                vec2 i = p;
                float c = 1.0;
                float inten = .05;

                for (int n = 0; n < MAX_ITER; n++)
                {
                    float t = time * (1.0 - (3.0 / float(n+1)));

                    i = p + vec2(cos(t - i.x) + sin(t + i.y),
                    sin(t - i.y) + cos(t + i.x));

                    c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),
                    p.y / (cos(i.y+t)/inten)));
                }

                c /= float(MAX_ITER);
                c = 1.5 - sqrt(c);

                vec4 texColor = vec4(0.0, 0.01, 0.015, 1.0);

                texColor.rgb *= (1.0 / (1.0 - (c + 0.05)));
                vec4 pixel = texture2D(uMainSampler, outTexCoord);

                gl_FragColor = pixel + texColor;
            }`
        });
    }
});

// FUNCTIONS
function shaderType(_shaderName='scan', _cam=1) {
    switch (_shaderName) {
        case 'warp':
            if (_cam===2) {
                cam2.setRenderToTexture(scene.warpPipeline);
            } else {
                cam1.setRenderToTexture(scene.warpPipeline);
                cam2.setAlpha(1);
                cam2.ignore(storyText);
            }
        break;

        case 'colour': case 'colourscan': case 'default':
            if (_cam===2) {
                cam2.setRenderToTexture(scene.cSPipeline);
            } else {
                cam1.setRenderToTexture(scene.cSPipeline);
                cam2.setAlpha(1);
                cam2.ignore(storyText);
            }
        break;

        case 'green': case 'greenscan':
            if (_cam===2) {
                cam2.setRenderToTexture(scene.gSSPipeline);
            } else {
                cam1.setRenderToTexture(scene.gSSPipeline);
                cam2.setAlpha(1);
                cam2.ignore(storyText);
            }
        break;

        case 'gray': case 'grey': case 'grayscan': case 'greyscan':
            if (_cam===2) {
                cam2.setRenderToTexture(scene.gSPipeline);
            } else {
                cam1.setRenderToTexture(scene.gSPipeline);
                cam2.setAlpha(1);
                cam2.ignore(storyText);
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