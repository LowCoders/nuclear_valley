# Nukleáris Energiavölgy 3D (Nuclear Valley WebGL)

[![Licenc: MIT](https://img.shields.io/badge/Licenc-MIT-blue.svg)](LICENSE)
[![Three.js](https://img.shields.io/badge/Three.js-r160-black.svg)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![Nyelv: EN/HU](https://img.shields.io/badge/i18n-EN%20%7C%20HU-38bdf8.svg)](#többnyelvűség-i18n)

Interaktív, bejárható 3D WebGL / Three.js oktató és kutatási alkalmazás a nukleáris fajlagos kötési energiavölgy és magstabilitási felület megjelenítéséhez a periódusos rendszer első 94 elemének (Hidrogéntől a Plutóniumig) 3078 izotópjával.

A projekt a [KisFiz Interaktív energiavölgy](https://kisfiz.hu/nuclear-physics/interactive-energy-valley/) tananyaga alapján készült, látványvilágában és moduláris szoftverarchitektúrájában pedig a szomszédos `/web/visualisation` (Kvantum- és Atomvizualizációs Rendszer) komponenseire és stílusára támaszkodik.

![Nukleáris Energiavölgy 3D — útvonal képregény stílusú távozó energia címkékkel](docs/images/nuclear-valley-screenshot.jpg)

---

## Tartalomjegyzék

1. [Fizikai Fogalmak és Matematikai Háttér](#fizikai-fogalmak-és-matematikai-háttér)
2. [Főbb Jellemzők](#főbb-jellemzők)
3. [Interaktív Irányítás](#interaktív-irányítás)
4. [Magátalakulási Útvonalak és Atomledobás](#magátalakulási-útvonalak-és-atomledobás)
5. [Periódusos Rendszer Atomválasztó](#periódusos-rendszer-atomválasztó)
6. [Többnyelvűség (i18n)](#többnyelvűség-i18n)
7. [Telepítés és Futtatás](#telepítés-és-futtatás)
8. [Projekt Felépítése](#projekt-felépítése)

---

## Fizikai Fogalmak és Matematikai Háttér

### Miért völgy alakú a képződmény?

A magerők vonzása miatt a szabad nukleonokból kötött atommag képződésekor jelentős kötési energia szabadul fel ($E_\text{köt} > 0$). A magban lévő nukleonok átlagos energiája tehát **alacsonyabb**, mint a szabad nukleonoké:

$$
E_\text{nukleon} = - \frac{E_\text{köt}}{A}
$$

Ha ezt az energiát ábrázoljuk a rendszám ($Z$) és a tömegszám ($A$) függvényében egy térbeli diagramon, egy folyóvölgyhöz hasonló formát kapunk:

- **Szabad proton ($^{1}\text{H}$)**: nincs nukleonkötés, $E_\text{köt}/A = 0$, így ez alkotja a völgy legmagasabb csúcsát.
- **Völgyfenék ($^{56}_{26}\text{Fe}$ és $^{62}_{28}\text{Ni}$)**: a nukleononként felszabadult kötési energia itt éri el a maximumát:
  - $^{56}\text{Fe}$: $8{,}79036\text{ MeV/nukleon} \approx 1{,}40837\text{ pJ/nukleon}$
  - $^{62}\text{Ni}$: $8{,}79456\text{ MeV/nukleon} \approx 1{,}40904\text{ pJ/nukleon}$ (a periódusos rendszer abszolút legmagasabb fajlagos kötésű izotópja).
- **A magátalakulások hajtóereje**: a fizikai rendszerek a mélyebb energiájú, szorosabban kötött állapotok felé törekednek. A könnyű magok **magfúzióval** lépkednek a völgy feneke felé, míg a nehéz magok **maghasadással (fisszió)** és alfa-bomlásokkal csúsznak le a stabil völgyfenék irányába.

### Mértékegység Átszámítás

A magfizika hagyományosan megaelektronvoltot (MeV) használ, a középiskolai és egyetemi oktatásban pedig gyakran a pikojoule (pJ) szerepel:

$$
1\text{ MeV} = 10^6\text{ eV} = 1{,}602176634 \times 10^{-13}\text{ J} = 0{,}1602176634\text{ pJ}
$$

A program mindkét mértékegységet valós időben számolja az IAEA AME2020 adatai alapján, és párhuzamosan megjeleníti a telemetria adatlapon.

---

## Főbb Jellemzők

- **Hivatalos IAEA / AMDC AME2020 Adatbázis**: 3078 izotóp ($Z = 1 \dots 94$) a legújabb kiadott magtömeg-kiértékelésből.
- **GPU-Gyorsított InstancedMesh Renderelés**: Mind a 3078 oszlop egyetlen draw-callban renderelődik folyamatos 60 FPS sebességgel, előre kiszámított színátmenet-tömbbel.
- **Egységes Párhuzamos Navigáció**:
  - Az egér (OrbitControls) folyamatosan aktív forgatásra és zoomolásra.
  - A nyilak és a `WASD` gombok ezzel párhuzamosan, valós időben mozgatják a kamerát és a fókuszpontot a térben.
- **Optimális 45 Fokos Kezdőperspektíva**: A völgy hossztengelye mentén elforgatott nézet, amely mindkét lejtőfalat és a mély kanyont egyszerre mutatja.
- **Kétféle Völgyábrázolás**:
  - *Völgy mód (alapértelmezett, intuitív)*: a mélyebb oszlop stabilabb magot jelent; a vas és nikkel a legmélyebb ponton ül.
  - *Csúcs mód*: hagyományos oszlopdiagram, ahol az oszlop magassága numerikusan egyezik a fajlagos kötési energiával.
- **Interaktív 18 Oszlopos Periódusos Rendszer Választó**: Teljes IUPAC táblázat színkódolt kategóriákkal, izotóp-fiókkal és közvetlen ledobási lehetőséggel.
- **Mágikus Számok Jelölése**: Szaggatott vonalak és 3D feliratok a zárt nukleonhéjakhoz: $Z = 2, 8, 20, 28, 50, 82$.

---

## Interaktív Irányítás

| Funkció | Billentyű / Egér |
|---|---|
| **Nézet forgatása (Orbit)** | Egér bal gomb nyomva tartása és húzás |
| **Közelítés / Távolítás (Zoom)** | Egérgörgő |
| **Mozgás a térben (Bejárás)** | `Nyilak` vagy `W`, `A`, `S`, `D` (párhuzamosan működik az egérrel) |
| **Függőleges mozgás** | `Q` / `Szóköz` (fel), `E` / `C` (le) |
| **Gyors mozgás (boost)** | `Shift` nyomva tartása mozgás közben |
| **Izotóp kiválasztása** | Bal egérkattintás bármelyik oszlopra |
| **Atom ledobása a völgybe** | `Shift + Kattintás` vagy `Dupla kattintás` bármelyik oszlopra, vagy `▶ Kiválasztott Mag Ledobása` gomb |
| **Animáció szüneteltetése / folytatása** | `⏸ Szünet` / `▶ Folytatás` gomb |
| **Nyelvváltás** | `[EN]` / `[HU]` gomb a fejlécben |

---

## Magátalakulási Útvonalak és Atomledobás

A felhasználó tetszőleges izotópot ledobhat a magasból ($Y + 24$). Az atom szabadeséssel érkezik meg az induló oszlopára, majd lépésről lépésre vándorol a völgyfenék felé:

1. **Gradiens Mód**: Minden lépésben a legnagyobb $\Delta(E_\text{köt}/A)$ növekedést nyújtó szomszédos izotóp felé halad.
2. **Bomláslánc Mód**: Valós fizikai reakciócsatornákat követ:
   - **Maghasadás (fisszió)**: Nehéz aktinoidák ($Z \ge 90$) közepes tömegű hasadványmagokra esnek szét (pl. $^{235}\text{U} \to ^{96}\text{Zr}$).
   - **$\alpha$-bomlás**: $^{4}\text{He}$ kibocsátása ($\Delta Z = -2, \Delta A = -4$).
   - **$\beta^{-}$ / $\beta^{+}$ / EC**: Izobár átalakulások ($\Delta Z = \pm 1, \Delta A = 0$).
   - **Fúzió és magbefogás**: Könnyű magok csillagbeli nukleoszintézise a völgyfenék felé.
3. **Tartós 3D Nyomvonal és Távozó Energia Címkék**: A bejárt útvonal mentén világító 3D vonal és lépésenkénti távozó energia címkék (+MeV / +pJ) jelennek meg, amelyek a célba érés után is tartósan a völgyben maradnak egy újabb atom ledobásáig vagy a nyomok kézi törléséig.
4. **Dinamikus Lejátszásvezérlés**: A ledobás gomb futás közben `⏸ Szünet`, megállításkor pedig `▶ Folytatás` gombra vált.

---

## Periódusos Rendszer Atomválasztó

A `📋 Periódusos Rendszer Választó...` gombra kattintva megnyílik a teljes periódusos rendszer felugró ablak:
- Szabványos 18 oszlopos rács mind a 94 elemmel, vegyjelekkel és magyar/angol elnevezésekkel.
- Külön Lantanoida ($Z = 57..71$) és Aktinoida ($Z = 89..94$) sorok.
- Részletes izotóp-fiók: felsorolja az adott elem összes izotópját tömegszámmal, fajlagos kötési energiával és stabilitási jelöléssel.
- Közvetlen `📍 Kijelölés a völgyben` és `▶ Ledobás a völgybe` gombok.

---

## Többnyelvűség (i18n)

Az alkalmazás kétnyelvű: **alapértelmezetten angol (EN)**, és bármikor átváltható **magyar (HU)** nyelvre. A választott nyelv automatikusan mentődik a böngésző `localStorage` tárhelyében.

Minden felületi elem azonnal és szinkronban frissül:
- Fejléc, jelvények, feliratok és irányítási tippek.
- Vezérlőpult gombjai, csúszkái és feliratai.
- Izotóp adatlap magfizikai magyarázatai és összetételi adatai.
- Periódusos rendszer kategóriái és elemei (angol és magyar vegytani nevek).
- 3D koordináta-tengelyek feliratai.
- Intelligens kereső, amely angol (`iron`, `lead`, `gold`, `uranium`) és magyar (`vas`, `olom`, `arany`, `uran`) neveket is felismer.

---

## Telepítés és Futtatás

```bash
# Lépj be a projekt mappájába
cd /web/nuclear_valley

# Függőségek telepítése
npm install

# Fejlesztői szerver indítása (hot-reload)
npm run dev

# Termelési build készítése
npm run build

# Termelési build helyi előnézete
npm run preview

# Automatikus telepítés a .env konfiguráció szerint
npm run deploy
```

A részletes, lépésről lépésre követhető kézi telepítési és webszerver-konfigurációs útmutatót az [INSTALL.hu.md](INSTALL.hu.md) fájl tartalmazza.

---

## Projekt Felépítése

```
/web/nuclear_valley/
├── index.html                    # Fő HTML oldal HUD elemekkel és Three.js konténerrel
├── package.json                  # Csomag konfiguráció (Three.js, Vite)
├── .env.example                  # Környezeti változók sablonja
├── .env                          # Helyi környezeti változók
├── .github/workflows/ci-cd.yml   # Automatizált GitHub Actions CI/CD munkafolyamat
├── README.md                     # Központi dokumentációs mutató
├── README.en.md                  # Részletes angol nyelvű dokumentáció
├── README.hu.md                  # Részletes magyar nyelvű dokumentáció (ez a fájl)
├── INSTALL.en.md                 # Kézi telepítési útmutató (angol)
├── INSTALL.hu.md                 # Kézi telepítési útmutató (magyar)
├── scripts/
│   ├── build-isotope-data.mjs    # AME2020 táblázatot feldolgozó Node script
│   └── deploy.sh                 # Környezeti változókat olvasó telepítő script
├── public/data/isotopes.json     # Kompakt, 3078 izotóp adatait tartalmazó JSON adatbázis
└── src/
    ├── main.js                   # Alkalmazás belépési pont és komponens huzalozás
    ├── core/
    │   ├── Engine.js             # WebGL renderelő, megvilágítás és egységes navigáció
    │   ├── i18n.js               # Reaktív többnyelvű modul (EN/HU állapotmentéssel)
    │   ├── PathPlanner.js        # Gradiens és reakciócsatorna útvonal-tervező
    │   ├── DropManager.js        # Párhuzamos atomledobások és Play/Pause vezérlés
    │   ├── InteractionManager.js # Fojtott raycasting és kattintáskezelő
    │   ├── SyncEngine.js         # Szimulációs órajel és eseménybusz
    │   └── VisualComponent.js    # 3D vizuális komponensek életciklus alaposztálya
    ├── components/
    │   ├── EnergyValley.js       # 3078 oszlop InstancedMesh reprezentációja
    │   ├── AtomWalker.js         # 3D vándorló atommodell (halo, fény, jelvény, animáció)
    │   ├── PathTrail.js          # Bejárt útvonal mentén rajzolt 3D vonal és energia-címkék
    │   ├── ValleyAxes.js         # Lokalizált koordináta-tengelyek és mágikus számok
    │   └── GroundPlane.js        # Sötét sci-fi koordináta padlórács
    ├── data/
    │   └── IsotopeStore.js       # Izotóp lekérdezések, szűrés és kétnyelvű kereső
    └── ui/
        ├── BasePanel.js          # Glassmorphic lebegő panel alaposztály
        ├── ControlPanel.js       # Bal oldali vezérlőpult (geometria, atomválasztó, keresés)
        ├── DisplayPanel.js       # Jobb oldali kétnyelvű izotóp adatlap
        ├── PeriodicTableModal.js # 18 oszlopos interaktív periódusos rendszer modál
        └── styles.css            # Sci-fi glassmorphic stíluslap
```
