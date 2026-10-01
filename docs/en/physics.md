# Physical Concept & Mathematical Background

The nuclear energy valley is one of the most expressive pedagogical and research tools in nuclear physics. It clarifies why stellar cores release energy through fusion, why nuclear power plants operate via fission, and why certain nuclides remain stable while others decay in microseconds.

---

## 1. Why Does the Valley Form?

Atomic nuclei are held together by the strong nuclear force, which overcomes electrostatic Coulomb repulsion between positively charged protons. When free nucleons bind together, energy is released:

$$
E_\text{bind} = \left[ Z \cdot m_p + (A - Z) \cdot m_n - m(Z, A) \right] \cdot c^2
$$

Where:

- $Z$: atomic number (proton count)
- $A$: mass number (total nucleon count, $A = Z + N$)
- $m_p, m_n$: rest masses of free protons and neutrons
- $m(Z, A)$: rest mass of the bound nucleus
- $c$: speed of light in vacuum

The specific binding energy per nucleon is defined as:

$$
\varepsilon = \frac{E_\text{bind}}{A}
$$

The average bound state energy per nucleon is therefore negative relative to free space:

$$
E_\text{nucleon} = - \frac{E_\text{bind}}{A} = - \varepsilon
$$

When plotted on the $(Z, A)$ plane:
- Inverting the sign creates an intuitive **valley**, where deeper points indicate stronger binding and lower internal energy.
- Plotting raw positive binding energy produces a **ridge / plateau**, where higher peaks represent higher stability.
- Our application allows toggling between both representations with a single click (**Valley Mode** vs **Peak Mode**).

---

## 2. The Valley Basin: $^{56}\text{Fe}$ and $^{62}\text{Ni}$

Popular accounts frequently cite Iron-56 as the most tightly bound isotope. Precision nuclear mass evaluations (IAEA AME2020) reveal a more nuanced reality:

| Isotope | Atomic Number ($Z$) | Mass Number ($A$) | Binding Energy / $A$ (MeV) | Binding Energy / $A$ (pJ) | Role in Physics |
|---|---|---|---|---|---|
| $^{1}\text{H}$ | 1 | 1 | 0.00000 | 0.00000 | Free proton – highest summit of the valley |
| $^{4}\text{He}$ | 2 | 4 | 7.07392 | 1.13338 | Tightly bound alpha particle (doubly magic) |
| $^{56}\text{Fe}$ | 26 | 56 | 8.79036 | 1.40837 | Most abundant endpoint of stellar silicon burning |
| $^{62}\text{Ni}$ | 28 | 62 | **8.79456** | **1.40904** | **Absolute highest specific binding energy in nature** |
| $^{235}\text{U}$ | 92 | 235 | 7.59091 | 1.21620 | Fissile actinide fuel |
| $^{238}\text{U}$ | 92 | 238 | 7.57013 | 1.21287 | Primary natural uranium isotope |

Iron-56 dominates stellar nucleosynthesis because photodisintegration equilibrium (NSE) favors the faster $^{56}\text{Ni} \to ^{56}\text{Co} \to ^{56}\text{Fe}$ decay chain under stellar interior temperatures, even though Nickel-62 is thermodynamically slightly deeper.

---

## 3. Unit Systems & Conversions

Nuclear laboratories routinely measure energy in mega-electronvolts ($1\text{ MeV} = 10^6\text{ eV}$), whereas standard SI textbooks often use picojoules ($1\text{ pJ} = 10^{-12}\text{ J}$).

The exact conversion factor based on elementary electric charge:

$$
1\text{ eV} = 1.602176634 \times 10^{-19}\text{ J}
$$

$$
1\text{ MeV} = 0.1602176634\text{ pJ}
$$

$$
1\text{ pJ} \approx 6.241509074\text{ MeV}
$$

The application displays both units simultaneously in the real-time telemetry HUD for every nuclide.

---

## 4. Semi-Empirical Mass Formula (Bethe–Weizsäcker)

The continuous geometry of the valley is well captured by the liquid drop model formula:

$$
E_\text{bind}(Z, A) = a_v A - a_s A^{2/3} - a_c \frac{Z(Z-1)}{A^{1/3}} - a_a \frac{(A - 2Z)^2}{A} + \delta(Z, A)
$$

Physical terms:

1. **Volume term ($a_v A$)**: Nearest-neighbor strong force saturation.
2. **Surface term ($-a_s A^{2/3}$)**: Boundary nucleons experience fewer neighbors (surface tension).
3. **Coulomb term ($-a_c \frac{Z(Z-1)}{A^{1/3}}$)**: Long-range proton repulsion bending heavy nuclei toward neutron excess.
4. **Asymmetry term ($-a_a \frac{(A - 2Z)^2}{A}$)**: Quantum Pauli exclusion penalizing unequal proton and neutron states ($N \approx Z$).
5. **Pairing term ($\delta$)**: Even-even configurations gain extra stability through spin pairing.

---

## 5. Magic Numbers & Closed Shells

Deviations from the smooth liquid drop curve reflect nuclear shell structure. Nuclei with complete quantum shells exhibit anomalously high binding energy. The fundamental magic numbers:

$$
Z, N \in \{ 2, 8, 20, 28, 50, 82, 126 \}
$$

In the 3D visualization, closed shells appear as marked dashed grid lines and 3D labels, highlighting stability ridges along the valley slopes.
