/**
 * PeriodicTableModal: Interactive 18-column periodic table popup (Z = 1..94)
 * allowing users to select elements and their isotopes, view binding energies,
 * jump directly to them in the 3D nuclear valley, or drop them to walk down the valley floor.
 * Fully localized for English (EN) and Hungarian (HU).
 */
import { i18n } from '../core/i18n.js';

function getGridPosition(z) {
  if (z === 1) return { r: 1, c: 1 };
  if (z === 2) return { r: 1, c: 18 };
  if (z >= 3 && z <= 4) return { r: 2, c: z - 2 };
  if (z >= 5 && z <= 10) return { r: 2, c: z + 8 };
  if (z >= 11 && z <= 12) return { r: 3, c: z - 10 };
  if (z >= 13 && z <= 18) return { r: 3, c: z };
  if (z >= 19 && z <= 36) return { r: 4, c: z - 18 };
  if (z >= 37 && z <= 54) return { r: 5, c: z - 36 };
  if (z >= 55 && z <= 56) return { r: 6, c: z - 54 };
  if (z >= 57 && z <= 71) return { r: 8, c: z - 57 + 3 }; // Lanthanides row 8, cols 3..17
  if (z >= 72 && z <= 86) return { r: 6, c: z - 72 + 4 };
  if (z >= 87 && z <= 88) return { r: 7, c: z - 86 };
  if (z >= 89 && z <= 94) return { r: 9, c: z - 89 + 3 }; // Actinides row 9, cols 3..8
  return { r: 1, c: 1 };
}

function getCategoryId(z) {
  if ([2, 10, 18, 36, 54, 86].includes(z)) return 'noble';
  if ([9, 17, 35, 53, 85].includes(z)) return 'halogen';
  if (z === 1 || [6, 7, 8, 15, 16, 34].includes(z)) return 'nonmetal';
  if ([5, 14, 32, 33, 51, 52].includes(z)) return 'metalloid';
  if ([3, 11, 19, 37, 55, 87].includes(z)) return 'alkali';
  if ([4, 12, 20, 38, 56, 88].includes(z)) return 'alkaline';
  if (z >= 57 && z <= 71) return 'lanthanide';
  if (z >= 89 && z <= 94) return 'actinide';
  if ([13, 31, 49, 50, 81, 82, 83, 84].includes(z)) return 'post-transition';
  return 'transition';
}

export class PeriodicTableModal {
  /**
   * @param {import('../data/IsotopeStore.js').IsotopeStore} isotopeStore
   */
  constructor(isotopeStore) {
    this.isotopeStore = isotopeStore;
    this.backdropElement = null;
    this.modalElement = null;
    this.isOpen = false;

    this.selectedZ = 26; // Default to Iron (Fe)
    this.selectedIsotope = null;
    this.currentPlayState = { isRunning: false, isPaused: false };

    this.listeners = new Map();
    this._onKeyDown = this.onKeyDown.bind(this);

    this.init();

    i18n.onLanguageChange(() => {
      this.updateStaticTexts();
      this.renderGrid();
      this.selectElement(this.selectedZ);
    });
  }

