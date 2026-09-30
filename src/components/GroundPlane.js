import * as THREE from 'three';
import { VisualComponent } from '../core/VisualComponent.js';

/**
 * GroundPlane: Dark sci-fi floor with coordinates grid and radial attenuation.
 */
export class GroundPlane extends VisualComponent {
  constructor(id = 'ground-plane', options = {}) {
    const defaultParams = {
      size: 200,
      divisions: 40,
      y: -0.1,
      colorGrid: 0x1e293b,
      colorCenter: 0x38bdf8
    };

    super(id, {
      name: 'Ground Plane Grid',
      ...options,
      parameters: {
        ...defaultParams,
        ...(options.parameters || {})
      }
    });
  }

  build() {
    const { size, divisions, y, colorGrid, colorCenter } = this.parameters;

    // Grid helper
    const grid = new THREE.GridHelper(size, divisions, colorCenter, colorGrid);
    grid.position.y = y;
    if (grid.material) {
      grid.material.transparent = true;
      grid.material.opacity = 0.35;
      grid.material.depthWrite = false;
    }
    this.group.add(grid);

    // Subtle dark circular platform beneath the valley
    const discGeo = new THREE.CircleGeometry(size * 0.65, 64);
    discGeo.rotateX(-Math.PI / 2);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x070c18,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.position.y = y - 0.05;
    this.group.add(discMesh);
  }
}
