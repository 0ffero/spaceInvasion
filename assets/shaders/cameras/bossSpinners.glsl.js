---
name: bossSpinner Blue Light
type: fragment
---
precision mediump float;
#extension GL_OES_standard_derivatives : enable

uniform float time; uniform vec2 resolution; uniform sampler2D uMainSampler; varying vec2 outTexCoord;

void main( void ) {
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y)*1.1; // radius of the big circle
    vec3 destColor = vec3(0.0, 0.4, 1.0); // colour of circles
    float f = 0.0; // background colour based on circle colour (bleed through)
    float radius = (sin(time)+0.5)*0.07; // min and max radius for small circles
    for(float i = 0.0; i < 10.0; i++) {
        float theta = 16.0*sin(time) + i * 0.628318; float s = sin(theta) * 1.0; float c = cos(theta) * 1.0; float equ = abs(length((p - vec2(c, s))/vec2(c, 1.0)) - radius); f += 0.0068 / equ*5.0;
    }
    vec4 pixel = texture2D(uMainSampler, outTexCoord);
    gl_FragColor = pixel + vec4(vec3(destColor * f), 1.0);
}

---
name: bossSpinner Blue Normal
type: fragment
---
precision mediump float;
#extension GL_OES_standard_derivatives : enable

uniform float time; uniform vec2 resolution; uniform sampler2D uMainSampler; varying vec2 outTexCoord;

void main( void ) {
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y)*1.1; // radius of the big circle
    vec3 destColor = vec3(0.0, 0.0, 1.0); // colour of circles
    float f = 0.0; // background colour based on circle colour (bleed through)
    float radius = (sin(time)+0.5)*0.07; // min and max radius for small circles
    for(float i = 0.0; i < 10.0; i++) {
        float theta = 16.0*sin(time) + i * 0.628318; float s = sin(theta) * 1.0; float c = cos(theta) * 1.0; float equ = abs(length((p - vec2(c, s))/vec2(c, 1.0)) - radius); f += 0.0068 / equ*5.0;
    }
    vec4 pixel = texture2D(uMainSampler, outTexCoord);
    gl_FragColor = pixel + vec4(vec3(destColor * f), 1.0);
}

