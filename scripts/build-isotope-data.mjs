#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_FILE = path.resolve(__dirname, '../data/raw/mass_1.mas20.txt');
const OUTPUT_FILE = path.resolve(__dirname, '../public/data/isotopes.json');

const ELEMENT_NAMES = {
  1: { sym: 'H', hu: 'Hidrogén' },
  2: { sym: 'He', hu: 'Hélium' },
  3: { sym: 'Li', hu: 'Lítium' },
  4: { sym: 'Be', hu: 'Berillium' },
  5: { sym: 'B', hu: 'Bór' },
  6: { sym: 'C', hu: 'Szén' },
  7: { sym: 'N', hu: 'Nitrogén' },
  8: { sym: 'O', hu: 'Oxigén' },
  9: { sym: 'F', hu: 'Fluor' },
  10: { sym: 'Ne', hu: 'Neon' },
  11: { sym: 'Na', hu: 'Nátrium' },
  12: { sym: 'Mg', hu: 'Magnézium' },
  13: { sym: 'Al', hu: 'Alumínium' },
  14: { sym: 'Si', hu: 'Szilícium' },
  15: { sym: 'P', hu: 'Foszfor' },
  16: { sym: 'S', hu: 'Kén' },
  17: { sym: 'Cl', hu: 'Klór' },
  18: { sym: 'Ar', hu: 'Argon' },
  19: { sym: 'K', hu: 'Kálium' },
  20: { sym: 'Ca', hu: 'Kalcium' },
  21: { sym: 'Sc', hu: 'Szkandium' },
  22: { sym: 'Ti', hu: 'Titán' },
  23: { sym: 'V', hu: 'Vanádium' },
  24: { sym: 'Cr', hu: 'Króm' },
  25: { sym: 'Mn', hu: 'Mangán' },
  26: { sym: 'Fe', hu: 'Vas' },
  27: { sym: 'Co', hu: 'Kobalt' },
  28: { sym: 'Ni', hu: 'Nikkel' },
  29: { sym: 'Cu', hu: 'Réz' },
  30: { sym: 'Zn', hu: 'Cink' },
  31: { sym: 'Ga', hu: 'Gallium' },
  32: { sym: 'Ge', hu: 'Germánium' },
  33: { sym: 'As', hu: 'Arzén' },
  34: { sym: 'Se', hu: 'Szelén' },
  35: { sym: 'Br', hu: 'Bróm' },
  36: { sym: 'Kr', hu: 'Kripton' },
  37: { sym: 'Rb', hu: 'Rubídium' },
  38: { sym: 'Sr', hu: 'Stroncium' },
  39: { sym: 'Y', hu: 'Ittrium' },
  40: { sym: 'Zr', hu: 'Cirkónium' },
  41: { sym: 'Nb', hu: 'Nióbium' },
  42: { sym: 'Mo', hu: 'Molibdén' },
  43: { sym: 'Tc', hu: 'Technécium' },
  44: { sym: 'Ru', hu: 'Ruténium' },
  45: { sym: 'Rh', hu: 'Ródium' },
  46: { sym: 'Pd', hu: 'Palládium' },
  47: { sym: 'Ag', hu: 'Ezüst' },
  48: { sym: 'Cd', hu: 'Kadmium' },
  49: { sym: 'In', hu: 'Indium' },
  50: { sym: 'Sn', hu: 'Ón' },
  51: { sym: 'Sb', hu: 'Antimon' },
  52: { sym: 'Te', hu: 'Tellúr' },
  53: { sym: 'I', hu: 'Jód' },
  54: { sym: 'Xe', hu: 'Xenon' },
  55: { sym: 'Cs', hu: 'Cézium' },
  56: { sym: 'Ba', hu: 'Bárium' },
  57: { sym: 'La', hu: 'Lantán' },
  58: { sym: 'Ce', hu: 'Cérium' },
  59: { sym: 'Pr', hu: 'Prazeodímium' },
  60: { sym: 'Nd', hu: 'Neodímium' },
  61: { sym: 'Pm', hu: 'Prométium' },
  62: { sym: 'Sm', hu: 'Szamárium' },
  63: { sym: 'Eu', hu: 'Európium' },
  64: { sym: 'Gd', hu: 'Gadolínium' },
  65: { sym: 'Tb', hu: 'Terbium' },
  66: { sym: 'Dy', hu: 'Diszprózium' },
  67: { sym: 'Ho', hu: 'Holmium' },
  68: { sym: 'Er', hu: 'Erbium' },
  69: { sym: 'Tm', hu: 'Túlium' },
  70: { sym: 'Yb', hu: 'Itterbium' },
  71: { sym: 'Lu', hu: 'Lutécium' },
  72: { sym: 'Hf', hu: 'Hafnium' },
  73: { sym: 'Ta', hu: 'Tantál' },
  74: { sym: 'W', hu: 'Volfrám' },
  75: { sym: 'Re', hu: 'Rénium' },
  76: { sym: 'Os', hu: 'Ozmium' },
  77: { sym: 'Ir', hu: 'Iridium' },
  78: { sym: 'Pt', hu: 'Platina' },
  79: { sym: 'Au', hu: 'Arany' },
  80: { sym: 'Hg', hu: 'Higany' },
  81: { sym: 'Tl', hu: 'Tallium' },
  82: { sym: 'Pb', hu: 'Ólom' },
  83: { sym: 'Bi', hu: 'Bizmut' },
  84: { sym: 'Po', hu: 'Polónium' },
  85: { sym: 'At', hu: 'Asztácium' },
  86: { sym: 'Rn', hu: 'Radon' },
  87: { sym: 'Fr', hu: 'Francium' },
  88: { sym: 'Ra', hu: 'Rádium' },
  89: { sym: 'Ac', hu: 'Aktínium' },
  90: { sym: 'Th', hu: 'Tórium' },
  91: { sym: 'Pa', hu: 'Protaktínium' },
  92: { sym: 'U', hu: 'Urán' },
  93: { sym: 'Np', hu: 'Neptúnium' },
  94: { sym: 'Pu', hu: 'Plutónium' }
};

