import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import WizardShell from "../components/WizardShell";
import { useMission } from "../state/mission";

export default function RoiPage() {
  const nav = useNavigate();
  const { draft, setRoi } = useMission();

  useEffect(() => {
    if (!draft.family) {
      nav("/", { replace: true });
      return;
    }
    if (!draft.payload) {
      nav("/payload", { replace: true });
    }
  }, [draft.family, draft.payload, nav]);

  const initialGlobal = useMemo(() => draft.roi?.type === "global", [draft.roi?.type]);
  const [global, setGlobal] = useState<boolean>(initialGlobal);
  const [query, setQuery] = useState<string>(() =>
    draft.roi?.type === "region" ? draft.roi.query : "",
  );

  return (
    <WizardShell
      title="Region of Interest"
      subtitle="Start simple: global coverage or a region query string. (Map UI comes next.)"
      backTo="/payload"
    >
      <div className="form">
        <label className="toggleRow">
          <input
            type="checkbox"
            checked={global}
            onChange={(e) => setGlobal(e.target.checked)}
            aria-label="Global Coverage"
          />
          <span>Global Coverage</span>
        </label>

        {!global ? (
          <label>
            Region Search
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter country, region, city..."
              aria-label="Region Search"
            />
          </label>
        ) : null}
      </div>

      <div className="actions">
        <button
          className="btn btnPrimary"
          type="button"
          onClick={() => {
            if (global) {
              setRoi({ type: "global" });
              nav("/parameters");
              return;
            }
            if (query.trim().length < 2) return;
            setRoi({ type: "region", query: query.trim() });
            nav("/parameters");
          }}
          disabled={!global && query.trim().length < 2}
        >
          Next
        </button>
      </div>
    </WizardShell>
  );
}
