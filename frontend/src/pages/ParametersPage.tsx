import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import WizardShell from "../components/WizardShell";
import { useMission } from "../state/mission";

export default function ParametersPage() {
  const nav = useNavigate();
  const { draft, setRevisitHours } = useMission();
  const [hours, setHours] = useState<number>(() => draft.parameters?.revisit_time_hours ?? 48);

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
    }
  }, [draft.family, draft.payload, draft.roi, nav]);

  return (
    <WizardShell
      title="Mission Parameters"
      subtitle="v1 uses revisit time to estimate constellation size and drive trade-offs."
      backTo="/roi"
      testId="page-parameters"
    >
      <div className="form">
        <label>
          Revisit Time (hours)
          <input
            type="range"
            min={2}
            max={168}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
        </label>
        <div className="kpi">
          <div className="kpiLabel">Revisit Hours</div>
          <input
            aria-label="Revisit Hours"
            className="kpiInput"
            type="number"
            min={1}
            max={720}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="actions">
        <button
          className="btn btnPrimary"
          type="button"
          onClick={() => {
            flushSync(() => setRevisitHours(hours));
            nav("/result");
          }}
        >
          Finish
        </button>
      </div>
    </WizardShell>
  );
}
