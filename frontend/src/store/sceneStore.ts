import { create } from "zustand";
import type { MissionFamily, PayloadType, RegionSelection, SceneStep } from "../types/scene";

type SceneStore = {
  step: SceneStep;
  missionFamily: MissionFamily;
  payloadType: PayloadType;
  selectedRegion: RegionSelection;
  regionQuery: string;

  roiInteractionEnabled: boolean;
  earthAutoRotate: boolean;
  earthFocused: boolean;

  setStep: (step: SceneStep) => void;
  setMissionFamily: (missionFamily: MissionFamily) => void;
  setPayloadType: (payloadType: PayloadType) => void;
  setSelectedRegion: (region: RegionSelection) => void;
  setRegionQuery: (query: string) => void;
  setROIInteractionEnabled: (enabled: boolean) => void;
  setEarthAutoRotate: (enabled: boolean) => void;
  setEarthFocused: (focused: boolean) => void;
};

export const useSceneStore = create<SceneStore>((set) => ({
  step: "missionType",
  missionFamily: null,
  payloadType: null,
  selectedRegion: null,
  regionQuery: "",

  roiInteractionEnabled: false,
  earthAutoRotate: true,
  earthFocused: false,

  setStep: (step) =>
    set({
      step,
      roiInteractionEnabled: step === "roi",
      earthAutoRotate: true,
      earthFocused: false,
    }),

  setMissionFamily: (missionFamily) => set({ missionFamily }),
  setPayloadType: (payloadType) => set({ payloadType }),
  setSelectedRegion: (selectedRegion) => set({ selectedRegion }),
  setRegionQuery: (regionQuery) => set({ regionQuery }),
  setROIInteractionEnabled: (roiInteractionEnabled) => set({ roiInteractionEnabled }),
  setEarthAutoRotate: (earthAutoRotate) => set({ earthAutoRotate }),
  setEarthFocused: (earthFocused) => set({ earthFocused }),
}));
