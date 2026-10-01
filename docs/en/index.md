# Nuclear Energy Valley 3D

Welcome to the **Nuclear Energy Valley 3D** scientific and educational documentation!

This project is an interactive, real-time 3D WebGL / Three.js simulation visualizing the nuclear specific binding energy landscape and stability surface across **3,078 isotopes** of the first 94 elements (from Hydrogen to Plutonium), powered by the official **IAEA / AMDC AME2020** atomic mass database.

<div class="cta-container">
  <a href="../app/" class="btn-cta-primary">
    <span>⚛️ Launch 3D Simulator</span>
  </a>
  <a href="physics/" class="btn-cta-secondary">
    <span>📚 Read Physical Background</span>
  </a>
  <a href="guide/" class="btn-cta-secondary">
    <span>🎮 Controls & User Guide</span>
  </a>
</div>

---

## What is the Nuclear Energy Valley?

Due to the attractive nature of the strong nuclear force, binding free protons and neutrons into a nucleus releases substantial binding energy ($E_\text{bind} > 0$). The average bound state energy per nucleon is lower than that of a free, unbound nucleon:

$$
E_\text{nucleon} = - \frac{E_\text{bind}}{A}
$$

When plotted against atomic number ($Z$) and mass number ($A$), the resulting surface resembles a dramatic river valley:

- **The Summit**: The free proton ($^{1}\text{H}$) forms the highest pinnacle ($E_\text{bind}/A = 0$), where no nuclear binding exists.
- **The Valley Basin**: The deepest basin is occupied by iron-peak isotopes: $^{56}_{26}\text{Fe}$ ($8.790\text{ MeV/nucleon}$) and nature's most tightly bound nucleus, $^{62}_{28}\text{Ni}$ ($8.795\text{ MeV/nucleon}$).
- **The Driving Force**: Physical systems naturally seek minimum energy configurations. Light nuclei undergo **nuclear fusion**, while heavy actinides undergo **nuclear fission and alpha cascades** to slide down into the valley floor.

---

## Key Features

<div class="feature-grid">
  <div class="feature-card">
    <h3>🌌 Complete AME2020 Dataset</h3>
    <p>3,078 experimentally evaluated nuclides with mass excess, binding energy per nucleon, half-life, and decay modes.</p>
  </div>
  <div class="feature-card">
    <h3>⚡ GPU InstancedMesh Rendering</h3>
    <p>All 3,078 columns render in a single WebGL draw call, delivering a steady 60 FPS with dynamic color mapping.</p>
  </div>
  <div class="feature-card">
    <h3>🎮 Unified Dual Navigation</h3>
    <p>Seamlessly combines OrbitControls mouse rotation and zooming with WASD / arrow flight traversal.</p>
  </div>
  <div class="feature-card">
    <h3>☄️ Trajectory Engine & Atom Drop</h3>
    <p>Drop any nuclide from high altitude and watch it roll down to the valley floor via physical decay chains or steepest gradient ascent.</p>
  </div>
  <div class="feature-card">
    <h3>🧪 Periodic Table Nuclide Picker</h3>
    <p>Full 18-column IUPAC grid with color-coded categories and expandable isotope drawers for quick selection.</p>
  </div>
  <div class="feature-card">
    <h3>🌐 Dual Language Support (EN / HU)</h3>
    <p>Complete bilingual support across the 3D application UI, telemetry HUD, and in-depth documentation.</p>
  </div>
</div>

---

## Documentation Sections

- [Physical Concept & Mathematical Model](physics.md) – Liquid drop model, Bethe–Weizsäcker formula, binding energies, and unit conversions.
- [Interactive Controls & Guide](guide.md) – Keybindings, camera flight controls, simulation modes, and atom dropping.
- [Database & Architecture](database.md) – AME2020 data pipeline, Three.js instanced rendering, and component structure.
- [Launch 3D WebGL Simulator](../app/) – Jump straight into the interactive 3D environment.
