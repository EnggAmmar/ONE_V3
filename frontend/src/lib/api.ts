export type MissionFamily = "remote_sensing" | "iot_communication" | "navigation";

export type TaxonomyPayloadCategory = {
  category_id: string;
  label: string;
  description: string;
  payloads: Array<{ payload_id: string; label: string }>;
};

export type TaxonomyMissionFamily = {
  family_id: MissionFamily;
  label: string;
  description: string;
  payload_categories: TaxonomyPayloadCategory[];
};

export type TaxonomyResponse = {
  version: string;
  families: TaxonomyMissionFamily[];
};

export type Roi = { type: "global" } | { type: "region"; query: string };

export type PayloadSelection =
  | { type: "catalog"; payload_id: string }
  | {
      type: "my_payload";
      name: string;
      length_mm: number;
      width_mm: number;
      height_mm: number;
      mass_kg: number;
      avg_power_w: number;
      peak_power_w: number;
      data_rate_mbps?: number;
      pointing_accuracy_deg?: number;
      thermal_class?: "standard" | "sensitive";
    };

export interface MissionInput {
  family: MissionFamily;
  payload: PayloadSelection;
  roi: Roi;
  parameters: { revisit_time_hours: number };
}

export interface MissionSolveResponse {
  constellation: { satellites: number; planes: number; orbit_type: string };
  solution: {
    platform: { name: string; bus_size_u: number };
    budgets: { total_cost_kusd: number; total_mass_kg: number };
    subsystems: Array<{ domain: string; name: string }>;
    warnings: string[];
  };
}

export async function solveMission(input: MissionInput): Promise<MissionSolveResponse> {
  const resp = await fetch("/api/v1/mission/solve", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ input }),
  });
  if (!resp.ok) throw new Error(`Solve failed: ${resp.status}`);
  return resp.json();
}

export async function downloadMissionReport(input: MissionInput): Promise<Blob> {
  const resp = await fetch("/api/v1/mission/report", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ input }),
  });
  if (!resp.ok) throw new Error(`Report failed: ${resp.status}`);
  return resp.blob();
}

export async function getTaxonomy(): Promise<TaxonomyResponse> {
  const resp = await fetch("/api/v1/taxonomy", { method: "GET" });
  if (!resp.ok) throw new Error(`Taxonomy failed: ${resp.status}`);
  return resp.json();
}
