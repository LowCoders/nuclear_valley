# Használati Útmutató

A **Nukleáris Energiavölgy 3D** egy teljes mértékben interaktív, böngészőben futó WebGL alkalmazás. Nem igényel semmilyen külső beépülő modult vagy telepítést.

---

## 1. Kamera és Navigáció

Az alkalmazás egyesíti az Orbit forgatást a repülő üzemmóddal, így mindkét navigációs mód párhuzamosan használható.

| Funkció | Billentyű / Egér | Leírás |
|---|---|---|
| **Nézet forgatása (Orbit)** | Bal egérgomb nyomva tartása és húzás | A kamera a fókuszpont körül forog. |
| **Közelítés / Távolítás (Zoom)** | Egérgörgő vagy kétujjas görgetés | Finom léptékű optikai zoom. |
| **Vízszintes bejárás** | `W`, `A`, `S`, `D` vagy `Nyilak` | Előre, balra, hátra, jobbra repülés a térben. |
| **Függőleges mozgás** | `Q` / `Szóköz` (fel), `E` / `C` (le) | Magasságváltoztatás a völgy felett. |
| **Gyorsítás (Boost)** | `Shift` billentyű nyomva tartása | Kétszeres repülési sebesség a térképen való gyors átkeléshez. |
| **Fókuszpont áthelyezése** | Kattintás egy izotóp oszlopra | A kamera fókusza a kiválasztott izotópra ugrik. |

---

## 2. Megjelenítési Módok

A vezérlőpulton két alapvető topográfiai ábrázolás közül választhat:

1. **Völgy mód (Alapértelmezett)**:
   - A fizikai potenciálgödröt mintázza: az oszlop lefelé mutat.
   - Minél szorosabban kötött egy mag ($E_\text{köt}/A$ magasabb), annál mélyebben fekszik a völgyben.
   - A legstabilabb magok ($^{56}\text{Fe}$, $^{62}\text{Ni}$) a kanyon legmélyén helyezkednek el.
   - Kiválóan alkalmas az atomledobás szemléltetésére: az atom legurul a hegyoldalról a legmélyebb völgyfenékbe.

2. **Csúcs mód (Tradicionális oszlopdiagram)**:
   - Az oszlop magassága közvetlenül arányos a numerikus fajlagos kötési energiával.
   - A vas- és nikkelcsoport képezi a legmagasabb platót ($~8{,}8\text{ MeV}$).

---

## 3. Izotóp Választás és Telemetria

Bármelyik 3D oszlopra kattintva a jobb oldali **Telemetria Panel** részletes adatlapot mutat:

- **Elem neve és vegyjele**: Pl. Vas ($^{56}_{26}\text{Fe}$), Urán ($^{235}_{92}\text{U}$)
- **Nukleáris számok**: $Z$ (rendszám), $N$ (neutronszám), $A$ (tömegszám)
- **Fajlagos kötési energia**: $\text{MeV/nukleon}$ és $\text{pJ/nukleon}$ egységekben
- **Tömegtöbblet**: $\Delta = m - A$ keV egységben
- **Stabilitási státusz**: Stabil mag, vagy radioaktív felezési idő és bomlási mód ($\alpha$, $\beta^{-}$, $\beta^{+}$, hasadás)

A fejlécben található **Gyorsugró Gombok** segítségével azonnal a legérdekesebb pontokra ugorhat:
- ⛰️ $^{56}\text{Fe}$ – Legismertebb stabilitási végpont
- ⚓ $^{62}\text{Ni}$ – Abszolút legszorosabb fajlagos kötés
- 📍 $^{1}\text{H}$ – Szabad proton (a völgy csúcsa)
- ☢️ $^{235}\text{U}$ – Fisszilis uránizotóp

---

## 4. Atomledobás és Magátalakulási Útvonal

A szimulátor különleges funkciója az **Atomledobás (Drop Atom)**:

1. Válasszon ki egy tetszőleges izotópot (pl. $^{238}\text{U}$, $^{14}\text{C}$ vagy $^{2}\text{H}$).
2. Kattintson a **▶ Kiválasztott Mag Ledobása** gombra, vagy használja a `Shift + Kattintás` / `Dupla kattintás` gesztust az oszlopon.
3. Egy szférikus atomgömb hullik le a magasból az oszlopra szabadeséssel.
4. Ezután az atom lépésről lépésre megkezdi vándorlását a völgy stabil rétegei felé.

### Útvonalszámítási Algoritmusok

A vezérlőpulton beállítható, hogy milyen logikát kövessen az atom:

- **Gradiens Mód**: Minden lépésben megkeresi azt a szomszédos izotópot ($\Delta Z \in \{-1,0,1\}, \Delta N \in \{-1,0,1\}$), amely a legnagyobb fajlagos kötési energia-növekedést biztosítja.
- **Bomláslánc Mód**: Valós fizikai bomlásokat szimulál:
  - Fisszió (hasadás) az aktinoidáknál
  - $\alpha$-bomlás ($Z - 2, A - 4$)
  - $\beta^{-}$-bomlás ($Z + 1, A$)
  - $\beta^{+}$-bomlás / Elektronbefogás ($Z - 1, A$)

A bejárt útvonal mentén 3D fénycsóva (PathTrail) és lebegő képregény stílusú energiacímkék mutatják az egyes lépésekben felszabadult $\Delta E$ energiát.

---

## 5. Periódusos Rendszer Választó

A bal oldali gombsorban található **🧪 Periódusos Rendszer** gomb megnyitja a teljes, 18 oszlopos interaktív felületet:

- Minden elem színe a kémiai kategóriáját tükrözi (alkálifém, halogén, nemesgáz, aktinoida stb.).
- Egy elemre kattintva lenyílik az **Izotóp-fiók**, ahol kilistázódik az adott elem összes ismert izotópja a stabilitási jelzéssel együtt.
- Egy kattintással azonnal kiválasztható és ledobható a völgybe a kívánt mag.
