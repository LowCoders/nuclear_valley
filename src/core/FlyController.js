import * as THREE from 'three';

/**
 * FlyController: First-person WASD + Ctrl mouse-look exploration over the 3D energy valley.
 * Inspired by KisFiz interactive energy valley controls.
 */
export class FlyController {
  /**
   * @param {THREE.Camera} camera
   * @param {HTMLElement} domElement
   * @param {Object} [options={}]
   */
  constructor(camera, domElement, options = {}) {
    this.camera = camera;
    this.domElement = domElement || document.body;
    this.enabled = false;

    // Movement speeds
    this.moveSpeed = options.moveSpeed || 25.0; // units/s
    this.boostMultiplier = options.boostMultiplier || 2.4;
    this.lookSpeed = options.lookSpeed || 0.0022; // radians/px
    this.damping = options.damping || 7.0;

    // State
    this.isLookArmed = false;
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      boost: false
    };

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    // Orientation (radians)
    this.pitch = 0; // vertical rotation [-PI/2.1, PI/2.1]
    this.yaw = 0;   // horizontal rotation

    this._onKeyDown = this.onKeyDown.bind(this);
    this._onKeyUp = this.onKeyUp.bind(this);
    this._onMouseMove = this.onMouseMove.bind(this);
    this._onPointerLockChange = this.onPointerLockChange.bind(this);
    this._onClick = this.onClick.bind(this);

    this.listeners = new Map();

    this.syncFromCamera();
  }

  syncFromCamera() {
    // Extract current pitch and yaw from camera quaternion
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.setFromQuaternion(this.camera.quaternion);
    this.pitch = euler.x;
    this.yaw = euler.y;
  }

  enable() {
    if (this.enabled) return;
    this.enabled = true;
    this.syncFromCamera();
    this.velocity.set(0, 0, 0);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
    this.domElement.addEventListener('click', this._onClick);

    this.emit('enable', true);
  }

  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    this.isLookArmed = false;

    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);
    this.domElement.removeEventListener('click', this._onClick);

    if (document.pointerLockElement === this.domElement) {
      document.exitPointerLock();
    }

    this.resetKeys();
    this.emit('enable', false);
    this.emit('lookState', false);
  }

  resetKeys() {
    for (const k in this.keys) {
      this.keys[k] = false;
    }
  }

  toggleLook() {
    this.setLookArmed(!this.isLookArmed);
  }

  setLookArmed(armed) {
    this.isLookArmed = !!armed;
    if (this.isLookArmed) {
      try {
        if (this.domElement.requestPointerLock) {
          this.domElement.requestPointerLock();
        }
      } catch (err) {
        // Fallback to tracking mousemove without pointer lock
      }
    } else {
      if (document.pointerLockElement === this.domElement) {
        document.exitPointerLock();
      }
    }
    this.emit('lookState', this.isLookArmed);
  }

  onPointerLockChange() {
    const isLocked = document.pointerLockElement === this.domElement;
    if (this.isLookArmed !== isLocked) {
      this.isLookArmed = isLocked;
      this.emit('lookState', this.isLookArmed);
    }
  }

  onClick(e) {
    // If user clicks on canvas and look is armed but lock was lost, re-request lock
    if (this.isLookArmed && document.pointerLockElement !== this.domElement) {
      if (this.domElement.requestPointerLock) {
        this.domElement.requestPointerLock();
      }
    }
  }

  onKeyDown(e) {
    if (!this.enabled) return;

    // Do not capture input when user is typing in an input or textarea
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
      return;
    }

    // Ctrl button: KisFiz mental model (toggle mouse look on/off)
    if (e.key === 'Control') {
      this.toggleLook();
      e.preventDefault();
      return;
    }

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
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
    if (!this.enabled) return;

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
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

  onMouseMove(e) {
    if (!this.enabled || !this.isLookArmed) return;

    const movementX = e.movementX || 0;
    const movementY = e.movementY || 0;

    this.yaw -= movementX * this.lookSpeed;
    this.pitch -= movementY * this.lookSpeed;

    // Clamp pitch so camera doesn't flip over
    const maxPitch = Math.PI / 2.05;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

    // Apply rotation
    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);
  }

  update(deltaTime) {
    if (!this.enabled) return;

    const dt = Math.min(deltaTime, 0.1);

    // Speed multiplier
    const speed = this.moveSpeed * (this.keys.boost ? this.boostMultiplier : 1.0);

    // Direction calculation in horizontal XZ plane
    this.direction.set(0, 0, 0);

    // Forward vector (projected onto XZ plane for intuitive walking)
    const sinY = Math.sin(this.yaw);
    const cosY = Math.cos(this.yaw);

    const fwdX = -sinY;
    const fwdZ = -cosY;
    const rightX = cosY;
    const rightZ = -sinY;

    if (this.keys.forward) {
      this.direction.x += fwdX;
      this.direction.z += fwdZ;
    }
    if (this.keys.backward) {
      this.direction.x -= fwdX;
      this.direction.z -= fwdZ;
    }
    if (this.keys.left) {
      this.direction.x -= rightX;
      this.direction.z -= rightZ;
    }
    if (this.keys.right) {
      this.direction.x += rightX;
      this.direction.z += rightZ;
    }
    if (this.keys.up) {
      this.direction.y += 1.0;
    }
    if (this.keys.down) {
      this.direction.y -= 1.0;
    }

    if (this.direction.lengthSq() > 0.0001) {
      this.direction.normalize();
      this.velocity.addScaledVector(this.direction, speed * 8.0 * dt);
    }

    // Apply damping
    const dampingFactor = Math.max(0, 1.0 - this.damping * dt);
    this.velocity.multiplyScalar(dampingFactor);

    // Apply movement
    this.camera.position.addScaledVector(this.velocity, dt);

    // Prevent going deep below ground plane
    if (this.camera.position.y < 0.8) {
      this.camera.position.y = 0.8;
      this.velocity.y = Math.max(0, this.velocity.y);
    }
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(handler);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const h of this.listeners.get(event)) h(data);
    }
  }
}
