import * as THREE from 'three';

/**
 * Creates a crisp comic-style 3D sprite speech bubble showing released energy (+X.XX MeV / +Y.YY pJ).
 * Features a downward-pointing tail/stem that points directly to the waypoint sphere.
 */
function createEnergyLabelSprite(mev, pj) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 192;
  canvas.height = 100;

  const w = canvas.width;
  const h = canvas.height;
  const pad = 3;
  const r = 12;
  const stemH = 22;
  const boxBottom = h - stemH - pad;
  const stemTipX = w / 2;
  const stemTipY = h - pad;
  const stemHalfW = 10;

  // Seamless single-path speech bubble with bottom stem
  ctx.beginPath();
  ctx.moveTo(pad + r, pad);
  ctx.lineTo(w - pad - r, pad);
  ctx.quadraticCurveTo(w - pad, pad, w - pad, pad + r);
  ctx.lineTo(w - pad, boxBottom - r);
  ctx.quadraticCurveTo(w - pad, boxBottom, w - pad - r, boxBottom);
  ctx.lineTo(stemTipX + stemHalfW, boxBottom);
  ctx.lineTo(stemTipX, stemTipY); // Stem tip pointing down
  ctx.lineTo(stemTipX - stemHalfW, boxBottom);
  ctx.lineTo(pad + r, boxBottom);
  ctx.quadraticCurveTo(pad, boxBottom, pad, boxBottom - r);
  ctx.lineTo(pad, pad + r);
  ctx.quadraticCurveTo(pad, pad, pad + r, pad);
  ctx.closePath();

  // Dark glass background with emerald border
  ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.90)';
  ctx.lineWidth = 2.5;
  ctx.fill();
  ctx.stroke();

  // Line 1: Released MeV in bright emerald green
  ctx.font = '800 17px monospace';
  ctx.fillStyle = '#6ee7b7';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`+${Number(mev).toFixed(2)} MeV`, w / 2, 26);

  // Line 2: Released pJ in soft light blue
  ctx.font = '600 13px monospace';
  ctx.fillStyle = '#93c5fd';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`+${Number(pj).toFixed(2)} pJ`, w / 2, 50);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  });
  const sprite = new THREE.Sprite(spriteMat);
  // Anchor at the bottom center (the tip of the stem)
  sprite.center.set(0.5, 0.0);
  const aspect = w / h;
  const scaleY = 0.90;
  sprite.scale.set(scaleY * aspect, scaleY, 1.0);

  return { sprite, texture, material: spriteMat };
}

/**
 * PathTrail: Manages the visual 3D trail left behind by an atom moving along its transformation path.
 * Stays permanently visible on the valley landscape with energy callouts, until a new drop or manual clear.
 */
export class PathTrail {
  /**
   * @param {THREE.Scene|THREE.Group} parentGroup
   * @param {Object} [options={}]
   */
  constructor(parentGroup, options = {}) {
    this.parentGroup = parentGroup;
    this.color = options.color || new THREE.Color(0x38bdf8);
    this.autoFade = options.autoFade || false;
    this.holdDuration = options.holdDuration !== undefined ? options.holdDuration : 4.5;
    this.fadeDuration = options.fadeDuration !== undefined ? options.fadeDuration : 2.5;

    this.points = [];
    this.bufferCapacity = 64; // Initial capacity for trajectory waypoints
    this.positionsBuffer = new Float32Array(this.bufferCapacity * 3);
    this.posAttribute = new THREE.BufferAttribute(this.positionsBuffer, 3);
    this.posAttribute.setUsage(THREE.DynamicDrawUsage);

    this.lineGeometry = null;
    this.lineMaterial = null;
    this.lineMesh = null;

    // Glowing waypoint markers
    this.markersGroup = new THREE.Group();
    this.markerMaterial = null;

    // Energy label badges
    this.labelsGroup = new THREE.Group();
    this.energyLabels = [];

    // State
    this.isFinished = false;
    this.holdTimer = 0;
    this.opacity = 0.95;
    this.isDisposed = false;

    this.init();
  }

