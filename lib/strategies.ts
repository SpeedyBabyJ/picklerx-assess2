import type { Severity } from "./ranges";

export type Joint = "ankle" | "knee" | "hip" | "trunk" | "shoulder";

export const strategies: Record<Joint, Record<Exclude<Severity,"Unknown">, string[]>> = {
  ankle: {
    High: [
      "Calf SMR (gastroc/soleus)",
      "Band-assisted ankle dorsiflexion mobilizations",
      "Wall ankle rocker (knee-to-wall)"
    ],
    Medium: [
      "Heel-elevated squat regressions",
      "Foam roll posterior chain (calf/hamstring)",
      "Ankle CARs (controlled articular rotations)"
    ],
    Low: []
  },
  knee: {
    High: [
      "Lateral tube walks (glute med activation)",
      "Wall-supported single-leg sit-to-stand (knee tracking)",
      "Split-squat with band pulling knee out (RNT)"
    ],
    Medium: [
      "Mini-band squats (knees out cue)",
      "Clamshells / side-lying hip abduction",
      "Goblet squat tempo (3-1-3) with midfoot pressure"
    ],
    Low: []
  },
  hip: {
    High: [
      "90/90 hip switches (capsule)",
      "Hip flexor/quad SMR + couch stretch",
      "Glute bridge iso → hip thrust progression"
    ],
    Medium: [
      "QL/erector SMR, hip hinge drills",
      "Tall-kneeling KB front raise (neutral ribcage)",
      "Wall hip airplanes"
    ],
    Low: []
  },
  trunk: {
    High: [
      "Dead bug + breathing (brace without rib flare)",
      "Wall slides (posterior tilt + overhead reach)",
      "Tall-kneeling anti-extension (band pulldown)"
    ],
    Medium: [
      "Plank with exhale (ribs down)",
      "Pallof press (anti-rotation)",
      "Half-kneeling cable lift/chop"
    ],
    Low: []
  },
  shoulder: {
    High: [
      "Lat/pec SMR + doorway pec stretch",
      "Thoracic extension mobilization on roller",
      "Overhead carry regressions (PVC then light KB)"
    ],
    Medium: [
      "Wall slides (thumbs up)",
      "Serratus reach + lift-off",
      "Scaption raises (light load)"
    ],
    Low: []
  }
};
