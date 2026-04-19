from __future__ import annotations

from fastapi import APIRouter, HTTPException, Response

from app.schemas.mission import (
    MissionFamiliesResponse,
    MissionReportRequest,
    MissionSolveRequest,
    MissionSolveResponse,
    PayloadCategoriesResponse,
)
from app.services.catalog import get_catalog
from app.services.constellation import estimate_constellation
from app.services.optimization.solver import solve_subsystems
from app.services.report import render_mission_report_markdown
from app.services.requirements import derive_requirements
from app.services.taxonomy import get_taxonomy

router = APIRouter()


@router.get("/mission-families", response_model=MissionFamiliesResponse)
def mission_families() -> MissionFamiliesResponse:
    taxonomy = get_taxonomy()
    return MissionFamiliesResponse(families=[f.family_id for f in taxonomy.families])


@router.get("/payload-categories", response_model=PayloadCategoriesResponse)
def payload_categories(family: str) -> PayloadCategoriesResponse:
    taxonomy = get_taxonomy()
    fam = next((f for f in taxonomy.families if f.family_id.value == family), None)
    if not fam:
        return PayloadCategoriesResponse(categories=[])
    return PayloadCategoriesResponse(
        categories=[
            {"category_id": c.category_id, "label": c.label} for c in fam.payload_categories
        ]
    )


@router.post("/mission/solve", response_model=MissionSolveResponse)
def mission_solve(req: MissionSolveRequest) -> MissionSolveResponse:
    catalog = get_catalog()
    try:
        requirements = derive_requirements(req.input, catalog)
        constellation = estimate_constellation(req.input, requirements)
        solution = solve_subsystems(req.input, requirements, constellation, catalog)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return MissionSolveResponse(
        input=req.input,
        requirements=requirements,
        constellation=constellation,
        solution=solution,
    )


@router.post("/mission/report")
def mission_report(req: MissionReportRequest) -> Response:
    catalog = get_catalog()
    try:
        requirements = derive_requirements(req.input, catalog)
        constellation = estimate_constellation(req.input, requirements)
        solution = solve_subsystems(req.input, requirements, constellation, catalog)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    md = render_mission_report_markdown(
        mission_input=req.input,
        requirements=requirements,
        constellation=constellation,
        solution=solution,
    )
    return Response(content=md, media_type="text/markdown; charset=utf-8")
