Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "== Backend =="
Push-Location "backend"
ruff check .
pytest -q
Pop-Location

Write-Host "== Frontend =="
Push-Location "frontend"
npm run lint
npm run test
npm run build
npx playwright test
Pop-Location

Write-Host "CI checks complete."

