from __future__ import annotations

from enum import StrEnum
from typing import Annotated, Literal

from pydantic import BaseModel, Field


class MissionFamily(StrEnum):
    remote_sensing = "remote_sensing"
    iot_communication = "iot_communication"
    navigation = "navigation"


class ThermalClass(StrEnum):
    standard = "standard"
    sensitive = "sensitive"


class CatalogPayloadRef(BaseModel):
    type: Literal["catalog"] = "catalog"
    payload_id: str = Field(..., min_length=1)


class MyPayloadInput(BaseModel):
    type: Literal["my_payload"] = "my_payload"
    name: str = Field(..., min_length=1)
    length_mm: float = Field(..., gt=0)
    width_mm: float = Field(..., gt=0)
    height_mm: float = Field(..., gt=0)
    mass_kg: float = Field(..., gt=0)
    avg_power_w: float = Field(..., ge=0)
    peak_power_w: float = Field(..., ge=0)
    data_rate_mbps: float | None = Field(default=None, gt=0)
    pointing_accuracy_deg: float | None = Field(default=None, gt=0)
    thermal_class: ThermalClass | None = None
    storage_required_gb: float | None = Field(default=None, gt=0)
    gpu_required_tops: float | None = Field(default=None, gt=0)


PayloadSelection = Annotated[CatalogPayloadRef | MyPayloadInput, Field(discriminator="type")]


class RoiGlobal(BaseModel):
    type: Literal["global"] = "global"


class RoiRegion(BaseModel):
    type: Literal["region"] = "region"
    query: str = Field(..., min_length=2)


RegionOfInterest = Annotated[RoiGlobal | RoiRegion, Field(discriminator="type")]


class MissionParameters(BaseModel):
    revisit_time_hours: float = Field(..., gt=0, le=720)


class MissionInput(BaseModel):
    family: MissionFamily
    payload: PayloadSelection
    roi: RegionOfInterest
    parameters: MissionParameters


class DerivedRequirements(BaseModel):
    payload_mass_kg: float
    payload_volume_cm3: float
    payload_avg_power_w: float
    payload_peak_power_w: float
    min_downlink_mbps: float | None = None
    max_pointing_error_deg: float | None = None
    thermal_class: ThermalClass = ThermalClass.standard


class ConstellationEstimate(BaseModel):
    orbit_type: str
    altitude_km: int
    satellites: int
    planes: int
    satellites_per_plane: int
    notes: list[str] = Field(default_factory=list)


class SelectedSubsystem(BaseModel):
    domain: str
    item_id: str
    name: str
    mass_kg: float
    avg_power_w: float
    peak_power_w: float
    cost_kusd: float
    metadata: dict[str, object] = Field(default_factory=dict)


class PlatformSummary(BaseModel):
    platform_id: str
    name: str
    bus_size_u: float
    max_total_mass_kg: float
    max_payload_volume_cm3: float
    avg_power_gen_w: float
    peak_power_gen_w: float


class Budgets(BaseModel):
    total_mass_kg: float
    total_avg_power_w: float
    total_peak_power_w: float
    total_cost_kusd: float
    mass_margin_kg: float
    avg_power_margin_w: float
    peak_power_margin_w: float


class SolverSolution(BaseModel):
    platform: PlatformSummary
    subsystems: list[SelectedSubsystem]
    budgets: Budgets
    warnings: list[str] = Field(default_factory=list)
    trace: list[str] = Field(default_factory=list)


class MissionSolveRequest(BaseModel):
    input: MissionInput


class MissionReportRequest(BaseModel):
    input: MissionInput


class MissionSolveResponse(BaseModel):
    input: MissionInput
    requirements: DerivedRequirements
    constellation: ConstellationEstimate
    solution: SolverSolution


class MissionFamiliesResponse(BaseModel):
    families: list[MissionFamily]


class PayloadCategory(BaseModel):
    category_id: str
    label: str


class PayloadCategoriesResponse(BaseModel):
    categories: list[PayloadCategory]
