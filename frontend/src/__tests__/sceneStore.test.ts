import { describe, expect, it } from "vitest";
import { useSceneStore } from "../store/sceneStore";

describe("scene store", () => {
  it("toggles interactive globe on roi step", () => {
    const { setStep } = useSceneStore.getState();
    setStep("landing");
    expect(useSceneStore.getState().interactiveGlobe).toBe(false);
    setStep("roi");
    expect(useSceneStore.getState().interactiveGlobe).toBe(true);
    setStep("result");
    expect(useSceneStore.getState().interactiveGlobe).toBe(false);
  });
});

