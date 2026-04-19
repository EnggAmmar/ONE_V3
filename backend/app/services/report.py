from __future__ import annotations

from datetime import UTC, datetime

from app.schemas.mission import (
    ConstellationEstimate,
    DerivedRequirements,
    MissionInput,
    SolverSolution,
)


def render_mission_report_markdown(
    mission_input: MissionInput,
    requirements: DerivedRequirements,
    constellation: ConstellationEstimate,
    solution: SolverSolution,
) -> str:
    now = datetime.now(tz=UTC).strftime("%Y-%m-%d %H:%M UTC")
    lines: list[str] = []

    lines.append("# Mission Report (v1)")
    lines.append("")
    lines.append(f"Generated: {now}")
    lines.append("")
    lines.append("## Mission Input")
    lines.append(f"- Family: `{mission_input.family.value}`")
    lines.append(f"- ROI: `{mission_input.roi.type}`")
    if mission_input.roi.type == "region":
        lines.append(f"- Region query: `{mission_input.roi.query}`")
    lines.append(f"- Revisit time target: `{mission_input.parameters.revisit_time_hours:g} h`")
    lines.append("")

    lines.append("## Derived Requirements")
    lines.append(f"- Payload mass: `{requirements.payload_mass_kg:g} kg`")
    lines.append(f"- Payload volume: `{requirements.payload_volume_cm3:g} cm^3`")
    lines.append(f"- Payload avg power: `{requirements.payload_avg_power_w:g} W`")
    lines.append(f"- Payload peak power: `{requirements.payload_peak_power_w:g} W`")
    if requirements.min_downlink_mbps is not None:
        lines.append(f"- Min downlink: `{requirements.min_downlink_mbps:g} Mbps`")
    if requirements.max_pointing_error_deg is not None:
        lines.append(f"- Max pointing error: `{requirements.max_pointing_error_deg:g} deg`")
    lines.append(f"- Thermal class: `{requirements.thermal_class.value}`")
    lines.append("")

    lines.append("## Constellation Estimate (Approx.)")
    lines.append(f"- Orbit: `{constellation.orbit_type}` @ `{constellation.altitude_km} km`")
    lines.append(
        f"- Constellation: `{constellation.satellites} sats` in `{constellation.planes} planes`"
    )
    lines.append(f"- Satellites/plane: `{constellation.satellites_per_plane}`")
    for note in constellation.notes:
        lines.append(f"- Note: {note}")
    lines.append("")

    lines.append("## Platform")
    lines.append(f"- Selected: `{solution.platform.name}` (`{solution.platform.bus_size_u}U`)")
    lines.append(f"- Max total mass: `{solution.platform.max_total_mass_kg:g} kg`")
    lines.append(f"- Avg power generation: `{solution.platform.avg_power_gen_w:g} W`")
    lines.append("")

    lines.append("## Selected Subsystems")
    for s in solution.subsystems:
        lines.append(
            f"- `{s.domain}`: `{s.name}` (mass `{s.mass_kg:g} kg`, "
            f"avg `{s.avg_power_w:g} W`, cost `{s.cost_kusd:g} kUSD`)"
        )
    lines.append("")

    lines.append("## Budgets")
    b = solution.budgets
    lines.append(f"- Total mass: `{b.total_mass_kg:g} kg` (margin `{b.mass_margin_kg:g} kg`)")
    lines.append(f"- Avg power: `{b.total_avg_power_w:g} W` (margin `{b.avg_power_margin_w:g} W`)")
    lines.append(
        f"- Peak power: `{b.total_peak_power_w:g} W` (margin `{b.peak_power_margin_w:g} W`)"
    )
    lines.append(f"- Indicative cost: `{b.total_cost_kusd:g} kUSD`")
    lines.append("")

    if solution.warnings:
        lines.append("## Warnings")
        for w in solution.warnings:
            lines.append(f"- {w}")
        lines.append("")

    lines.append("## Trace")
    for t in solution.trace:
        lines.append(f"- {t}")
    lines.append("")

    return "\n".join(lines)
