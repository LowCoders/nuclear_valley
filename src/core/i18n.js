/**
 * i18n: Lightweight, reactive internationalization module supporting English (EN, default)
 * and Hungarian (HU), with localStorage state persistence.
 */

const STORAGE_KEY = 'nuclear_valley_lang';

export const ELEMENTS_I18N = {
  1:  { sym: 'H',  en: 'Hydrogen',     hu: 'Hidrogén' },
  2:  { sym: 'He', en: 'Helium',       hu: 'Hélium' },
  3:  { sym: 'Li', en: 'Lithium',      hu: 'Lítium' },
  4:  { sym: 'Be', en: 'Beryllium',    hu: 'Berillium' },
  5:  { sym: 'B',  en: 'Boron',        hu: 'Bór' },
  6:  { sym: 'C',  en: 'Carbon',       hu: 'Szén' },
  7:  { sym: 'N',  en: 'Nitrogen',     hu: 'Nitrogén' },
  8:  { sym: 'O',  en: 'Oxygen',       hu: 'Oxigén' },
  9:  { sym: 'F',  en: 'Fluorine',     hu: 'Fluor' },
  10: { sym: 'Ne', en: 'Neon',         hu: 'Neon' },
  11: { sym: 'Na', en: 'Sodium',       hu: 'Nátrium' },
  12: { sym: 'Mg', en: 'Magnesium',    hu: 'Magnézium' },
  13: { sym: 'Al', en: 'Aluminum',     hu: 'Alumínium' },
  14: { sym: 'Si', en: 'Silicon',      hu: 'Szilícium' },
  15: { sym: 'P',  en: 'Phosphorus',   hu: 'Foszfor' },
  16: { sym: 'S',  en: 'Sulfur',       hu: 'Kén' },
  17: { sym: 'Cl', en: 'Chlorine',     hu: 'Klór' },
  18: { sym: 'Ar', en: 'Argon',        hu: 'Argon' },
  19: { sym: 'K',  en: 'Potassium',    hu: 'Kálium' },
  20: { sym: 'Ca', en: 'Calcium',      hu: 'Kalcium' },
  21: { sym: 'Sc', en: 'Scandium',     hu: 'Szkandium' },
  22: { sym: 'Ti', en: 'Titanium',     hu: 'Titán' },
  23: { sym: 'V',  en: 'Vanadium',     hu: 'Vanádium' },
  24: { sym: 'Cr', en: 'Chromium',     hu: 'Króm' },
  25: { sym: 'Mn', en: 'Manganese',    hu: 'Mangán' },
  26: { sym: 'Fe', en: 'Iron',         hu: 'Vas' },
  27: { sym: 'Co', en: 'Cobalt',       hu: 'Kobalt' },
  28: { sym: 'Ni', en: 'Nickel',       hu: 'Nikkel' },
  29: { sym: 'Cu', en: 'Copper',       hu: 'Réz' },
  30: { sym: 'Zn', en: 'Zinc',         hu: 'Cink' },
  31: { sym: 'Ga', en: 'Gallium',      hu: 'Gallium' },
  32: { sym: 'Ge', en: 'Germanium',    hu: 'Germánium' },
  33: { sym: 'As', en: 'Arsenic',      hu: 'Arzén' },
  34: { sym: 'Se', en: 'Selenium',     hu: 'Szelén' },
  35: { sym: 'Br', en: 'Bromine',      hu: 'Bróm' },
  36: { sym: 'Kr', en: 'Krypton',      hu: 'Kripton' },
  37: { sym: 'Rb', en: 'Rubidium',     hu: 'Rubídium' },
  38: { sym: 'Sr', en: 'Strontium',    hu: 'Stroncium' },
  39: { sym: 'Y',  en: 'Yttrium',      hu: 'Ittrium' },
  40: { sym: 'Zr', en: 'Zirconium',    hu: 'Cirkónium' },
  41: { sym: 'Nb', en: 'Niobium',      hu: 'Nióbium' },
  42: { sym: 'Mo', en: 'Molybdenum',   hu: 'Molibdén' },
  43: { sym: 'Tc', en: 'Technetium',   hu: 'Technécium' },
  44: { sym: 'Ru', en: 'Ruthenium',    hu: 'Ruténium' },
  45: { sym: 'Rh', en: 'Rhodium',      hu: 'Ródium' },
  46: { sym: 'Pd', en: 'Palladium',    hu: 'Palládium' },
  47: { sym: 'Ag', en: 'Silver',       hu: 'Ezüst' },
  48: { sym: 'Cd', en: 'Cadmium',      hu: 'Kadmium' },
  49: { sym: 'In', en: 'Indium',       hu: 'Indium' },
  50: { sym: 'Sn', en: 'Tin',          hu: 'Ón' },
  51: { sym: 'Sb', en: 'Antimony',     hu: 'Antimon' },
  52: { sym: 'Te', en: 'Tellurium',    hu: 'Tellúr' },
  53: { sym: 'I',  en: 'Iodine',       hu: 'Jód' },
  54: { sym: 'Xe', en: 'Xenon',        hu: 'Xenon' },
  55: { sym: 'Cs', en: 'Cesium',       hu: 'Cézium' },
  56: { sym: 'Ba', en: 'Barium',       hu: 'Bárium' },
  57: { sym: 'La', en: 'Lanthanum',    hu: 'Lantán' },
  58: { sym: 'Ce', en: 'Cerium',       hu: 'Cérium' },
  59: { sym: 'Pr', en: 'Praseodymium', hu: 'Prazeodímium' },
  60: { sym: 'Nd', en: 'Neodymium',    hu: 'Neodímium' },
  61: { sym: 'Pm', en: 'Promethium',   hu: 'Prométium' },
  62: { sym: 'Sm', en: 'Samarium',     hu: 'Szamárium' },
  63: { sym: 'Eu', en: 'Europium',     hu: 'Európium' },
  64: { sym: 'Gd', en: 'Gadolinium',   hu: 'Gadolínium' },
  65: { sym: 'Tb', en: 'Terbium',      hu: 'Terbium' },
  66: { sym: 'Dy', en: 'Dysprosium',   hu: 'Diszprózium' },
  67: { sym: 'Ho', en: 'Holmium',      hu: 'Holmium' },
  68: { sym: 'Er', en: 'Erbium',       hu: 'Erbium' },
  69: { sym: 'Tm', en: 'Thulium',      hu: 'Túlium' },
  70: { sym: 'Yb', en: 'Ytterbium',    hu: 'Itterbium' },
  71: { sym: 'Lu', en: 'Lutetium',     hu: 'Lutécium' },
  72: { sym: 'Hf', en: 'Hafnium',      hu: 'Hafnium' },
  73: { sym: 'Ta', en: 'Tantalum',     hu: 'Tantál' },
  74: { sym: 'W',  en: 'Tungsten',     hu: 'Volfrám' },
  75: { sym: 'Re', en: 'Rhenium',      hu: 'Rénium' },
  76: { sym: 'Os', en: 'Osmium',       hu: 'Ozmium' },
  77: { sym: 'Ir', en: 'Iridium',      hu: 'Iridium' },
  78: { sym: 'Pt', en: 'Platinum',     hu: 'Platina' },
  79: { sym: 'Au', en: 'Gold',         hu: 'Arany' },
  80: { sym: 'Hg', en: 'Mercury',      hu: 'Higany' },
  81: { sym: 'Tl', en: 'Thallium',     hu: 'Tallium' },
  82: { sym: 'Pb', en: 'Lead',         hu: 'Ólom' },
  83: { sym: 'Bi', en: 'Bismuth',      hu: 'Bizmut' },
  84: { sym: 'Po', en: 'Polonium',     hu: 'Polónium' },
  85: { sym: 'At', en: 'Astatine',     hu: 'Asztácium' },
  86: { sym: 'Rn', en: 'Radon',        hu: 'Radon' },
  87: { sym: 'Fr', en: 'Francium',     hu: 'Francium' },
  88: { sym: 'Ra', en: 'Radium',       hu: 'Rádium' },
  89: { sym: 'Ac', en: 'Actinium',     hu: 'Aktínium' },
  90: { sym: 'Th', en: 'Thorium',      hu: 'Tórium' },
  91: { sym: 'Pa', en: 'Protactinium', hu: 'Protaktínium' },
  92: { sym: 'U',  en: 'Uranium',      hu: 'Urán' },
  93: { sym: 'Np', en: 'Neptunium',    hu: 'Neptúnium' },
  94: { sym: 'Pu', en: 'Plutonium',    hu: 'Plutónium' }
};

