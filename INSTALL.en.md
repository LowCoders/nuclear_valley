# Manual Installation & Deployment Guide (English)

This document provides a comprehensive, step-by-step guide for installing, configuring, running, and deploying the **Nuclear Energy Valley 3D WebGL** application on Linux, macOS, and Windows.

---

## Table of Contents

1. [Prerequisites & System Requirements](#1-prerequisites--system-requirements)
2. [Cloning & Directory Setup](#2-cloning--directory-setup)
3. [Installing Dependencies](#3-installing-dependencies)
4. [Dataset Verification & Generation](#4-dataset-verification--generation)
5. [Local Development Server](#5-local-development-server)
6. [Building for Production](#6-building-for-production)
7. [Environment Variables (.env)](#7-environment-variables-env)
8. [Production Web Server Deployment](#8-production-web-server-deployment)
   - [Nginx Configuration](#nginx-configuration)
   - [Apache Configuration](#apache-configuration)
   - [Docker Container Deployment](#docker-container-deployment)
9. [Automated CI/CD & Deploy Script](#9-automated-cicd--deploy-script)
10. [Troubleshooting & FAQ](#10-troubleshooting--faq)

---

## 1. Prerequisites & System Requirements

### Hardware Requirements
- **CPU**: Dual-core 2.0 GHz or higher (quad-core recommended).
- **RAM**: 2 GB minimum (4 GB recommended).
- **GPU**: Any graphics hardware with WebGL 2.0 support (Intel HD 4000+, NVIDIA GeForce, AMD Radeon, or Apple Silicon).

### Software Requirements
- **Node.js**: `v18.0.0` or higher (`v20.x` LTS recommended).
- **npm**: `v9.0.0` or higher.
- **Git**: Latest stable version.
- **Web Browser**: Any modern evergreen browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari 15+).

Verify your Node.js and npm versions:
```bash
node -v
npm -v
```

---

## 2. Cloning & Directory Setup

Navigate to your workspace and ensure the directory is accessible:

```bash
cd /web/nuclear_valley
```

If setting up fresh from a repository clone:
```bash
git clone <repository-url> nuclear_valley
cd nuclear_valley
```

---

## 3. Installing Dependencies

Install the required npm packages:

```bash
npm install
```

This installs `three` (`^0.160.0`) and `vite` (`^5.0.0`). The project utilizes native ES modules (`"type": "module"` in `package.json`).

---

## 4. Dataset Verification & Generation

The application includes a precompiled dataset of 3,078 isotopes located at `public/data/isotopes.json`. If you ever need to recompile the dataset from the raw IAEA AME2020 mass evaluation tables:

```bash
npm run build:data
```

This script parses `data/raw/mass_1.mas20.txt` and updates `public/data/isotopes.json`.

---

## 5. Local Development Server

To launch the Vite local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

By default, the server listens at:
```
http://localhost:5174/
```

To expose the development server to your local network:
```bash
npx vite --host 0.0.0.0 --port 5174
```

---

## 6. Building for Production

Compile and bundle the application into static, minified HTML, JavaScript, and CSS assets:

```bash
npm run build
```

The compiled output is generated in the `dist/` directory:
- `dist/index.html` – Main entry point.
- `dist/assets/*.js` – Bundled Three.js and application code.
- `dist/assets/*.css` – Glassmorphic stylesheet.
- `dist/data/isotopes.json` – Static nuclear dataset.

To preview the production build locally:
```bash
npm run preview
```

---

## 7. Environment Variables (.env)

Copy the provided `.env.example` template:

```bash
cp .env.example .env
```

Available configuration keys:

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `5174` | Local server port |
| `HOST` | `127.0.0.1` | Local server host bind |
| `VITE_APP_TITLE` | `Nuclear Energy Valley 3D` | Browser title bar text |
| `DEPLOY_METHOD` | `local` | `local` (copy to path) or `ssh` (remote rsync) |
| `DEPLOY_TARGET_DIR` | `/var/www/nuclear-valley` | Local directory destination |
| `DEPLOY_REMOTE_HOST` | *(empty)* | Remote server IP/hostname |
| `DEPLOY_REMOTE_USER` | *(empty)* | Remote server SSH username |
| `DEPLOY_REMOTE_PORT` | `22` | Remote SSH port |
| `DEPLOY_REMOTE_DIR` | `/var/www/nuclear-valley` | Destination path on remote server |
| `HEALTHCHECK_URL` | `http://127.0.0.1:5174` | Post-deployment HTTP check |

---

## 8. Production Web Server Deployment

Because Nuclear Energy Valley 3D compiles into standard static assets in `dist/`, it can be served by any static web server.

### Nginx Configuration

Create an Nginx configuration file (e.g. `/etc/nginx/sites-available/nuclear-valley`):

```nginx
server {
    listen 80;
    server_name nuclear-valley.example.com;

    root /var/www/nuclear-valley;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    gzip_min_length 1024;

    # Caching for static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /data/ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # SPA Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/nuclear-valley /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Apache Configuration

In an Apache virtual host or `.htaccess`:

```apache
<VirtualHost *:80>
    ServerName nuclear-valley.example.com
    DocumentRoot /var/www/nuclear-valley

    <Directory /var/www/nuclear-valley>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Fallback to index.html
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

### Docker Container Deployment

Create a `Dockerfile` in the project root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production static server stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run the container:
```bash
docker build -t nuclear-valley:latest .
docker run -d -p 8080:80 --name nuclear-valley nuclear-valley:latest
```

---

## 9. Automated CI/CD & Deploy Script

The project contains an automated deployment script `scripts/deploy.sh`:

```bash
# Execute local or remote deployment as specified in .env
npm run deploy
# or directly:
bash scripts/deploy.sh
```

### Automated GitHub Actions CI/CD

On every `push` to `main` or `master`, the workflow defined in `.github/workflows/ci-cd.yml`:
1. Checks out the code.
2. Installs dependencies.
3. Builds and validates the isotope database.
4. Generates the production bundle.
5. Deploys the artifacts according to repository secrets (`DEPLOY_METHOD`, `DEPLOY_TARGET_DIR`, etc.).

---

## 10. Troubleshooting & FAQ

### 1. WebGL Not Supported or Canvas is Blank
- **Cause**: Hardware acceleration is disabled in your browser.
- **Fix**: Open browser settings, search for "Hardware acceleration" and ensure it is enabled. In Chrome, check `chrome://gpu` to confirm WebGL 2.0 is active.

### 2. Port 5174 is Already in Use
- **Fix**: Change `PORT` in `.env`, or run Vite with an explicit port:
  ```bash
  npx vite --port 5180
  ```

### 3. Missing `public/data/isotopes.json`
- **Fix**: Re-generate the dataset using:
  ```bash
  npm run build:data
  ```

### 4. Language Selection Does Not Persist
- **Fix**: Ensure your browser allows `localStorage` for the site domain (third-party cookie/storage blocking can occasionally restrict this in incognito/private windows).
