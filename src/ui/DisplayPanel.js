import { BasePanel } from './BasePanel.js';
import { i18n } from '../core/i18n.js';

/**
 * DisplayPanel: Right-hand HUD presenting detailed nuclear telemetry,
 * binding energy per nucleon (MeV and pJ), stability diagnostics,
 * and physical explanations for the selected isotope in EN and HU.
 */
export class DisplayPanel extends BasePanel {
  /**
   * @param {string} id
   * @param {Object} [options={}]
   */
  constructor(id = 'display-panel', options = {}) {
    super(id, {
      title: i18n.t('dispTitle'),
      icon: '📊',
      position: 'top-right',
      width: 340,
      ...options
    });

    this.currentIsotope = null;
    this.walkerLogEntries = [];
    this.currentWalkerId = null;
    this.cumulativeReleasedMeV = 0;
    this.cumulativeReleasedPJ = 0;
    this.lastWalkerTelemetry = null;

    i18n.onLanguageChange(() => {
      this.setTitle(i18n.t('dispTitle'));
      if (this.togglePill) {
        this.togglePill.innerHTML = `${this.icon} ${this.title}`;
      }
      if (this.bodyElement) {
        this.renderContent(this.bodyElement);
        if (this.currentIsotope) {
          this.setIsotope(this.currentIsotope);
        }
        if (this.walkerLogEntries.length > 0) {
          this.renderWalkerLog();
        }
      }
    });
  }

