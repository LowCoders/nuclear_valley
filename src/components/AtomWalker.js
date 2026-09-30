import * as THREE from 'three';
import { PathTrail } from './PathTrail.js';

// Static reusable offset vectors to prevent per-hop GC allocations
const _HOP_OFFSET = new THREE.Vector3(0, 0.45, 0);
const _SKY_OFFSET = new THREE.Vector3(0, 24.0, 0);

function createNuclideSprite(text, color = '#38bdf8') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontSize = 32;
  ctx.font = `700 ${fontSize}px monospace`;
  const metrics = ctx.measureText(text);
  const width = Math.ceil(metrics.width) + 24;
  const height = fontSize + 16;
  canvas.width = width;
  canvas.height = height;

  ctx.font = `700 ${fontSize}px monospace`;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // Rounded pill background
  const r = 6;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(width - r, 0);
  ctx.quadraticCurveTo(width, 0, width, r);
  ctx.lineTo(width, height - r);
  ctx.quadraticCurveTo(width, height, width - r, height);
  ctx.lineTo(r, height);
  ctx.quadraticCurveTo(0, height, 0, height - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  const aspect = width / height;
  sprite.scale.set(1.8 * aspect, 1.8, 1);
  return sprite;
}

/**
 * AtomWalker: 3D animated atom that drops into the valley and walks along
 * a sequence of waypoints calculated by PathPlanner.
 */
export class AtomWalker {
  /**
   * @param {string} id
   * @param {Array<Object>} pathSteps
   * @param {import('./EnergyValley.js').EnergyValley} energyValley
   * @param {Object} [options={}]
   */
  constructor(id, pathSteps, energyValley, options = {}) {
    this.id = id;
    this.pathSteps = pathSteps || [];
    this.energyValley = energyValley;
    this.color = options.color || new THREE.Color(0x38bdf8);
    this.hopDuration = options.hopDuration || 0.55; // seconds per hop
    this.dropDuration = options.dropDuration || 0.85; // seconds to fall initially

    this.group = new THREE.Group();
    this.group.name = `AtomWalker_${id}`;

    this.trail = null;
    this.mesh = null;
    this.halo = null;
    this.light = null;
    this.sprite = null;

    // Animation state
    this.state = 'dropping'; // 'dropping' | 'hopping' | 'arrived' | 'done'
    this.currentStepIdx = 0;
    this.stepProgress = 0; // 0..1
    this.startPos = new THREE.Vector3();
    this.targetPos = new THREE.Vector3();

    this.isDisposed = false;
    this.listeners = new Map();

    this.init();
  }

