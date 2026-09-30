/**
 * PathPlanner: Computes descent trajectories across the nuclear energy valley
 * toward the maximum-stability valley floor (Fe-56 / Ni-62).
 *
 * Supports two distinct physics modes:
 * 1. 'gradient': Continuous steepest-ascent optimization on binding energy per nucleon (E_bind/A).
 * 2. 'channels': Discrete nuclear transformation channels (alpha, beta-, beta+/EC, fusion/capture, fission).
 */
import { i18n } from './i18n.js';

export class PathPlanner {
  /**
   * @param {import('../data/IsotopeStore.js').IsotopeStore} isotopeStore
   */
  constructor(isotopeStore) {
    this.isotopeStore = isotopeStore;
  }

  /**
   * Plans a trajectory from startIsotope to the valley floor.
   * @param {Object} startIsotope
   * @param {'gradient'|'channels'} [mode='gradient']
   * @param {Object} [options={}]
   * @returns {Array<Object>} Array of nuclide step objects with transition metadata
   */
  plan(startIsotope, mode = 'gradient', options = {}) {
    if (!startIsotope || !this.isotopeStore || !this.isotopeStore.isLoaded) {
      return [];
    }

    if (mode === 'channels') {
      return this.planChannels(startIsotope, options);
    }
    return this.planGradient(startIsotope, options);
  }

  /**
   * Gradient mode: selects the neighboring isotope with the greatest increase in binding energy per nucleon.
   */
  planGradient(startIsotope, options = {}) {
    const maxSteps = options.maxSteps || 40;
    const path = [];
    const visited = new Set();
    const isHu = i18n.getLanguage() === 'hu';

    // Reference binding energy for 4He alpha particle (~28.296 MeV)
    const he4Iso = this.isotopeStore.get(2, 4);
    const he4Be = he4Iso ? he4Iso.be : 28.29566;

    let curr = startIsotope;
    path.push({
      step: 0,
      z: curr.z,
      a: curr.a,
      n: curr.n,
      symbol: curr.symbol,
      nameHu: curr.nameHu,
      nameEn: curr.nameEn,
      beA: curr.beA,
      be: curr.be,
      type: 'start',
      label: isHu ? 'Kezdőállapot' : 'Initial state',
      gain: 0,
      releasedMeV: 0,
      releasedPJ: 0,
      isotope: curr
    });
    visited.add(`${curr.z}_${curr.a}`);

    for (let s = 1; s <= maxSteps; s++) {
      // Termination check: reached absolute valley floor (Fe-56 or Ni-62)
      if ((curr.z === 26 && curr.a === 56) || (curr.z === 28 && curr.a === 62)) {
        break;
      }

      let bestNeighbor = null;
      let maxGain = 0;

      // Search localized window of nuclear transitions: dZ in [-2..2], dA in [-4..4]
      for (let dz = -2; dz <= 2; dz++) {
        for (let da = -4; da <= 4; da++) {
          if (dz === 0 && da === 0) continue;

          const nz = curr.z + dz;
          const na = curr.a + da;
          if (nz < 1 || nz > 94 || na < nz) continue;

          const key = `${nz}_${na}`;
          if (visited.has(key)) continue;

          const cand = this.isotopeStore.get(nz, na);
          if (!cand) continue;

          const gain = cand.beA - curr.beA;
          if (gain > maxGain) {
            maxGain = gain;
            bestNeighbor = cand;
          }
        }
      }

      // No neighbor gives further binding energy gain (local equilibrium reached)
      if (!bestNeighbor || maxGain <= 0.0001) {
        break;
      }

      visited.add(`${bestNeighbor.z}_${bestNeighbor.a}`);
      const stepText = isHu
        ? `Gradiens lépés (+${maxGain.toFixed(3)} MeV/A)`
        : `Gradient step (+${maxGain.toFixed(3)} MeV/A)`;

      const dz = bestNeighbor.z - curr.z;
      const da = bestNeighbor.a - curr.a;
      let relMeV = bestNeighbor.be - curr.be;
      if (dz === -2 && da === -4) {
        relMeV = (bestNeighbor.be + he4Be) - curr.be;
      } else if (dz === 2 && da === 4) {
        relMeV = bestNeighbor.be - (curr.be + he4Be);
      }
      if (relMeV <= 0) {
        relMeV = bestNeighbor.a * maxGain;
      }
      relMeV = Number(relMeV.toFixed(3));
      const relPJ = Number((relMeV * 0.16021766).toFixed(4));

      path.push({
        step: s,
        z: bestNeighbor.z,
        a: bestNeighbor.a,
        n: bestNeighbor.n,
        symbol: bestNeighbor.symbol,
        nameHu: bestNeighbor.nameHu,
        nameEn: bestNeighbor.nameEn,
        beA: bestNeighbor.beA,
        be: bestNeighbor.be,
        type: 'gradient',
        label: stepText,
        gain: maxGain,
        releasedMeV: relMeV,
        releasedPJ: relPJ,
        isotope: bestNeighbor
      });
      curr = bestNeighbor;
    }

    return path;
  }

