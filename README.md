# Shivam Electricals ERP

Flutter mobile client and Node.js/Express backend for the distributor ERP.

## Project layout

- `lib/` - Flutter app, GetX routing, secure session, and API client.
- `backend/` - Phase 1 API service, MongoDB models, authentication, role checks,
  and audit-log plumbing.
- `Shivam Electricals ERP – System Architecture.pdf` - product architecture
  and phased delivery reference.

## Run the Flutter app

```powershell
flutter pub get
flutter run
```

## Run the backend

See [`backend/README.md`](backend/README.md). The backend requires a MongoDB
connection and JWT secrets in `backend/.env`.
