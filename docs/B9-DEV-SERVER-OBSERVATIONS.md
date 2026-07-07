## B-9 Dev Server Observations

### Row 1 — Navigate to `http://localhost:3000`
- URL: `http://localhost:3000/`
- Console error: None blocking; page loads the public landing page.
- Network response: 200 OK for `/`
- Likely cause: The root route is a public marketing/landing page instead of redirecting unauthenticated users to `/login` or `/dashboard`.
- Suggested fix: If the B-9 contract expects a redirect, make `/` route through the auth perimeter or redirect explicitly based on session state.

### Row 2 — Log in with demo credentials
- URL: `http://localhost:3000/login`
- Console error: Access to fetch at 'http://localhost:5000/api/auth/refresh' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
- Network response: POST `http://localhost:5000/api/auth/refresh` failed with `net::ERR_FAILED`
- Likely cause: backend CORS allowlist does not include the active frontend origin on port 3000 during dev.
- Suggested fix: update the backend CORS origin configuration so `http://localhost:3000` is allowed, then re-run the login smoke.

### Row 5 — Fill and submit new order form
- URL: `http://localhost:3000/orders/new`
- Console error: `Failed to load resource: the server responded with a status of 500 (Internal Server Error)`
- Network response: 500 on order submission
- Likely cause: The create-order payload from the UI is not aligned with the current backend contract and is likely missing required order fields such as `materials`.
- Suggested fix: Align the frontend order form payload with the current order schema, default `materials` to an empty array or expose the field in the form before submitting.
