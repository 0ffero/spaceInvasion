---
name: bossSpinner Blue Sprite
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
    vec4 destColor = vec4(0.0, 0.0, 1.0, 0.7); // colour of circles
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
name: bossSpinner Green Sprite
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
name: bossSpinner Purple Sprite
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
name: bossSpinner Purple2 Sprite
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
    vec4 destColor = vec4(0.639, 0.0, 0.85, 0.7); // colour of circles
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
name: bossSpinner Red Sprite
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
name: bossSpinner Yellow Sprite
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