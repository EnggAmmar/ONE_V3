# CubeSat Mission Configurator

Mission-driven CubeSat / constellation configurator (FastAPI + React + OR-Tools CP-SAT).

## Local dev (Docker)

1. Build + run:
   - `docker compose up --build`
2. Open:
   - Frontend: `http://localhost:3000`
   - Backend docs: `http://localhost:8000/docs`

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

- Scene canvas: `frontend/src/scene/SceneCanvas.tsx` (react-three-fiber `Canvas`)
- Scene world: `frontend/src/scene/SceneWorld.tsx` (stars, Earth, atmosphere, orbit rings, satellites)
- Camera + step transitions: `frontend/src/scene/SceneDirector.tsx` (GSAP)
- Route/state bridge: `frontend/src/scene/SceneBridge.tsx` (maps wizard route + mission draft into scene store)
- Scene state: `frontend/src/store/sceneStore.ts` (Zustand)
- UI route animation wrapper: `frontend/src/ui/RouteTransition.tsx`

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