  /**
   * Channels mode: follows nuclear reactions and decay channels
   * (fission for actinides, alpha decay, beta+/- decays, fusion/capture for light nuclei).
   */
  planChannels(startIsotope, options = {}) {
    const maxSteps = options.maxSteps || 35;
    const path = [];
    const visited = new Set();
    const isHu = i18n.getLanguage() === 'hu';

    // Reference binding energy for 4He alpha particle (~28.296 MeV)
    const he4Iso = this.isotopeStore.get(2, 4);
    const he4Be = he4Iso ? he4Iso.be : 28.29566;

    let curr = startIsotope;
    path.push({
      step: 0,
      z: curr.z,
      a: curr.a,
      n: curr.n,
      symbol: curr.symbol,
      nameHu: curr.nameHu,
      nameEn: curr.nameEn,
      beA: curr.beA,
      be: curr.be,
      type: 'start',
      label: isHu ? 'Kezdőállapot' : 'Initial state',
      gain: 0,
      releasedMeV: 0,
      releasedPJ: 0,
      isotope: curr
    });
    visited.add(`${curr.z}_${curr.a}`);

    for (let s = 1; s <= maxSteps; s++) {
      if ((curr.z === 26 && curr.a === 56) || (curr.z === 28 && curr.a === 62)) {
        break;
      }

      const candidates = [];

      // 1. Spontaneous or induced fission for heavy actinides (Z >= 90) on step 1
      if (curr.z >= 90 && s === 1) {
        const fissionFragments = [
          { z: 56, a: 141, sym: '¹⁴¹Ba' },
          { z: 54, a: 140, sym: '¹⁴⁰Xe' },
          { z: 40, a: 96,  sym: '⁹⁶Zr' },
          { z: 38, a: 94,  sym: '⁹⁴Sr' }
        ];

        for (const frag of fissionFragments) {
          const cand = this.isotopeStore.get(frag.z, frag.a);
          if (cand && !visited.has(`${cand.z}_${cand.a}`)) {
            const label = isHu
              ? `Maghasadás (fisszió) → ${frag.sym}`
              : `Nuclear fission → ${frag.sym}`;
            const gain = cand.beA - curr.beA;
            const relMeV = curr.a * gain;
            candidates.push({
              cand,
              type: 'fission',
              label,
              gain,
              relMeV
            });
          }
        }
      }

      // 2. Alpha decay (alpha emitter): dZ = -2, dA = -4 (emission of 4He)
      if (curr.a >= 60) {
        const alphaCand = this.isotopeStore.get(curr.z - 2, curr.a - 4);
        if (alphaCand && !visited.has(`${alphaCand.z}_${alphaCand.a}`)) {
          const gain = alphaCand.beA - curr.beA;
          let relMeV = (alphaCand.be + he4Be) - curr.be;
          if (relMeV <= 0) relMeV = alphaCand.a * gain;
          candidates.push({
            cand: alphaCand,
            type: 'alpha',
            label: isHu ? 'α-bomlás (–⁴He)' : 'α-decay (–⁴He)',
            gain,
            relMeV
          });
        }
      }

      // 3. Beta-minus decay (neutron-rich): dZ = +1, dA = 0 (n -> p + e- + v_e)
      const betaMinusCand = this.isotopeStore.get(curr.z + 1, curr.a);
      if (betaMinusCand && !visited.has(`${betaMinusCand.z}_${betaMinusCand.a}`)) {
        const gain = betaMinusCand.beA - curr.beA;
        let relMeV = betaMinusCand.be - curr.be;
        if (relMeV <= 0) relMeV = betaMinusCand.a * gain;
        candidates.push({
          cand: betaMinusCand,
          type: 'beta_minus',
          label: isHu ? 'β⁻-bomlás (n → p)' : 'β⁻-decay (n → p)',
          gain,
          relMeV
        });
      }

      // 4. Beta-plus / Electron Capture (proton-rich): dZ = -1, dA = 0 (p -> n + e+ + v_e)
      const betaPlusCand = this.isotopeStore.get(curr.z - 1, curr.a);
      if (betaPlusCand && !visited.has(`${betaPlusCand.z}_${betaPlusCand.a}`)) {
        const gain = betaPlusCand.beA - curr.beA;
        let relMeV = betaPlusCand.be - curr.be;
        if (relMeV <= 0) relMeV = betaPlusCand.a * gain;
        candidates.push({
          cand: betaPlusCand,
          type: 'beta_plus',
          label: isHu ? 'β⁺-bomlás / EC (p → n)' : 'β⁺-decay / EC (p → n)',
          gain,
          relMeV
        });
      }

      // 5. Light nucleus fusion channels (stellar nucleosynthesis climbing the valley, A < 56)
      if (curr.a < 56) {
        // Alpha capture / 4He fusion (alpha process)
        const alphaCap = this.isotopeStore.get(curr.z + 2, curr.a + 4);
        if (alphaCap && !visited.has(`${alphaCap.z}_${alphaCap.a}`)) {
          const gain = alphaCap.beA - curr.beA;
          let relMeV = alphaCap.be - (curr.be + he4Be);
          if (relMeV <= 0) relMeV = alphaCap.a * gain;
          candidates.push({
            cand: alphaCap,
            type: 'alpha_capture',
            label: isHu ? 'α-befogás (+⁴He fúzió)' : 'α-capture (+⁴He fusion)',
            gain,
            relMeV
          });
        }

        // Proton capture
        const pCap = this.isotopeStore.get(curr.z + 1, curr.a + 1);
        if (pCap && !visited.has(`${pCap.z}_${pCap.a}`)) {
          const gain = pCap.beA - curr.beA;
          let relMeV = pCap.be - curr.be;
          if (relMeV <= 0) relMeV = pCap.a * gain;
          candidates.push({
            cand: pCap,
            type: 'proton_capture',
            label: isHu ? 'p-befogás (+¹H)' : 'p-capture (+¹H)',
            gain,
            relMeV
          });
        }

        // Neutron capture (s-process / r-process step)
        const nCap = this.isotopeStore.get(curr.z, curr.a + 1);
        if (nCap && !visited.has(`${nCap.z}_${nCap.a}`)) {
          const gain = nCap.beA - curr.beA;
          let relMeV = nCap.be - curr.be;
          if (relMeV <= 0) relMeV = nCap.a * gain;
          candidates.push({
            cand: nCap,
            type: 'neutron_capture',
            label: isHu ? 'n-befogás' : 'n-capture',
            gain,
            relMeV
          });
        }
      }

      // Rank moves by gain in binding energy per nucleon
      candidates.sort((a, b) => b.gain - a.gain);

      const best = candidates[0];
      if (!best || best.gain <= 0.00001) {
        break;
      }

      visited.add(`${best.cand.z}_${best.cand.a}`);
      const relMeV = Number(best.relMeV.toFixed(3));
      const relPJ = Number((relMeV * 0.16021766).toFixed(4));
      path.push({
        step: s,
        z: best.cand.z,
        a: best.cand.a,
        n: best.cand.n,
        symbol: best.cand.symbol,
        nameHu: best.cand.nameHu,
        nameEn: best.cand.nameEn,
        beA: best.cand.beA,
        be: best.cand.be,
        type: best.type,
        label: `${best.label} (+${best.gain.toFixed(3)} MeV/A)`,
        gain: best.gain,
        releasedMeV: relMeV,
        releasedPJ: relPJ,
        isotope: best.cand
      });
      curr = best.cand;
    }

    return path;
  }
}
