import {
  Color,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector3,
  WebGLRenderer,
  DoubleSide,
  MeshBasicMaterial,
  Clock,
  Vector4,
  SphereGeometry,
  WebGLRenderTarget,
  WebGLCubeRenderTarget,
  LinearMipMapLinearFilter,
  RGBAFormat,
  sRGBEncoding,
  CubeCamera,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { DotScreenShader } from "./CustomShader.js";

import vertexShader from "./shader/vertex.glsl";
import vertexShader1 from "./shader/vertex1.glsl";
import fragmentShader from "./shader/fragment.glsl";
import fragmentShader1 from "./shader/fragment1.glsl";
import GUI from "lil-gui";

export default class webGL {
  constructor(containerSelector) {
    // canvasタグが配置されるコンテナを取得
    this.container = document.querySelector(containerSelector);

    this.renderParam = {
      clearColor: 0xffffff,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.cameraParam = {
      fov: 45,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 100,
      fovRad: null,
      dist: null,
      lookAt: new Vector3(0, 0, 0),
      x: 0,
      y: 0,
      z: 1.5,
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.loader = null;
    this.texture = null;
    this.geometry = null;
    this.material = null;
    this.mesh = null;
    this.uniforms = null;
    this.composer = null;
    this.clock = new Clock();
  }

  init() {
    this._setScene();
    this._setRender();
    this._setCamera();
    this._setGui();
    // this._setContorols();
    this._setTexture();
    this._createMesh();
    this._createMesh1();
    this._createPost();
  }

  _setScene() {
    this.scene = new Scene();
  }

  _setRender() {
    this.renderer = new WebGLRenderer({
      antialias: true,
      transparent: true,
    });
    this.renderer.setClearColor(new Color(this.renderParam.clearColor));
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.renderParam.width, this.renderParam.height);
    this.container.appendChild(this.renderer.domElement);
  }

  _setCamera() {
    // ウィンドウとwebGLの座標を一致させるため、描画がウィンドウぴったりになるようカメラを調整
    this.camera = new PerspectiveCamera(
      this.cameraParam.fov,
      this.cameraParam.aspect,
      this.cameraParam.near,
      this.cameraParam.far
    );
    this.camera.position.set(
      this.cameraParam.x,
      this.cameraParam.y,
      this.cameraParam.z
    );
    this.cameraParam.fovRad = (this.cameraParam.fov / 2) * (Math.PI / 180);
    this.cameraParam.dist = this.renderParam.height / 2 / Math.tan(this.cameraParam.fovRad);
    // this.camera.position.z = this.cameraParam.dist;
  }

  _setGui() {
    let that = this;
    this.settings = {
      uPatternScale: 0.1,
      uPatternBias1: 0.5,
      uPatternBias2: 0.1,
      uFirstColor: new Color(120.0 / 255.0, 158.0 / 255.0, 113.0 / 255.0),
      uSecondColor: new Color(224.0 / 255.0, 148.0 / 255.0, 66.0 / 255.0),
      uAccentColor: new Color(0.0, 0.0, 0.0),
      uRefractionRatio: 1.02,
      uFresnelBias: 0.1,
      uFresnelScale: 2.0,
      uFresnelPower: 1.0,
    }
    this.gui = new GUI();

    const bgFolder = this.gui.addFolder('BackGround');
    bgFolder.add(this.settings, 'uPatternScale', 0.01, 1, 0.01,).name('Pattern Scale').onChange(() => {
      this.material.uniforms.uPatternScale.value = this.settings.uPatternScale;
    });
    bgFolder.add(this.settings, 'uPatternBias1', 0, 1, 0.01,).name('Pattern Bias1').onChange(() => {
      this.material.uniforms.uPatternBias1.value = this.settings.uPatternBias1;
    });
    bgFolder.add(this.settings, 'uPatternBias2', 0, 1, 0.01,).name('Pattern Bias2').onChange(() => {
      this.material.uniforms.uPatternBias2.value = this.settings.uPatternBias2;
    });
    bgFolder.addColor(this.settings, 'uFirstColor').name('First Color').onChange(() => {
      this.material.uniforms.uFirstColor.value = this.settings.uFirstColor;
    });
    bgFolder.addColor(this.settings, 'uSecondColor').name('Second Color').onChange(() => {
      this.material.uniforms.uSecondColor.value = this.settings.uSecondColor;
    });
    bgFolder.addColor(this.settings, 'uAccentColor').name('Accent Color').onChange(() => {
      this.material.uniforms.uAccentColor.value = this.settings.uAccentColor;
    });

    const geometryFolder = this.gui.addFolder('Geometry');
    geometryFolder.add(this.settings, 'uRefractionRatio', 0.5, 2, 0.01,).name('Refraction Ratio').onChange(() => {
      this.material1.uniforms.uRefractionRatio.value = this.settings.uRefractionRatio;
    });
    geometryFolder.add(this.settings, 'uFresnelBias', 0, 1, 0.01).name('Fresnel Bias').onChange(() => {
      this.material1.uniforms.uFresnelBias.value = this.settings.uFresnelBias;
    });
    geometryFolder.add(this.settings, 'uFresnelScale', 0, 5, 0.01).name('Fresnel Scale').onChange(() => {
      this.material1.uniforms.uFresnelScale.value = this.settings.uFresnelScale;
    });
    geometryFolder.add(this.settings, 'uFresnelPower', 0, 5, 0.01).name('Fresnel Power').onChange(() => {
      this.material1.uniforms.uFresnelPower.value = this.settings.uFresnelPower;
    });
  }

  _setContorols() {
    this.contorols = new OrbitControls(this.camera, this.renderer.domElement);
  }

  _setTexture() {
    this.texture = new TextureLoader().load(this.image);
  }

  // 背景
  _createMesh() {
    this.geometry = new SphereGeometry(1.5, 32, 32);
    this.material = new ShaderMaterial({
      uniforms: {
        uProgress: {value: 0},
        uTime: { value: 0 },
        uResolution: { value: new Vector4() },
        uTexture: { value: this.texture },
        uPatternScale: {value: 0.1},
        uPatternBias1: {value: 0.5},
        uPatternBias2: {value: 0.1},
        uFirstColor: { value: new Color(120.0 / 255.0, 158.0 / 255.0, 113.0 / 255.0) },
        uSecondColor: { value: new Color(224.0 / 255.0, 148.0 / 255.0, 66.0 / 255.0) },
        uAccentColor: { value: new Color(0.0, 0.0, 0.0) },
        // vec3 baseFirst = vec3( 120.0 / 255.0, 158.0 / 255.0, 113.0 / 255.0 );
        // vec3 baseSecond = vec3( 224.0 / 255.0, 148.0 / 255.0, 66.0 / 255.0);
      },
      vertexShader,
      fragmentShader,
      // wireframe: true,
      side: DoubleSide,
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  // オブジェクト
  _createMesh1() {
    this.cubeRenderTarget = new WebGLCubeRenderTarget(256, {
        format: RGBAFormat,
        generateMipmaps: true,
        minFilter: LinearMipMapLinearFilter,
        encoding: sRGBEncoding,
      }
    );

    this.cubeCamera = new CubeCamera( 0.1, 10, this.cubeRenderTarget );

    this.geometry1 = new SphereGeometry(0.4, 32, 32);
    this.material1 = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        tCube: { value: null },
        uResolution: { value: new Vector4() },
        uRefractionRatio: { value: 1.02},
        uFresnelBias: { value: 0.1},
        uFresnelScale: { value: 2.0},
        uFresnelPower: {value: 1.0},
      },
      vertexShader: vertexShader1,
      fragmentShader: fragmentShader1,
      // wireframe: true,
      side: DoubleSide,
    });

    this.mesh1 = new Mesh(this.geometry1, this.material1);
    this.scene.add(this.mesh1);
  }

  // ポストプロセッシング
  _createPost() {
    this.composer = new EffectComposer( this.renderer );
    this.composer.addPass( new RenderPass( this.scene, this.camera ) );

    const effect1 = new ShaderPass( DotScreenShader );
    effect1.uniforms[ 'scale' ].value = 4;
    this.composer.addPass( effect1 );
  }

  _render() {
    // this.renderer.render( this.scene, this.camera );
    this.composer.render( this.scene, this.camera );
  }

  // 毎フレーム呼び出す
  update() {
    this.time += 0.01;
    this.material.uniforms.uTime.value += 0.01;
    this.material1.uniforms.uTime.value += 0.01;
    // this.material.uniforms.uTime.value = this.time;
    this.cubeCamera.update( this.renderer, this.scene );
    this.material1.uniforms.tCube.value = this.cubeRenderTarget.texture;
    requestAnimationFrame( this.update.bind(this) );
    this._render();
  }

  onResize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    this.camera.aspect = windowWidth / windowHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // this.composer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(windowWidth, windowHeight);
    this.composer.setSize(windowWidth, windowHeight);
    // this.cameraParam.fovRad = (this.cameraParam.fov / 2) * (Math.PI / 180);
    // this.cameraParam.dist = windowHeight / 2 / Math.tan(this.cameraParam.fovRad);
    // this.camera.position.z = this.cameraParam.dist;
    this._render();
  }
}
