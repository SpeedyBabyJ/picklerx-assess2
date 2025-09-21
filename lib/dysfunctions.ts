import { DysfunctionTag } from "./types";

export const DYSFUNCTIONS: Record<string, DysfunctionTag> = {
  feet_turn_out: { id: "feet_turn_out", label: "Feet Turn Out", checkpoint: "ANKLE", reason: "External foot flare often reflects tight calves/TFL and weak anterior tib, reducing stable force transfer." },
  excessive_pronation: { id: "excessive_pronation", label: "Ankle Pronation", checkpoint: "ANKLE", reason: "Excessive rolling in stresses the arch/Achilles and alters knee tracking—raising shin and knee injury risk." },
  limited_dorsiflexion: { id: "limited_dorsiflexion", label: "Limited Dorsiflexion", checkpoint: "ANKLE", reason: "Restricted ankle bend forces compensations up the chain, reducing squat depth and power absorption." },

  knee_valgus: { id: "knee_valgus", label: "Knee Valgus", checkpoint: "KNEE", reason: "Knees collapsing inward increases ACL/MCL strain and reduces efficient cutting/jumping power." },
  knee_varus: { id: "knee_varus", label: "Knee Varus", checkpoint: "KNEE", reason: "Knees bowing out shifts load laterally and can irritate ITB/hip, reducing stable knee mechanics." },

  excessive_hip_internal_rotation: { id: "excessive_hip_internal_rotation", label: "Hip IR Dominance", checkpoint: "HIP", reason: "Over-rotating inward at the hip compromises frontal-plane control and increases lumbar/patellofemoral stress." },
  anterior_pelvic_tilt: { id: "anterior_pelvic_tilt", label: "Anterior Pelvic Tilt", checkpoint: "HIP", reason: "Excessive tilt shortens hip flexors and extends lumbar spine, elevating low-back strain and inhibiting glutes." },

  excessive_forward_lean: { id: "excessive_forward_lean", label: "Excessive Forward Lean", checkpoint: "TRUNK", reason: "Forward torso angle shifts demand to low back and hips, reducing stacked posture for power and endurance." },
  low_back_arch: { id: "low_back_arch", label: "Lumbar Extension (Arch)", checkpoint: "TRUNK", reason: "Over-extension jams facet joints and diminishes core bracing, risking low-back irritation." },
  low_back_round: { id: "low_back_round", label: "Lumbar Flexion (Round)", checkpoint: "TRUNK", reason: "Spinal flexion under load stresses discs and reduces efficient hip drive." },

  arms_fall_forward: { id: "arms_fall_forward", label: "Arms Fall Forward", checkpoint: "SHOULDER", reason: "Tight lats/pecs and weak lower traps cause scapular dyskinesis, hurting overhead mobility and paddle speed." },
  scapular_winging: { id: "scapular_winging", label: "Scapular Winging", checkpoint: "SHOULDER", reason: "Poor scap control destabilizes the shoulder complex and raises impingement risk." },

  asym_weight_shift: { id: "asym_weight_shift", label: "Asymmetric Weight Shift", checkpoint: "SYMMETRY", reason: "Favoring one side builds strength imbalances and increases overuse risk on the dominant limb." },
};
