# Quick Deployment Guide (45.63.74.34)

This guide provides step-by-step instructions for deploying the Quantum platform (Backend + Frontend) on your server.

## Prerequisites

Connect to your server:
```bash
ssh root@45.63.74.34
```

### 1. Install System Dependencies

Run these commands to install Node.js, pnpm, Docker, and Nginx:

```bash
# Update and install basics
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx

# Install Node.js (v20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
sudo npm install -g pnpm

# Install PM2 (Process Manager for Node.js)
sudo npm install -g pm2

# Install Docker & Docker Compose
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
# (Log out and back in for docker group changes to take effect)
```

---

## 2. Deploy Database (Docker)

Navigate to the `backend` directory and start the Postgres container.

```bash
cd backend
docker-compose up -d
```
> [!NOTE]
> This will start Postgres 15 on port `5433` as defined in your `docker-compose.yml`.

---

## 3. Backend Deployment (Express/Prisma)

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```

2.  **Environment Variables**:
    Create `.env` in the `backend` folder:
    ```bash
    DATABASE_URL="postgresql://quantum_user:quantum_password@localhost:5433/quantum_db?schema=public"
    JWT_SECRET="your_very_secure_secret_here"
    PORT=3000
    ```

3.  **Database Migration**:
    ```bash
    pnpm db:push
    pnpm db:generate
    ```

4.  **Build and Start with PM2**:
    ```bash
    pnpm build
    pm2 start dist/index.js --name quantum-backend
    pm2 save
    ```

---

## 4. Frontend Deployment (React/Vite)

1.  **Install dependencies**:
    ```bash
    cd ../frontend
    pnpm install
    ```

2.  **Build the application**:
    ```bash
    pnpm build
    ```
    > This creates a `dist/` directory.

3.  **Nginx Configuration**:
    Create a new site configuration:
    ```bash
    sudo nano /etc/nginx/sites-available/the_quantum
    ```

    Paste the following:
    ```nginx
    server {
        listen 80;
        server_name 45.63.74.34;

        root /var/www/johny/frontend/dist;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        # Proxy API requests to the backend
        location /api/ {
            proxy_pass http://localhost:3000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

    Enable the site and reload Nginx:
    ```bash
    sudo ln -s /etc/nginx/sites-available/the_quantum /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    ```

---

## 5. SSL / HTTPS (Optional)

If you have a domain name, run:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 6. Automated Updates & Monitoring

- View backend logs: `pm2 logs quantum-backend`
- Monitor processes: `pm2 monit`
- **Manual Automation**: Deploy future updates manually:
  ```bash
  cd /var/www/johny
  ./deploy.sh
  ```
  
- **Auto-Deploy Every 5 Minutes (Cron)**:
  To let the server pull changes automatically every 5 minutes, run `crontab -e` and paste this at the bottom:
  ```bash
  */5 * * * * cd /var/www/johny && ./deploy.sh >> /var/www/johny/deploy.log 2>&1
  ```
  *(We built a safety mechanism into the script: if the code is already up-to-date, it skips the heavy build processes, keeping your server's CPU usage low!)*
