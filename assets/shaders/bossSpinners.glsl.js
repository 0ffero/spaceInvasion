---
name: bossSpinnerBlueLight Camera
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
name: bossSpinnerRed Sprite
type: fragment
author: 04
---
precision mediump float;
#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 resolution;
#define PI 3.14159265358979
varying vec2 fragCoord;

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 p = (fragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y)*1.4; // radius of the big circle
    vec4 destColor = vec4(1.0, 0.0, 0.0, 0.7); // colour of circles
    float f = 0.0; // background colour based on circle colour (bleed through/bloom)
    float radius = (sin(time)+0.7)*0.07; // min and max radius for small circles
    for(float i = 0.0; i < 10.0; i++) {
        float angle = PI*sin(time) + i * 0.628318; // spinner speed
        float h = cos(angle) * 1.0; // height
        float w = sin(angle) * 1.0; // width
        float equ = abs(length((p - vec2(h, w))/vec2(h, 1.0)) - radius);
        f += 0.0088 / equ*3.0; // bloom
    }
    fragColor = vec4(destColor * f);
    if (fragColor.a < 0.2) { fragColor = vec4(0.0, 0.0, 0.0, 0.0); }
}

void main( void ) {
    mainImage(gl_FragColor, fragCoord.xy);
}


---
name: bossSpinnerGreen Sprite
type: fragment
author: 04
---
precision mediump float;
#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 resolution;
#define PI 3.14159265358979
varying vec2 fragCoord;

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 p = (fragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y)*1.4; // radius of the big circle
    vec4 destColor = vec4(0.0, 1.0, 0.0, 0.7); // colour of circles
    float f = 0.0; // background colour based on circle colour (bleed through/bloom)
    float radius = (sin(time)+0.7)*0.07; // min and max radius for small circles
    for(float i = 0.0; i < 10.0; i++) {
        float angle = PI*sin(time) + i * 0.628318; // spinner speed
        float h = cos(angle) * 1.0; // height
        float w = sin(angle) * 1.0; // width
        float equ = abs(length((p - vec2(h, w))/vec2(h, 1.0)) - radius);
        f += 0.0088 / equ*3.0; // bloom
    }
    fragColor = vec4(destColor * f);
    if (fragColor.a < 0.2) { fragColor = vec4(0.0, 0.0, 0.0, 0.0); }
}

void main( void ) {
    mainImage(gl_FragColor, fragCoord.xy);
}


---
name: bossSpinnerBlue Sprite
type: fragment
author: 04
---
precision mediump float;
#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 resolution;
#define PI 3.14159265358979
varying vec2 fragCoord;

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 p = (fragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y)*1.4; // radius of the big circle
    vec4 destColor = vec4(1.0, 1.0, 0.0, 0.7); // colour of circles
    float f = 0.0; // background colour based on circle colour (bleed through/bloom)
    float radius = (sin(time)+0.7)*0.07; // min and max radius for small circles
    for(float i = 0.0; i < 10.0; i++) {
        float angle = PI*sin(time) + i * 0.628318; // spinner speed
        float h = cos(angle) * 1.0; // height
        float w = sin(angle) * 1.0; // width
        float equ = abs(length((p - vec2(h, w))/vec2(h, 1.0)) - radius);
        f += 0.0088 / equ*3.0; // bloom
    }
    fragColor = vec4(destColor * f);
    if (fragColor.a < 0.2) { fragColor = vec4(0.0, 0.0, 0.0, 0.0); }
}

void main( void ) {
    mainImage(gl_FragColor, fragCoord.xy);
}


---
name: bossSpinnerPurple Sprite
type: fragment
author: 04
---
precision mediump float;
#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 resolution;
#define PI 3.14159265358979
varying vec2 fragCoord;

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 p = (fragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y)*1.4; // radius of the big circle
    vec4 destColor = vec4(0.788, 0.149, 1.0, 0.7); // colour of circles
    float f = 0.0; // background colour based on circle colour (bleed through/bloom)
    float radius = (sin(time)+0.7)*0.07; // min and max radius for small circles
    for(float i = 0.0; i < 10.0; i++) {
        float angle = PI*sin(time) + i * 0.628318; // spinner speed
        float h = cos(angle) * 1.0; // height
        float w = sin(angle) * 1.0; // width
        float equ = abs(length((p - vec2(h, w))/vec2(h, 1.0)) - radius);
        f += 0.0088 / equ*3.0; // bloom
    }
    fragColor = vec4(destColor * f);
    if (fragColor.a < 0.2) { fragColor = vec4(0.0, 0.0, 0.0, 0.0); }
}

void main( void ) {
    mainImage(gl_FragColor, fragCoord.xy);
}


---
name: bossSpinnerYellow Sprite
type: fragment
author: 04
---
precision mediump float;
#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 resolution;
#define PI 3.14159265358979
varying vec2 fragCoord;

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 p = (fragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y)*1.4; // radius of the big circle
    vec4 destColor = vec4(1.0, 1.0, 0.0, 0.7); // colour of circles
    float f = 0.0; // background colour based on circle colour (bleed through/bloom)
    float radius = (sin(time)+0.7)*0.07; // min and max radius for small circles
    for(float i = 0.0; i < 10.0; i++) {
        float angle = PI*sin(time) + i * 0.628318; // spinner speed
        float h = cos(angle) * 1.0; // height
        float w = sin(angle) * 1.0; // width
        float equ = abs(length((p - vec2(h, w))/vec2(h, 1.0)) - radius);
        f += 0.0088 / equ*3.0; // bloom
    }
    fragColor = vec4(destColor * f);
    if (fragColor.a < 0.2) { fragColor = vec4(0.0, 0.0, 0.0, 0.0); }
}

void main( void ) {
    mainImage(gl_FragColor, fragCoord.xy);
}