  renderContent(body) {
    const t = (k, p) => i18n.t(k, p);

    body.innerHTML = `
      <div id="isotope-telemetry-container">
        <!-- Header Info -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 8px;">
          <div>
            <div id="disp-nuclide-symbol" style="font-size: 26px; font-weight: 800; font-family: monospace; color: var(--accent-cyan); line-height: 1.1;">
              <span style="font-size: 0.6em; vertical-align: super;">56</span>Fe
            </div>
            <div id="disp-nuclide-name" style="font-size: 13px; color: var(--text-muted); font-weight: 500;">
              Iron (Z = 26)
            </div>
          </div>
          <div id="disp-stability-badge" class="brand-badge" style="background: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.4); color: #6ee7b7;">
            ${t('badgeStable')}
          </div>
        </div>

        <!-- Binding Energy Primary Stats -->
        <div class="control-section" style="background: rgba(15, 23, 42, 0.6); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 10px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--accent-gold); font-weight: 700; margin-bottom: 4px;">
            ${t('lblBindingHeader')}
          </div>
          <div style="display: flex; align-items: baseline; gap: 8px;">
            <div id="disp-bea-mev" style="font-size: 22px; font-weight: 700; color: #fff; font-family: monospace;">
              8.79036
            </div>
            <div id="disp-unit-mev" style="font-size: 13px; color: var(--accent-cyan); font-weight: 600;">
              ${t('unitMevPerA')}
            </div>
          </div>
          <div style="display: flex; align-items: baseline; gap: 6px; margin-top: 2px;">
            <div id="disp-kisfiz-ref-label" style="font-size: 11.5px; color: var(--text-muted);">
              ${t('lblKisfizRef')}
            </div>
            <div id="disp-bea-pj" style="font-size: 12px; font-weight: 600; color: #cbd5e1; font-family: monospace;">
              1.40837 pJ / nucleon
            </div>
          </div>
        </div>

        <!-- Composition Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 10px;">
          <div style="background: rgba(255,255,255,0.04); padding: 6px; border-radius: 6px; text-align: center; border: 1px solid rgba(255,255,255,0.06);">
            <div id="disp-lbl-z" style="font-size: 10px; color: var(--text-muted);">${t('lblColZ')}</div>
            <div id="disp-val-z" style="font-size: 15px; font-weight: 700; color: var(--accent-cyan); font-family: monospace;">26</div>
            <div id="disp-sub-z" style="font-size: 9px; color: #64748b;">${t('lblColZSub')}</div>
          </div>
          <div style="background: rgba(255,255,255,0.04); padding: 6px; border-radius: 6px; text-align: center; border: 1px solid rgba(255,255,255,0.06);">
            <div id="disp-lbl-n" style="font-size: 10px; color: var(--text-muted);">${t('lblColN')}</div>
            <div id="disp-val-n" style="font-size: 15px; font-weight: 700; color: var(--accent-gold); font-family: monospace;">30</div>
            <div id="disp-sub-n" style="font-size: 9px; color: #64748b;">${t('lblColNSub')}</div>
          </div>
          <div style="background: rgba(255,255,255,0.04); padding: 6px; border-radius: 6px; text-align: center; border: 1px solid rgba(255,255,255,0.06);">
            <div id="disp-lbl-a" style="font-size: 10px; color: var(--text-muted);">${t('lblColA')}</div>
            <div id="disp-val-a" style="font-size: 15px; font-weight: 700; color: #fff; font-family: monospace;">56</div>
            <div id="disp-sub-a" style="font-size: 9px; color: #64748b;">${t('lblColASub')}</div>
          </div>
        </div>

        <!-- Secondary Physics Telemetry -->
        <div class="control-section" style="font-size: 11.5px; line-height: 1.5; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span id="disp-lbl-tot-be" style="color: var(--text-muted);">${t('lblTotalBinding')}</span>
            <span id="disp-val-tot-be" style="font-weight: 600; font-family: monospace; color: #fff;">492.26 MeV</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span id="disp-lbl-mass-ex" style="color: var(--text-muted);">${t('lblMassExcess')}</span>
            <span id="disp-val-mass-excess" style="font-weight: 600; font-family: monospace; color: #93c5fd;">-60.61 MeV</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span id="disp-lbl-elev" style="color: var(--text-muted);">${t('lblValleyDepth')}</span>
            <span id="disp-val-elevation" style="font-weight: 600; font-family: monospace; color: #facc15;">0.00 MeV</span>
          </div>
        </div>

        <!-- Physical Explanation / Nuclear Trend -->
        <div class="control-section" style="background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; padding: 8px 10px; margin-bottom: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--accent-cyan); margin-bottom: 3px; display: flex; align-items: center; gap: 4px;">
            <span>💡</span> <span id="disp-lbl-significance">${t('secSignificance')}</span>
          </div>
          <div id="disp-physics-note" style="font-size: 11px; color: #e2e8f0; line-height: 1.45;">
            ${t('noteFe56')}
          </div>
        </div>

        <!-- Dynamic Atom Journey Telemetry Card -->
        <div id="disp-walker-card" class="control-section" style="display: none; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 8px; padding: 8px 10px; margin-bottom: 10px; animation: fadeIn 0.3s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div style="font-size: 11px; font-weight: 700; color: var(--accent-gold); display: flex; align-items: center; gap: 4px;">
              <span>🚀</span> <span id="disp-lbl-walker-title">${t('cardWalkerTitle')}</span>
            </div>
            <div id="disp-walker-step-badge" style="font-size: 10px; background: rgba(245, 158, 11, 0.25); color: #fff; padding: 2px 6px; border-radius: 4px; font-family: monospace;">
              ${t('badgeStep', { curr: 0, total: 0 })}
            </div>
          </div>
          <div id="disp-walker-info" style="font-size: 11.5px; color: #fef08a; font-weight: 600; margin-bottom: 2px;">
            ...
          </div>
          <div id="disp-walker-desc" style="font-size: 10.5px; color: #e2e8f0; line-height: 1.35; margin-bottom: 6px;">
            ...
          </div>

          <!-- Step History & Released Energy Log -->
          <div style="border-top: 1px solid rgba(245, 158, 11, 0.25); padding-top: 6px; margin-top: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 10px; color: var(--text-muted);">
              <span id="disp-lbl-walker-log" style="font-weight: 600; color: #fde68a;">${t('walkerLogTitle')}</span>
              <span id="disp-walker-tot-released" style="color: #6ee7b7; font-family: monospace; font-weight: 600;">${t('walkerLogSum', { mev: '0.00', pj: '0.00' })}</span>
            </div>
            <div id="disp-walker-log" class="walker-step-log">
              <!-- Dynamic step log rows -->
            </div>
          </div>
        </div>

        <!-- Color scale legend -->
        <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px;">
          <div id="disp-lbl-legend" style="font-size: 10px; color: var(--text-muted); margin-bottom: 2px;">${t('legendTitle')}</div>
          <div class="color-legend-bar"></div>
          <div class="color-legend-labels">
            <span>0 MeV (¹H)</span>
            <span>4 MeV</span>
            <span>7.5 MeV</span>
            <span>8.8 MeV (⁵⁶Fe / ⁶²Ni)</span>
          </div>
        </div>
      </div>
    `;
  }

