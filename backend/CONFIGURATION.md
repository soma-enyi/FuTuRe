# Backend Configuration Guide

## Overview

The FuTuRe backend uses environment variables and a centralized configuration module to manage settings across development, testing, and production environments.

## Configuration Module

The configuration is managed through `backend/src/config/env.js`, which provides:

- **getConfig()** - Returns the current configuration object
- **createConfigFromEnv()** - Creates a fresh configuration from environment variables
- **resetConfig()** - Clears the cached configuration (useful for testing)

## Environment Variables

### Core Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `STELLAR_NETWORK` | `testnet` | Stellar network (testnet or public) |
| `JWT_SECRET` | `dev-secret-change-in-production` | JWT signing secret (MUST be set in production) |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` | CORS allowed origins (comma-separated) |

### Setup

1. Copy the example environment file:
```bash
cp backend/.env.example backend/.env
```

2. Update `backend/.env` with your settings:
```env
PORT=3001
STELLAR_NETWORK=testnet
JWT_SECRET=your-secure-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Security Headers

The backend applies strict security headers via the `securityHeaders` middleware:

### Content Security Policy (CSP)

The CSP header enforces:

- **default-src 'self'** - Only allow resources from the same origin
- **script-src 'self'** - Only allow scripts from the same origin (prevents XSS)
- **connect-src 'self' https://horizon-testnet.stellar.org https://horizon.stellar.org** - Allow API calls to Stellar Horizon
- **object-src 'none'** - Block all object/embed resources
- **report-uri /api/security/csp-report** - Report CSP violations to the backend

### Additional Security Headers

- **X-Content-Type-Options: nosniff** - Prevent MIME type sniffing
- **X-Frame-Options: DENY** - Prevent clickjacking
- **X-XSS-Protection: 1; mode=block** - Enable XSS protection
- **Strict-Transport-Security** - Enforce HTTPS (1 year)
- **Referrer-Policy: strict-origin-when-cross-origin** - Control referrer information
- **Permissions-Policy** - Disable geolocation, microphone, camera

## JWT Configuration

JWT tokens are signed using the `JWT_SECRET` from the configuration:

- **Access Token** - Expires in 1 hour
- **Refresh Token** - Expires in 7 days

The JWT secret is read from `config.security.jwtSecret`, which is populated from the `JWT_SECRET` environment variable.

### Production Requirements

In production, you MUST:

1. Set a strong `JWT_SECRET` (minimum 32 characters)
2. Use HTTPS (enforced by Strict-Transport-Security header)
3. Set appropriate `ALLOWED_ORIGINS` for your domain
4. Never commit `.env` files to version control

## Configuration Structure

```javascript
{
  port: number,
  stellarNetwork: string,
  security: {
    jwtSecret: string,
    corsOrigins: string[]
  }
}
```

## Testing

When testing, use `resetConfig()` to clear the cached configuration:

```javascript
import { resetConfig } from '../src/config/env.js';

beforeEach(() => {
  resetConfig();
  process.env.JWT_SECRET = 'test-secret';
});
```

## Troubleshooting

### JWT_SECRET not being picked up

Ensure:
1. The environment variable is set before the app starts
2. You're using `getConfig().security.jwtSecret`, not `process.env.JWT_SECRET` directly
3. Call `resetConfig()` in tests if you change the environment variable

### CORS errors

Check that:
1. Your frontend origin is in `ALLOWED_ORIGINS`
2. Origins are comma-separated with no spaces
3. Include the protocol (http:// or https://)

### CSP violations

If you see CSP violations in the browser console:
1. Check the report at `/api/security/csp-report`
2. Update the CSP policy in `backend/src/middleware/securityHeaders.js`
3. Add new domains to `connect-src` if needed for external APIs
