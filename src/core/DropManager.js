import * as THREE from 'three';
import { PathPlanner } from './PathPlanner.js';
import { AtomWalker } from '../components/AtomWalker.js';

const PALETTE = [
  new THREE.Color(0x38bdf8), // Cyan
  new THREE.Color(0xfbbf24), // Gold / Amber
  new THREE.Color(0xf43f5e), // Magenta / Rose
  new THREE.Color(0x10b981), // Emerald
  new THREE.Color(0xa855f7), // Purple
  new THREE.Color(0xf97316), // Orange
  new THREE.Color(0x06b6d4), // Turquoise
  new THREE.Color(0xec4899)  // Pink
];

/**
 * DropManager: Coordinates dropping atoms into the valley,
 * computing paths with PathPlanner, orchestrating AtomWalker animations,
 * pausing/resuming animation playback, and managing persistent path trails.
 */
export class DropManager {
  /**
   * @param {THREE.Scene} scene
   * @param {import('../components/EnergyValley.js').EnergyValley} energyValley
   * @param {import('../data/IsotopeStore.js').IsotopeStore} isotopeStore
   */
  constructor(scene, energyValley, isotopeStore) {
    this.scene = scene;
    this.energyValley = energyValley;
    this.isotopeStore = isotopeStore;

    this.pathPlanner = new PathPlanner(isotopeStore);
    this.activeWalkers = [];
    this.activeTrails = [];
    this.maxWalkers = 10;
    this.dropCounter = 0;

    this.pathMode = 'gradient'; // 'gradient' | 'channels'
    this.isPaused = false;
    this.listeners = new Map();
  }

  setPathMode(mode) {
    this.pathMode = mode === 'channels' ? 'channels' : 'gradient';
    this.emit('pathModeChange', this.pathMode);
  }

  hasActiveWalkers() {
    return this.activeWalkers.some(w => !w.isDisposed && w.state !== 'done');
  }

  emitPlayState() {
    this.emit('playStateChange', {
      isRunning: this.hasActiveWalkers(),
      isPaused: this.isPaused
    });
  }

  pause() {
    this.isPaused = true;
    this.emitPlayState();
  }

  resume() {
    this.isPaused = false;
    this.emitPlayState();
  }

  togglePause() {
    if (!this.hasActiveWalkers()) {
      return false;
    }
    this.isPaused = !this.isPaused;
    this.emitPlayState();
    return this.isPaused;
  }

  /**
   * Drops an isotope into the valley.
   * @param {Object} isotope
   * @param {'gradient'|'channels'} [overrideMode]
   * @returns {AtomWalker|null}
   */
  drop(isotope, overrideMode) {
    if (!isotope) return null;

    // Clear previous walkers and persistent trails when starting a new drop
    for (const walker of this.activeWalkers) {
      walker.dispose();
    }
    this.activeWalkers = [];

    for (const trail of this.activeTrails) {
      trail.dispose();
    }
    this.activeTrails = [];

    const mode = overrideMode || this.pathMode;
    const steps = this.pathPlanner.plan(isotope, mode);

    if (!steps || steps.length === 0) {
      console.warn('Nem sikerült útvonalat tervezni az izotóphoz:', isotope);
      return null;
    }

    this.dropCounter++;
    const id = `atom_${this.dropCounter}`;
    const color = PALETTE[(this.dropCounter - 1) % PALETTE.length].clone();

    const walker = new AtomWalker(id, steps, this.energyValley, {
      color,
      hopDuration: 0.52,
      dropDuration: 0.75
    });

    this.scene.add(walker.group);
    this.activeWalkers.push(walker);
    if (walker.trail) {
      this.activeTrails.push(walker.trail);
    }

    // Unpause when dropping a new atom
    this.isPaused = false;

    // Forward walker events
    walker.on('hop', (data) => {
      this.emit('walkerHop', { ...data, totalSteps: steps.length });
    });

    walker.on('arrive', (data) => {
      this.emit('walkerArrive', data);
      // Auto-schedule walker mesh removal after 5.5 seconds of holding at bottom
      setTimeout(() => {
        if (!walker.isDisposed) {
          const idx = this.activeWalkers.indexOf(walker);
          if (idx !== -1) this.activeWalkers.splice(idx, 1);
          walker.dispose();
          this.emit('countChange', this.activeWalkers.length);
          this.emitPlayState();
        }
      }, 5500);
    });

    this.emit('drop', {
      walker,
      isotope,
      stepsCount: steps.length,
      mode
    });
    this.emit('countChange', this.activeWalkers.length);
    this.emitPlayState();

    return walker;
  }

  /**
   * Clears all active walkers and path trails immediately.
   */
  clearAll() {
    for (const walker of this.activeWalkers) {
      walker.dispose();
    }
    this.activeWalkers = [];

    for (const trail of this.activeTrails) {
      trail.dispose();
    }
    this.activeTrails = [];

    this.isPaused = false;
    this.emit('countChange', 0);
    this.emitPlayState();
  }

  /**
   * Per-frame simulation update.
   */
  update(time, deltaTime) {
    if (this.isPaused) return;

    // 1. Update walkers
    for (let i = this.activeWalkers.length - 1; i >= 0; i--) {
      const walker = this.activeWalkers[i];
      if (walker.isDisposed) {
        this.activeWalkers.splice(i, 1);
        this.emitPlayState();
        continue;
      }
      walker.update(time, deltaTime);
    }

    // 2. Update trails (fading)
    for (let i = this.activeTrails.length - 1; i >= 0; i--) {
      const trail = this.activeTrails[i];
      const isAlive = trail.update(deltaTime);
      if (!isAlive) {
        this.activeTrails.splice(i, 1);
      }
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
    this.clearAll();
    this.listeners.clear();
  }
}
