# User & Controls Guide

**Nuclear Energy Valley 3D** is a fully interactive WebGL application running directly in your web browser. No plugins, installations, or external dependencies are needed.

---

## 1. Camera & Navigation

The application combines orbit inspection with free-flight traversal, allowing simultaneous mouse and keyboard operation.

| Action | Control / Key | Description |
|---|---|---|
| **Rotate view (Orbit)** | Left click & drag | Rotates camera around the current target. |
| **Zoom in / out** | Scroll wheel / pinch gesture | Smooth optical zoom. |
| **Horizontal traversal** | `W`, `A`, `S`, `D` or `Arrow keys` | Fly forward, backward, left, or right. |
| **Vertical elevation** | `Q` / `Space` (up), `E` / `C` (down) | Change altitude above the landscape. |
| **Speed boost** | Hold `Shift` while traversing | Doubles travel speed across the chart. |
| **Focus on isotope** | Click any nuclide column | Centers camera orbit on that isotope. |

---

## 2. Visualization Modes

The control panel provides two distinct topographic perspectives:

1. **Valley Mode (Default & Intuitive)**:
   - Reflects the true physical potential well: bars extend downwards.
   - More tightly bound nuclei ($E_\text{bind}/A$ higher) sit deeper in the canyon.
   - $^{56}\text{Fe}$ and $^{62}\text{Ni}$ rest at the lowest basin.
   - Ideal for the atom drop simulation: dropped atoms roll downward under gravity.

2. **Peak Mode (Traditional Column Chart)**:
   - Column height is directly proportional to binding energy per nucleon.
   - Iron-group elements form the highest plateau ($~8.8\text{ MeV}$).

---

## 3. Nuclide Selection & Telemetry

Clicking any 3D bar updates the **Telemetry Panel** on the right side:

- **Element & Chemical Symbol**: E.g. Iron ($^{56}_{26}\text{Fe}$), Uranium ($^{235}_{92}\text{U}$)
- **Nuclear Coordinates**: $Z$ (protons), $N$ (neutrons), $A$ (mass number)
- **Specific Binding Energy**: Expressed in both $\text{MeV/nucleon}$ and $\text{pJ/nucleon}$
- **Mass Excess**: $\Delta = m - A$ in keV
- **Stability Status**: Stable nuclide, or half-life with radioactive decay mode ($\alpha$, $\beta^{-}$, $\beta^{+}$, fission)

The top header bar provides instant shortcuts to key nuclei:
- ⛰️ $^{56}\text{Fe}$ – Famous nucleosynthesis endpoint
- ⚓ $^{62}\text{Ni}$ – Highest binding energy per nucleon
- 📍 $^{1}\text{H}$ – Free proton (valley summit)
- ☢️ $^{235}\text{U}$ – Fissile uranium fuel

---

## 4. Nuclear Trajectory Engine (Atom Drop)

Experience nuclear transformations firsthand with the **Atom Drop** feature:

1. Select any isotope (e.g. $^{238}\text{U}$, $^{14}\text{C}$, or $^{2}\text{H}$).
2. Click **▶ Drop Selected Nucleus**, or use `Shift + Click` / `Double-Click` on the 3D bar.
3. A spherical particle falls from high altitude onto the chosen column via simulated gravity.
4. The atom then embarks on a step-by-step migration toward the stability basin.

### Path Algorithms

- **Gradient Mode**: Step-by-step local steepest ascent in binding energy per nucleon ($\Delta E_\text{bind}/A$) across immediate neighbors.
- **Decay Chain Mode**: Simulates realistic physical transitions:
  - Fission for heavy actinides
  - $\alpha$-decay ($Z - 2, A - 4$)
  - $\beta^{-}$-decay ($Z + 1, A$)
  - $\beta^{+}$ / Electron capture ($Z - 1, A$)

A 3D light ribbon (`PathTrail`) and floating comic-style callouts follow the particle, showing the energy $\Delta E$ released at each transition.

---

## 5. Periodic Table Nuclide Picker

Click the **🧪 Periodic Table** button in the left sidebar to open the 18-column IUPAC interactive modal:

- Color-coded by standard chemical families (alkali metals, halogens, noble gases, actinides, etc.).
- Clicking any element opens its **Isotope Drawer**, listing all 3,078 evaluated isotopes with stability indicators.
- Select and drop any isotope directly from the modal into the 3D valley.
