import { ELEMENTS_I18N } from '../core/i18n.js';

function normalizeStr(s) {
  return s ? s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() : '';
}

/**
 * IsotopeStore: Manages the nuclear dataset loaded from isotopes.json.
 * Provides indexing by (Z, A), filtering, search, and statistical lookups.
 */
export class IsotopeStore {
  constructor() {
    this.meta = null;
    this.isotopes = [];
    this.byKey = new Map();
    this.byZ = new Map();
    this.bySymbol = new Map();
    this.byNameHu = new Map();
    this.byNameEn = new Map();
    this.isLoaded = false;

    this.minBeA = 0;
    this.maxBeA = 8.79456;
    this.minZ = 1;
    this.maxZ = 94;
    this.minA = 1;
    this.maxA = 244;
  }

  /**
   * Loads isotopes.json from the public data directory.
   * @param {string} [url='./data/isotopes.json']
   * @returns {Promise<IsotopeStore>}
   */
  async load(url = './data/isotopes.json') {
    if (this.isLoaded) return this;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Nem sikerült betölteni az izotóp adatbázist: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.meta = data.meta;
    this.isotopes = data.isotopes;

    let minBeA = Infinity;
    let maxBeA = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    let minA = Infinity;
    let maxA = -Infinity;

    for (let i = 0; i < this.isotopes.length; i++) {
      const it = this.isotopes[i];
      it.index = i;

      // Attach English name if available
      const elInfo = ELEMENTS_I18N[it.z];
      it.nameEn = elInfo ? elInfo.en : it.nameHu;

      const key = `${it.z}_${it.a}`;
      this.byKey.set(key, it);

      if (!this.byZ.has(it.z)) {
        this.byZ.set(it.z, []);
      }
      this.byZ.get(it.z).push(it);

      const symKey = it.symbol.toUpperCase();
      if (!this.bySymbol.has(symKey)) {
        this.bySymbol.set(symKey, []);
      }
      this.bySymbol.get(symKey).push(it);

      const nameHuKey = normalizeStr(it.nameHu);
      if (!this.byNameHu.has(nameHuKey)) {
        this.byNameHu.set(nameHuKey, []);
      }
      this.byNameHu.get(nameHuKey).push(it);

      const nameEnKey = normalizeStr(it.nameEn);
      if (!this.byNameEn.has(nameEnKey)) {
        this.byNameEn.set(nameEnKey, []);
      }
      this.byNameEn.get(nameEnKey).push(it);

      if (it.beA < minBeA) minBeA = it.beA;
      if (it.beA > maxBeA) maxBeA = it.beA;
      if (it.z < minZ) minZ = it.z;
      if (it.z > maxZ) maxZ = it.z;
      if (it.a < minA) minA = it.a;
      if (it.a > maxA) maxA = it.a;
    }

    this.minBeA = minBeA;
    this.maxBeA = maxBeA;
    this.minZ = minZ;
    this.maxZ = maxZ;
    this.minA = minA;
    this.maxA = maxA;

    this.isLoaded = true;
    return this;
  }

  get(z, a) {
    return this.byKey.get(`${z}_${a}`) || null;
  }

  getByIndex(index) {
    if (index >= 0 && index < this.isotopes.length) {
      return this.isotopes[index];
    }
    return null;
  }

  getByZ(z) {
    return this.byZ.get(z) || [];
  }

  getBySymbol(sym) {
    if (!sym) return [];
    return this.bySymbol.get(sym.trim().toUpperCase()) || [];
  }

  search(query) {
    if (!query || typeof query !== 'string') return [];
    const rawQ = query.trim();
    const q = rawQ.toLowerCase();
    const qNorm = normalizeStr(rawQ);

    // 1. Z_A or Z-A (both digits), e.g. 26_56, 26-56, 26:56
    const zaMatch = rawQ.match(/^(\d+)[_\-\/:](\d+)$/);
    if (zaMatch) {
      const z = parseInt(zaMatch[1], 10);
      const a = parseInt(zaMatch[2], 10);
      const it = this.get(z, a);
      if (it) return [it];
    }

    // 2. Element Symbol + Mass number: 'fe-56', 'fe56', '56fe', 'u-235', '1h'
    const symAMatch = rawQ.match(/^([a-z]+)[-\s]?(\d+)$/i) || rawQ.match(/^(\d+)[-\s]?([a-z]+)$/i);
    if (symAMatch) {
      const sym = isNaN(symAMatch[1]) ? symAMatch[1].toUpperCase() : symAMatch[2].toUpperCase();
      const a = isNaN(symAMatch[1]) ? parseInt(symAMatch[2], 10) : parseInt(symAMatch[1], 10);
      const candidates = this.getBySymbol(sym);
      const found = candidates.filter(it => it.a === a);
      if (found.length > 0) return found;
    }

    // 3. Explicit Z query: 'z=26' or 'z:26'
    const zPrefixMatch = rawQ.match(/^z\s*[=:\-]\s*(\d+)$/i);
    if (zPrefixMatch) {
      const z = parseInt(zPrefixMatch[1], 10);
      const list = this.getByZ(z);
      if (list && list.length > 0) return list.slice().sort((a, b) => b.beA - a.beA);
    }

    // 4. Pure integer: if in 1..94, match atomic number Z; otherwise mass number A
    if (/^\d+$/.test(rawQ)) {
      const val = parseInt(rawQ, 10);
      if (val >= 1 && val <= 94 && this.byZ.has(val)) {
        return this.getByZ(val).slice().sort((a, b) => b.beA - a.beA);
      }
      const byA = this.isotopes.filter(it => it.a === val).sort((a, b) => b.beA - a.beA);
      if (byA.length > 0) return byA;
    }

    // 5. Exact element symbol match (case-insensitive): 'U', 'Fe', 'Ni', 'H'
    const symUpper = rawQ.toUpperCase();
    if (this.bySymbol.has(symUpper)) {
      return this.bySymbol.get(symUpper).slice().sort((a, b) => b.beA - a.beA);
    }

    // 6. Exact English or Hungarian name match
    if (this.byNameEn.has(qNorm)) {
      return this.byNameEn.get(qNorm).slice().sort((a, b) => b.beA - a.beA);
    }
    if (this.byNameHu.has(qNorm)) {
      return this.byNameHu.get(qNorm).slice().sort((a, b) => b.beA - a.beA);
    }

    // 7. Partial English or Hungarian name match (e.g. 'iron', 'uran', 'pluton')
    const partialNameMatches = [];
    for (const [nameKey, list] of this.byNameEn.entries()) {
      if (nameKey.includes(qNorm)) {
        partialNameMatches.push(...list);
      }
    }
    for (const [nameKey, list] of this.byNameHu.entries()) {
      if (nameKey.includes(qNorm) && !partialNameMatches.includes(list[0])) {
        partialNameMatches.push(...list);
      }
    }
    if (partialNameMatches.length > 0) {
      return partialNameMatches.slice().sort((a, b) => b.beA - a.beA).slice(0, 50);
    }

    // 8. Fallback substring search in symbol or key
    return this.isotopes.filter(it =>
      `${it.symbol}-${it.a}`.toLowerCase().includes(q) ||
      it.symbol.toLowerCase().includes(q)
    ).slice(0, 50);
  }

  getSpecialNuclides() {
    return {
      fe56: this.get(26, 56),
      ni62: this.get(28, 62),
      h1: this.get(1, 1),
      h2: this.get(1, 2),
      he4: this.get(2, 4),
      c12: this.get(6, 12),
      u235: this.get(92, 235),
      u238: this.get(92, 238),
      pu239: this.get(94, 239)
    };
  }
}