export const CATEGORIES_I18N = {
  noble:           { en: 'Noble Gas',             hu: 'Nemesgáz',           color: '#a855f7' },
  halogen:         { en: 'Halogen',               hu: 'Halogén',            color: '#06b6d4' },
  nonmetal:        { en: 'Reactive Nonmetal',     hu: 'Nemfém',             color: '#38bdf8' },
  metalloid:       { en: 'Metalloid',             hu: 'Félfém',             color: '#10b981' },
  alkali:          { en: 'Alkali Metal',          hu: 'Alkálifém',          color: '#ef4444' },
  alkaline:        { en: 'Alkaline Earth Metal',  hu: 'Alkáli földfém',     color: '#f97316' },
  lanthanide:      { en: 'Lanthanide',            hu: 'Lantanoida',         color: '#ec4899' },
  actinide:        { en: 'Actinide',              hu: 'Aktinoida',          color: '#e11d48' },
  'post-transition': { en: 'Post-transition Metal', hu: 'Félnehézfém',      color: '#64748b' },
  transition:      { en: 'Transition Metal',      hu: 'Átmenetifém',        color: '#f59e0b' }
};

export const TRANSLATIONS = {
  en: {
    // Header & Meta
    pageTitle: 'Nuclear Energy Valley 3D',
    brandBadge: '⚛️ Nuclear Physics & Stability',
    appTitle: 'Nuclear Energy Valley 3D',
    appSubtitle: 'Specific binding energy (E_bind / A) and nuclear stability surface vs atomic number (Z) and mass number (A)',
    controlsHint: '🎮 Controls: <b>Mouse drag</b> – orbit view | <b>Scroll</b> – zoom | <b>Arrow keys / WASD</b> – traverse space | <b>Click</b> – datasheet | <b>Shift + click</b> – drop atom',
    linkDocs: '📖 Documentation',
    tipLinkDocs: 'Open interactive documentation & physics guide',
    jumpFe56: 'Jump to deepest valley floor: 56-Fe',
    jumpNi62: 'Jump to highest specific binding energy: 62-Ni',
    jumpH1: 'Jump to unbound free proton (peak): 1-H',
    jumpU235: 'Jump to fissile actinide: 235-U',

    // Control Panel
    ctrlTitle: 'Control Panel',
    secGeometry: '⛰️ Model Geometry',
    lblStyle: 'Display style:',
    optValley: 'Valley (Fe/Ni at lowest point)',
    optPeak: 'Peak (Fe/Ni at highest point)',
    lblHeightScale: 'Height scale:',
    lblOnlyStable: 'Highlight stable isotopes only',

    secAtomPicker: '🧪 Nuclide Picker',
    btnOpenPeriodic: '📋 Periodic Table Picker...',
    descPeriodic: 'Browse and pick any element and isotope (Z = 1 → 94) from the interactive chart!',

    secDrop: '✨ Atom Drop & Valley Trajectory',
    lblPathType: 'Trajectory type:',
    btnPathGradient: '⛰️ Gradient',
    btnPathChannels: '⚛️ Decay Chain',
    tipGradient: 'Steps along the steepest increase in binding energy per nucleon (E_bind/A)',
    tipChannels: 'Follows physical decay and reaction channels (fission, alpha, beta, fusion)',
    btnDropSelected: '▶ Drop Selected Nucleus',
    btnDropSelectedRunning: '⏸ Pause',
    btnDropSelectedPaused: '▶ Resume',
    lblActiveAtoms: 'Active atoms: {count}',
    btnClearWalkers: '🧹 Clear trails',

    secCamera: '📷 Camera Views',
    camPerspective: '📐 Perspective',
    camTop: '🗺️ Map (Top-down)',
    camGorge: '🏞️ Valley Walk',
    camReset: '↺ Reset View',

    secSearch: '🔍 Isotope Search',
    searchPlaceholder: 'e.g. Fe-56, Ni-62, U, 92...',
    btnSearchJump: 'Jump',
    searchMatch: 'Found: {a}-{sym} ({name}, Z={z})',
    searchNotFound: 'Isotope not found: "{query}"',

    // Display Panel
    dispTitle: 'Isotope Datasheet',
    badgeValleyFloor: '⛰️ Valley Floor (Fe)',
    badgeMaxBinding: '⚓ Max Binding (Ni)',
    badgeStable: 'Stable / Long-lived',
    badgeRadioactive: 'Radioactive',
    lblBindingHeader: '⚡ Binding Energy per Nucleon (E_bind / A)',
    unitMevPerA: 'MeV / nucleon',
    unitPjPerA: '{val} pJ / nucleon',
    lblKisfizRef: 'In KisFiz units:',
    lblColZ: 'Atomic # (Z)',
    lblColZSub: 'proton',
    lblColN: 'Neutron (N)',
    lblColNSub: 'neutron',
    lblColA: 'Mass # (A)',
    lblColASub: 'nucleon',
    lblTotalBinding: 'Total binding energy:',
    lblMassExcess: 'Mass excess:',
    lblValleyDepth: 'Valley depth (from top):',
    lblDepthUnit: '{val} MeV above valley floor',
    secSignificance: '💡 Nuclear Physics Significance',
    noteH1: 'Free proton (¹H): no nucleons bound together, E_bind = 0. Represents the highest summit of the valley.',
    noteHe4: 'Helium-4 (alpha particle): exceptionally tight binding for a light nucleus (7.07 MeV/nucleon), sharp peak of stability.',
    noteFe56: 'Iron-56: Lies at the deepest basin of the valley. Nucleons are in the tightest bound state; no net energy can be extracted via either fusion or fission.',
    noteNi62: 'Nickel-62: The absolute highest binding energy per nucleon of any isotope in the periodic table (8.7946 MeV/nucleon).',
    noteU235: 'Uranium-235: Fissile heavy nucleus. Upon neutron-induced fission, the two medium-mass fragments slide down toward the valley floor, releasing ~200 MeV!',
    noteLight: 'Light nucleus (A = {a}): During nuclear fusion, nucleons merge into heavier, more tightly bound states closer to the valley floor, releasing energy.',
    noteHeavy: 'Heavy nucleus (A = {a}): Coulomb repulsion weakens nucleon binding; through fission and alpha decays, nuclei cascade toward the stable valley floor.',
    noteDefault: 'Deeply bound isotope located in the valley basin region.',

    // Active Walker Telemetry
    cardWalkerTitle: '🚀 Travelling Atom State',
    badgeStep: 'Step: {curr} / {total}',
    walkerStarted: 'Drop started from the valley slope, descending toward stability.',
    walkerArrived: '🏁 <b>Valley floor reached:</b> {label}. Path trail and energy callouts remain visible.',
    walkerLogTitle: '📜 Trajectory Log & Released Energy',
    walkerLogSum: 'Σ Released: +{mev} MeV (+{pj} pJ)',
    walkerLogStart: '📍 Initial isotope: {el} (E_bind/A = {bea} MeV/A)',
    walkerLogArrive: '🏁 Valley floor reached: {label}',

    // Color Legend
    legendTitle: 'Color Scale (Binding energy increase):',

    // Periodic Table Modal
    modalTitle: 'Periodic Table Nuclide Picker',
    modalSubtitle: 'Select any element and isotope (Z = 1 → 94) to highlight in 3D or drop into the valley!',
    modalBtnClose: 'Close (Esc)',
    modalBtnJump: '📍 Highlight in Valley',
    modalBtnDrop: '▶ Drop into Valley',
    modalBtnPause: '⏸ Pause',
    modalBtnResume: '▶ Resume',
    modalIsotopesLabel: 'Available isotopes:',
    tagStable: 'Stable',

    // 3D Axes
    axisZ: 'Atomic Number (Z: 1 → 94)',
    axisA: 'Mass Number (A: 1 → 244)',
    axisY: 'Valley Depth ∝ E_bind / A'
  },

  hu: {
    // Header & Meta
    pageTitle: 'Nukleáris Energiavölgy 3D',
    brandBadge: '⚛️ Nukleáris Fizika & Magstabilitás',
    appTitle: 'Nukleáris Energiavölgy 3D',
    appSubtitle: 'Fajlagos kötési energia (E_köt / A) és stabilitási test a rendszám (Z) és tömegszám (A) függvényében',
    controlsHint: '🎮 Irányítás: <b>Egér húzás</b> – nézet forgatása | <b>Görgő</b> – zoom | <b>Nyilak / WASD</b> – bejárás a térben | <b>Kattintás</b> – adatlap | <b>Shift + kattintás</b> – ledobás',
    linkDocs: '📖 Dokumentáció',
    tipLinkDocs: 'Többnyelvű kereshető dokumentáció és fizikai háttér megnyitása',
    jumpFe56: 'Ugrás a legkötöttebb völgyfenékhez: 56-Fe',
    jumpNi62: 'Ugrás a legmagasabb fajlagos kötési energiájú izotóphoz: 62-Ni',
    jumpH1: 'Ugrás a szabad protonhoz (csúcs): 1-H',
    jumpU235: 'Ugrás a hasadó urán izotóphoz: 235-U',

    // Control Panel
    ctrlTitle: 'Vezérlőpult',
    secGeometry: '⛰️ Modell Geometria',
    lblStyle: 'Megjelenítés stílusa:',
    optValley: 'Völgy (Fe/Ni legmélyebb pont)',
    optPeak: 'Csúcs (Fe/Ni legmagasabb)',
    lblHeightScale: 'Magasság skála:',
    lblOnlyStable: 'Csak stabil izotópok kiemelése',

    secAtomPicker: '🧪 Atomválasztó',
    btnOpenPeriodic: '📋 Periódusos Rendszer Választó...',
    descPeriodic: 'Válassz ki tetszőleges elemet és izotópot (Z=1..94) a felugró periódusos rendszerből!',

    secDrop: '✨ Atom Ledobása & Vándorlás',
    lblPathType: 'Útvonal jellege:',
    btnPathGradient: '⛰️ Gradiens',
    btnPathChannels: '⚛️ Bomláslánc',
    tipGradient: 'Minden lépésben a legnagyobb E_köt/A növekedést adó szomszédos mag felé halad',
    tipChannels: 'Valós bomlások (alfa, béta+/-, hasadás, fúzió) követése a stabilitás felé',
    btnDropSelected: '▶ Kiválasztott Mag Ledobása',
    btnDropSelectedRunning: '⏸ Szünet',
    btnDropSelectedPaused: '▶ Folytatás',
    lblActiveAtoms: 'Aktív atomok: {count}',
    btnClearWalkers: '🧹 Nyomok törlése',

    secCamera: '📷 Kamera Beállítások',
    camPerspective: '📐 Átlós Perspektíva',
    camTop: '🗺️ Térkép (Felülről)',
    camGorge: '🏞️ Völgyfenék séta',
    camReset: '↺ Alaphelyzet',

    secSearch: '🔍 Izotóp Kereső',
    searchPlaceholder: 'pl. Fe-56, Ni-62, U, 92...',
    btnSearchJump: 'Ugrás',
    searchMatch: 'Találat: {a}-{sym} ({name}, Z={z})',
    searchNotFound: 'Nem található izotóp: "{query}"',

    // Display Panel
    dispTitle: 'Izotóp Adatlap',
    badgeValleyFloor: '⛰️ Völgyfenék (Fe)',
    badgeMaxBinding: '⚓ Max Fajlagos Kötés (Ni)',
    badgeStable: 'Stabil / Tartós',
    badgeRadioactive: 'Radioaktív',
    lblBindingHeader: '⚡ Fajlagos Kötési Energia (E_köt / A)',
    unitMevPerA: 'MeV / nukleon',
    unitPjPerA: '{val} pJ / nukleon',
    lblKisfizRef: 'KisFiz referencia egységben:',
    lblColZ: 'Rendszám (Z)',
    lblColZSub: 'proton',
    lblColN: 'Neutron (N)',
    lblColNSub: 'neutron',
    lblColA: 'Tömegszám (A)',
    lblColASub: 'nukleon',
    lblTotalBinding: 'Teljes kötési energia:',
    lblMassExcess: 'Tömegtöbblet (Mass excess):',
    lblValleyDepth: 'Völgy mélysége (csúcstól):',
    lblDepthUnit: '{val} MeV magasság a völgyfenéktől',
    secSignificance: '💡 Magfizikai Jelentőség',
    noteH1: 'Szabad proton (¹H): nincs nukleonkötés, ezért E_köt = 0. A völgy legmagasabb pontját képezi.',
    noteHe4: 'Hélium-4 (alfa-részecske): rendkívül szorosan kötött könnyű mag (7.07 MeV/nukleon), kiugró stabilitási csúcs.',
    noteFe56: 'Vas-56: A völgy legmélyebb pontja (egyike a legstabilabb magoknak). Sem csillagbeli fúzióval, sem hasadással nem nyerhető belőle energia.',
    noteNi62: 'Nikkel-62: Az egész periódusos rendszer abszolút legmagasabb fajlagos kötési energiájú izotópja (8.7946 MeV/nukleon).',
    noteU235: 'Urán-235: Hasadásakor (fisszió) a két keletkező közepes tömegű hasadványmag lejjebb csúszik a völgy mélyére, ~200 MeV energiát felszabadítva!',
    noteLight: 'Könnyű mag (A = {a}): A magfúzió során a magok nehezebb, a völgy aljához közelebbi állapotba kerülhetnek, energiafelszabadulással.',
    noteHeavy: 'Nehéz mag (A = {a}): A Coulomb-taszítás miatt a fajlagos kötés csökken; maghasadással a magok a stabilabb völgyfenék felé tartanak.',
    noteDefault: 'A völgyfenék régiójában elhelyezkedő maximálisan kötött mag.',

    // Active Walker Telemetry
    cardWalkerTitle: '🚀 Vándorló Atom Állapota',
    badgeStep: 'Lépés: {curr} / {total}',
    walkerStarted: '📍 Kiindulási állapot a völgy lejtőjén. Megindul a lefelé tartó átalakulási folyamat.',
    walkerArrived: '🏁 <b>Völgyfenék elérve:</b> {label}. A nyomvonal és az energiacímkék a völgyben maradnak.',
    walkerLogTitle: '📜 Lépésnapló és Távozó Energiák',
    walkerLogSum: 'Σ Távozó: +{mev} MeV (+{pj} pJ)',
    walkerLogStart: '📍 Kiinduló izotóp: {el} (E_köt/A = {bea} MeV/A)',
    walkerLogArrive: '🏁 Völgyfenék elérve: {label}',

    // Color Legend
    legendTitle: 'Színskála (Kötési energia növekedése):',

    // Periodic Table Modal
    modalTitle: 'Periódusos Rendszer Atomválasztó',
    modalSubtitle: 'Válassz elemet és izotópot (Z = 1 → 94) a 3D völgyben való kijelöléshez vagy ledobáshoz!',
    modalBtnClose: 'Bezárás (Esc)',
    modalBtnJump: '📍 Kijelölés a völgyben',
    modalBtnDrop: '▶ Ledobás a völgybe',
    modalBtnPause: '⏸ Szünet',
    modalBtnResume: '▶ Folytatás',
    modalIsotopesLabel: 'Választható izotópok:',
    tagStable: 'Stabil',

    // 3D Axes
    axisZ: 'Rendszám (Z: 1 → 94)',
    axisA: 'Tömegszám (A: 1 → 244)',
    axisY: 'Völgy mélysége ∝ E_köt / A'
  }
};

