export type Severity = "Low" | "Medium" | "High" | "Unknown";

// Numeric thresholds (degrees or relative px scaled).
// Tune these from Assessments.zip later if needed.
export const ranges = {
  kneeValgus: {         // knee drift (medial) relative to ankle, in units of shoulderWidth %
    mediumPct: 0.10,
    highPct:   0.20,
  },
  trunkLean: {          // trunk angle from vertical (deg)
    mediumDeg: 15,
    highDeg:   30,
  },
  trunkLateralShift: {  // shoulderMid-to-hipMid X deviation as shoulderWidth %
    mediumPct: 0.10,
    highPct:   0.20,
  },
  shoulderFlexion: {    // angle (elbow–shoulder–hip); 180 = stacked overhead
    mediumMinDeg: 120,
    lowMinDeg:    150,
  },
  ankleMirrorKnee: true // pragmatic first-pass: ankle severity mirrors knee valgus
} as const;

export type Ranges = typeof ranges;
