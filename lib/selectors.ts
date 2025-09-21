import { AssessmentResult, Checkpoint, Prescription } from "./types";

export function tierFromScores(avg: number, highCount: number): AssessmentResult["tier"] {
  if (avg >= 90 && highCount === 0) return "ELITE";
  if ((avg >= 80 && avg < 90) || (highCount <= 1 && avg >= 85)) return "PRO";
  if ((avg >= 65 && avg < 80) || highCount === 2) return "AMATEUR";
  return "NOVICE";
}

export function buildPrescriptions(
  result: AssessmentResult,
  map: Record<string, Prescription>
): Record<Checkpoint, Prescription[]> {
  const out: Record<Checkpoint, Prescription[]> = {
    ANKLE: [], KNEE: [], HIP: [], TRUNK: [], SHOULDER: [], SYMMETRY: []
  };
  for (const cp of result.checkpoints) {
    for (const d of cp.dysfunctions) {
      const p = map[d];
      if (p) out[cp.checkpoint].push(p);
    }
  }
  return out;
}
