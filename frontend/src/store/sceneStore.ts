import { create } from "zustand";

export type SceneStep = "landing" | "payload" | "roi" | "parameters" | "result";

export type SceneState = {
  step: SceneStep;
  family: "remote_sensing" | "iot_communication" | "navigation" | null;
  payloadType: "catalog" | "my_payload" | null;
  roiType: "global" | "region" | null;
  revisitHours: number | null;
  satellites: number | null;
  interactiveGlobe: boolean;
  setStep: (step: SceneStep) => void;
  setMission: (
    next: Partial<Pick<SceneState, "family" | "payloadType" | "roiType" | "revisitHours">>,
  ) => void;
  setSatellites: (satellites: number | null) => void;
};

export const useSceneStore = create<SceneState>((set) => ({
  step: "landing",
  family: null,
  payloadType: null,
  roiType: null,
  revisitHours: null,
  satellites: null,
  interactiveGlobe: false,
  setStep: (step) =>
    set({
      step,
      interactiveGlobe: step === "roi",
    }),
  setMission: (next) => set((s) => ({ ...s, ...next })),
  setSatellites: (satellites) => set({ satellites }),
}));
