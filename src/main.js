import * as THREE from 'three';
import { Engine } from './core/Engine.js';
import { IsotopeStore } from './data/IsotopeStore.js';
import { GroundPlane } from './components/GroundPlane.js';
import { ValleyAxes } from './components/ValleyAxes.js';
import { EnergyValley } from './components/EnergyValley.js';
import { ControlPanel } from './ui/ControlPanel.js';
import { DisplayPanel } from './ui/DisplayPanel.js';
import { PeriodicTableModal } from './ui/PeriodicTableModal.js';
import { InteractionManager } from './core/InteractionManager.js';
import { DropManager } from './core/DropManager.js';
import { i18n } from './core/i18n.js';

async function bootstrap() {
  try {
    const container = document.getElementById('canvas-container');
    if (!container) {
      throw new Error('Canvas container #canvas-container nem található!');
    }

    // 1. Initialize Engine (Scene, Renderer, Dual Navigation)
    const engine = new Engine(container);

    // 2. Load Nuclear AME Dataset
    const isotopeStore = new IsotopeStore();
    try {
      await isotopeStore.load('./data/isotopes.json');
    } catch (err) {
      console.error('Hiba az izotóp adatbázis betöltésekor:', err);
    }

    // 3. Add 3D Components
    const groundPlane = new GroundPlane('ground-plane');
    engine.addComponent(groundPlane);

    const valleyAxes = new ValleyAxes('valley-axes', {
      parameters: {
        zMin: 1,
        zMax: 94,
        aMin: 1,
        aMax: 244,
        scaleX: 0.7,
        scaleZ: 0.35,
        heightMax: 22
      }
    });
    engine.addComponent(valleyAxes);

    const energyValley = new EnergyValley('energy-valley', isotopeStore, {
      parameters: {
        scaleX: 0.7,
        scaleZ: 0.35,
        heightScale: 2.5,
        valleyMode: true
      }
    });
    engine.addComponent(energyValley);

    // 4. Initialize HUD Panels
    const controlPanel = new ControlPanel('ctrl-panel', {
      engine,
      energyValley,
      isotopeStore
    });
    controlPanel.mount(document.body);

    const displayPanel = new DisplayPanel('disp-panel', {
      position: 'top-right'
    });
    displayPanel.mount(document.body);

    // 5. Initialize Interaction Manager (Raycasting & Selection)
    const interactionManager = new InteractionManager(engine, energyValley);

    // 6. Initialize Drop Manager (Atom Trajectories & Fading Trails)
    const dropManager = new DropManager(engine.scene, energyValley, isotopeStore);
    engine.onFrame = (dt) => {
      dropManager.update(engine.clock.getElapsedTime(), dt);
    };

    // 7. Initialize Periodic Table Picker Modal
    const periodicTableModal = new PeriodicTableModal(isotopeStore);

    let currentSelectedIsotope = null;

    // 8. Navigation & Drop Helpers
    const jumpToIsotope = (it) => {
      if (!it) return;

      currentSelectedIsotope = it;
      interactionManager.selectIsotope(it);
      displayPanel.setIsotope(it);

      const worldPos = energyValley.getIsotopeWorldPosition(it);
      if (worldPos) {
        // Position camera slightly offset from the nuclide
        const camPos = worldPos.clone().add({ x: 0, y: 5.5, z: 12.0 });
        engine.flyTo(camPos, worldPos, 1.2);
      }
    };

    const performDropWithZoom = (it) => {
      if (!it) return;

      currentSelectedIsotope = it;
      interactionManager.selectIsotope(it);
      displayPanel.setIsotope(it);

      // No rotation on drop: if camera is zoomed too close, gently pull back along current line of sight
      if (engine.controls) {
        const target = engine.controls.target;
        const dir = new THREE.Vector3().subVectors(engine.camera.position, target);
        const currentDist = dir.length();
        if (currentDist < 55.0 && dir.lengthSq() > 0.001) {
          const newCamPos = target.clone().addScaledVector(dir.normalize(), 60.0);
          engine.flyTo(newCamPos, target, 0.75);
        }
      }

      dropManager.drop(it);
    };

    const jumpToNuclide = (target) => {
      if (!target) return;
      if (typeof target === 'object' && target.z && target.a) {
        jumpToIsotope(target);
        return;
      }
      const specials = isotopeStore.getSpecialNuclides();
      const it = specials[target] || isotopeStore.search(String(target))[0];
      if (it) {
        jumpToIsotope(it);
      }
    };

    // 9. Internationalization (EN / HU)
    const applyLanguage = (lang) => {
      document.documentElement.lang = lang;
      document.title = i18n.t('pageTitle');

      const elBadge = document.getElementById('header-brand-badge');
      const elTitle = document.getElementById('header-app-title');
      const elSubtitle = document.getElementById('header-app-subtitle');
      const elHint = document.getElementById('controls-hint');

      if (elBadge) elBadge.textContent = i18n.t('brandBadge');
      if (elTitle) elTitle.textContent = i18n.t('appTitle');
      if (elSubtitle) elSubtitle.textContent = i18n.t('appSubtitle');
      if (elHint) elHint.innerHTML = i18n.t('controlsHint');

      const chipFe = document.getElementById('chip-jump-fe56');
      const chipNi = document.getElementById('chip-jump-ni62');
      const chipH = document.getElementById('chip-jump-h1');
      const chipU = document.getElementById('chip-jump-u235');

      if (chipFe) chipFe.title = i18n.t('jumpFe56');
      if (chipNi) chipNi.title = i18n.t('jumpNi62');
      if (chipH) chipH.title = i18n.t('jumpH1');
      if (chipU) chipU.title = i18n.t('jumpU235');

      const linkDocs = document.getElementById('link-docs');
      const textDocs = document.getElementById('text-link-docs');
      if (linkDocs) {
        linkDocs.title = i18n.t('tipLinkDocs');
        linkDocs.href = (lang === 'en') ? '../en/' : '../';
      }
      if (textDocs) {
        textDocs.textContent = i18n.t('linkDocs');
      }

      const btnEn = document.getElementById('btn-lang-en');
      const btnHu = document.getElementById('btn-lang-hu');
      if (btnEn && btnHu) {
        btnEn.classList.toggle('active', lang === 'en');
        btnHu.classList.toggle('active', lang === 'hu');
      }

      if (currentSelectedIsotope) {
        displayPanel.setIsotope(currentSelectedIsotope);
      }
    };

    const btnEn = document.getElementById('btn-lang-en');
    const btnHu = document.getElementById('btn-lang-hu');

    if (btnEn) {
      btnEn.addEventListener('click', () => {
        i18n.setLanguage('en');
      });
    }

    if (btnHu) {
      btnHu.addEventListener('click', () => {
        i18n.setLanguage('hu');
      });
    }

    i18n.onLanguageChange((lang) => {
      applyLanguage(lang);
    });

    // Apply initial language (defaults to 'en')
    applyLanguage(i18n.getLanguage());

    // 10. Wire UI Events
    // Top Header Quick Jump Chips
    document.querySelectorAll('.btn-jump').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        jumpToNuclide(target);
      });
    });

    // ControlPanel Geometry & Views
    controlPanel.on('valleyModeChange', (isValley) => {
      energyValley.setParameters({ valleyMode: isValley });
      valleyAxes.setParameters({
        heightMax: isValley ? 22 : 22
      });
    });

    controlPanel.on('heightScaleChange', (scale) => {
      energyValley.setParameters({ heightScale: scale });
    });

    controlPanel.on('stableFilterChange', (onlyStable) => {
      energyValley.setParameters({ onlyStable });
    });

    controlPanel.on('quickJump', (target) => {
      jumpToNuclide(target);
    });

    controlPanel.on('cameraPreset', (preset) => {
      engine.setCameraPreset(preset);
    });

    controlPanel.on('search', ({ query, feedbackEl }) => {
      const results = isotopeStore.search(query);
      if (results.length > 0) {
        const first = results[0];
        jumpToIsotope(first);
        if (feedbackEl) {
          const elInfo = i18n.getElement(first.z);
          const elName = elInfo ? elInfo.name : (first.nameEn || first.nameHu || '');
          feedbackEl.textContent = i18n.t('searchMatch', {
            a: first.a,
            sym: first.symbol,
            name: elName,
            z: first.z
          });
          feedbackEl.style.color = 'var(--accent-cyan)';
        }
      } else {
        if (feedbackEl) {
          feedbackEl.textContent = i18n.t('searchNotFound', { query });
          feedbackEl.style.color = '#f87171';
        }
      }
    });

    // ControlPanel & Modal Play/Pause & Drop Events
    controlPanel.on('pathModeChange', (mode) => {
      dropManager.setPathMode(mode);
    });

    controlPanel.on('openPeriodicTable', () => {
      periodicTableModal.open(currentSelectedIsotope ? currentSelectedIsotope.z : 26);
    });

    periodicTableModal.on('select', (it) => {
      jumpToIsotope(it);
    });

    periodicTableModal.on('drop', (it) => {
      performDropWithZoom(it);
    });

    periodicTableModal.on('togglePause', () => {
      dropManager.togglePause();
    });

    controlPanel.on('dropOrPause', () => {
      if (dropManager.hasActiveWalkers()) {
        dropManager.togglePause();
      } else if (currentSelectedIsotope) {
        performDropWithZoom(currentSelectedIsotope);
      }
    });

    controlPanel.on('clearWalkers', () => {
      dropManager.clearAll();
      displayPanel.clearWalkerTelemetry();
    });

    // Drop from 3D scene (Shift+click or double-click)
    interactionManager.on('dropIsotope', (isotope) => {
      performDropWithZoom(isotope);
    });

    // DropManager Telemetry & Play State
    dropManager.on('playStateChange', (state) => {
      controlPanel.setPlayState(state);
      periodicTableModal.setPlayState(state);
    });

    // DropManager Telemetry
    dropManager.on('countChange', (count) => {
      controlPanel.setActiveWalkersCount(count);
    });

    dropManager.on('drop', ({ walker }) => {
      if (walker) {
        displayPanel.resetWalkerLog(walker.id);
      }
    });

    dropManager.on('walkerHop', (data) => {
      displayPanel.setWalkerTelemetry(data);
    });

    dropManager.on('walkerArrive', (data) => {
      const totalSteps = data.walker?.pathSteps?.length || ((data.finalStep?.step || 0) + 1);
      const stepIdx = (data.finalStep?.step !== undefined) ? data.finalStep.step : (totalSteps - 1);
      displayPanel.setWalkerTelemetry({
        ...data,
        step: data.finalStep,
        stepIdx,
        totalSteps,
        isFinal: true
      });
    });

    // Interaction Manager events
    interactionManager.on('select', (isotope) => {
      currentSelectedIsotope = isotope;
      displayPanel.setIsotope(isotope);
    });

    // Default selection: Fe-56 (the hallmark valley floor nuclide)
    const fe56 = isotopeStore.get(26, 56);
    if (fe56) {
      currentSelectedIsotope = fe56;
      interactionManager.selectIsotope(fe56);
      displayPanel.setIsotope(fe56);
    }

    // 8. Start Rendering Loop
    engine.start();
    console.log('⚛️ Nukleáris Energiavölgy 3D sikeresen elindult!');
  } catch (err) {
    console.error('BOOTSTRAP ERROR:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

