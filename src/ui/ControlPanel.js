import { BasePanel } from './BasePanel.js';
import { i18n } from '../core/i18n.js';

/**
 * ControlPanel: Left-hand HUD for valley representation settings,
 * nuclide picker trigger, atom drop trajectories, camera presets, and search.
 */
export class ControlPanel extends BasePanel {
  /**
   * @param {string} id
   * @param {Object} [options={}]
   */
  constructor(id = 'control-panel', options = {}) {
    super(id, {
      title: i18n.t('ctrlTitle'),
      icon: '⚙️',
      position: 'top-left',
      width: 330,
      ...options
    });

    this.engine = options.engine || null;
    this.energyValley = options.energyValley || null;
    this.isotopeStore = options.isotopeStore || null;

    this.currentPlayState = { isRunning: false, isPaused: false };
    this.currentActiveCount = 0;
    this.currentPathMode = 'gradient';
    this.currentValleyMode = 'valley';
    this.currentHeightScale = 2.5;
    this.currentOnlyStable = false;

    // React to global language changes
    i18n.onLanguageChange(() => {
      this.setTitle(i18n.t('ctrlTitle'));
      if (this.togglePill) {
        this.togglePill.innerHTML = `${this.icon} ${this.title}`;
      }
      if (this.bodyElement) {
        this.renderContent(this.bodyElement);
      }
    });
  }

  renderContent(body) {
    const t = (k, p) => i18n.t(k, p);

    body.innerHTML = `
      <!-- 1. Model Geometry -->
      <div class="control-section">
        <div class="section-title">${t('secGeometry')}</div>
        
        <div class="control-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <label style="font-size: 12px; color: var(--text-main);">${t('lblStyle')}</label>
          <select id="sel-valley-mode" class="glass-select" style="background: rgba(15, 23, 42, 0.85); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 3px 8px; font-size: 11px;">
            <option value="valley" ${this.currentValleyMode === 'valley' ? 'selected' : ''}>${t('optValley')}</option>
            <option value="peak" ${this.currentValleyMode === 'peak' ? 'selected' : ''}>${t('optPeak')}</option>
          </select>
        </div>

        <div class="control-row" style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: var(--text-muted); margin-bottom: 2px;">
            <span>${t('lblHeightScale')}</span>
            <span id="val-height-scale">${this.currentHeightScale.toFixed(1)}×</span>
          </div>
          <input type="range" id="slider-height-scale" min="0.5" max="5.0" step="0.1" value="${this.currentHeightScale}" style="width: 100%;">
        </div>

        <div class="checkbox-row" style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
          <input type="checkbox" id="chk-only-stable" style="cursor: pointer;" ${this.currentOnlyStable ? 'checked' : ''}>
          <label for="chk-only-stable" style="font-size: 11.5px; cursor: pointer; color: var(--text-main);">
            ${t('lblOnlyStable')}
          </label>
        </div>
      </div>

      <!-- 2. Periodic Table Nuclide Picker -->
      <div class="control-section">
        <div class="section-title">${t('secAtomPicker')}</div>
        <button id="btn-open-periodic-table" class="action-btn primary" style="width: 100%; font-weight: 700; background: rgba(56, 189, 248, 0.22); border-color: var(--accent-cyan); color: #fff; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 7px 12px;">
          ${t('btnOpenPeriodic')}
        </button>
        <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 5px; line-height: 1.35;">
          ${t('descPeriodic')}
        </div>
      </div>

      <!-- 3. Atom Drop & Valley Trajectory -->
      <div class="control-section">
        <div class="section-title">${t('secDrop')}</div>

        <div style="margin-bottom: 8px;">
          <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">${t('lblPathType')}</div>
          <div style="display: flex; gap: 4px;">
            <button id="btn-path-gradient" class="action-btn primary ${this.currentPathMode === 'gradient' ? 'active' : ''}" style="flex: 1; font-size: 10.5px; padding: 4px 6px;" title="${t('tipGradient')}">
              ${t('btnPathGradient')}
            </button>
            <button id="btn-path-channels" class="action-btn ${this.currentPathMode === 'channels' ? 'active primary' : ''}" style="flex: 1; font-size: 10.5px; padding: 4px 6px;" title="${t('tipChannels')}">
              ${t('btnPathChannels')}
            </button>
          </div>
        </div>

        <button id="btn-drop-selected" class="action-btn primary" style="width: 100%; margin-bottom: 8px; font-weight: 700; background: rgba(56, 189, 248, 0.22); border-color: var(--accent-cyan); color: #fff;">
          ${t('btnDropSelected')}
        </button>

        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.25); padding: 4px 8px; border-radius: 6px;">
          <span id="active-walkers-badge" style="font-size: 11px; color: ${this.currentActiveCount > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)'}; font-weight: 600;">
            ${t('lblActiveAtoms', { count: this.currentActiveCount })}
          </span>
          <button id="btn-clear-walkers" class="action-btn" style="font-size: 10px; padding: 2px 8px; color: #fca5a5; border-color: rgba(239,68,68,0.4);">
            ${t('btnClearWalkers')}
          </button>
        </div>
      </div>

      <!-- 4. Camera Views -->
      <div class="control-section">
        <div class="section-title">${t('secCamera')}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          <button class="action-btn cam-preset" data-preset="perspective">
            ${t('camPerspective')}
          </button>
          <button class="action-btn cam-preset" data-preset="top">
            ${t('camTop')}
          </button>
          <button class="action-btn cam-preset" data-preset="gorgewalk">
            ${t('camGorge')}
          </button>
          <button class="action-btn" id="btn-reset-cam">
            ${t('camReset')}
          </button>
        </div>
      </div>

      <!-- 5. Isotope Search -->
      <div class="control-section" style="margin-bottom: 0;">
        <div class="section-title">${t('secSearch')}</div>
        <div style="display: flex; gap: 6px;">
          <input type="text" id="inp-search-nuclide" placeholder="${t('searchPlaceholder')}" style="flex: 1; background: rgba(15, 23, 42, 0.8); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 4px 8px; font-size: 11.5px;">
          <button id="btn-do-search" class="action-btn" style="padding: 4px 10px;">${t('btnSearchJump')}</button>
        </div>
        <div id="search-feedback" style="font-size: 10.5px; color: var(--accent-gold); margin-top: 4px; min-height: 14px;"></div>
      </div>
    `;

    this.wireEvents(body);
    this.setPlayState(this.currentPlayState);
  }