  init() {
    if (this.pathSteps.length === 0) {
      this.state = 'done';
      return;
    }

    const firstStep = this.pathSteps[0];
    const firstPos = this.energyValley.getIsotopeWorldPosition(firstStep.isotope || firstStep);
    if (!firstPos) {
      this.state = 'done';
      return;
    }

    // Starting waypoint on top of bar
    const landingPos = firstPos.clone().add(_HOP_OFFSET);
    // Spawn drop position high in the sky above the starting bar
    this.startPos.copy(landingPos).add(_SKY_OFFSET);
    this.targetPos.copy(landingPos);

    // Visual Mesh: glowing core sphere
    const sphereGeo = new THREE.SphereGeometry(0.5, 20, 20);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: this.color,
      emissive: this.color,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.3
    });
    this.mesh = new THREE.Mesh(sphereGeo, sphereMat);
    this.group.add(this.mesh);

    // Orbiting electron halo ring
    const ringGeo = new THREE.RingGeometry(0.75, 0.85, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    this.halo = new THREE.Mesh(ringGeo, ringMat);
    this.halo.rotation.x = Math.PI / 3;
    this.group.add(this.halo);

    // Local point light
    this.light = new THREE.PointLight(this.color, 2.5, 12);
    this.group.add(this.light);

    // Floating nuclide badge
    this.sprite = createNuclideSprite(`${firstStep.a}${firstStep.symbol}`, '#' + this.color.getHexString());
    this.sprite.position.set(0, 1.2, 0);
    this.group.add(this.sprite);

    // Set initial position
    this.group.position.copy(this.startPos);

    // Trail (lifecycle managed by DropManager so it remains persistent)
    this.trail = new PathTrail(this.energyValley.group, {
      color: this.color
    });
  }

  getCurrentStep() {
    return this.pathSteps[this.currentStepIdx] || null;
  }

  update(time, deltaTime) {
    if (this.isDisposed || this.state === 'done') return;

    // Spin the halo ring
    if (this.halo) {
      this.halo.rotation.z += deltaTime * 4.0;
      this.halo.rotation.y += deltaTime * 2.5;
    }

    if (this.state === 'dropping') {
      this.stepProgress += deltaTime / this.dropDuration;
      // Ease in acceleration (gravity feel)
      const t = Math.min(1.0, this.stepProgress);
      const easeT = t * t;
      this.group.position.lerpVectors(this.startPos, this.targetPos, easeT);

      if (t >= 1.0) {
        // Landed on initial isotope!
        this.trail.addPoint(this.targetPos);
        this.state = 'hopping';
        this.stepProgress = 0;
        this.currentStepIdx = 0;

        this.emit('hop', {
          walker: this,
          stepIdx: 0,
          step: this.pathSteps[0],
          isInitial: true
        });

        this.prepareNextHop();
      }
      return;
    }

    if (this.state === 'hopping') {
      this.stepProgress += deltaTime / this.hopDuration;
      const t = Math.min(1.0, this.stepProgress);

      // Smooth horizontal lerp with parabolic vertical arc
      this.group.position.x = THREE.MathUtils.lerp(this.startPos.x, this.targetPos.x, t);
      this.group.position.z = THREE.MathUtils.lerp(this.startPos.z, this.targetPos.z, t);
      const baseY = THREE.MathUtils.lerp(this.startPos.y, this.targetPos.y, t);
      const arcHeight = Math.max(1.2, Math.abs(this.targetPos.x - this.startPos.x) * 0.4);
      this.group.position.y = baseY + Math.sin(t * Math.PI) * arcHeight;

      if (t >= 1.0) {
        // Arrived at next waypoint
        this.group.position.copy(this.targetPos);
        this.trail.addPoint(this.targetPos);
        this.currentStepIdx++;

        const step = this.pathSteps[this.currentStepIdx];
        if (step) {
          this.updateSprite(`${step.a}${step.symbol}`);
          if (step.releasedMeV && step.releasedMeV > 0) {
            this.trail.addEnergyLabel(this.targetPos, step);
          }
          this.emit('hop', {
            walker: this,
            stepIdx: this.currentStepIdx,
            step,
            isFinal: this.currentStepIdx >= this.pathSteps.length - 1
          });
        }

        if (this.currentStepIdx >= this.pathSteps.length - 1) {
          // Reached destination (valley floor)
          this.state = 'arrived';
          this.trail.finish();
          this.emit('arrive', {
            walker: this,
            finalStep: this.pathSteps[this.pathSteps.length - 1]
          });
        } else {
          this.stepProgress = 0;
          this.prepareNextHop();
        }
      }
      return;
    }

    if (this.state === 'arrived') {
      // Gentle floating animation at the destination
      this.group.position.y = this.targetPos.y + Math.sin(time * 3.5) * 0.15;
    }
  }

  prepareNextHop() {
    const nextIdx = this.currentStepIdx + 1;
    if (nextIdx >= this.pathSteps.length) return;

    const nextStep = this.pathSteps[nextIdx];
    const worldPos = this.energyValley.getIsotopeWorldPosition(nextStep.isotope || nextStep);
    if (!worldPos) return;

    this.startPos.copy(this.group.position);
    this.targetPos.copy(worldPos).add(_HOP_OFFSET);
  }

  updateSprite(text) {
    if (this.sprite) {
      this.group.remove(this.sprite);
      if (this.sprite.material) {
        if (this.sprite.material.map) this.sprite.material.map.dispose();
        this.sprite.material.dispose();
      }
    }
    this.sprite = createNuclideSprite(text, '#' + this.color.getHexString());
    this.sprite.position.set(0, 1.2, 0);
    this.group.add(this.sprite);
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

  dispose() {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.state = 'done';

    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }

    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
    if (this.halo) {
      this.halo.geometry.dispose();
      this.halo.material.dispose();
    }
    if (this.sprite) {
      if (this.sprite.material.map) this.sprite.material.map.dispose();
      this.sprite.material.dispose();
    }
    // Note: this.trail is intentionally NOT disposed here.
    // The trail is owned and disposed by DropManager (on clearAll or new drop).
    this.trail = null;
    this.listeners.clear();
  }
}
