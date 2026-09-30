import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SyncEngine } from './SyncEngine.js';

// Static reusable vectors & matrices to eliminate frame-loop Garbage Collection
const _UP = new THREE.Vector3(0, 1, 0);
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _lookMatrix = new THREE.Matrix4();

/**
 * Core Engine for Nuclear Valley:
 * Coordinates Three.js scene, camera, lighting, smooth camera transitions,
 * frame loop, and unified navigation (mouse orbit/zoom + simultaneous arrow keys / WASD walk).
 */
export class Engine {
  /**
   * @param {HTMLElement} container
   * @param {Object} [options={}]
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Unified Navigation: OrbitControls handles mouse, keyboard handles movement
    this.controls = null;
    this.moveSpeed = options.moveSpeed || 32.0; // units/s
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      boost: false
    };

    this.syncEngine = new SyncEngine(options.syncOptions || {});
    this.clock = new THREE.Clock();
    this.animationFrameId = null;
    this.isRunning = false;

    // Default camera parameters (rotated 45 degrees along vertical axis to align with the valley axis)
    this.defaultCamPosition = new THREE.Vector3(42.0, 28.0, 42.0);
    this.defaultCamTarget = new THREE.Vector3(0, 4, 0);

    // Camera tweening
    this.isTransitioning = false;
    this.camTween = null;

    this.listeners = new Map();

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x04060d, 0.007);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.copy(this.defaultCamPosition);
    this.camera.lookAt(this.defaultCamTarget);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls (always active for mouse interaction)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 250;
    this.controls.minDistance = 2.0;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
    this.controls.target.copy(this.defaultCamTarget);
    this.controls.enabled = true;

    // 5. Keyboard Navigation (Arrows + WASD work simultaneously with Orbit)
    this._onKeyDown = this.onKeyDown.bind(this);
    this._onKeyUp = this.onKeyUp.bind(this);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    // 6. Lighting
    this.setupLighting();

    // 7. Window resize
    this._onResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  setupLighting() {
    // Ambient soft base
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambientLight);

    // Directional main light creating sharp nuclide column definition
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(30, 50, 40);
    this.scene.add(dirLight);

    // Cyan key light (from high right)
    const keyCyan = new THREE.PointLight(0x38bdf8, 2.8, 160);
    keyCyan.position.set(25, 30, 25);
    this.scene.add(keyCyan);

    // Warm amber fill light (from low left)
    const fillAmber = new THREE.PointLight(0xf59e0b, 2.2, 160);
    fillAmber.position.set(-30, 20, -20);
    this.scene.add(fillAmber);

    // Magenta bottom rim accent
    const rimMagenta = new THREE.PointLight(0xf43f5e, 1.8, 120);
    rimMagenta.position.set(0, -5, 10);
    this.scene.add(rimMagenta);
  }

  onKeyDown(e) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
      return;
    }

    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.keys.forward = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.keys.backward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.left = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.keys.right = true;
        break;
      case 'KeyQ':
      case 'Space':
        this.keys.up = true;
        break;
      case 'KeyE':
      case 'KeyC':
        this.keys.down = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.boost = true;
        break;
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.keys.forward = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.keys.backward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.keys.right = false;
        break;
      case 'KeyQ':
      case 'Space':
        this.keys.up = false;
        break;
      case 'KeyE':
      case 'KeyC':
        this.keys.down = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.boost = false;
        break;
    }
  }

  updateKeyboard(dt) {
    if (this.isTransitioning) return;

    const keys = this.keys;
    // Early exit if no motion keys are held (zero calculation & zero allocations)
    if (!keys.forward && !keys.backward && !keys.left && !keys.right && !keys.up && !keys.down) {
      return;
    }

    // Forward direction in horizontal XZ plane
    this.camera.getWorldDirection(_forward);
    _forward.y = 0;
    if (_forward.lengthSq() < 0.0001) {
      _forward.set(0, 0, -1);
    } else {
      _forward.normalize();
    }

    // Right direction in horizontal XZ plane
    _right.crossVectors(_forward, _UP).normalize();

    _moveDir.set(0, 0, 0);
    if (keys.forward) _moveDir.add(_forward);
    if (keys.backward) _moveDir.sub(_forward);
    if (keys.right) _moveDir.add(_right);
    if (keys.left) _moveDir.sub(_right);
    if (keys.up) _moveDir.y += 1.0;
    if (keys.down) _moveDir.y -= 1.0;

    if (_moveDir.lengthSq() > 0.0001) {
      _moveDir.normalize();
      const speed = this.moveSpeed * (keys.boost ? 2.2 : 1.0);
      const moveDelta = _moveDir.multiplyScalar(speed * dt);

      // Translate camera and OrbitControls focus target simultaneously
      this.camera.position.add(moveDelta);
      this.controls.target.add(moveDelta);

      // Prevent going deep below floor
      if (this.camera.position.y < 0.8) {
        const diff = 0.8 - this.camera.position.y;
        this.camera.position.y = 0.8;
        this.controls.target.y += diff;
      }
    }
  }

  /**
   * Smoothly animates camera to a destination position and look-at point.
   */
  flyTo(targetPos, targetLookAt, duration = 1.2) {
    const startPos = this.camera.position.clone();
    const startQuat = this.camera.quaternion.clone();

    // Use fast static Matrix4 lookAt instead of cloning the entire Camera
    _lookMatrix.lookAt(targetPos, targetLookAt, _UP);
    const endQuat = new THREE.Quaternion().setFromRotationMatrix(_lookMatrix);

    this.isTransitioning = true;
    const startTime = performance.now();

    if (this.controls) this.controls.enabled = false;

    this.camTween = {
      update: () => {
        const elapsed = (performance.now() - startTime) / 1000;
        const progress = Math.min(1.0, elapsed / duration);
        // Smooth cubic easeInOut
        const t = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        this.camera.position.lerpVectors(startPos, targetPos, t);
        this.camera.quaternion.slerpQuaternions(startQuat, endQuat, t);

        if (progress >= 1.0) {
          this.isTransitioning = false;
          this.camTween = null;

          if (this.controls) {
            this.controls.target.copy(targetLookAt);
            this.controls.enabled = true;
            this.controls.update();
          }
        }
      }
    };
  }

