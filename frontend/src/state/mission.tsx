import React, { createContext, useContext, useMemo, useState } from "react";
import type { MissionFamily, MissionInput, PayloadSelection, Roi } from "../lib/api";

export type MissionDraft = Partial<MissionInput> & {
  family?: MissionFamily;
  payload?: PayloadSelection;
  roi?: Roi;
  parameters?: { revisit_time_hours: number };
};

type MissionContextValue = {
  draft: MissionDraft;
  setFamily: (family: MissionFamily) => void;
  setPayload: (payload: PayloadSelection) => void;
  setRoi: (roi: Roi) => void;
  setRevisitHours: (hours: number) => void;
  reset: () => void;
};

const MissionContext = createContext<MissionContextValue | null>(null);

const STORAGE_KEY = "mission_draft_v1";

function loadInitial(): MissionDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as MissionDraft;
  } catch {
    return {};
  }
}

export function MissionProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<MissionDraft>(() => loadInitial());

  const value = useMemo<MissionContextValue>(() => {
    const persist = (next: MissionDraft) => {
      setDraft(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
    };

    return {
      draft,
      setFamily: (family) =>
        persist({ family, payload: undefined, roi: undefined, parameters: undefined }),
      setPayload: (payload) => persist({ ...draft, payload }),
      setRoi: (roi) => persist({ ...draft, roi }),
      setRevisitHours: (hours) => persist({ ...draft, parameters: { revisit_time_hours: hours } }),
      reset: () => persist({}),
    };
  }, [draft]);

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMission() {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error("useMission must be used within MissionProvider");
  return ctx;
}

export function requireMissionInput(draft: MissionDraft): MissionInput {
  if (!draft.family) throw new Error("Missing mission family");
  if (!draft.payload) throw new Error("Missing payload selection");
  if (!draft.roi) throw new Error("Missing ROI");
  if (!draft.parameters) throw new Error("Missing mission parameters");
  return {
    family: draft.family,
    payload: draft.payload,
    roi: draft.roi,
    parameters: draft.parameters,
  };
}
