# Fizikai Fogalmak és Matematikai Háttér

A nukleáris energiavölgy a magfizika egyik legfontosabb szemléltető eszköze. Segítségével megérthető, hogy miért működnek a csillagok magfúzióval, miért termelnek energiát az atomerőművek maghasadással, és miért stabilak bizonyos atommagok, míg mások rendkívül gyorsan elbomlanak.

---

## 1. Miért Alakul Ki a Völgy?

Az atommagot az erős kölcsönhatás (magerő) tartja össze a pozitív töltésű protonok közötti elektrosztatikus Coulomb-taszítás ellenében. Amikor szabad protonok és neutronok magba tömörülnek, kötési energia szabadul fel:

$$
E_\text{köt} = \left[ Z \cdot m_p + (A - Z) \cdot m_n - m(Z, A) \right] \cdot c^2
$$

Ahol:

- $Z$: rendszám (protonok száma)
- $A$: tömegszám (összes nukleon száma, $A = Z + N$)
- $m_p, m_n$: szabad proton és neutron nyugalmi tömege
- $m(Z, A)$: az atommag nyugalmi tömege
- $c$: fénysebesség vákuumban

A fajlagos kötési energia, azaz az egy nukleonra eső energia:

$$
\varepsilon = \frac{E_\text{köt}}{A}
$$

A magban lévő nukleonok átlagos energiája tehát:

$$
E_\text{nukleon} = - \frac{E_\text{köt}}{A} = - \varepsilon
$$

Amikor ezt az értéket ábrázoljuk a $(Z, A)$ koordinátarendszerben:
- A negatív energiaábrázolás egy **völgyet** rajzol ki (ahol a mélyebb állapot szorosabb kötést, alacsonyabb belső energiát jelent).
- A pozitív kötési energia ábrázolás egy **gerincet/platót** ad, amelynek legmagasabb pontjai a legstabilabbak.
- Alkalmazásunkban mindkét nézet választható egyetlen gombnyomással (**Völgy mód** és **Csúcs mód**).

---

## 2. A Völgyfenék: $^{56}\text{Fe}$ és $^{62}\text{Ni}$

Sokan úgy tudják, hogy az 56-os vas a legszorosabban kötött izotóp. A precíz nukleáris mérések (IAEA AME2020) azonban rámutatnak a finomabb valóságra:

| Izotóp | Rendszám ($Z$) | Tömegszám ($A$) | Kötési energia / $A$ (MeV) | Kötési energia / $A$ (pJ) | Megjegyzés |
|---|---|---|---|---|---|
| $^{1}\text{H}$ | 1 | 1 | 0,00000 | 0,00000 | Szabad proton – a völgy legmagasabb csúcsa |
| $^{4}\text{He}$ | 2 | 4 | 7,07392 | 1,13338 | Rendkívül szoros alfa-kötés (mágikus mag) |
| $^{56}\text{Fe}$ | 26 | 56 | 8,79036 | 1,40837 | A leggyakoribb végállapot a csillagok szilícium-égésében |
| $^{62}\text{Ni}$ | 28 | 62 | **8,79456** | **1,40904** | **A természet abszolút legszorosabban kötött magja** |
| $^{235}\text{U}$ | 92 | 235 | 7,59091 | 1,21620 | Hasadóképes aktinoida |
| $^{238}\text{U}$ | 92 | 238 | 7,57013 | 1,21287 | Természetes urán fő izotópja |

A különbség oka, hogy a csillagok belsejében a fotonukleáris egyensúlyi folyamatok (NSE) során az $^{56}\text{Ni} \to ^{56}\text{Co} \to ^{56}\text{Fe}$ lánc sokkal gyorsabban és nagyobb mennyiségben keletkezik a magas fotonhőmérsékleten, noha termodinamikailag a $^{62}\text{Ni}$ minimálisan szorosabban kötött.

---

## 3. Mértékegységek és Átszámítások

A magfizikai laboratóriumok leggyakrabban megaelektronvoltban ($1\text{ MeV} = 10^6\text{ eV}$) fejezik ki az energiákat, míg a magyar oktatási kerettantervekben és SI rendszerben a pikojoule ($1\text{ pJ} = 10^{-12}\text{ J}$) szerepel.

Az átszámítás pontos összefüggése az elektron töltése alapján:

$$
1\text{ eV} = 1{,}602176634 \times 10^{-19}\text{ J}
$$

$$
1\text{ MeV} = 0{,}1602176634\text{ pJ}
$$

$$
1\text{ pJ} \approx 6{,}241509074\text{ MeV}
$$

A szimulátorban mindkét érték valós időben, párhuzamosan látható minden kiválasztott izotóp adatlapján és a telemetriai HUD sávban.

---

## 4. A Folyadékcsepp Modell (Weizsäcker-formula)

Az energiavölgy elméleti hátterét a Bethe–Weizsäcker féle semi-empirikus tömegformula (SEMF) alapozza meg:

$$
E_\text{köt}(Z, A) = a_v A - a_s A^{2/3} - a_c \frac{Z(Z-1)}{A^{1/3}} - a_a \frac{(A - 2Z)^2}{A} + \delta(Z, A)
$$

A tagok fizikai jelentése:

1. **Térfogati tag ($a_v A$)**: A rövid hatótávolságú magerők vonzása, minden nukleon a szomszédaihoz kötődik.
2. **Felületi tag ($-a_s A^{2/3}$)**: A mag felületén lévő nukleonoknak kevesebb szomszédjuk van (hasonlóan a folyadékcsepp felületi feszültségéhez).
3. **Coulomb-taszítás ($-a_c \frac{Z(Z-1)}{A^{1/3}}$)**: A protonok közötti elektrosztatikus taszítás, amely nagy rendszámoknál a völgy falát egyre aszimmetrikusabbá torzítja.
4. **Aszimmetria tag ($-a_a \frac{(A - 2Z)^2}{A}$)**: A Pauli-féle kizárási elv miatt az atommag akkor stabilabb, ha a protonok és neutronok száma közel azonos ($N \approx Z$).
5. **Párosítási tag ($\delta$)**: A páros-páros magok kiugróan stabilak, a páratlan-páratlan magok kevésbé kötöttek.

---

## 5. Mágikus Számok és Zárt Héjak

A folyadékcsepp modell folytonos leírását a kvantált maghéjmodell finomítja. Bizonyos neutronszámoknál és rendszámoknál az atommagok zárt héjakat alkotnak, és megnövekedett kötési energiát mutatnak. Ezek a mágikus számok:

$$
Z, N \in \{ 2, 8, 20, 28, 50, 82, 126 \}
$$

A 3D vizualizációban ezek a kitüntetett vonalak szaggatott marker vonalakkal és 3D feliratokkal vannak kiemelve a koordinátatengelyeken, így közvetlenül látható a stabilitási szigetek kiemelkedése a völgy lejtőin.
