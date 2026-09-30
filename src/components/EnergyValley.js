import * as THREE from 'three';
import { VisualComponent } from '../core/VisualComponent.js';

// Color stops for binding energy per nucleon (0 MeV -> 8.8 MeV)
const COLOR_STOPS = [
  { t: 0.00, color: new THREE.Color(0xf43f5e) }, // Red/magenta (loosely bound / free nucleon)
  { t: 0.30, color: new THREE.Color(0xf97316) }, // Orange
  { t: 0.65, color: new THREE.Color(0xfbbf24) }, // Amber / Gold
  { t: 0.85, color: new THREE.Color(0x10b981) }, // Emerald Green
  { t: 1.00, color: new THREE.Color(0x38bdf8) }  // Cyan (maximum binding: Fe-56 / Ni-62)
];

function sampleGradient(t) {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const s1 = COLOR_STOPS[i];
    const s2 = COLOR_STOPS[i + 1];
    if (clamped >= s1.t && clamped <= s2.t) {
      const alpha = (clamped - s1.t) / (s2.t - s1.t);
      return s1.color.clone().lerp(s2.color, alpha);
    }
  }
  return COLOR_STOPS[COLOR_STOPS.length - 1].color.clone();
}

const _dummy = new THREE.Object3D();
const _selectedColor = new THREE.Color(0xffffff);

/**
 * EnergyValley: 3D Instanced bar representation of ~3000 isotopes in the nuclear valley.
 */
export class EnergyValley extends VisualComponent {
  /**
   * @param {string} id
   * @param {import('../data/IsotopeStore.js').IsotopeStore} isotopeStore
   * @param {Object} options
   */
  constructor(id = 'energy-valley', isotopeStore, options = {}) {
    const defaultParams = {
      scaleX: 0.7,             // Horizontal spacing for Z
      scaleZ: 0.35,            // Horizontal spacing for A
      heightScale: 2.5,        // Vertical multiplier for energy
      minHeight: 0.4,          // Minimum bar height
      barWidth: 0.52,          // Bar width along X
      barDepth: 0.32,          // Bar depth along Z
      valleyMode: true,        // true = inverted (Fe/Ni at bottom), false = normal peak
      onlyStable: false,       // Filter to stable candidate isotopes only
      zRange: [1, 94],
      aRange: [1, 244]
    };

    super(id, {
      name: 'Nukleáris Energiavölgy',
      ...options,
      parameters: {
        ...defaultParams,
        ...(options.parameters || {})
      }
    });

    this.isotopeStore = isotopeStore;
    this.instancedMesh = null;
    this.instanceColors = [];
    this.instanceMatrices = [];
    this.selectedIndex = -1;
    this.hoveredIndex = -1;

    // Selection indicator 3D marker
    this.selectionMarker = null;
    this.selectionLight = null;
  }