class I18nManager {
  constructor() {
    let saved = 'hu';
    try {
      saved = localStorage.getItem(STORAGE_KEY) || 'hu';
    } catch (e) {
      // Fallback if localStorage is inaccessible
      saved = 'hu';
    }
    this.currentLang = (saved === 'en') ? 'en' : 'hu';
    this.listeners = new Set();
  }

  getLanguage() {
    return this.currentLang;
  }

  setLanguage(lang) {
    const next = (lang === 'hu') ? 'hu' : 'en';
    if (this.currentLang === next) return;
    this.currentLang = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      // ignore storage errors
    }
    this.listeners.forEach(fn => fn(this.currentLang));
  }

  t(key, params = {}) {
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
    let text = dict[key] || TRANSLATIONS.en[key] || key;
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
    return text;
  }

  getElement(z) {
    const entry = ELEMENTS_I18N[z];
    if (!entry) return { sym: `E${z}`, name: `Element ${z}` };
    return {
      sym: entry.sym,
      name: (this.currentLang === 'hu') ? entry.hu : entry.en
    };
  }

  getCategory(id) {
    const cat = CATEGORIES_I18N[id] || { en: id, hu: id, color: '#38bdf8' };
    return {
      id,
      name: (this.currentLang === 'hu') ? cat.hu : cat.en,
      color: cat.color
    };
  }

  onLanguageChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

export const i18n = new I18nManager();
