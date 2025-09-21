export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type Checkpoint = "ANKLE" | "KNEE" | "HIP" | "TRUNK" | "SHOULDER" | "SYMMETRY";

export interface DysfunctionTag {
  id: string;              // "knee_valgus"
  label: string;           // "Knee Valgus"
  checkpoint: Checkpoint;  // "KNEE"
  reason: string;          // one-sentence "why it matters"
}

export interface CheckpointResult {
  checkpoint: Checkpoint;
  score: number;                 // 0–100
  risk: RiskLevel;
  dysfunctions: string[];        // array of DysfunctionTag.id
  notes?: string[];
}

export interface AssessmentResult {
  athleteId?: string;
  createdAt: string;             // ISO
  tier: "ELITE" | "PRO" | "AMATEUR" | "NOVICE";
  symmetryScore: number;         // 0–100
  checkpoints: CheckpointResult[];
  frames?: { frontUrl?: string; sideUrl?: string };
}

export type ExerciseType = "STRENGTH" | "STRETCH" | "FOAM_ROLL";

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  tags: string[];                // muscles/qualities
  cue?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  prescription?: string;         // sets/reps/time
}

export interface Prescription {
  checkpoint: Checkpoint;
  dysfunctionId: string;         // matches DysfunctionTag.id
  strength: string[];            // 3 Exercise.id
  stretch: string[];             // 2 Exercise.id
  foamRoll: string[];            // 2 Exercise.id
}
