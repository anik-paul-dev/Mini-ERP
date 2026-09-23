# Mini ERP - Project Setup & Installation Guide

Mini ERP is a full-stack inventory and sales management system built with the MERN stack and TypeScript. It includes role-based access control, product/customer/sales management, dashboard statistics, activity logs, image uploads through Cloudinary, local realtime updates with Socket.IO, and Vercel-friendly polling for production.

## 1. Tech Stack

### Frontend

- React 18 + TypeScript
- Vite
- React Router
- TanStack React Query
- Axios
- Tailwind CSS
- Socket.IO Client for local realtime mode
- HTTP polling fallback for Vercel production

### Backend

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT auth with HTTP-only cookies
- Socket.IO for local realtime updates
- Cloudinary image upload
- Optional Upstash/Redis cache
- Zod validation
- Express Rate Limit
- Helmet + CORS

## 2. Project Structure

```text
ERP/
  client/                 Frontend React app
    src/
      api/                Axios API client
      components/         Layout, UI, guards, chat widget
      context/            Auth and socket contexts
      hooks/              Shared React hooks
      pages/              Admin, Manager, Employee, Public pages
      types/              Shared frontend TypeScript interfaces
      utils/              Helpers
    vercel.json           Client Vercel config

  server/                 Backend Express API
    api/index.ts          Vercel serverless entry
    src/
      app.ts              Express app, middleware, routes
      config/             DB, Cloudinary, Redis, Socket.IO
      middleware/         Auth, authorization, validation, upload, rate limit
      modules/            Auth, users, roles, products, customers, sales, dashboard, chat, activity
      seed/seed.ts        Default role/admin seeder
      utils/              API response, errors, query builder, tokens, email
    vercel.json           Server Vercel config
```

## 3. Prerequisites

Install these before running locally:

- Node.js 18 or newer
- npm
- MongoDB local server or MongoDB Atlas URI
- Cloudinary account for product images
- Gmail app password if using forgot/reset password emails
- Optional Redis/Upstash URL for shared cache

## 4. Clone And Install

```bash
git clone <your-repository-url>
cd ERP

cd server
npm install

cd ../client
npm install
```

## 5. Backend Environment Setup

Create `server/.env` from `server/.env.example`.

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mini-erp
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
REDIS_URL=
CLIENT_URL=http://localhost:5173
NODE_ENV=development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail-address@gmail.com
SMTP_APP_PASSWORD=your-google-app-password
MAIL_FROM="Mini ERP" <your-gmail-address@gmail.com>
```

Notes:

- `CLIENT_URL` is used for CORS and Socket.IO. For multiple clients, separate URLs with commas.
- `REDIS_URL` is optional. If empty, the server uses in-memory cache.
- Cloudinary env vars are required for product image create/update.

## 6. Frontend Environment Setup

Local development does not require a client env file because Vite proxies `/api` to `http://localhost:5000`.

For deployed client builds, use:

```env
VITE_API_URL=https://your-server-project.vercel.app
VITE_USE_POLLING=true
VITE_POLLING_INTERVAL_MS=4000
```

Do not set `VITE_USE_POLLING=true` for local development if you want Socket.IO realtime updates.

## 7. Seed Default Roles And Admin

Run the seed script after MongoDB is configured:

```bash
cd server
npm run seed
```

Default login:

```text
Email: admin@minierp.com
Password: password123
```

The seed creates these system roles:

- Admin: full access
- Manager: product, customer, sales, dashboard, activity access
- Employee: product read, customer read, sales, dashboard access

## 8. Run Locally

Open two terminals.

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

Local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
Health:   http://localhost:5000/health
API base: http://localhost:5000/api/v1
```

## 9. Build For Production

Backend:

```bash
cd server
npm run build
```

Client:

```bash
cd client
npm run build
```

A Vite large chunk warning can appear for the client. It is a warning, not a failed build.

## 10. Vercel Deployment

Deploy as two separate Vercel projects from the same GitHub repository.

### Server Project

- Root Directory: `server`
- Build handled by `server/vercel.json`
- Entry point: `server/api/index.ts`

Required server env:

```env
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-uri
JWT_ACCESS_SECRET=your-production-access-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
REDIS_URL=your-upstash-url-if-used
CLIENT_URL=https://your-client-project.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail-address@gmail.com
SMTP_APP_PASSWORD=your-google-app-password
MAIL_FROM="Mini ERP" <your-gmail-address@gmail.com>
```

### Client Project

- Root Directory: `client`
- Build command: `npm run build`
- Output directory: `dist`

Required client env:

```env
VITE_API_URL=https://your-server-project.vercel.app
VITE_USE_POLLING=true
VITE_POLLING_INTERVAL_MS=4000
```

## 11. Realtime Behavior

Local development:

- Socket.IO is enabled.
- Server starts a long-running HTTP server with Socket.IO.
- Realtime events invalidate client queries and update chat/notifications.

Vercel production:

- Socket.IO is disabled because Vercel serverless functions do not support persistent WebSocket servers.
- Backend socket emits become no-op calls.
- Frontend uses React Query polling and chat polling every 4 seconds by default.

## 12. Important Scripts

Server:

```bash
npm run dev      # Start backend in watch mode
npm run build    # Compile TypeScript
npm start        # Run compiled dist/app.js
npm run seed     # Seed default roles and admin
```

Client:

```bash
npm run dev      # Start Vite dev server
npm run build    # TypeScript check and Vite production build
npm run preview  # Preview production build locally
```

## 13. Authentication Notes

- Login sets `accessToken` and `refreshToken` as HTTP-only cookies.
- In production cookies use `SameSite=None; Secure` for separate client/server Vercel domains.
- Axios uses `withCredentials: true` so cookies are sent automatically.
- The API also accepts `Authorization: Bearer <accessToken>` for protected requests.

## 14. Common Issues

### CORS error after deployment

Check server `CLIENT_URL` exactly matches the deployed client origin:

```text
https://your-client-project.vercel.app
```

No path is needed. A trailing slash is normalized, but the origin should still be clean.

### Product image upload fails

Check Cloudinary variables and ensure the request uses `multipart/form-data` with field name `image`.

### Login works locally but not in production

Check:

- `CLIENT_URL` on server project
- `VITE_API_URL` on client project
- Both projects redeployed after env changes
- Browser third-party cookie restrictions if testing in strict privacy modes

### Chat not realtime on Vercel

This is expected. Vercel uses polling mode with `VITE_USE_POLLING=true`.