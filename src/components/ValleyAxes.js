import * as THREE from 'three';
import { VisualComponent } from '../core/VisualComponent.js';
import { i18n } from '../core/i18n.js';

/**
 * Creates a billboard text sprite using 2D canvas.
 */
function createTextSprite(text, options = {}) {
  const fontFace = options.fontFace || 'Inter, -apple-system, sans-serif';
  const fontSize = options.fontSize || 36;
  const fontColor = options.color || '#38bdf8';
  const bgColor = options.bgColor || 'rgba(4, 6, 13, 0.85)';
  const borderColor = options.borderColor || 'rgba(56, 189, 248, 0.4)';
  const padding = options.padding || 12;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  ctx.font = `600 ${fontSize}px ${fontFace}`;
  const textMetrics = ctx.measureText(text);
  const textWidth = Math.ceil(textMetrics.width);
  const textHeight = Math.ceil(fontSize * 1.3);

  canvas.width = textWidth + padding * 2;
  canvas.height = textHeight + padding * 2;

  // Re-set font after canvas resize
  ctx.font = `600 ${fontSize}px ${fontFace}`;
  ctx.imageSmoothingEnabled = true;

  // Background box
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  const radius = 8;
  const w = canvas.width;
  const h = canvas.height;

  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(w - radius, 0);
  ctx.quadraticCurveTo(w, 0, w, radius);
  ctx.lineTo(w, h - radius);
  ctx.quadraticCurveTo(w, h, w - radius, h);
  ctx.lineTo(radius, h);
  ctx.quadraticCurveTo(0, h, 0, h - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.fillStyle = fontColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  const aspect = canvas.width / canvas.height;
  const scale = options.scale || 4.5;
  sprite.scale.set(scale * aspect, scale, 1.0);

  return sprite;
}

/**
 * ValleyAxes: 3D coordinate frame, axes lines, magic number markers, and tick labels.
 */
export class ValleyAxes extends VisualComponent {
  constructor(id = 'valley-axes', options = {}) {
    const defaultParams = {
      zMin: 1,
      zMax: 94,
      aMin: 1,
      aMax: 244,
      scaleX: 0.7,
      scaleZ: 0.35,
      heightMax: 22
    };

    super(id, {
      name: 'Valley Coordinate Frame',
      ...options,
      parameters: {
        ...defaultParams,
        ...(options.parameters || {})
      }
    });

    i18n.onLanguageChange(() => {
      this.rebuild();
    });
  }

  build() {
    this.rebuild();
  }

  rebuild() {
    // Clear previous children
    while (this.group.children.length > 0) {
      const obj = this.group.children[0];
      this.group.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }

    const { zMin, zMax, aMin, aMax, scaleX, scaleZ, heightMax } = this.parameters;

    const xMin = (zMin - 47) * scaleX;
    const xMax = (zMax - 47) * scaleX;
    const zPosMin = (aMin - 120) * scaleZ;
    const zPosMax = (aMax - 120) * scaleZ;
    const yBase = 0;

    // Line material
    const axisMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      linewidth: 2
    });

    const faintMat = new THREE.LineBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.35
    });

    const magicMat = new THREE.LineDashedMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.5,
      dashSize: 1,
      gapSize: 0.8
    });

    // 1. Z-axis (Rendszám, X irány)
    const zAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(xMin - 2, yBase, zPosMin - 3),
      new THREE.Vector3(xMax + 5, yBase, zPosMin - 3)
    ]);
    const zAxisLine = new THREE.Line(zAxisGeo, axisMat);
    this.group.add(zAxisLine);

    // 2. A-axis (Tömegszám, Z irány)
    const aAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(xMin - 3, yBase, zPosMin - 2),
      new THREE.Vector3(xMin - 3, yBase, zPosMax + 5)
    ]);
    const aAxisLine = new THREE.Line(aAxisGeo, axisMat);
    this.group.add(aAxisLine);

    // 3. Vertical Height Axis (Energia, Y irány)
    const yAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(xMin - 3, yBase, zPosMin - 3),
      new THREE.Vector3(xMin - 3, heightMax + 3, zPosMin - 3)
    ]);
    const yAxisLine = new THREE.Line(yAxisGeo, axisMat);
    this.group.add(yAxisLine);

    // Axis Labels
    const zLabel = createTextSprite(i18n.t('axisZ'), {
      color: '#38bdf8',
      scale: 3.2,
      borderColor: 'rgba(56, 189, 248, 0.5)'
    });
    zLabel.position.set((xMin + xMax) / 2, yBase + 1.2, zPosMin - 7);
    this.group.add(zLabel);

    const aLabel = createTextSprite(i18n.t('axisA'), {
      color: '#38bdf8',
      scale: 3.2,
      borderColor: 'rgba(56, 189, 248, 0.5)'
    });
    aLabel.position.set(xMin - 9, yBase + 1.2, (zPosMin + zPosMax) / 2);
    this.group.add(aLabel);

    const yLabel = createTextSprite(i18n.t('axisY'), {
      color: '#fbbf24',
      scale: 3.0,
      borderColor: 'rgba(251, 191, 36, 0.5)'
    });
    yLabel.position.set(xMin - 6, heightMax + 2.5, zPosMin - 3);
    this.group.add(yLabel);

    // Magic numbers in nuclear physics (Z: 2, 8, 20, 28, 50, 82)
    const magicZ = [
      { z: 2, label: 'He (Z=2)' },
      { z: 8, label: 'O (Z=8)' },
      { z: 20, label: 'Ca (Z=20)' },
      { z: 28, label: 'Ni (Z=28)' },
      { z: 50, label: 'Sn (Z=50)' },
      { z: 82, label: 'Pb (Z=82)' }
    ];

    magicZ.forEach(({ z, label }) => {
      const posX = (z - 47) * scaleX;
      // Grid line along A-axis
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(posX, yBase, zPosMin - 2),
        new THREE.Vector3(posX, yBase, zPosMax + 2)
      ]);
      const magicLine = new THREE.Line(lineGeo, magicMat);
      magicLine.computeLineDistances();
      this.group.add(magicLine);

      // Label at axis
      const tickSprite = createTextSprite(`Z=${z}`, {
        color: '#f59e0b',
        scale: 1.8,
        fontSize: 28,
        bgColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(245, 158, 11, 0.4)'
      });
      tickSprite.position.set(posX, yBase + 0.8, zPosMin - 4.5);
      this.group.add(tickSprite);
    });

    // Mass number ticks (A = 50, 100, 150, 200)
    [50, 100, 150, 200].forEach(a => {
      const posZ = (a - 120) * scaleZ;
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(xMin - 2, yBase, posZ),
        new THREE.Vector3(xMax + 2, yBase, posZ)
      ]);
      const faintLine = new THREE.Line(lineGeo, faintMat);
      this.group.add(faintLine);

      const tickSprite = createTextSprite(`A=${a}`, {
        color: '#94a3b8',
        scale: 1.8,
        fontSize: 28,
        bgColor: 'rgba(15, 23, 42, 0.85)',
        borderColor: 'rgba(148, 163, 184, 0.3)'
      });
      tickSprite.position.set(xMin - 5.5, yBase + 0.8, posZ);
      this.group.add(tickSprite);
    });
  }

  onParametersChanged() {
    this.rebuild();
  }
}
