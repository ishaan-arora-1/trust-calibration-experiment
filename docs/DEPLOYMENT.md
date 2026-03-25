# Deployment Guide

## Local Development

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

The app runs at `http://localhost:3000`.

## Production Deployment (Vercel)

### Prerequisites

- A [Vercel](https://vercel.com) account
- The Vercel CLI installed (`npm i -g vercel`)

### Steps

1. **Push to GitHub** — Vercel auto-deploys from your repository.

2. **Configure Environment Variables** in Vercel dashboard:
   ```
   DATABASE_URL="file:./prod.db"
   ```

3. **Build Settings**:
   - Framework: Next.js
   - Build Command: `npx prisma generate && npx prisma migrate deploy && next build`
   - Output Directory: `.next`

4. **Note on SQLite in Vercel**: Vercel's serverless functions have an ephemeral filesystem. For persistent data in production, consider:
   - [Turso](https://turso.tech/) (SQLite-compatible, hosted)
   - [LiteFS](https://fly.io/docs/litefs/) on Fly.io
   - Switch to PostgreSQL via Prisma (change `provider` in schema)

### Using Turso (Recommended for Production)

1. Create a Turso database:
   ```bash
   turso db create trust-experiment
   turso db show trust-experiment --url
   turso db tokens create trust-experiment
   ```

2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("TURSO_DATABASE_URL")
   }
   ```

3. Set environment variables in Vercel:
   ```
   TURSO_DATABASE_URL=libsql://your-db.turso.io
   TURSO_AUTH_TOKEN=your-token
   ```

## Self-Hosted (VPS / University Server)

```bash
# Clone and install
git clone https://github.com/ishaan-arora-1/trust-calibration-experiment.git
cd trust-calibration-experiment
npm install

# Set up database
cp .env.example .env  # Edit DATABASE_URL if needed
npx prisma migrate deploy
npm run db:seed

# Build and start
npm run build
npm start
```

The app runs on port 3000 by default. Use a reverse proxy (nginx/caddy) for HTTPS.

### Nginx Configuration Example

```nginx
server {
    listen 443 ssl;
    server_name experiment.youruniversity.edu;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Management

```bash
# View database in browser
npm run db:studio

# Reset database (deletes all data)
npm run db:reset

# Re-seed conditions
npm run db:seed

# Create a new migration after schema changes
npx prisma migrate dev --name description_of_change
```

## Data Backup

The SQLite database file is at `prisma/dev.db`. To back up:

```bash
cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db
```

## Sharing the Experiment

To share the experiment with participants:

1. Deploy to a public URL (Vercel, VPS, or university server)
2. Share `https://your-domain.com/experiment`
3. Monitor progress at `https://your-domain.com/admin`
4. Export data from the admin dashboard when collection is complete
