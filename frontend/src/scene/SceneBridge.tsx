import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSceneStore } from "../store/sceneStore";
import { useMission } from "../state/mission";

function stepFromPath(pathname: string) {
  if (pathname === "/") return "landing" as const;
  if (pathname.startsWith("/payload")) return "payload" as const;
  if (pathname.startsWith("/roi")) return "roi" as const;
  if (pathname.startsWith("/parameters")) return "parameters" as const;
  if (pathname.startsWith("/result")) return "result" as const;
  return "landing" as const;
}

export default function SceneBridge() {
  const loc = useLocation();
  const { draft } = useMission();
  const setStep = useSceneStore((s) => s.setStep);
  const setMission = useSceneStore((s) => s.setMission);

  useEffect(() => {
    setStep(stepFromPath(loc.pathname));
  }, [loc.pathname, setStep]);

  useEffect(() => {
    setMission({
      family: draft.family ?? null,
      payloadType: draft.payload?.type ?? null,
      roiType: draft.roi?.type ?? null,
      revisitHours: draft.parameters?.revisit_time_hours ?? null,
    });
  }, [
    draft.family,
    draft.parameters?.revisit_time_hours,
    draft.payload?.type,
    draft.roi?.type,
    setMission,
  ]);

  return null;
}
