# CubeSat Mission Configurator

Mission-driven CubeSat / constellation configurator (FastAPI + React + OR-Tools CP-SAT).

## Local dev (Docker)

1. Build + run:
   - `docker compose up --build`
2. Open:
   - Frontend: `http://localhost:3000`
   - Backend docs: `http://localhost:8000/docs`

Troubleshooting:
- Don’t browse to `http://0.0.0.0:...` (that’s a bind address). Use `http://localhost:3000`.
- If Docker runs inside WSL and `localhost` doesn’t work, use your WSL IP (e.g. `http://<wsl-ip>:3000`).

## Local dev (without Docker)

### Backend

- `cd backend`
- `python -m venv .venv`
- `.\.venv\Scripts\Activate.ps1`
- `pip install -r requirements.txt -r requirements-dev.txt`
- `uvicorn app.main:app --reload --port 8000`

Run tests:
- `pytest -q`

Lint / format:
- `ruff check .`
- `ruff format .`

### Frontend

- `cd frontend`
- `npm install`
- `npm run dev`

Unit tests (Vitest):
- `npm run test`

Run Playwright:
- `npx playwright install`
- `npm run test:e2e` (starts Vite automatically)
- `npm run test:e2e:docker` (brings up full stack and runs full-flow test)

Lint / format:
- `npm run lint`
- `npm run format`

## v1 Scope

- Wizard flow: mission family -> payload -> ROI -> mission parameters -> solution summary
- Backend: requirement derivation -> constellation estimate -> CP-SAT subsystem selection -> reports
- Seeded example data in `backend/app/data/catalog.json`

## Frontend scene architecture (v1)

The UI is an overlay on top of a persistent WebGL scene:

- Scene canvas root: `frontend/src/scene/SceneCanvas.tsx` (persistent react-three-fiber `Canvas`)
- Pose + transitions: `frontend/src/scene/SceneDirector.tsx` (GSAP-driven camera/object staging)
- Earth system hierarchy (single parent group):
  - `frontend/src/scene/earth/EarthSystem.tsx`
  - `frontend/src/scene/earth/EarthBase.tsx` (stylized atlas texture)
  - `frontend/src/scene/earth/OrbitLayer.tsx` (orbits attached to Earth group)
  - `frontend/src/scene/earth/RegionOverlay.tsx` + `frontend/src/scene/earth/ROIControls.tsx`
- Satellite hero: `frontend/src/scene/satellite/SatelliteHero.tsx`
- Cursor glow overlay: `frontend/src/scene/effects/CursorGlow.tsx`
- Scene store/types: `frontend/src/store/sceneStore.ts`, `frontend/src/types/scene.ts`
- Geo helpers: `frontend/src/lib/geo/geoUtils.ts`
- Route → scene-store sync + left dock: `frontend/src/ui/RouteTransition.tsx`, `frontend/src/ui/LeftDock.tsx`

## Test matrix (CI-friendly)

Backend:
- Lint: `cd backend && ruff check .`
- Unit/integration: `cd backend && pytest -q`

Frontend:
- Lint: `cd frontend && npm run lint`
- Unit (Vitest): `cd frontend && npm run test`
- Build: `cd frontend && npm run build`
- E2E (Playwright, mocked backend by default): `cd frontend && npx playwright test`
- E2E (Playwright, full stack): `cd frontend && npm run test:e2e:docker`

One-command CI runs:
- `make test`
- PowerShell: `./scripts/ci.ps1`
- Bash: `./scripts/ci.sh`
