# Shivam Electricals API

Phase 1 Node.js/Express backend for the Flutter app.

## Run locally

```powershell
Copy-Item .env.example .env
npm install
npm test
npm start
```

Set `MONGODB_URI`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` in `.env`
before starting the server. The server intentionally fails to start when the
database cannot be reached; `/api/v1/health` reports readiness after startup.

## Endpoints

- `GET /api/v1/hello` - deployment smoke test
- `GET /api/v1/health` - API and MongoDB readiness
- `POST /api/v1/auth/login` - email/phone and password login
- `POST /api/v1/auth/refresh` - refresh-token rotation
- `POST /api/v1/auth/logout` - revoke a refresh token
- `GET /api/v1/auth/me` - current user
- `GET /api/v1/stores` - stores assigned to the current user
- `GET /api/v1/stores/admin-ping` - protected admin-route smoke test

Successful responses use `{ "success": true, "data": ... }`. Errors use
`{ "success": false, "message": "...", "errors": { ... } }`.