  init() {
    this.lineGeometry = new THREE.BufferGeometry();
    this.lineGeometry.setAttribute('position', this.posAttribute);
    this.lineGeometry.setDrawRange(0, 0);

    this.lineMaterial = new THREE.LineBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: this.opacity,
      linewidth: 3,
      depthWrite: false
    });

    this.lineMesh = new THREE.Line(this.lineGeometry, this.lineMaterial);
    this.lineMesh.frustumCulled = false;
    this.parentGroup.add(this.lineMesh);

    this.markerMaterial = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: this.opacity,
      depthWrite: false
    });
    this.parentGroup.add(this.markersGroup);
    this.parentGroup.add(this.labelsGroup);
  }

  /**
   * Adds a new 3D waypoint to the trail.
   * @param {THREE.Vector3} point
   */
  addPoint(point) {
    if (this.isDisposed) return;

    const idx = this.points.length;
    this.points.push(point.clone());

    // Dynamically expand buffer only if capacity is exceeded
    if (idx >= this.bufferCapacity) {
      this.bufferCapacity *= 2;
      const newBuffer = new Float32Array(this.bufferCapacity * 3);
      newBuffer.set(this.positionsBuffer);
      this.positionsBuffer = newBuffer;
      this.posAttribute = new THREE.BufferAttribute(this.positionsBuffer, 3);
      this.posAttribute.setUsage(THREE.DynamicDrawUsage);
      this.lineGeometry.setAttribute('position', this.posAttribute);
    }

    this.positionsBuffer[idx * 3 + 0] = point.x;
    this.positionsBuffer[idx * 3 + 1] = point.y;
    this.positionsBuffer[idx * 3 + 2] = point.z;

    this.posAttribute.needsUpdate = true;
    this.lineGeometry.setDrawRange(0, this.points.length);

    // Create a small waypoint sphere marker
    const sphereGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const sphere = new THREE.Mesh(sphereGeo, this.markerMaterial);
    sphere.position.copy(point);
    this.markersGroup.add(sphere);
  }

  /**
   * Adds a 3D badge showing the departing energy at this waypoint.
   * @param {THREE.Vector3} point
   * @param {Object|number} energyData Object with { releasedMeV, releasedPJ } or { mev, pj } or number
   */
  addEnergyLabel(point, energyData) {
    if (this.isDisposed || !energyData) return;
    let mev = 0;
    let pj = 0;
    if (typeof energyData === 'number') {
      mev = energyData;
      pj = mev * 0.16021766;
    } else if (typeof energyData === 'object') {
      mev = energyData.releasedMeV !== undefined ? energyData.releasedMeV : (energyData.mev || 0);
      pj = energyData.releasedPJ !== undefined ? energyData.releasedPJ : (energyData.pj !== undefined ? energyData.pj : (mev * 0.16021766));
    }

    if (mev <= 0.0001 && pj <= 0.0001) return;

    const labelData = createEnergyLabelSprite(mev, pj);
    // Position the bottom stem tip right above the waypoint sphere (radius ~0.22)
    // The comic bubble box rises upward above the stem to y + 1.25
    labelData.sprite.position.set(point.x, point.y + 0.35, point.z);
    this.labelsGroup.add(labelData.sprite);
    this.energyLabels.push(labelData);
  }

  rebuildGeometry() {
    // Retained for backward-compatibility; buffer is now updated dynamically in addPoint()
    if (this.posAttribute) {
      this.posAttribute.needsUpdate = true;
      this.lineGeometry.setDrawRange(0, this.points.length);
    }
  }

  /**
   * Signals that the walker has completed its descent.
   */
  finish() {
    this.isFinished = true;
    this.holdTimer = 0;
  }

  /**
   * Frame update. If autoFade is false, the trail remains permanently visible.
   * @param {number} deltaTime
   * @returns {boolean} true if trail is still alive, false if completely faded and disposed
   */
  update(deltaTime) {
    if (this.isDisposed) return false;

    // By default trails are persistent and do not auto-fade
    if (!this.autoFade) {
      return true;
    }

    if (this.isFinished) {
      this.holdTimer += deltaTime;

      if (this.holdTimer > this.holdDuration) {
        const fadeElapsed = this.holdTimer - this.holdDuration;
        const progress = Math.min(1.0, fadeElapsed / this.fadeDuration);
        this.opacity = Math.max(0, 0.95 * (1.0 - progress));

        if (this.lineMaterial) {
          this.lineMaterial.opacity = this.opacity;
        }
        if (this.markerMaterial) {
          this.markerMaterial.opacity = this.opacity;
        }

        if (progress >= 1.0) {
          this.dispose();
          return false;
        }
      }
    }

    return true;
  }

  dispose() {
    if (this.isDisposed) return;
    this.isDisposed = true;

    if (this.lineMesh && this.lineMesh.parent) {
      this.lineMesh.parent.remove(this.lineMesh);
    }
    if (this.markersGroup && this.markersGroup.parent) {
      this.markersGroup.parent.remove(this.markersGroup);
    }
    if (this.labelsGroup && this.labelsGroup.parent) {
      this.labelsGroup.parent.remove(this.labelsGroup);
    }

    if (this.lineGeometry) this.lineGeometry.dispose();
    if (this.lineMaterial) this.lineMaterial.dispose();
    if (this.markerMaterial) this.markerMaterial.dispose();

    while (this.markersGroup.children.length > 0) {
      const child = this.markersGroup.children[0];
      this.markersGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }

    for (const item of this.energyLabels) {
      if (item.texture) item.texture.dispose();
      if (item.material) item.material.dispose();
    }
    this.energyLabels = [];

    while (this.labelsGroup.children.length > 0) {
      const child = this.labelsGroup.children[0];
      this.labelsGroup.remove(child);
    }

    this.posAttribute = null;
    this.positionsBuffer = null;
    this.points = [];
  }
}
