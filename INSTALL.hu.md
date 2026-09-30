# Kézi Telepítési és Rendszergazdai Útmutató (Magyar)

Ez a dokumentum részletes, lépésről lépésre követhető útmutatót nyújt a **Nukleáris Energiavölgy 3D WebGL** alkalmazás telepítéséhez, beállításához, futtatásához és éles szerverre történő telepítéséhez Linux, macOS és Windows környezetben.

---

## Tartalomjegyzék

1. [Rendszerkövetelmények](#1-rendszerkövetelmények)
2. [A forráskód előkészítése](#2-a-forráskód-előkészítése)
3. [Függőségek telepítése](#3-függőségek-telepítése)
4. [Izotóp adatbázis ellenőrzése és újraépítése](#4-izotóp-adatbázis-ellenőrzése-és-újraépítése)
5. [Fejlesztői szerver indítása](#5-fejlesztői-szerver-indítása)
6. [Termelési csomag fordítása (Build)](#6-termelési-csomag-fordítása-build)
7. [Környezeti változók (.env)](#7-környezeti-változók-env)
8. [Éles webszerver beállítása](#8-éles-webszerver-beállítása)
   - [Nginx beállítás](#nginx-beállítás)
   - [Apache beállítás](#apache-beállítás)
   - [Docker konténeres futtatás](#docker-konténeres-futtatás)
9. [Automatizált CI/CD és telepítő script](#9-automatizált-cicd-és-telepítő-script)
10. [Gyakori hibák és elhárításuk](#10-gyakori-hibák-és-elhárításuk)

---

## 1. Rendszerkövetelmények

### Hardverkövetelmények
- **Processzor (CPU)**: Kétmagos 2.0 GHz vagy gyorsabb (négymagos ajánlott).
- **Memória (RAM)**: Legalább 2 GB (4 GB ajánlott).
- **Grafikus kártya (GPU)**: WebGL 2.0 kompatibilis videovezérlő (Intel HD 4000+, NVIDIA GeForce, AMD Radeon vagy Apple Silicon).

### Szoftverkövetelmények
- **Node.js**: `v18.0.0` vagy újabb (`v20.x` LTS ajánlott).
- **npm**: `v9.0.0` vagy újabb.
- **Böngésző**: Bármely modern böngésző (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari 15+).

A meglévő verziók ellenőrzése terminálban:
```bash
node -v
npm -v
```

---

## 2. A forráskód előkészítése

Lépj be a projekt mappájába:

```bash
cd /web/nuclear_valley
```

Új klónozás esetén:
```bash
git clone <repository-url> nuclear_valley
cd nuclear_valley
```

---

## 3. Függőségek telepítése

Futtasd az alábbi parancsot a szükséges csomagok (`three`, `vite`) letöltéséhez:

```bash
npm install
```

---

## 4. Izotóp adatbázis ellenőrzése és újraépítése

A projekt tartalmazza a 3078 izotóp előre feldolgozott adatait a `public/data/isotopes.json` fájlban. Amennyiben módosítod a nyers IAEA AME2020 táblázatot vagy frissíteni szeretnéd az adatbázist:

```bash
npm run build:data
```

A script feldolgozza a `data/raw/mass_1.mas20.txt` forrásfájlt, és újragenerálja a JSON állományt.

---

## 5. Fejlesztői szerver indítása

A Vite fejlesztői szerverének elindítása forró modulcserével (HMR):

```bash
npm run dev
```

Alapértelmezés szerint az alkalmazás a következő címen érhető el:
```
http://localhost:5174/
```

Helyi hálózatra való kiterjesztéshez:
```bash
npx vite --host 0.0.0.0 --port 5174
```

---

## 6. Termelési csomag fordítása (Build)

Az optimalizált, minifikált statikus csomag elkészítése:

```bash
npm run build
```

A kész állományok a `dist/` mappába kerülnek:
- `dist/index.html` – Fő belépési HTML oldal.
- `dist/assets/*.js` – Összefűzött JavaScript modulok (Three.js és alkalmazáskód).
- `dist/assets/*.css` – Stíluslap.
- `dist/data/isotopes.json` – Statikus izotóp adatbázis.

A lefordított termelési build helyi ellenőrzése:
```bash
npm run preview
```

---

## 7. Környezeti változók (.env)

Másold le a mellékelt `.env.example` mintát:

```bash
cp .env.example .env
```

A konfigurálható paraméterek listája:

| Változó | Alapérték | Leírás |
|---|---|---|
| `NODE_ENV` | `production` | Futtatási környezet |
| `PORT` | `5174` | Helyi szerver portszáma |
| `HOST` | `127.0.0.1` | Kiszolgáló címe |
| `VITE_APP_TITLE` | `Nuclear Energy Valley 3D` | Böngésző fejléc címe |
| `DEPLOY_METHOD` | `local` | Telepítés módja: `local` (másolás helyi könyvtárba) vagy `ssh` (távoli szerver rsync-kel) |
| `DEPLOY_TARGET_DIR` | `/var/www/nuclear-valley` | Célkönyvtár helyi telepítéskor |
| `DEPLOY_REMOTE_HOST` | *(üres)* | Távoli szerver IP címe vagy domainje |
| `DEPLOY_REMOTE_USER` | *(üres)* | Távoli szerver SSH felhasználóneve |
| `DEPLOY_REMOTE_PORT` | `22` | Távoli szerver SSH portja |
| `DEPLOY_REMOTE_DIR` | `/var/www/nuclear-valley` | Célkönyvtár a távoli szerveren |
| `HEALTHCHECK_URL` | `http://127.0.0.1:5174` | Telepítés utáni állapot-ellenőrző URL |

---

## 8. Éles webszerver beállítása

Mivel a projekt tisztán statikus webes állományokból áll a `dist/` könyvtárban, bármilyen webszerverrel azonnal kiszolgálható.

### Nginx beállítás

Hozz létre egy konfigurációs fájlt (pl. `/etc/nginx/sites-available/nuclear-valley`):

```nginx
server {
    listen 80;
    server_name nuclear-valley.example.com;

    root /var/www/nuclear-valley;
    index index.html;

    # Gzip tömörítés bekapcsolása
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    gzip_min_length 1024;

    # Statikus fájlok gyorsítótárazása
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /data/ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # SPA útvonal-irányítás
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

A konfiguráció engedélyezése és újraindítása:
```bash
sudo ln -s /etc/nginx/sites-available/nuclear-valley /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Apache beállítás

Apache szerver esetén hozz létre egy `.htaccess` fájlt vagy VirtualHost blokkot:

```apache
<VirtualHost *:80>
    ServerName nuclear-valley.example.com
    DocumentRoot /var/www/nuclear-valley

    <Directory /var/www/nuclear-valley>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

### Docker konténeres futtatás

A gyökérkönyvtárban lévő `Dockerfile` minta alapján:

```dockerfile
# Fordítási szakasz
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Éles Nginx webszerver szakasz
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Konténer építése és indítása:
```bash
docker build -t nuclear-valley:latest .
docker run -d -p 8080:80 --name nuclear-valley nuclear-valley:latest
```

---

## 9. Automatizált CI/CD és telepítő script

A projekt tartalmaz egy előre elkészített automatizált telepítő scriptet a `scripts/deploy.sh` állományban:

```bash
# Telepítés futtatása a .env beállításai szerint
npm run deploy
# vagy közvetlenül:
bash scripts/deploy.sh
```

### GitHub Actions CI/CD integráció

A `.github/workflows/ci-cd.yml` munkafolyamat automatikusan lefut minden `main` vagy `master` ágra történő `git push` esetén:
1. Letölti a forráskódot.
2. Telepíti a függőségeket.
3. Ellenőrzi és újragenerálja az izotóp adatbázist.
4. Lefordítja a termelési kódot.
5. A repository Secrets-ben megadott adatok alapján elvégzi a telepítést a `scripts/deploy.sh` futtatásával.

---

## 10. Gyakori hibák és elhárításuk

### 1. Fekete képernyő / Nem indul a 3D WebGL vászon
- **Ok**: A hardveres gyorsítás le van tiltva a böngészőben.
- **Megoldás**: Nyisd meg a böngésző beállításait, keress rá a „Hardveres gyorsítás” lehetőségre, és kapcsold be. Google Chrome-ban a `chrome://gpu` oldalon ellenőrizheted, hogy a WebGL 2.0 elérhető-e.

### 2. A port (5174) már foglalt
- **Megoldás**: Állíts be egy másik portot a `.env` fájlban (`PORT=5180`), vagy indítsd el paraméterezve:
  ```bash
  npx vite --port 5180
  ```

### 3. Nem található a `public/data/isotopes.json`
- **Megoldás**: Generáld újra az adatbázist:
  ```bash
  npm run build:data
  ```

### 4. Nyelvválasztás nem marad meg újraindítás után
- **Megoldás**: Ellenőrizd, hogy a böngésző privát/inkognitó módban nem tiltja-e a `localStorage` használatát. Normál módban a rendszer automatikusan megőrzi az EN vagy HU beállítást.
