# Task: Fix SPA Routing in Production Web Server

## Status
- [x] Analyze the issue (404 Not Found on deep links in production)
- [x] Fix `webServerManager.ts` to correctly handle SPA routing (catch-all route)
- [x] Verify build works
- [x] Verify fix logic

## Details
The user reported a `NotFoundError` when accessing deep links (e.g. `/projects/...`) in the production build of the CLI web server.
This was caused by the Express server in `webServerManager.ts` not having a proper catch-all route for SPA history mode.
It was using `/*path` which might be restrictive or buggy, and checking for dots.
I replaced it with a standard `app.get('*')` handler that serves `index.html`.
I also added a check to ensure `index.html` exists before starting the server.
