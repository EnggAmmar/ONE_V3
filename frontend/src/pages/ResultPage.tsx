import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import WizardShell from "../components/WizardShell";
import { downloadMissionReport, solveMission, type MissionSolveResponse } from "../lib/api";
import { requireMissionInput, useMission } from "../state/mission";
import { useSceneStore } from "../store/sceneStore";

export default function ResultPage() {
  const nav = useNavigate();
  const { draft } = useMission();
  const setConstellation = useSceneStore((s) => s.setConstellation);

  const input = useMemo(() => {
    try {
      return requireMissionInput(draft);
    } catch {
      return null;
    }
  }, [draft]);

  useEffect(() => {
    if (!draft.family) {
      nav("/", { replace: true });
      return;
    }
    if (!draft.payload) {
      nav("/payload", { replace: true });
      return;
    }
    if (!draft.roi) {
      nav("/roi", { replace: true });
      return;
    }
    if (!draft.parameters) {
      nav("/parameters", { replace: true });
    }
  }, [draft.family, draft.payload, draft.roi, draft.parameters, nav]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MissionSolveResponse | null>(null);

  useEffect(() => {
    if (!input) return;
    let alive = true;
    setLoading(true);
    solveMission(input)
      .then((r) => {
        if (!alive) return;
        setData(r);
        setConstellation({
          totalSatellites: r.constellation.satellites,
          planes: r.constellation.planes,
        });
        setError(null);
      })
      .catch((e) => {
        if (!alive) return;
        setError(String(e?.message ?? e));
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [input]);

  return (
    <WizardShell
      title="Your Constellation"
      subtitle="An explainable v1 solution: constellation estimate + CP-SAT subsystem selection."
      backTo="/parameters"
    >
      {loading ? <div className="muted">Solving...</div> : null}
      {error ? <div className="error">Solve error: {error}</div> : null}

      {!loading && !error && data ? (
        <div className="result">
          <div className="resultRow">
            <div className="resultCard">
              <div className="resultLabel">Constellation</div>
              <div data-testid="solution-satellites" className="resultValue">
                {data.constellation.satellites} satellites
              </div>
              <div className="muted">{data.constellation.orbit_type}</div>
            </div>

            <div className="resultCard">
              <div className="resultLabel">Platform</div>
              <div data-testid="solution-platform" className="resultValue">
                {data.solution.platform.bus_size_u}U Platform
              </div>
              <div className="muted">{data.solution.platform.name}</div>
            </div>

            <div className="resultCard">
              <div className="resultLabel">Indicative Cost</div>
              <div className="resultValue">
                ${Math.round(data.solution.budgets.total_cost_kusd)}K
              </div>
              <div className="muted">kUSD base sum</div>
            </div>
          </div>

          <div className="resultCardWide">
            <div className="resultLabel">Subsystems</div>
            <div className="subList">
              {data.solution.subsystems.map((s) => (
                <div key={s.domain} className="subItem">
                  <div className="subDomain">{s.domain}</div>
                  <div className="subName">{s.name}</div>
                </div>
              ))}
            </div>
            {data.solution.warnings?.length ? (
              <div className="warnBox">
                {data.solution.warnings.map((w: string) => (
                  <div key={w}>• {w}</div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="actions">
            <button
              className="btn btnPrimary"
              type="button"
              onClick={async () => {
                if (!input) return;
                const blob = await downloadMissionReport(input);
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "mission-report.md";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download Mission Doc
            </button>
          </div>
        </div>
      ) : null}
    </WizardShell>
  );
}
