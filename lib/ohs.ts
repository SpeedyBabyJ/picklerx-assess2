export type KP = { name: string; x: number; y: number; score?: number; };
export type OHSFlags = {
  ankle: "Low" | "Medium" | "High" | "Unknown";
  knee: "Low" | "Medium" | "High" | "Unknown";
  hip: "Low" | "Medium" | "High" | "Unknown";
  trunk: "Low" | "Medium" | "High" | "Unknown";
  shoulder: "Low" | "Medium" | "High" | "Unknown";
};

const MIN_SCORE = 0.5;
const get = (kps: KP[], n: string) => kps.find(k => k.name === n && (k.score ?? 1) >= MIN_SCORE);
const ang = (a: KP, b: KP, c: KP) => {
  const ab = { x: a.x - b.x, y: a.y - b.y }, cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y, m1 = Math.hypot(ab.x, ab.y), m2 = Math.hypot(cb.x, cb.y);
  if (!m1 || !m2) return NaN; const cos = Math.max(-1, Math.min(1, dot / (m1 * m2)));
  return Math.acos(cos) * 180 / Math.PI;
};

export function computeOHSFlags(keypoints: KP[]): OHSFlags {
  const ls=get(keypoints,"left_shoulder"), rs=get(keypoints,"right_shoulder");
  const lh=get(keypoints,"left_hip"), rh=get(keypoints,"right_hip");
  const lk=get(keypoints,"left_knee"), rk=get(keypoints,"right_knee");
  const la=get(keypoints,"left_ankle"), ra=get(keypoints,"right_ankle");
  const le=get(keypoints,"left_elbow"), re=get(keypoints,"right_elbow");
  if(!(ls&&rs&&lh&&rh&&lk&&rk&&la&&ra&&le&&re)) return { ankle:"Unknown",knee:"Unknown",hip:"Unknown",trunk:"Unknown",shoulder:"Unknown" };

  const shoulderW = Math.hypot(rs.x-ls.x, rs.y-ls.y) || 200;
  const hipMid = { x:(lh.x+rh.x)/2, y:(lh.y+rh.y)/2 }, shMid = { x:(ls.x+rs.x)/2, y:(ls.y+rs.y)/2 };
  
  // Calculate joint angles for proper biomechanical assessment
  const ankleAngle = ang(la, lk, lh) || ang(ra, rk, rh);
  const kneeAngle = ang(lk, lh, { name: "hip_mid", x: hipMid.x, y: hipMid.y, score: 1 }) || ang(rk, rh, { name: "hip_mid", x: hipMid.x, y: hipMid.y, score: 1 });
  const hipAngle = ang(lh, { name: "hip_mid", x: hipMid.x, y: hipMid.y, score: 1 }, ls) || ang(rh, { name: "hip_mid", x: hipMid.x, y: hipMid.y, score: 1 }, rs);
  const shoulderAngle = ang(le, ls, lh) || ang(re, rs, rh);
  
  // Ankle assessment: Dorsiflexion range
  let ankle:"Low"|"Medium"|"High"="Low";
  if (ankleAngle !== undefined && !isNaN(ankleAngle)) {
    if (ankleAngle < 5) ankle = "High";      // < 5° dorsiflexion
    else if (ankleAngle < 15) ankle = "Medium"; // 5-15° dorsiflexion
    else ankle = "Low";                       // > 15° dorsiflexion
  }

  // Knee assessment: Valgus/varus drift + flexion range
  const leftDrift = lk.x - la.x, rightDrift = rk.x - ra.x;
  const valgusMed = 0.10*shoulderW, valgusHigh = 0.20*shoulderW;
  let knee:"Low"|"Medium"|"High"="Low";
  const leftMed = leftDrift < -valgusMed, rightMed = rightDrift > valgusMed;
  const leftSev = leftDrift < -valgusHigh, rightSev = rightDrift > valgusHigh;
  if (leftSev || rightDrift > valgusHigh) knee = "High";
  else if (leftMed || rightMed) knee = "Medium";
  else if (kneeAngle !== undefined && !isNaN(kneeAngle)) {
    if (kneeAngle < 80 || kneeAngle > 120) knee = "Medium"; // Outside optimal range
  }

  // Hip assessment: Trunk lean from vertical
  const v = { x: shMid.x-hipMid.x, y: shMid.y-hipMid.y };
  const trunkFromVertical = Math.abs(Math.atan2(v.x, -v.y) * 180 / Math.PI);
  let hip:"Low"|"Medium"|"High"="Low";
  if (trunkFromVertical > 25) hip = "High";      // > 25° forward lean
  else if (trunkFromVertical > 15) hip = "Medium"; // 15-25° forward lean
  else hip = "Low";                              // < 15° forward lean

  // Trunk assessment: Lateral shift + rotation
  const lateralShift = Math.abs(shMid.x - hipMid.x);
  let trunk:"Low"|"Medium"|"High"="Low";
  if (lateralShift > 0.15*shoulderW) trunk = "High";    // > 15% shoulder width
  else if (lateralShift > 0.08*shoulderW) trunk = "Medium"; // 8-15% shoulder width
  else trunk = "Low";                                   // < 8% shoulder width

  // Shoulder assessment: Overhead position + stability
  let shoulder:"Low"|"Medium"|"High"|"Unknown"="Low";
  if (shoulderAngle !== undefined && !isNaN(shoulderAngle)) {
    if (shoulderAngle < 120) shoulder = "High";      // < 120° overhead
    else if (shoulderAngle < 150) shoulder = "Medium"; // 120-150° overhead
    else shoulder = "Low";                           // > 150° overhead
  } else {
    shoulder = "Unknown";
  }

  // Console logging for debugging
  console.table({
    ankle: { angle: ankleAngle, risk: ankle },
    knee: { angle: kneeAngle, drift: { left: leftDrift, right: rightDrift }, risk: knee },
    hip: { trunkLean: trunkFromVertical, risk: hip },
    trunk: { lateralShift: lateralShift, risk: trunk },
    shoulder: { angle: shoulderAngle, risk: shoulder }
  });

  return { ankle, knee, hip, trunk, shoulder };
}
