import * as THREE from 'three';

/**
 * InteractionManager: Handles raycasting and mouse interactions on the instanced isotope valley.
 */
export class InteractionManager {
  /**
   * @param {import('./Engine.js').Engine} engine
   * @param {import('../components/EnergyValley.js').EnergyValley} energyValley
   */
  constructor(engine, energyValley) {
    this.engine = engine;
    this.energyValley = energyValley;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);

    this.mouseDownPos = new THREE.Vector2();
    this.isMouseDown = false;
    this.dragThreshold = 6; // pixels

    this.hoveredInstanceId = -1;
    this.selectedInstanceId = -1;
    this.lastHoverCheckTime = 0;

    // Cache element bounding rect to avoid layout reflows on mousemove
    this.cachedRect = null;

    this.listeners = new Map();

    this._onPointerMove = this.onPointerMove.bind(this);
    this._onPointerDown = this.onPointerDown.bind(this);
    this._onPointerUp = this.onPointerUp.bind(this);
    this._onResize = () => { this.cachedRect = null; };

    this.init();
  }

  init() {
    const el = this.engine.renderer.domElement;
    el.addEventListener('pointermove', this._onPointerMove);
    el.addEventListener('pointerdown', this._onPointerDown);
    el.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('resize', this._onResize);
    window.addEventListener('scroll', this._onResize, true);

    this._onDblClick = (e) => {
      if (!this.energyValley || !this.energyValley.instancedMesh) return;
      this.raycaster.setFromCamera(this.mouse, this.engine.camera);
      const intersects = this.raycaster.intersectObject(this.energyValley.instancedMesh);
      if (intersects.length > 0) {
        const hit = intersects[0];
        const instanceId = hit.instanceId;
        if (instanceId !== undefined) {
          const isotope = this.energyValley.isotopeStore.getByIndex(instanceId);
          if (isotope) {
            this.selectInstance(instanceId);
            this.emit('dropIsotope', isotope);
          }
        }
      }
    };
    el.addEventListener('dblclick', this._onDblClick);
  }

  onPointerDown(e) {
    this.isMouseDown = true;
    this.mouseDownPos.set(e.clientX, e.clientY);
  }

  onPointerMove(e) {
    if (!this.cachedRect) {
      this.cachedRect = this.engine.renderer.domElement.getBoundingClientRect();
    }
    const rect = this.cachedRect;
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const now = performance.now();
    if (now - this.lastHoverCheckTime > 32) {
      this.lastHoverCheckTime = now;
      this.checkHover();
    }
  }

  onPointerUp(e) {
    this.isMouseDown = false;
    const dist = Math.hypot(e.clientX - this.mouseDownPos.x, e.clientY - this.mouseDownPos.y);

    // If mouse was dragged, do not trigger click select
    if (dist > this.dragThreshold) return;

    this.performPick(e.shiftKey);
  }

  checkHover() {
    if (!this.energyValley || !this.energyValley.instancedMesh) return;

    this.raycaster.setFromCamera(this.mouse, this.engine.camera);
    const intersects = this.raycaster.intersectObject(this.energyValley.instancedMesh);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const instanceId = hit.instanceId;

      if (instanceId !== undefined && instanceId !== this.hoveredInstanceId) {
        this.hoveredInstanceId = instanceId;
        const isotope = this.energyValley.isotopeStore.getByIndex(instanceId);
        if (isotope) {
          this.engine.renderer.domElement.style.cursor = 'pointer';
          this.emit('hover', isotope);
        }
      }
    } else {
      if (this.hoveredInstanceId !== -1) {
        this.hoveredInstanceId = -1;
        this.engine.renderer.domElement.style.cursor = 'default';
        this.emit('hover', null);
      }
    }
  }

  performPick(isShift = false) {
    if (!this.energyValley || !this.energyValley.instancedMesh) return;

    this.raycaster.setFromCamera(this.mouse, this.engine.camera);
    const intersects = this.raycaster.intersectObject(this.energyValley.instancedMesh);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const instanceId = hit.instanceId;
      if (instanceId !== undefined) {
        this.selectInstance(instanceId);
        const isotope = this.energyValley.isotopeStore.getByIndex(instanceId);
        if (isotope && isShift) {
          this.emit('dropIsotope', isotope);
        }
      }
    }
  }

  selectInstance(instanceId) {
    this.selectedInstanceId = instanceId;
    this.energyValley.setSelectedIndex(instanceId);
    const isotope = this.energyValley.isotopeStore.getByIndex(instanceId);
    if (isotope) {
      this.emit('select', isotope);
    }
  }

  selectIsotope(isotope) {
    if (!isotope) return;
    const idx = isotope.index !== undefined ? isotope.index : -1;
    if (idx >= 0) {
      this.selectInstance(idx);
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

  dispose() {
    const el = this.engine.renderer.domElement;
    el.removeEventListener('pointermove', this._onPointerMove);
    el.removeEventListener('pointerdown', this._onPointerDown);
    el.removeEventListener('pointerup', this._onPointerUp);
    el.removeEventListener('dblclick', this._onDblClick);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('scroll', this._onResize, true);
    this.listeners.clear();
  }
}