  setIsotope(it) {
    if (!it || !this.panelElement) return;
    this.currentIsotope = it;

    const t = (k, p) => i18n.t(k, p);
    const elInfo = i18n.getElement(it.z);
    const elNameStr = elInfo ? elInfo.name : (it.nameEn || it.nameHu || '');

    const elSym = this.panelElement.querySelector('#disp-nuclide-symbol');
    const elName = this.panelElement.querySelector('#disp-nuclide-name');
    const elBadge = this.panelElement.querySelector('#disp-stability-badge');
    const elBeaMev = this.panelElement.querySelector('#disp-bea-mev');
    const elBeaPj = this.panelElement.querySelector('#disp-bea-pj');
    const elValZ = this.panelElement.querySelector('#disp-val-z');
    const elValN = this.panelElement.querySelector('#disp-val-n');
    const elValA = this.panelElement.querySelector('#disp-val-a');
    const elTotBe = this.panelElement.querySelector('#disp-val-tot-be');
    const elMassEx = this.panelElement.querySelector('#disp-val-mass-excess');
    const elElev = this.panelElement.querySelector('#disp-val-elevation');
    const elNote = this.panelElement.querySelector('#disp-physics-note');

    if (elSym) {
      elSym.innerHTML = `<span style="font-size: 0.6em; vertical-align: super;">${it.a}</span>${it.symbol}`;
    }
    if (elName) {
      elName.textContent = `${elNameStr} (Z = ${it.z})`;
    }
    if (elBadge) {
      if (it.z === 26 && it.a === 56) {
        elBadge.textContent = t('badgeValleyFloor');
        elBadge.style.color = '#38bdf8';
        elBadge.style.background = 'rgba(56, 189, 248, 0.2)';
      } else if (it.z === 28 && it.a === 62) {
        elBadge.textContent = t('badgeMaxBinding');
        elBadge.style.color = '#38bdf8';
        elBadge.style.background = 'rgba(56, 189, 248, 0.2)';
      } else if (it.isStableCandidate) {
        elBadge.textContent = t('badgeStable');
        elBadge.style.color = '#6ee7b7';
        elBadge.style.background = 'rgba(16, 185, 129, 0.2)';
      } else {
        elBadge.textContent = t('badgeRadioactive');
        elBadge.style.color = '#fca5a5';
        elBadge.style.background = 'rgba(239, 68, 68, 0.2)';
      }
    }
    if (elBeaMev) elBeaMev.textContent = it.beA.toFixed(5);
    if (elBeaPj) {
      const pJ = (it.beA * 0.16021766).toFixed(5);
      elBeaPj.textContent = t('unitPjPerA', { val: pJ });
    }
    if (elValZ) elValZ.textContent = it.z;
    if (elValN) elValN.textContent = it.n;
    if (elValA) elValA.textContent = it.a;
    if (elTotBe) elTotBe.textContent = `${it.be.toFixed(2)} MeV`;
    if (elMassEx) {
      elMassEx.textContent = it.massExcess !== null ? `${(it.massExcess / 1000).toFixed(2)} MeV` : 'N/A';
    }
    if (elElev) {
      const diff = Math.max(0, 8.79456 - it.beA);
      elElev.textContent = t('lblDepthUnit', { val: diff.toFixed(3) });
    }

    if (elNote) {
      let note = '';
      if (it.z === 1 && it.a === 1) {
        note = t('noteH1');
      } else if (it.z === 2 && it.a === 4) {
        note = t('noteHe4');
      } else if (it.z === 26 && it.a === 56) {
        note = t('noteFe56');
      } else if (it.z === 28 && it.a === 62) {
        note = t('noteNi62');
      } else if (it.z === 92 && it.a === 235) {
        note = t('noteU235');
      } else if (it.a < 56) {
        note = t('noteLight', { a: it.a });
      } else if (it.a > 62) {
        note = t('noteHeavy', { a: it.a });
      } else {
        note = t('noteDefault');
      }
      elNote.textContent = note;
    }
  }

