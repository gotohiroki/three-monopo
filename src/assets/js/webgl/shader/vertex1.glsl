uniform float uTime;
uniform float uRefractionRatio;
uniform float uFresnelBias;
uniform float uFresnelScale;
uniform float uFresnelPower;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;

#include './_inc/classic3d.glsl'

float noise(vec3 n) {
  return cnoise(n * 2.0 + uTime) * 0.05;
}

void main() {
  vec3 pos = position;
  vec3 norm = normal;

  pos += noise(pos);
  norm += noise(norm);

  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
  vec4 worldPosition = modelMatrix * vec4( pos, 1.0 );

  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * norm );

  vec3 I = worldPosition.xyz - cameraPosition;

  vReflect = reflect( I, worldNormal );
  vRefract[0] = refract( normalize( I ), worldNormal, uRefractionRatio );
  vRefract[1] = refract( normalize( I ), worldNormal, uRefractionRatio * 0.99 );
  vRefract[2] = refract( normalize( I ), worldNormal, uRefractionRatio * 0.98 );
  vReflectionFactor = uFresnelBias + uFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), uFresnelPower );

  gl_Position = projectionMatrix * mvPosition;

}