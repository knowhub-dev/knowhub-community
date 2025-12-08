# Domain and cookie configuration

This project relies on consistent domain settings between the backend (Laravel) and the frontend (Next.js) so that authentication cookies work reliably across subdomains.

## Required environment variables

- `SESSION_DOMAIN`: Root domain (with a leading dot) used by Laravel sessions and Sanctum. Example: `.knowhub.uz`.
- `COOKIE_DOMAIN`: Domain used for backend-issued cookies. Keep it identical to `SESSION_DOMAIN`.
- `NEXT_PUBLIC_COOKIE_DOMAIN`: Domain used by the frontend when writing the `auth_token` cookie. **Must match `SESSION_DOMAIN`.**
- `FRONTEND_URL`: The canonical frontend URL (e.g., `https://space.knowhub.uz`).
- `APP_URL`: The backend base URL (e.g., `https://api.knowhub.uz`).
- `SANCTUM_STATEFUL_DOMAINS`: Comma-separated list of stateful domains that should include the frontend and API subdomains on the same root.
- `CORS_ALLOWED_ORIGINS` / `CORS_ALLOWED_ORIGIN_PATTERN`: Extra origins or wildcards when custom domains are required.

## Recommended production setup

```env
SESSION_DOMAIN=.knowhub.uz
COOKIE_DOMAIN=.knowhub.uz
NEXT_PUBLIC_COOKIE_DOMAIN=.knowhub.uz
FRONTEND_URL=https://space.knowhub.uz
APP_URL=https://api.knowhub.uz
SANCTUM_STATEFUL_DOMAINS=space.knowhub.uz,api.knowhub.uz,knowhub.uz
```

- `SameSite=None; Secure` is enforced for frontend cookies in production. Ensure HTTPS is used everywhere so browsers accept the cookie.
- Subdomain access is enabled through `SESSION_DOMAIN` and the CORS configuration, which default to the shared root domain while allowing wildcard patterns for additional subdomains.

## Local development tips

- Keep `SESSION_DOMAIN`/`COOKIE_DOMAIN`/`NEXT_PUBLIC_COOKIE_DOMAIN` in sync, even when switching to test domains.
- Use `http://localhost:3000` for the frontend and `http://localhost` or `http://127.0.0.1` for the API; these are already included in the CORS allowlist.
- Add any additional ports or domains to `CORS_ALLOWED_ORIGINS` as needed.