// 1 MeV = 0.1602176634 pJ (picojoule)
const MEV_TO_PJ = 0.1602176634;

function cleanNum(val) {
  if (!val) return NaN;
  const s = val.replace(/[#*]/g, '');
  return parseFloat(s);
}

function parseAme() {
  if (!fs.existsSync(RAW_FILE)) {
    throw new Error(`Raw AME mass file not found at: ${RAW_FILE}`);
  }

  const content = fs.readFileSync(RAW_FILE, 'utf8');
  const lines = content.split('\n');

  const isotopes = [];
  const byKey = new Map();

  for (let i = 35; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const parts = rawLine.split(/\s+/);
    let idx = 0;
    if (parts[0] === '0' || parts[0] === '1') {
      idx = 1;
    }

    const n = parseInt(parts[idx + 1], 10);
    const z = parseInt(parts[idx + 2], 10);
    const a = parseInt(parts[idx + 3], 10);
    const el = parts[idx + 4];

    // Filter elements Z in [1..94]
    if (isNaN(z) || isNaN(a) || isNaN(n) || !el || z < 1 || z > 94) {
      continue;
    }

    const rest = parts.slice(idx + 5);
    let massExcessStr;
    let bindingStr;

    const firstIsNum = !isNaN(cleanNum(rest[0]));
    if (firstIsNum) {
      massExcessStr = rest[0];
      bindingStr = rest[2];
    } else {
      massExcessStr = rest[1];
      bindingStr = rest[3];
    }

    const bePerA_keV = cleanNum(bindingStr);
    const massExcess_keV = cleanNum(massExcessStr);

    if (isNaN(bePerA_keV)) {
      continue;
    }

    const bePerA_MeV = bePerA_keV / 1000.0;
    const be_MeV = (bePerA_MeV * a);
    const beA_pJ = bePerA_MeV * MEV_TO_PJ;

    const elInfo = ELEMENT_NAMES[z] || { sym: el, hu: el };

    // Check beta decay / stability indicator in the rest line
    // When rest contains '*' for beta decay energy or no decay, it is often stable
    const hasAsteriskBeta = rest.includes('*');

    const iso = {
      z,
      n,
      a,
      symbol: elInfo.sym,
      nameHu: elInfo.hu,
      beA: Number(bePerA_MeV.toFixed(5)),       // MeV/A
      be: Number(be_MeV.toFixed(3)),            // total MeV
      beApJ: Number(beA_pJ.toFixed(6)),         // pJ/A
      massExcess: !isNaN(massExcess_keV) ? Number(massExcess_keV.toFixed(2)) : null,
      isStableCandidate: hasAsteriskBeta
    };

    const key = `${z}_${a}`;
    // Keep the one with highest precision or first entry
    if (!byKey.has(key)) {
      byKey.set(key, iso);
      isotopes.push(iso);
    }
  }

  // Sort by Z asc, then A asc
  isotopes.sort((x, y) => {
    if (x.z !== y.z) return x.z - y.z;
    return x.a - y.a;
  });

  // Calculate stats
  let minBeA = Infinity;
  let maxBeA = -Infinity;
  let maxIso = null;

  for (const iso of isotopes) {
    if (iso.beA < minBeA) minBeA = iso.beA;
    if (iso.beA > maxBeA) {
      maxBeA = iso.beA;
      maxIso = iso;
    }
  }

  const result = {
    meta: {
      title: 'AME2020 Nukleáris Kötési Energia és Magtömeg Adattár (Z=1..94)',
      source: 'IAEA / AMDC AME2020 (Chinese Physics C45, 030002/030003, 2021)',
      unit_energy: 'MeV',
      unit_energy_pj: 'pJ',
      count: isotopes.length,
      zRange: [1, 94],
      aRange: [isotopes[0].a, isotopes[isotopes.length - 1].a],
      maxBindingPerNucleon: {
        symbol: maxIso ? `${maxIso.symbol}-${maxIso.a}` : null,
        z: maxIso ? maxIso.z : null,
        a: maxIso ? maxIso.a : null,
        beA_MeV: maxBeA,
        beA_pJ: maxIso ? maxIso.beApJ : null
      },
      fe56: isotopes.find(it => it.z === 26 && it.a === 56),
      ni62: isotopes.find(it => it.z === 28 && it.a === 62)
    },
    isotopes
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf8');

  console.log(`Parsed ${isotopes.length} isotopes (Z=1..94). Output written to: ${OUTPUT_FILE}`);
  console.log(`Max BE/A: ${result.meta.maxBindingPerNucleon.symbol} (${maxBeA} MeV/nucleon = ${result.meta.maxBindingPerNucleon.beA_pJ} pJ)`);
  if (result.meta.fe56) {
    console.log(`Fe-56: BE/A = ${result.meta.fe56.beA} MeV/nucleon (${result.meta.fe56.beApJ} pJ)`);
  }
  if (result.meta.ni62) {
    console.log(`Ni-62: BE/A = ${result.meta.ni62.beA} MeV/nucleon (${result.meta.ni62.beApJ} pJ)`);
  }
}

parseAme();
