"use client";
import { create } from "zustand";
import { AssessmentResult } from "./types";

type S = {
  lastResult?: AssessmentResult;
  setLastResult: (r: AssessmentResult) => void;
  reset: () => void;
};

export const useAssessmentStore = create<S>((set) => ({
  setLastResult: (r) => set({ lastResult: r }),
  reset: () => set({ lastResult: undefined }),
}));