  resetWalkerLog(walkerId = null) {
    this.currentWalkerId = walkerId;
    this.walkerLogEntries = [];
    this.cumulativeReleasedMeV = 0;
    this.cumulativeReleasedPJ = 0;
    this.lastWalkerTelemetry = null;

    if (!this.panelElement) return;
    const card = this.panelElement.querySelector('#disp-walker-card');
    const logEl = this.panelElement.querySelector('#disp-walker-log');
    const totEl = this.panelElement.querySelector('#disp-walker-tot-released');
    if (card) card.style.display = 'block';
    if (logEl) logEl.innerHTML = '';
    if (totEl) totEl.textContent = i18n.t('walkerLogSum', { mev: '0.00', pj: '0.00' });
  }

  renderWalkerLog() {
    if (!this.panelElement) return;
    const card = this.panelElement.querySelector('#disp-walker-card');
    const logEl = this.panelElement.querySelector('#disp-walker-log');
    const totEl = this.panelElement.querySelector('#disp-walker-tot-released');
    if (!logEl || !totEl) return;

    const t = (k, p) => i18n.t(k, p);

    if (this.walkerLogEntries.length === 0) {
      logEl.innerHTML = '';
      totEl.textContent = t('walkerLogSum', { mev: '0.00', pj: '0.00' });
      return;
    }

    if (card) {
      card.style.display = 'block';
    }

    totEl.textContent = t('walkerLogSum', {
      mev: this.cumulativeReleasedMeV.toFixed(2),
      pj: this.cumulativeReleasedPJ.toFixed(2)
    });

    let html = '';
    for (const entry of this.walkerLogEntries) {
      const { step, stepIdx, isFinal, isInitial, relMeV, relPJ } = entry;
      const elInfo = i18n.getElement(step.z);
      const elName = elInfo ? elInfo.name : (step.nameEn || step.nameHu || '');
      const nuclideStr = `${step.a}${step.symbol}`;

      if (isInitial) {
        html += `
          <div class="walker-log-row initial" style="background: rgba(255,255,255,0.04); border-left: 2px solid var(--accent-gold); padding: 3px 6px; border-radius: 3px; font-size: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-weight: 600; color: #fef08a;">#0 ${nuclideStr} <span style="font-size: 9px; color: var(--text-muted); font-weight: 400;">(${elName})</span></span>
              <span style="color: var(--text-muted); font-size: 9px; font-family: monospace;">${step.beA?.toFixed(3) || 0} MeV/A</span>
            </div>
            <div style="color: var(--text-muted); font-size: 9.5px; margin-top: 1px;">
              ${t('walkerLogStart', { el: nuclideStr, bea: step.beA?.toFixed(3) || '0' })}
            </div>
          </div>
        `;
      } else if (isFinal) {
        html += `
          <div class="walker-log-row final" style="background: rgba(16, 185, 129, 0.12); border-left: 2px solid var(--accent-green); padding: 3px 6px; border-radius: 3px; font-size: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-weight: 700; color: #6ee7b7;">🏁 #${stepIdx} ${nuclideStr} <span style="font-size: 9px; color: #a7f3d0; font-weight: 400;">(${elName})</span></span>
              <span style="color: #6ee7b7; font-weight: 700; font-family: monospace; font-size: 9.5px;">+${relMeV.toFixed(2)} MeV</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; color: #e2e8f0; font-size: 9.5px; margin-top: 1px;">
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 170px;">${step.label || ''}</span>
              <span style="color: #6ee7b7; font-family: monospace; font-size: 9px;">+${relPJ.toFixed(2)} pJ</span>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="walker-log-row" style="background: rgba(255,255,255,0.04); border-left: 2px solid var(--accent-cyan); padding: 3px 6px; border-radius: 3px; font-size: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-weight: 600; color: #fff;">#${stepIdx} ${nuclideStr} <span style="font-size: 9px; color: var(--text-muted); font-weight: 400;">(${elName})</span></span>
              <span style="color: #6ee7b7; font-weight: 600; font-family: monospace; font-size: 9.5px;">+${relMeV.toFixed(2)} MeV</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; color: #cbd5e1; font-size: 9.5px; margin-top: 1px;">
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 170px;">${step.label || ''}</span>
              <span style="color: #93c5fd; font-family: monospace; font-size: 9px;">+${relPJ.toFixed(2)} pJ</span>
            </div>
          </div>
        `;
      }
    }

    logEl.innerHTML = html;
    logEl.scrollTop = logEl.scrollHeight;
  }