  wireEvents(body) {
    // Valley / Peak representation
    const selMode = body.querySelector('#sel-valley-mode');
    selMode.addEventListener('change', () => {
      this.currentValleyMode = selMode.value;
      const isValley = this.currentValleyMode === 'valley';
      this.emit('valleyModeChange', isValley);
    });

    // Height scale
    const sliderScale = body.querySelector('#slider-height-scale');
    const valScale = body.querySelector('#val-height-scale');
    sliderScale.addEventListener('input', () => {
      this.currentHeightScale = parseFloat(sliderScale.value);
      valScale.textContent = `${this.currentHeightScale.toFixed(1)}×`;
      this.emit('heightScaleChange', this.currentHeightScale);
    });

    // Stable only
    const chkStable = body.querySelector('#chk-only-stable');
    chkStable.addEventListener('change', () => {
      this.currentOnlyStable = chkStable.checked;
      this.emit('stableFilterChange', this.currentOnlyStable);
    });

    // Atom Drop & Path Mode
    const btnOpenPeriodic = body.querySelector('#btn-open-periodic-table');
    if (btnOpenPeriodic) {
      btnOpenPeriodic.addEventListener('click', () => {
        this.emit('openPeriodicTable');
      });
    }

    const btnPathGrad = body.querySelector('#btn-path-gradient');
    const btnPathChan = body.querySelector('#btn-path-channels');

    btnPathGrad.addEventListener('click', () => {
      this.currentPathMode = 'gradient';
      btnPathGrad.classList.add('active', 'primary');
      btnPathChan.classList.remove('active', 'primary');
      this.emit('pathModeChange', 'gradient');
    });

    btnPathChan.addEventListener('click', () => {
      this.currentPathMode = 'channels';
      btnPathChan.classList.add('active', 'primary');
      btnPathGrad.classList.remove('active', 'primary');
      this.emit('pathModeChange', 'channels');
    });

    body.querySelector('#btn-drop-selected').addEventListener('click', () => {
      this.emit('dropOrPause');
    });

    body.querySelector('#btn-clear-walkers').addEventListener('click', () => {
      this.emit('clearWalkers');
    });

    // Camera presets
    body.querySelectorAll('.cam-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        this.emit('cameraPreset', preset === 'gorgewalk' ? 'gorge' : preset);
      });
    });

    body.querySelector('#btn-reset-cam').addEventListener('click', () => {
      this.emit('cameraPreset', 'perspective');
    });

    // Search
    const inpSearch = body.querySelector('#inp-search-nuclide');
    const btnSearch = body.querySelector('#btn-do-search');
    const searchFeedback = body.querySelector('#search-feedback');

    inpSearch.addEventListener('focus', () => {
      inpSearch.select();
    });

    const doSearch = () => {
      const query = inpSearch.value.trim();
      if (!query) return;
      this.emit('search', { query, feedbackEl: searchFeedback });
    };

    btnSearch.addEventListener('click', doSearch);
    inpSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
    });
  }

  setPlayState({ isRunning, isPaused }) {
    this.currentPlayState = { isRunning, isPaused };
    if (!this.panelElement) return;
    const btnDrop = this.panelElement.querySelector('#btn-drop-selected');
    if (!btnDrop) return;
    if (isRunning) {
      if (isPaused) {
        btnDrop.innerHTML = i18n.t('btnDropSelectedPaused');
        btnDrop.style.background = 'rgba(16, 185, 129, 0.25)';
        btnDrop.style.borderColor = 'var(--accent-green)';
        btnDrop.style.color = '#fff';
      } else {
        btnDrop.innerHTML = i18n.t('btnDropSelectedRunning');
        btnDrop.style.background = 'rgba(245, 158, 11, 0.25)';
        btnDrop.style.borderColor = 'var(--accent-gold)';
        btnDrop.style.color = '#fff';
      }
    } else {
      btnDrop.innerHTML = i18n.t('btnDropSelected');
      btnDrop.style.background = 'rgba(56, 189, 248, 0.22)';
      btnDrop.style.borderColor = 'var(--accent-cyan)';
      btnDrop.style.color = '#fff';
    }
  }

  setActiveWalkersCount(count) {
    this.currentActiveCount = count;
    if (!this.panelElement) return;
    const badge = this.panelElement.querySelector('#active-walkers-badge');
    if (badge) {
      badge.textContent = i18n.t('lblActiveAtoms', { count });
      badge.style.color = count > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)';
    }
  }

  setPathModeDisplay(mode) {
    this.currentPathMode = mode;
    if (!this.panelElement) return;
    const btnGrad = this.panelElement.querySelector('#btn-path-gradient');
    const btnChan = this.panelElement.querySelector('#btn-path-channels');
    if (btnGrad && btnChan) {
      if (mode === 'channels') {
        btnChan.classList.add('active', 'primary');
        btnGrad.classList.remove('active', 'primary');
      } else {
        btnGrad.classList.add('active', 'primary');
        btnChan.classList.remove('active', 'primary');
      }
    }
  }
}
