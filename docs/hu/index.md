# Nukleáris Energiavölgy 3D

Üdvözöljük a **Nukleáris Energiavölgy 3D** interaktív tudományos és oktatási dokumentációjában!

Ez a projekt egy valós idejű, bejárható 3D WebGL / Three.js szimuláció, amely a nukleáris fajlagos kötési energiát és a magstabilitási felületet jeleníti meg a periódusos rendszer első 94 elemének (Hidrogéntől a Plutóniumig) **3078 izotópjával**, a hivatalos **IAEA / AMDC AME2020** adatbázis alapján.

<div class="cta-container">
  <a href="app/" class="btn-cta-primary">
    <span>⚛️ 3D Szimulátor Indítása</span>
  </a>
  <a href="physics/" class="btn-cta-secondary">
    <span>📚 Fizikai Háttér Olvasása</span>
  </a>
  <a href="guide/" class="btn-cta-secondary">
    <span>🎮 Használati Útmutató</span>
  </a>
</div>

---

## 🚀 Elérhetőség a GitHub Pages-en

Az alkalmazás és a dokumentáció hivatalos, publikált kiadása elérhető a GitHub Pages felületén:

- 🌐 **Magyar nyelvű dokumentáció**: [https://lowcoders.github.io/nuclear_valley/](https://lowcoders.github.io/nuclear_valley/)
- 🌐 **Angol nyelvű dokumentáció**: [https://lowcoders.github.io/nuclear_valley/en/](https://lowcoders.github.io/nuclear_valley/en/)
- ⚛️ **Interaktív 3D WebGL alkalmazás**: [https://lowcoders.github.io/nuclear_valley/app/](https://lowcoders.github.io/nuclear_valley/app/)
- 🐙 **GitHub forráskód tároló**: [https://github.com/LowCoders/nuclear_valley](https://github.com/LowCoders/nuclear_valley)

---

## Mi az a Nukleáris Energiavölgy?

A magerők vonzása miatt, amikor szabad protonokból és neutronokból atommag keletkezik, tetemes mennyiségű kötési energia szabadul fel ($E_\text{köt} > 0$). A magban kötött nukleonok átlagos energiája alacsonyabb, mint a szabad nukleonoké:

$$
E_\text{nukleon} = - \frac{E_\text{köt}}{A}
$$

Ha ezt a fajlagos energiát ábrázoljuk a rendszám ($Z$) és a tömegszám ($A$) függvényében, a felület egy markáns folyóvölgyre hasonlít:

- **A hegycsúcs**: A szabad proton ($^{1}\text{H}$) áll a legmagasabb ponton ($E_\text{köt}/A = 0$), hiszen nincs nukleonkötés.
- **A völgyfenék**: A legmélyebb ponton a vascsoport izotópjai ülnek: a $^{56}_{26}\text{Fe}$ ($8{,}790\text{ MeV/nukleon}$) és a természet legszorosabban kötött magja, a $^{62}_{28}\text{Ni}$ ($8{,}795\text{ MeV/nukleon}$).
- **A magátalakulások iránya**: A természet a minimális energiájú állapotra törekszik. A könnyű magok **magfúzióval**, a nehéz magok pedig **maghasadással és alfa-bomlásokkal** mozognak a völgyfenék felé.

---

## Főbb Képességek

<div class="feature-grid">
  <div class="feature-card">
    <h3>🌌 Teljes AME2020 Adatbázis</h3>
    <p>3078 kísérletileg mért és kiértékelt izotóp adatai (tömegtöbblet, fajlagos kötési energia, stabilitási státusz, felezési idő és bomlási módok).</p>
  </div>
  <div class="feature-card">
    <h3>⚡ GPU InstancedMesh Renderelés</h3>
    <p>Mind a 3078 oszlop egyetlen WebGL draw call segítségével jelenik meg sima 60 FPS sebességgel, valós idejű színátmenettel és kiemelésekkel.</p>
  </div>
  <div class="feature-card">
    <h3>🎮 Párhuzamos Navigáció</h3>
    <p>Szabadon kombinálható egér forgatás (OrbitControls) és WASD / nyíl billentyűs repülés, fókuszpont-követéssel és azonnali ugrásokkal.</p>
  </div>
  <div class="feature-card">
    <h3>☄️ Pályaszimuláció & Atomledobás</h3>
    <p>Bármelyik atommag ledobható a völgybe a magasból: a rendszer fizikai bomlásláncok vagy gradiens mentén végigvezeti a völgyfenékig tartó útvonalat.</p>
  </div>
  <div class="feature-card">
    <h3>🧪 Periódusos Rendszer Választó</h3>
    <p>Teljes 18 oszlopos IUPAC periódusos rendszer kategória-színezéssel és izotópfiókokkal a gyors kereséshez és kiválasztáshoz.</p>
  </div>
  <div class="feature-card">
    <h3>🌐 Kétnyelvű Rendszer (HU / EN)</h3>
    <p>A felhasználói felület, az adatlapok és a teljes elméleti dokumentáció magyar és angol nyelven is rendelkezésre áll.</p>
  </div>
</div>

---

## Gyors Hivatkozások a Dokumentációban

- [Fizikai Fogalmak és Matematikai Modell](physics.md) – A folyadékcsepp modell, Bethe–Weizsäcker formula, kötési energia és mértékegységek.
- [Használati Útmutató](guide.md) – Billentyűkiosztás, kamerakezelés, szimulációs módok és atomledobás.
- [Adatbázis és Architektúra](database.md) – Az AME2020 adatfeldolgozás részletei, Three.js csővezeték és adatfolyamok.
- [3D WebGL Alkalmazás Indítása](app/) – Közvetlen belépés az interaktív 3D szimulátorba.