  appendWalkerLogEntry({ walker, step, stepIdx = 0, totalSteps = 0, isFinal = false, isInitial = false }) {
    if (!step) return;

    const walkerId = walker ? walker.id : null;
    if (walkerId && this.currentWalkerId && walkerId !== this.currentWalkerId) {
      this.resetWalkerLog(walkerId);
    } else if (walkerId && !this.currentWalkerId) {
      this.currentWalkerId = walkerId;
    }

    const existing = this.walkerLogEntries.find(e => e.stepIdx === stepIdx);
    if (existing) {
      if (isFinal && !existing.isFinal) {
        existing.isFinal = true;
        this.renderWalkerLog();
      }
      return;
    }

    const relMeV = step.releasedMeV || 0;
    const relPJ = step.releasedPJ || Number((relMeV * 0.16021766).toFixed(4));
    this.cumulativeReleasedMeV += relMeV;
    this.cumulativeReleasedPJ += relPJ;

    this.walkerLogEntries.push({
      step,
      stepIdx,
      totalSteps,
      isFinal,
      isInitial,
      relMeV,
      relPJ
    });

    this.renderWalkerLog();
  }

  setWalkerTelemetry(data) {
    if (!this.panelElement || !data || !data.step) return;
    const { step, stepIdx = 0, totalSteps = 0, isFinal = false, isInitial = false } = data;
    this.lastWalkerTelemetry = data;

    const card = this.panelElement.querySelector('#disp-walker-card');
    const badge = this.panelElement.querySelector('#disp-walker-step-badge');
    const info = this.panelElement.querySelector('#disp-walker-info');
    const desc = this.panelElement.querySelector('#disp-walker-desc');

    if (!card) return;
    card.style.display = 'block';

    const t = (k, p) => i18n.t(k, p);

    if (badge) {
      badge.textContent = t('badgeStep', { curr: stepIdx + 1, total: totalSteps });
    }

    const elInfo = i18n.getElement(step.z);
    const elName = elInfo ? elInfo.name : (step.nameEn || step.nameHu || '');

    if (info) {
      info.textContent = `${step.a}${step.symbol} (${elName}) — ${step.beA?.toFixed(4) || 0} MeV/A`;
    }

    if (desc) {
      if (isFinal) {
        desc.innerHTML = t('walkerArrived', { label: step.label || '' });
        card.style.borderColor = 'var(--accent-green)';
      } else if (isInitial) {
        desc.textContent = t('walkerStarted');
        card.style.borderColor = 'var(--accent-gold)';
      } else {
        desc.textContent = step.label || 'Step...';
        card.style.borderColor = 'var(--accent-cyan)';
      }
    }

    this.appendWalkerLogEntry(data);
  }

  clearWalkerTelemetry() {
    this.walkerLogEntries = [];
    this.currentWalkerId = null;
    this.cumulativeReleasedMeV = 0;
    this.cumulativeReleasedPJ = 0;
    this.lastWalkerTelemetry = null;

    if (!this.panelElement) return;
    const card = this.panelElement.querySelector('#disp-walker-card');
    const logEl = this.panelElement.querySelector('#disp-walker-log');
    if (logEl) logEl.innerHTML = '';
    if (card) {
      card.style.display = 'none';
    }
  }
}
