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

The controller embeds `ui/dist` and serves it at `/`, alongside `/v1` APIs and `/swagger`. No Node runtime is required in production. To update a sibling controller checkout:

```sh
make sync-server-ui
cd ../fxcontrol
go test ./...
make lint-new
go run . start --listen :3090
```

Open `http://localhost:3090`. The sync target builds first, then replaces only `ui/dist`; `ui/assets.go` is preserved. For another checkout, use `make sync-server-ui SERVER_UI_DIR=/path/to/fxcontrol/ui`. The destination must already contain `assets.go`.

Commit the generated `ui/dist` files in the controller repository with the integration changes. Each controller revision then contains its exact UI version, and Go builds require neither Node nor this frontend checkout. UI changes require another sync and controller rebuild/restart.

The server revalidates the homepage and uses immutable caching for Vite's hashed assets. Missing files return 404; there is no SPA fallback. There are no client-side routes yet; hash routing can be added without changing this serving strategy.

## Planned sequencing contract

- Persist timeline positions and durations as integer milliseconds. Display seconds/milliseconds; musical tempo is outside the initial scope.
- Keep project/track/clip data separate from transient editor selection, zoom, and scroll state. Validate service bindings before execution.
- The controller owns scheduling and playback. A browser disconnect must not cancel running sequences. The UI will reconnect to authoritative playback status.
- Add a controller-wide emergency-stop API that cancels every active sequence and pending scheduled dispatch, then sends stop commands to affected FX services. It should be idempotent and return partial failures explicitly; the UI must not claim everything stopped without confirmation. A subsequent run must require an explicit start.
- Define and test that API against the actual FX stop capabilities before enabling Stop all. Its endpoint and response shape have intentionally not been invented here. Service/network failures mean a software stop cannot guarantee physical equipment has stopped.
