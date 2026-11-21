# Shivam Electricals ERP

Shivam Electricals ERP is a distributor-management system for creating bills,
tracking stock, managing dealers, recording payments, and reporting sales.
The product is designed for an Admin and Staff mobile experience, with
server-side enforcement of prices, permissions, stock rules, and financial
operations.

The product requirements and architecture are defined in
[Shivam Electricals ERP - System Architecture](Shivam%20Electricals%20ERP%20%E2%80%93%20System%20Architecture.pdf).
This README describes what is currently implemented in this repository and how
to work on it safely.

## Product scope

### Core behavior

- Admin and Staff accounts with different dashboards and permissions.
- Multi-store support from the beginning through `storeId` assignments.
- Email or phone login with password authentication.
- Secure access tokens and rotating refresh tokens.
- Products, dealers, suppliers, stock movements, bills, payments, returns, and
  reports delivered in later phases.
- Server-side protection for retail price, cost price, margin, and restricted
  operations.
- Audit logging for security-sensitive changes.

### Planned operational capabilities

- Wholesale and retail billing with dealer-type pricing.
- Atomic bill creation and stock deduction.
- Financial-year bill numbers.
- Bill cancellation instead of deletion.
- Offline bill queue with idempotent bill IDs.
- GST-ready invoice PDFs and sharing through WhatsApp, email, or print.
- Low-stock push notifications.
- Scheduled backups, monitoring, rate limiting, and go-live hardening.

## Architecture

```text
Flutter mobile/web client
        |
        | HTTPS + JSON API
        v
Node.js + Express backend
        |
        +--> MongoDB Atlas
        +--> Firebase Cloud Messaging (planned)
        +--> Email provider (planned)
        +--> Cloudflare R2 backups (planned)
```

### Repository layout

```text
lib/                    Flutter application
  app/                  App bootstrap, routes, and middleware
  core/                 Shared network, session, storage, theme, and UI code
  features/             Feature controllers, repositories, bindings, and views
backend/                Node.js/Express API
  src/config/           Environment and database configuration
  src/middleware/       Auth, roles, validation, errors, and audit helpers
  src/models/           Mongoose models
  src/modules/          Domain modules such as auth and stores
  test/                 Backend API tests
test/                   Flutter tests
```

## Current implementation status

### Completed foundation

- Flutter app shell using GetX and Material 3.
- Secure token and session storage.
- Role-aware routing for Admin and Staff.
- Dio API client with API-error normalization.
- Access-token attachment and refresh-token retry flow.
- Login, splash, logout, and placeholder dashboards.
- Node.js/Express backend scaffold.
- MongoDB models for users, stores, refresh tokens, and audit logs.
- Login, refresh, logout, and current-user endpoints.
- JWT authentication and Admin route protection.
- Owner-managed staff creation, listing, updates, password reset, and
  permission enforcement.
- Seed command for the first store and Admin account.
- Product master data with colour variants, paise-based rates, search,
  pagination, role-safe price projections, and rate history.
- Consistent success and error response envelopes.
- Login rate limiting, Helmet, CORS, and request validation.

### Not yet completed

- Atlas and Render deployment.
- Initial Admin/Staff seed process.
- Client-confirmed dealer price tiers, credit rules, catalogue import, and
  opening balances.
- Product, dealer, supplier, stock, billing, payment, return, and report
  modules.
- Offline synchronization and invoice PDF generation.
- Push notifications, backups, monitoring, and web admin workflows.

The implementation must not be considered production-ready until the
deployment and hardening items are completed.

## Prerequisites

- Flutter SDK compatible with the Dart constraint in `pubspec.yaml`.
- Node.js 20 or newer.
- npm.
- MongoDB Atlas connection string for running database-backed API features.

## Flutter setup

Install dependencies:

```powershell
flutter pub get
```

Run the app:

```powershell
flutter run
```

The Flutter API base URL defaults to the Android emulator address:

```text
http://10.0.2.2:5000/api/v1
```

Override it for another device or environment:

```powershell
flutter run --dart-define=API_BASE_URL=https://your-api.example.com/api/v1
```

## Backend setup

Move into the backend:

```powershell
Set-Location backend
npm install
```

Create a local environment file:

```powershell
Copy-Item .env.example .env
```

Update `backend/.env` with a reachable MongoDB URI and unique random JWT
secrets. Never commit `.env` or real credentials.

Set the `SEED_*` values in `backend/.env`, then create the initial store and
Admin account:

```powershell
npm run seed
```

Start the API:

```powershell
npm start
```

Use the development watcher:

```powershell
npm run dev
```

