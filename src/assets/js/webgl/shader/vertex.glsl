uniform float uTime;
uniform float uNoiseFreq;
uniform float uNoiseAmp;

varying vec2 vUv;
varying vec3 vPosition;

#include './_inc/simplex3d.glsl'

float PI = 3.1415926535897932384626433832795;

void main() {
  vUv = uv;

  vec3 pos = position;
  vPosition = pos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}