  setCameraPreset(preset) {
    switch (preset) {
      case 'perspective':
        this.flyTo(new THREE.Vector3(42.0, 28.0, 42.0), new THREE.Vector3(0, 4.0, 0));
        break;
      case 'top':
        this.flyTo(new THREE.Vector3(0, 85, 0.001), new THREE.Vector3(0, 0, 0));
        break;
      case 'fe56':
        // Close view overlooking the valley floor at Fe-56 (Z=26, A=56)
        this.flyTo(new THREE.Vector3(-14.7, 8.0, -12.0), new THREE.Vector3(-14.7, 1.2, -22.4));
        break;
      case 'ni62':
        // Ni-62: Z=28, A=62
        this.flyTo(new THREE.Vector3(-13.3, 7.5, -10.5), new THREE.Vector3(-13.3, 1.0, -20.3));
        break;
      case 'h1':
        // H-1: Z=1, A=1
        this.flyTo(new THREE.Vector3(-32.2, 30.0, -28.0), new THREE.Vector3(-32.2, 22.0, -41.6));
        break;
      case 'u235':
        // U-235: Z=92, A=235
        this.flyTo(new THREE.Vector3(31.5, 14.0, 26.0), new THREE.Vector3(31.5, 3.5, 40.2));
        break;
      case 'gorge':
        // Walking inside the central river bed looking forward
        this.flyTo(new THREE.Vector3(0, 4.0, -35.0), new THREE.Vector3(0, 4.0, 20.0));
        break;
    }
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();

    const loop = () => {
      if (!this.isRunning) return;
      this.animationFrameId = requestAnimationFrame(loop);

      const rawDt = this.clock.getDelta();
      this.syncEngine.update(rawDt);

      // Tween update or unified keyboard + mouse controls
      if (this.isTransitioning && this.camTween) {
        this.camTween.update();
      } else {
        this.updateKeyboard(rawDt);
        if (this.controls && this.controls.enabled) {
          this.controls.update();
        }
      }

      if (this.onFrame) {
        this.onFrame(rawDt);
      }

      this.renderer.render(this.scene, this.camera);
    };

    loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  addComponent(component) {
    component.init(this.scene, this.syncEngine);
    this.syncEngine.registerComponent(component);
  }

  removeComponent(component) {
    this.syncEngine.unregisterComponent(component.id);
    component.dispose();
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const h of this.listeners.get(event)) h(data);
    }
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);

    if (this.controls) this.controls.dispose();

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}