  build() {
    if (!this.isotopeStore || !this.isotopeStore.isLoaded) {
      return;
    }

    const count = this.isotopeStore.isotopes.length;
    const { barWidth, barDepth } = this.parameters;

    // Create unit box geometry with pivot at bottom center
    const boxGeo = new THREE.BoxGeometry(barWidth, 1.0, barDepth);
    boxGeo.translate(0, 0.5, 0);

    const material = new THREE.MeshStandardMaterial({
      roughness: 0.32,
      metalness: 0.22,
      envMapIntensity: 1.0
    });

    this.instancedMesh = new THREE.InstancedMesh(boxGeo, material, count);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.instancedMesh.name = 'IsotopeBarsMesh';

    // Selection marker: glowing wireframe box
    const markerGeo = new THREE.BoxGeometry(barWidth * 1.35, 1.0, barDepth * 1.35);
    markerGeo.translate(0, 0.5, 0);
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.95
    });
    this.selectionMarker = new THREE.Mesh(markerGeo, markerMat);
    this.selectionMarker.visible = false;
    this.group.add(this.selectionMarker);

    // Accent point light above selected isotope
    this.selectionLight = new THREE.PointLight(0xffffff, 2.5, 15);
    this.selectionLight.visible = false;
    this.group.add(this.selectionLight);

    this.group.add(this.instancedMesh);

    // Precompute instance colors once (avoids thousands of allocations on re-renders)
    const maxBeA = this.isotopeStore.maxBeA;
    this.instanceColors = new Array(count);
    for (let i = 0; i < count; i++) {
      const it = this.isotopeStore.isotopes[i];
      const t = Math.max(0, Math.min(1, it.beA / maxBeA));
      this.instanceColors[i] = sampleGradient(t);
    }

    // Calculate matrices and colors
    this.updateMeshInstances();
  }

  updateMeshInstances() {
    if (!this.instancedMesh || !this.isotopeStore) return;

    const {
      scaleX,
      scaleZ,
      heightScale,
      minHeight,
      valleyMode,
      onlyStable,
      zRange,
      aRange
    } = this.parameters;

    const maxBeA = this.isotopeStore.maxBeA;
    const isotopes = this.isotopeStore.isotopes;

    for (let i = 0; i < isotopes.length; i++) {
      const it = isotopes[i];

      // Check visibility filter
      const inZ = it.z >= zRange[0] && it.z <= zRange[1];
      const inA = it.a >= aRange[0] && it.a <= aRange[1];
      const passStable = !onlyStable || it.isStableCandidate;

      if (!inZ || !inA || !passStable) {
        _dummy.position.set(0, -999, 0);
        _dummy.scale.set(0, 0, 0);
        _dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(i, _dummy.matrix);
        continue;
      }

      const posX = (it.z - 47) * scaleX;
      const posZ = (it.a - 120) * scaleZ;

      // Vertical height
      let barHeight;
      if (valleyMode) {
        // KisFiz valley style: lower column = more bound (Fe/Ni at bottom, H-1 at top)
        const elevation = Math.max(0, maxBeA - it.beA);
        barHeight = minHeight + elevation * heightScale;
      } else {
        // Direct binding energy height: Fe/Ni is tallest
        barHeight = minHeight + it.beA * heightScale;
      }

      _dummy.position.set(posX, 0, posZ);
      _dummy.scale.set(1, barHeight, 1);
      _dummy.rotation.set(0, 0, 0);
      _dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, _dummy.matrix);

      // Fast color assignment from precomputed lookup
      const baseCol = i === this.selectedIndex ? _selectedColor : this.instanceColors[i];
      this.instancedMesh.setColorAt(i, baseCol);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    this.updateSelectionMarker();
  }

  setSelectedIndex(index) {
    if (this.selectedIndex === index) return;

    // Reset previous selection color
    if (this.selectedIndex >= 0 && this.instanceColors[this.selectedIndex]) {
      this.instancedMesh.setColorAt(this.selectedIndex, this.instanceColors[this.selectedIndex]);
    }

    this.selectedIndex = index;

    if (this.selectedIndex >= 0) {
      // Highlight selected bar in bright pure white
      this.instancedMesh.setColorAt(this.selectedIndex, _selectedColor);
    }

    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    this.updateSelectionMarker();
  }

  updateSelectionMarker() {
    if (!this.selectionMarker || this.selectedIndex < 0) {
      if (this.selectionMarker) this.selectionMarker.visible = false;
      if (this.selectionLight) this.selectionLight.visible = false;
      return;
    }

    const it = this.isotopeStore.getByIndex(this.selectedIndex);
    if (!it) {
      this.selectionMarker.visible = false;
      if (this.selectionLight) this.selectionLight.visible = false;
      return;
    }

    const { scaleX, scaleZ, heightScale, minHeight, valleyMode } = this.parameters;
    const posX = (it.z - 47) * scaleX;
    const posZ = (it.a - 120) * scaleZ;

    let barHeight;
    if (valleyMode) {
      const elevation = Math.max(0, this.isotopeStore.maxBeA - it.beA);
      barHeight = minHeight + elevation * heightScale;
    } else {
      barHeight = minHeight + it.beA * heightScale;
    }

    this.selectionMarker.visible = true;
    this.selectionMarker.position.set(posX, 0, posZ);
    this.selectionMarker.scale.set(1.1, barHeight + 0.1, 1.1);

    if (this.selectionLight) {
      this.selectionLight.visible = true;
      this.selectionLight.position.set(posX, barHeight + 1.8, posZ);
    }
  }

  getIsotopeWorldPosition(it) {
    if (!it) return null;
    const { scaleX, scaleZ, heightScale, minHeight, valleyMode } = this.parameters;
    const posX = (it.z - 47) * scaleX;
    const posZ = (it.a - 120) * scaleZ;
    let barHeight;
    if (valleyMode) {
      const elevation = Math.max(0, this.isotopeStore.maxBeA - it.beA);
      barHeight = minHeight + elevation * heightScale;
    } else {
      barHeight = minHeight + it.beA * heightScale;
    }
    return new THREE.Vector3(posX, barHeight, posZ);
  }

  onUpdate(time, deltaTime) {
    // Subtle pulsating glow on selection marker
    if (this.selectionMarker && this.selectionMarker.visible) {
      const pulse = 0.75 + Math.sin(time * 6.0) * 0.25;
      this.selectionMarker.material.opacity = pulse;
    }
  }

  onParametersChanged() {
    this.updateMeshInstances();
  }
}
