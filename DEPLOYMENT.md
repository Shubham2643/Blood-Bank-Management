# Blood Bank Management — Deployment Guide

## Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Google Cloud Console project with Google OAuth2 enabled

## Environment Variables

### Backend (`backend/.env`)

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/bloodbank
JWT_SECRET=long_random_secret_here
PORT=5001
NODE_ENV=production
CLIENT_URL=https://yourdomain.com,https://www.yourdomain.com
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=strong_password_here
SERVE_FRONTEND=true
```

### Frontend (build-time — `frontend/.env`)

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

## Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Production Build

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

## Docker

```bash
docker compose up --build
```

App: http://localhost:5001

## First-time Admin Setup

```bash
cd backend
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=YourSecurePass123 npm run seed:admin
```

## Health Check

`GET /health` — returns database and Google Sign-in configuration status.

## Deployment Options

| Component | Recommended Host |
|-----------|------------------|
| Frontend only | Vercel, Netlify, Cloudflare Pages |
| Backend + DB | Railway, Render, DigitalOcean, AWS |
| Full stack | Docker on VPS |

## Security Checklist

- [ ] Rotate JWT_SECRET and email credentials
- [ ] Use MongoDB Atlas with TLS
- [ ] Set CLIENT_URL to production domain(s)
- [ ] Add production domain to Google Cloud Console Authorized JavaScript origins (Credentials page)
- [ ] Run `npm run seed:admin` with strong password
- [ ] Enable HTTPS (reverse proxy / load balancer)
