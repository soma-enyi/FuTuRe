# Backend Configuration

The backend reads configuration from:

1. Runtime environment variables (`process.env`)
2. `.env*` files in `backend/` (fallbacks)

## Environments

Set `APP_ENV` to enable environment-specific defaults and validation:

- `development` (default)
- `test`
- `production`

## `.env` file loading

Files are loaded in this precedence order (later wins):

1. `.env`
2. `.env.<APP_ENV>`
3. `.env.local` (skipped when `APP_ENV=test`)
4. `.env.<APP_ENV>.local` (skipped when `APP_ENV=test`)

`process.env` always overrides values from files.

## Required variables (production)

When `APP_ENV=production`:

- `ALLOWED_ORIGINS` (comma-separated)
- `JWT_SECRET` (must not be `secret`)

## Hot-reloading

Set `CONFIG_WATCH=true` to reload config when `.env*` files change.

- Changes apply to consumers that call `getConfig()` at runtime (e.g. CORS origin checks).
- Some values (like `PORT`) are still read once at startup.

## Encrypted secrets (optional)

You can store encrypted values using `ENC(<base64>)` or `enc:<base64>`, and provide a key via:

- `CONFIG_ENCRYPTION_KEY` (preferred)
- `CONFIG_SECRET_KEY` (alias)

The code uses AES-256-GCM with a SHA-256 derived key. See `backend/src/config/secrets.js`.

## API Versioning

The API uses semantic versioning with the `/api/v1/` prefix for all routes.

### Versioning Strategy

- **Current version**: `/api/v1/` (all routes mounted here)
- **Unversioned paths**: Requests to `/api/*` (without version) are automatically redirected to `/api/v1/*` with a 301 status code
- **Deprecation headers**: Unversioned requests receive:
  - `Deprecation: true`
  - `Sunset: <date 90 days from now>`
  - `Link: </api/v1/...>; rel="successor-version"`

### Health endpoints

Health check endpoints are **not versioned** and remain at the root level for compatibility with load balancers and orchestration platforms:

- `GET /health` - Basic health check
- `GET /health/live` - Liveness probe (Kubernetes)
- `GET /health/ready` - Readiness probe (Kubernetes)
- `GET /health/detailed` - Detailed health report (auth-gated)
- `GET /metrics` - System metrics

### Frontend integration

The frontend is configured to use `/api/v1/` as the base URL for all API calls via `axios.defaults.baseURL`. This is set in `frontend/src/utils/axiosConfig.js`.

### Migration path

When introducing breaking changes:

1. Implement the new behavior in a new version (e.g., `/api/v2/`)
2. Keep `/api/v1/` stable for 90 days
3. Clients have 90 days to migrate (indicated by `Sunset` header)
4. After 90 days, `/api/v1/` can be deprecated or removed