  init() {
    this.backdropElement = document.createElement('div');
    this.backdropElement.id = 'periodic-table-modal-backdrop';
    this.backdropElement.className = 'modal-backdrop';
    this.backdropElement.style.display = 'none';

    const t = (k, p) => i18n.t(k, p);

    this.backdropElement.innerHTML = `
      <div class="modal-dialog glass-panel periodic-modal">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="panel-icon">📋</span>
            <div class="modal-heading">
              <span class="modal-title" id="modal-header-title">${t('modalTitle')}</span>
              <span class="modal-subtitle" id="modal-header-subtitle">${t('modalSubtitle')}</span>
            </div>
          </div>
          <button class="modal-btn-close" id="modal-btn-close-header" title="${t('modalBtnClose')}">✕</button>
        </div>

        <div class="modal-body">
          <!-- 18-Column Periodic Table Grid -->
          <div class="periodic-grid-scroll">
            <div class="periodic-grid" id="periodic-elements-grid"></div>
          </div>

          <!-- Bottom Isotope Drawer -->
          <div class="isotope-drawer" id="periodic-isotope-drawer">
            <div class="drawer-header" id="drawer-header-info">
              <div class="drawer-element-title">
                <span id="drawer-el-symbol" class="drawer-symbol">Fe</span>
                <div>
                  <div id="drawer-el-name" class="drawer-name">Iron (Z = 26)</div>
                  <div id="drawer-el-cat" class="drawer-cat">Transition Metal</div>
                </div>
              </div>

              <div class="drawer-actions">
                <button id="btn-modal-jump" class="action-btn" title="Highlight nuclide in 3D valley">
                  ${t('modalBtnJump')}
                </button>
                <button id="btn-modal-drop" class="action-btn primary" title="Drop atom into valley / pause">
                  ${t('modalBtnDrop')}
                </button>
              </div>
            </div>

            <div class="drawer-chips-wrap">
              <div class="drawer-chips-label" id="modal-lbl-isotopes">${t('modalIsotopesLabel')}</div>
              <div class="isotope-chips-list" id="drawer-isotopes-list"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.backdropElement);

    // Event listeners
    const btnClose = this.backdropElement.querySelector('.modal-btn-close');
    btnClose.addEventListener('click', () => this.close());

    this.backdropElement.addEventListener('click', (e) => {
      if (e.target === this.backdropElement) {
        this.close();
      }
    });

    // Wire action buttons
    const btnJump = this.backdropElement.querySelector('#btn-modal-jump');
    btnJump.addEventListener('click', () => {
      if (this.selectedIsotope) {
        this.emit('select', this.selectedIsotope);
        this.close();
      }
    });

    const btnDrop = this.backdropElement.querySelector('#btn-modal-drop');
    btnDrop.addEventListener('click', () => {
      if (this.currentPlayState && this.currentPlayState.isRunning) {
        this.emit('togglePause');
        if (this.currentPlayState.isPaused) {
          this.close();
        }
      } else if (this.selectedIsotope) {
        this.emit('drop', this.selectedIsotope);
        this.close();
      }
    });

    this.renderGrid();
    this.selectElement(26); // Default to Iron
  }

  updateStaticTexts() {
    if (!this.backdropElement) return;
    const t = (k, p) => i18n.t(k, p);

    const titleEl = this.backdropElement.querySelector('#modal-header-title');
    const subtitleEl = this.backdropElement.querySelector('#modal-header-subtitle');
    const closeEl = this.backdropElement.querySelector('#modal-btn-close-header');
    const jumpEl = this.backdropElement.querySelector('#btn-modal-jump');
    const chipsLbl = this.backdropElement.querySelector('#modal-lbl-isotopes');

    if (titleEl) titleEl.textContent = t('modalTitle');
    if (subtitleEl) subtitleEl.textContent = t('modalSubtitle');
    if (closeEl) closeEl.title = t('modalBtnClose');
    if (jumpEl) jumpEl.innerHTML = t('modalBtnJump');
    if (chipsLbl) chipsLbl.textContent = t('modalIsotopesLabel');

    this.setPlayState(this.currentPlayState);
  }

  setPlayState({ isRunning, isPaused }) {
    this.currentPlayState = { isRunning, isPaused };
    if (!this.backdropElement) return;
    const btnDrop = this.backdropElement.querySelector('#btn-modal-drop');
    if (!btnDrop) return;
    const t = (k, p) => i18n.t(k, p);

    if (isRunning) {
      if (isPaused) {
        btnDrop.innerHTML = t('modalBtnResume');
        btnDrop.style.background = 'rgba(16, 185, 129, 0.25)';
        btnDrop.style.borderColor = 'var(--accent-green)';
        btnDrop.style.color = '#fff';
      } else {
        btnDrop.innerHTML = t('modalBtnPause');
        btnDrop.style.background = 'rgba(245, 158, 11, 0.25)';
        btnDrop.style.borderColor = 'var(--accent-gold)';
        btnDrop.style.color = '#fff';
      }
    } else {
      btnDrop.innerHTML = t('modalBtnDrop');
      btnDrop.style.background = 'rgba(56, 189, 248, 0.22)';
      btnDrop.style.borderColor = 'var(--accent-cyan)';
      btnDrop.style.color = '#fff';
    }
  }

  renderGrid() {
    const gridEl = this.backdropElement.querySelector('#periodic-elements-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    // Render Lanthanide / Actinide placeholders in main grid
    const lanthHolder = document.createElement('div');
    lanthHolder.className = 'element-tile placeholder-tile';
    lanthHolder.style.gridRow = '6';
    lanthHolder.style.gridColumn = '3';
    lanthHolder.innerHTML = `<span class="tile-z">57-71</span><span class="tile-sym">La-Lu</span>`;
    gridEl.appendChild(lanthHolder);

    const actHolder = document.createElement('div');
    actHolder.className = 'element-tile placeholder-tile';
    actHolder.style.gridRow = '7';
    actHolder.style.gridColumn = '3';
    actHolder.innerHTML = `<span class="tile-z">89-94</span><span class="tile-sym">Ac-Pu</span>`;
    gridEl.appendChild(actHolder);

    // Render all elements 1..94
    for (let z = 1; z <= 94; z++) {
      const isotopes = this.isotopeStore.getByZ(z);
      if (!isotopes || isotopes.length === 0) continue;

      const first = isotopes[0];
      const elInfo = i18n.getElement(z);
      const pos = getGridPosition(z);
      const catId = getCategoryId(z);
      const cat = i18n.getCategory(catId);

      const tile = document.createElement('button');
      tile.className = `element-tile tile-cat-${catId} ${z === this.selectedZ ? 'active' : ''}`;
      tile.dataset.z = z;
      tile.style.gridRow = String(pos.r);
      tile.style.gridColumn = String(pos.c);
      tile.style.setProperty('--cat-color', cat.color);

      tile.innerHTML = `
        <span class="tile-z">${z}</span>
        <span class="tile-sym">${first.symbol}</span>
        <span class="tile-name">${elInfo.name}</span>
      `;

      tile.addEventListener('click', () => {
        this.selectElement(z);
      });

      gridEl.appendChild(tile);
    }
  }

  selectElement(z) {
    this.selectedZ = z;
    const isotopes = this.isotopeStore.getByZ(z);
    if (!isotopes || isotopes.length === 0) return;

    // Highlight active element in periodic grid
    this.backdropElement.querySelectorAll('.element-tile').forEach(t => {
      t.classList.toggle('active', parseInt(t.dataset.z, 10) === z);
    });

    const first = isotopes[0];
    const elInfo = i18n.getElement(z);
    const catId = getCategoryId(z);
    const cat = i18n.getCategory(catId);

    // Update Drawer Header
    const elSym = this.backdropElement.querySelector('#drawer-el-symbol');
    const elName = this.backdropElement.querySelector('#drawer-el-name');
    const elCat = this.backdropElement.querySelector('#drawer-el-cat');

    if (elSym) {
      elSym.textContent = first.symbol;
      elSym.style.borderColor = cat.color;
      elSym.style.color = cat.color;
    }
    if (elName) elName.textContent = `${elInfo.name} (Z = ${z})`;
    if (elCat) elCat.textContent = cat.name;

    // Render Isotope Chips
    const chipsList = this.backdropElement.querySelector('#drawer-isotopes-list');
    if (!chipsList) return;
    chipsList.innerHTML = '';

    // Default select stable isotope or one closest to valley floor
    let bestIso = isotopes.find(it => it.isStableCandidate) || isotopes[Math.floor(isotopes.length / 2)];
    this.selectedIsotope = bestIso;

    const t = (k, p) => i18n.t(k, p);

    isotopes.forEach(iso => {
      const chip = document.createElement('button');
      const isSelected = iso === this.selectedIsotope;
      chip.className = `iso-chip ${isSelected ? 'active' : ''} ${iso.isStableCandidate ? 'stable' : 'unstable'}`;

      chip.innerHTML = `
        <span class="iso-chip-sym"><sup>${iso.a}</sup>${iso.symbol}</span>
        <span class="iso-chip-bea">${iso.beA.toFixed(2)} MeV/A</span>
        ${iso.isStableCandidate ? `<span class="iso-chip-tag">${t('tagStable')}</span>` : ''}
      `;

      chip.addEventListener('click', () => {
        this.selectedIsotope = iso;
        chipsList.querySelectorAll('.iso-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });

      // Double-click drops the isotope immediately
      chip.addEventListener('dblclick', () => {
        this.selectedIsotope = iso;
        this.emit('drop', iso);
        this.close();
      });

      chipsList.appendChild(chip);
    });
  }

  open(initialZ) {
    this.isOpen = true;
    if (this.backdropElement) {
      this.backdropElement.style.display = 'flex';
      // Trigger smooth CSS fade-in
      requestAnimationFrame(() => {
        this.backdropElement.classList.add('modal-visible');
      });
    }

    if (initialZ && initialZ >= 1 && initialZ <= 94) {
      this.selectElement(initialZ);
    } else {
      this.selectElement(this.selectedZ);
    }

    window.addEventListener('keydown', this._onKeyDown);
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    if (this.backdropElement) {
      this.backdropElement.classList.remove('modal-visible');
      setTimeout(() => {
        if (!this.isOpen && this.backdropElement) {
          this.backdropElement.style.display = 'none';
        }
      }, 200);
    }
    window.removeEventListener('keydown', this._onKeyDown);
  }

  onKeyDown(e) {
    if (e.key === 'Escape') {
      this.close();
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
