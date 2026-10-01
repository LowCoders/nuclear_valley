# Nuclear Energy Valley 3D / Nukleáris Energiavölgy 3D

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Three.js](https://img.shields.io/badge/Three.js-r160-black.svg)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![Language: EN/HU](https://img.shields.io/badge/i18n-EN%20%7C%20HU-38bdf8.svg)](README.en.md#internationalization-i18n)

An interactive, walkable 3D WebGL / Three.js visualization of the nuclear specific binding energy valley and stability body, based on authoritative IAEA AME2020 nuclear data covering 3,078 isotopes across elements $Z = 1 \dots 94$.

Interaktív, bejárható 3D WebGL / Three.js alkalmazás a nukleáris fajlagos kötési energiavölgy és magstabilitási felület megjelenítéséhez az IAEA AME2020 táblázat 3078 izotópjával ($Z = 1 \dots 94$).

![Nuclear Energy Valley 3D — trajectory with comic-style departing energy callouts](docs/images/nuclear-valley-screenshot.jpg)

---

## 🌐 Live GitHub Pages Demo & Documentation / Élő Elérhetőség

- ⚛️ **3D WebGL Application**: [https://lowcoders.github.io/nuclear_valley/app/](https://lowcoders.github.io/nuclear_valley/app/)
- 📖 **Dokumentáció (Magyar)**: [https://lowcoders.github.io/nuclear_valley/](https://lowcoders.github.io/nuclear_valley/)
- 📖 **Documentation (English)**: [https://lowcoders.github.io/nuclear_valley/en/](https://lowcoders.github.io/nuclear_valley/en/)

---

## Documentation Index / Dokumentációk

| Document | Language | Description |
|---|---|---|
| 📖 **[README.en.md](README.en.md)** | English | Comprehensive scientific background, physical models, feature documentation, and architecture. |
| 📖 **[README.hu.md](README.hu.md)** | Magyar | Részletes magfizikai elmélet, funkciók, modellmagyarázatok és architektúra leírás. |
| 🛠️ **[INSTALL.en.md](INSTALL.en.md)** | English | Complete manual installation, web server configuration (Nginx, Apache, Docker), and CI/CD deployment guide. |
| 🛠️ **[INSTALL.hu.md](INSTALL.hu.md)** | Magyar | Lépésről lépésre követhető kézi telepítési, szerver-konfigurációs és CI/CD útmutató. |

---

## Highlights / Főbb Funkciók

- **3,078 Isotopes (Z = 1..94)**: Direct from official IAEA/AMDC AME2020 mass evaluation data.
- **Unified Navigation**: OrbitControls mouse rotation and zooming work simultaneously with Arrow / WASD keys for free traversal.
- **45° Vantage Point**: Default view angled along the length of the valley gorge.
- **Interactive 18-Column Periodic Table Picker**: Browse all elements and isotopes, highlight them, or drop them directly into the valley.
- **Atom Drop Trajectories**: Drop any isotope and watch it cascade down to the valley floor (Fe-56 / Ni-62) via **Gradient** or **Nuclear Decay Chains** (fission, alpha, beta, fusion).
- **Play / Pause Controls**: Pause and resume moving atoms in mid-flight from both the control panel and periodic table modal.
- **Persistent Path Trails & 3D Energy Callouts**: 3D trajectories and departing energy badges (+MeV / +pJ) stay permanently visible on the valley landscape until a new drop or manual clear.
- **Bilingual Support (EN / HU)**: English by default, easily toggled to Hungarian with persistent state in `localStorage`.
- **CI/CD Pipeline & Automated Deploy**: Includes `.github/workflows/ci-cd.yml`, `scripts/deploy.sh`, and `.env` configuration.

---

## Quick Start / Gyors Indítás

```bash
# 1. Clone & Enter Directory
cd /web/nuclear_valley

# 2. Install Dependencies
npm install

# 3. Start Local Dev Server
npm run dev

# 4. Build Production Bundle
npm run build

# 5. Automated Deployment (reads .env)
npm run deploy
```

For full setup, environment variables, web server configs, and troubleshooting:
👉 **[Read the Installation Guide (English)](INSTALL.en.md)** / **[Kézi Telepítési Útmutató (Magyar)](INSTALL.hu.md)**
