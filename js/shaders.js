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

var TV = new Phaser.Class({

    Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

    initialize:

    function TV (game) {
        Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
            game: game,
            renderer: game.renderer,
            fragShader:`
            uniform vec3      iResolution;           // viewport resolution (in pixels)
            uniform float     iTime;                 // shader playback time (in seconds)
            uniform float     iTimeDelta;            // render time (in seconds)
            uniform int       iFrame;                // shader playback frame
            uniform float     iChannelTime[4];       // channel playback time (in seconds)
            uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
            uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
            uniform samplerXX iChannel0..3;          // input channel. XX = 2D/Cube
            uniform vec4      iDate;                 // (year, month, day, time in seconds)
            uniform float     iSampleRate;           // sound sample rate (i.e., 44100)

            vec2 curve(vec2 uv) {
                uv = (uv - 0.5) * 2.0;
                uv *= 1.1;
                uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);
                uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);
                uv  = (uv / 2.0) + 0.5;
                uv =  uv *0.92 + 0.04;
                return uv;
            }
            void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
                vec2 q = fragCoord.xy / iResolution.xy;
                vec2 uv = q;
                uv = curve( uv );
                vec3 oricol = texture2D( iChannel0, vec2(q.x,q.y) ).xyz;
                vec3 col;
                float x =  sin(0.3*iTime+uv.y*21.0)*sin(0.7*iTime+uv.y*29.0)*sin(0.3+0.33*iTime+uv.y*31.0)*0.0017;

                col.r = texture2D(iChannel0,vec2(x+uv.x+0.001,uv.y+0.001)).x+0.05;
                col.g = texture2D(iChannel0,vec2(x+uv.x+0.000,uv.y-0.002)).y+0.05;
                col.b = texture2D(iChannel0,vec2(x+uv.x-0.002,uv.y+0.000)).z+0.05;
                col.r += 0.08*texture2D(iChannel0,0.75*vec2(x+0.025, -0.027)+vec2(uv.x+0.001,uv.y+0.001)).x;
                col.g += 0.05*texture2D(iChannel0,0.75*vec2(x+-0.022, -0.02)+vec2(uv.x+0.000,uv.y-0.002)).y;
                col.b += 0.08*texture2D(iChannel0,0.75*vec2(x+-0.02, -0.018)+vec2(uv.x-0.002,uv.y+0.000)).z;

                col = clamp(col*0.6+0.4*col*col*1.0,0.0,1.0);

                float vig = (0.0 + 1.0*16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y));
                col *= vec3(pow(vig,0.3));

                col *= vec3(0.95,1.05,0.95);
                col *= 2.8;

                float scans = clamp( 0.35+0.35*sin(3.5*iTime+uv.y*iResolution.y*1.5), 0.0, 1.0);
                
                float s = pow(scans,1.7);
                col = col*vec3( 0.4+0.7*s) ;

                col *= 1.0+0.01*sin(110.0*iTime);
                if (uv.x < 0.0 || uv.x > 1.0)
                    col *= 0.0;
                if (uv.y < 0.0 || uv.y > 1.0)
                    col *= 0.0;

                col*=1.0-0.65*vec3(clamp((mod(fragCoord.x, 2.0)-1.0)*2.0,0.0,1.0));

                float comp = smoothstep( 0.1, 0.9, sin(iTime) );

                // Remove the next line to stop cross-fade between original and postprocess
                //	col = mix( col, oricol, comp );

                fragColor = vec4(col,1.0);
            }`
        });
    }
});

// FUNCTIONS
function shaderType(_shaderName='scan', _cam=1) {
    vars.shader.current = 'default';
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
            // ignore request for default if adi/shade is running
            let ssV = vars.player.ship.special;
            if (ssV.ADI.collected===false && ssV.SHADE.collected===false) {
                if (_cam===2) {
                    cam2.setRenderToTexture(scene.cSPipeline);
                } else {
                    cam1.setRenderToTexture(scene.cSPipeline);
                    cam2.setAlpha(1);
                    cam2.ignore(storyText);
                }
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