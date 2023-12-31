uniform float uTime;
uniform float uProgress;
uniform sampler2D uTexture;
uniform vec4 uResolution;
uniform float uPatternScale;
uniform float uPatternBias1;
uniform float uPatternBias2;

// カラー
uniform vec3 uFirstColor;
uniform vec3 uSecondColor;
uniform vec3 uAccentColor;

varying vec2 vUv;
varying vec3 vPosition;

float PI = 3.1415926535897932384626433832795;

#include './_inc/generic.glsl'

float lines(vec2 uv, float offset) {
  // return abs(sin(uv.x * 5.0));
  return smoothstep(
    0.0,
    0.5 + offset * 0.5,
    abs(0.5 * (sin(uv.x * 30.0) + offset * 2.0))
  );
}

mat2 rotate2D(float angle) {
  return mat2(
    cos(angle), -sin(angle),
    sin(angle), cos(angle)
  );
}

void main() {
  // ノイズ
  float n = noise(vPosition + uTime);

  // カラー
  // vec3 baseFirst = vec3(120.0 / 255.0, 158.0 / 255.0, 113.0 / 255.0);
  // vec3 baseSecond = vec3( 224.0 / 255.0, 148.0 / 255.0, 66.0 / 255.0);
  // vec3 accent = vec3( 0.0, 0.0, 0.0 );

  // ポジション
  vec2 baseUV = rotate2D(n) * vPosition.xy * uPatternScale;
  float basePattern = lines(baseUV, uPatternBias1);
  float secoundPattern = lines(baseUV, uPatternBias2);

  // カラー + ポシション
  vec3 baseColor = mix( uSecondColor, uFirstColor, basePattern );
  vec3 secoundBaseColor = mix( baseColor, uAccentColor, secoundPattern );

  // gl_FragColor = vec4(n, 0.0, 0.0, 1.0);
  // gl_FragColor = vec4(baseUV, 0.0, 1.0);
  gl_FragColor = vec4(vec3(secoundBaseColor), 1.0);
}