The API intentionally fails to start if MongoDB cannot be reached. This avoids
running a service that appears healthy while it cannot persist authentication
or business data.

## API conventions

Successful responses use:

```json
{
  "success": true,
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "field": "Field is required."
  }
}
```

Current Phase 1 endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/hello` | Deployment smoke test |
| GET | `/api/v1/health` | API and MongoDB readiness |
| POST | `/api/v1/auth/login` | Login with email/phone and password |
| POST | `/api/v1/auth/refresh` | Rotate an access/refresh token pair |
| POST | `/api/v1/auth/logout` | Revoke a refresh token |
| GET | `/api/v1/auth/me` | Return the authenticated user |
| GET | `/api/v1/stores` | List stores assigned to the user |
| GET | `/api/v1/stores/admin-ping` | Verify Admin-only route protection |
| POST | `/api/v1/users/staff` | Create a Staff account (Admin only) |
| GET | `/api/v1/users/staff` | List Staff accounts (Admin only) |
| PATCH | `/api/v1/users/staff/:id` | Update Staff access or status (Admin only) |
| POST | `/api/v1/users/staff/:id/reset-password` | Reset Staff password (Admin only) |
| GET | `/api/v1/products` | Search and paginate products |
| GET | `/api/v1/products/:id` | Get a role-filtered product |
| POST | `/api/v1/products` | Create a product (Admin only) |
| PATCH | `/api/v1/products/:id` | Edit product details (Admin only) |
| PATCH | `/api/v1/products/:id/variants/:variantId/rates` | Edit rates with history (Admin only) |
| POST | `/api/v1/products/rates/bulk` | Bulk-edit rates (Admin only) |
| GET | `/api/v1/products/:id/rate-history` | View rate history (Admin only) |

Authenticated shop-scoped requests may include the `X-Store-Id` header. Staff
are restricted to assigned active stores; Admin users may select any active
store or omit the header.

The backend contract must remain compatible with the Flutter API client:
[api_client.dart](lib/core/network/api_client.dart) unwraps the `data` field,
while [api_exception.dart](lib/core/network/api_exception.dart) maps API
errors into one client-side exception type.

## Authentication and authorization

- Passwords are stored as bcrypt hashes, never plaintext.
- Access tokens are short-lived JWTs.
- Refresh tokens are persisted as hashes and rotated on use.
- Disabled users cannot authenticate or use existing access tokens.
- Admin routes use explicit role middleware.
- Staff data responses must omit retail price, cost price, and margin at the
  query/serialization boundary, not only in the Flutter UI.
- The server is the final authority; client-side visibility checks are only a
  usability layer.

## Testing and validation

Run backend tests:

```powershell
Set-Location backend
npm test
```

Check backend JavaScript syntax:

```powershell
Get-ChildItem src -Recurse -Filter *.js | ForEach-Object {
  node --check $_.FullName
}
```

Run Flutter analysis and tests:

```powershell
flutter analyze
flutter test
```

Each phase should be validated before the next phase begins. API behavior
should be tested first, followed by Flutter screens, then an audit against the
phase's “done when” criteria.

## Delivery phases

1. **Foundation:** setup, authentication, roles, permissions, stores, and
   audit logs.
2. **Master data:** products, catalogue import, dealer types, dealers, and
   staff assignments.
3. **Stock and shops:** suppliers, purchase inward, stock ledger, transfers,
   and low-stock alerts.
4. **Billing:** pricing, atomic bills, cancellation, invoices, and offline
   synchronization.
5. **Payments and returns:** balances, payments, credit warnings, and returns.
6. **Dashboards and reports:** Admin/Staff summaries and exports.
7. **Web admin panel:** bulk upload, reports, staff, and shop management.
8. **Hardening:** screenshot protection, backups, restore testing, load testing,
   user acceptance, and APK distribution.

## Client decisions still required

These decisions affect the data model and must be confirmed before their
modules are built:

1. Dealer types and their price-tier mapping.
2. Credit-limit and outstanding-balance rules.
3. Number of shops and store relationships.
4. Product catalogue file and import format.
5. Opening stock and dealer opening balances.
6. GST invoice requirements and tax fields.
7. Whether staff may change rates or apply discounts.
8. Android-only versus iPhone support.
9. Required app languages.
10. Whether a web Admin panel is required immediately.
11. Email codes versus paid SMS OTP.

## Contribution guidelines

- Keep the Flutter flow as `View -> Controller -> Repository -> ApiClient`.
- Keep reusable session state in permanent services only.
- Keep server authorization independent of client visibility logic.
- Add focused tests for each new behavior and run the relevant validation
  commands before moving phases.
- Do not commit credentials, local `.env` files, generated build output, or
  `node_modules`.
