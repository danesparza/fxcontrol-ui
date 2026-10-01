# fxcontrol-ui

React + TypeScript SPA for the FX suite, built with Vite. The initial version provides live service discovery and a responsive timeline workspace shell. It does not edit, save, or execute sequences yet.

## Development

Requires Node.js 22.12+ (CI uses Node 22) and npm.

```sh
npm ci
npm run dev
```

Run fxcontrol separately on port 3090. Vite proxies `/v1` to `http://localhost:3090`; the browser always uses relative API URLs. Change the development proxy in `vite.config.ts` if the controller runs elsewhere. The SPA requests `GET /v1/discover/` on mount, every 30 seconds, and on manual refresh. Refresh fetches the controller's cached snapshot; it does not trigger a network scan.

The service browser supports search and selection. The inspector shows advertised metadata, not verified health. Failed refreshes keep the last successful snapshot and show an error. Empty snapshots, malformed responses, timeouts, and unavailable controllers are handled explicitly. Requests are canceled on unmount.

The workspace contains placeholder Audio, Pixels, Lighting, and Triggers lanes, plus a 10/30/60-second ruler. These are categories, not configured tracks. Playback controls and Stop all are disabled because controller sequence APIs do not exist yet. No demo devices or simulated playback are shown.

## Checks and build

```sh
npm test
make lint-new
npm run build
```

Build output is in `dist/`. CI checks tests, lint, and the production build, then uploads the static files as an artifact. This is a frontend-only repository; Go tests do not apply.

`npm run preview` previews built files only; it does not provide the controller API proxy. Use `npm run dev` for integrated local development.

## Embedding contract

A future fxcontrol integration can place the contents of `dist/` into a dedicated embedded asset directory and serve the UI at `/`, alongside `/v1` APIs. No Node runtime is required in production. This change does not modify the sibling fxcontrol repository or copy files into it.

Pin the UI revision/artifact used by the controller release for reproducibility. Serve hashed assets with immutable caching and revalidate `index.html`. Keep API errors and missing assets as actual errors rather than falling back to HTML. There are no client-side routes yet; choose hash routing or explicit SPA fallback when routes are introduced.

## Planned sequencing contract

- Persist timeline positions and durations as integer milliseconds. Display seconds/milliseconds; musical tempo is outside the initial scope.
- Keep project/track/clip data separate from transient editor selection, zoom, and scroll state. Validate service bindings before execution.
- The controller owns scheduling and playback. A browser disconnect must not cancel running sequences. The UI will reconnect to authoritative playback status.
- Add a controller-wide emergency-stop API that cancels every active sequence and pending scheduled dispatch, then sends stop commands to affected FX services. It should be idempotent and return partial failures explicitly; the UI must not claim everything stopped without confirmation. A subsequent run must require an explicit start.
- Define and test that API against the actual FX stop capabilities before enabling Stop all. Its endpoint and response shape have intentionally not been invented here. Service/network failures mean a software stop cannot guarantee physical equipment has stopped.
