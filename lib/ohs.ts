export type KP = { name: string; x: number; y: number; score?: number };

export type Severity = "Low" | "Medium" | "High" | "Unknown";

export type OHSFlags = {
  ankle: Severity;
  knee: Severity;
  hip: Severity;
  trunk: Severity;
  shoulder: Severity;
};

import { ranges } from "./ranges";
import { strategies } from "./strategies";

const MIN_SCORE = 0.5;

function kp(keypoints: KP[], name: string) {
  return keypoints.find((k) => k.name === name && (k.score ?? 1) >= MIN_SCORE);
}

function angle(a: KP, b: KP, c: KP) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag1 = Math.hypot(ab.x, ab.y);
  const mag2 = Math.hypot(cb.x, cb.y);
  if (mag1 === 0 || mag2 === 0) return NaN;
  const cos = dot / (mag1 * mag2);
  const clamped = Math.max(-1, Math.min(1, cos));
  return (Math.acos(clamped) * 180) / Math.PI;
}

export type OHSResult = {
  flags: OHSFlags;
  metrics: {
    shoulderWidth: number;
    kneeLeftDX: number;
    kneeRightDX: number;
    trunkAngleFromVertical: number;
    lateralShiftPx: number;
    shoulderLeftAngle: number;
    shoulderRightAngle: number;
  };
  recommendations: {
    ankle: string[];
    knee: string[];
    hip: string[];
    trunk: string[];
    shoulder: string[];
  };
};

// Compute severities + recommendations for a single frame
export function computeOHS(keypoints: KP[]): OHSResult {
  const ls = kp(keypoints, "left_shoulder");
  const rs = kp(keypoints, "right_shoulder");
  const lh = kp(keypoints, "left_hip");
  const rh = kp(keypoints, "right_hip");
  const lk = kp(keypoints, "left_knee");
  const rk = kp(keypoints, "right_knee");
  const la = kp(keypoints, "left_ankle");
  const ra = kp(keypoints, "right_ankle");
  const le = kp(keypoints, "left_elbow");
  const re = kp(keypoints, "right_elbow");

  const shoulderWidth = ls && rs ? Math.hypot(rs.x - ls.x, rs.y - ls.y) : 200;

  const missing =
    !(ls && rs && lh && rh && lk && rk && la && ra && le && re);
  if (missing) {
    return {
      flags: { ankle: "Unknown", knee: "Unknown", hip: "Unknown", trunk: "Unknown", shoulder: "Unknown" },
      metrics: {
        shoulderWidth: shoulderWidth ?? 0,
        kneeLeftDX: 0, kneeRightDX: 0,
        trunkAngleFromVertical: 0, lateralShiftPx: 0,
        shoulderLeftAngle: 0, shoulderRightAngle: 0
      },
      recommendations: { ankle: [], knee: [], hip: [], trunk: [], shoulder: [] }
    };
  }

  // ---- Knee valgus (medial drift relative to ankle) ------------------------
  const leftKneeXRel = lk!.x - la!.x;   // negative large => medial drift (mirrored video already handled upstream)
  const rightKneeXRel = rk!.x - ra!.x;  // positive large => medial drift
  const soft = ranges.kneeValgus.mediumPct * shoulderWidth;
  const hard = ranges.kneeValgus.highPct   * shoulderWidth;

  let knee: Severity = "Low";
  const leftMedial  = leftKneeXRel < -soft;
  const rightMedial = rightKneeXRel >  soft;
  const leftSevere  = leftKneeXRel < -hard;
  const rightSevere = rightKneeXRel >  hard;
  if (leftSevere || rightSevere) knee = "High";
  else if (leftMedial || rightMedial) knee = "Medium";

  // ---- Hip/trunk forward lean (angle of shoulderMid-hipMid to vertical) ----
  const shoulderMid = { x: (ls!.x + rs!.x) / 2, y: (ls!.y + rs!.y) / 2 };
  const hipMid      = { x: (lh!.x + rh!.x) / 2, y: (lh!.y + rh!.y) / 2 };
  const v = { x: shoulderMid.x - hipMid.x, y: shoulderMid.y - hipMid.y };
  const trunkAngleFromVertical = Math.abs((Math.atan2(v.x, -v.y) * 180) / Math.PI);

  let hip: Severity = "Low";
  if (trunkAngleFromVertical > ranges.trunkLean.highDeg) hip = "High";
  else if (trunkAngleFromVertical > ranges.trunkLean.mediumDeg) hip = "Medium";

  // ---- Trunk lateral shift --------------------------------------------------
  const lateralShiftPx = Math.abs(shoulderMid.x - hipMid.x);
  const latMed = ranges.trunkLateralShift.mediumPct * shoulderWidth;
  const latHigh = ranges.trunkLateralShift.highPct  * shoulderWidth;
  let trunk: Severity = "Low";
  if (lateralShiftPx > latHigh) trunk = "High";
  else if (lateralShiftPx > latMed) trunk = "Medium";

  // ---- Shoulder flexion (arms overhead) ------------------------------------
  const shoulderLeftAngle  = angle(le!, ls!, lh!);
  const shoulderRightAngle = angle(re!, rs!, rh!);
  function shoulderSeverity(ang: number): Severity {
    if (isNaN(ang)) return "Unknown";
    if (ang >= ranges.shoulderFlexion.lowMinDeg) return "Low";
    if (ang >= ranges.shoulderFlexion.mediumMinDeg) return "Medium";
    return "High";
  }
  const sL = shoulderSeverity(shoulderLeftAngle);
  const sR = shoulderSeverity(shoulderRightAngle);
  let shoulder: Severity = "Low";
  if (sL === "High" || sR === "High") shoulder = "High";
  else if (sL === "Medium" || sR === "Medium") shoulder = "Medium";
  if (sL === "Unknown" && sR === "Unknown") shoulder = "Unknown";

  // ---- Ankle mirrors knee (first pass) -------------------------------------
  const ankle: Severity = ranges.ankleMirrorKnee ? knee : "Low";

  const flags: OHSFlags = { ankle, knee, hip, trunk, shoulder };

  function getStrategies(joint: keyof typeof strategies, severity: Severity): string[] {
    if (severity === "Unknown") return [];
    return strategies[joint][severity];
  }

  const recommendations = {
    ankle:    getStrategies("ankle", ankle),
    knee:     getStrategies("knee", knee),
    hip:      getStrategies("hip", hip),
    trunk:    getStrategies("trunk", trunk),
    shoulder: getStrategies("shoulder", shoulder)
  };

  return {
    flags,
    metrics: {
      shoulderWidth,
      kneeLeftDX: leftKneeXRel,
      kneeRightDX: rightKneeXRel,
      trunkAngleFromVertical,
      lateralShiftPx,
      shoulderLeftAngle,
      shoulderRightAngle
    },
    recommendations
  };
}
