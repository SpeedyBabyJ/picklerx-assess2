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
  const leftDrift = lk.x - la.x, rightDrift = rk.x - ra.x;
  const valgusMed = 0.10*shoulderW, valgusHigh = 0.20*shoulderW;

  let knee:"Low"|"Medium"|"High"="Low";
  const leftMed = leftDrift < -valgusMed, rightMed = rightDrift > valgusMed;
  const leftSev = leftDrift < -valgusHigh, rightSev = rightDrift > valgusHigh;
  if (leftSev || rightSev) knee = "High"; else if (leftMed || rightMed) knee = "Medium";

  const v = { x: shMid.x-hipMid.x, y: shMid.y-hipMid.y };
  const trunkFromVertical = Math.abs(Math.atan2(v.x, -v.y) * 180 / Math.PI);
  let hip:"Low"|"Medium"|"High"="Low";
  if (trunkFromVertical > 30) hip = "High"; else if (trunkFromVertical > 15) hip = "Medium";

  const lateralShift = Math.abs(shMid.x - hipMid.x);
  let trunk:"Low"|"Medium"|"High"="Low";
  if (lateralShift > 0.20*shoulderW) trunk = "High"; else if (lateralShift > 0.10*shoulderW) trunk = "Medium";

  const leftArm=ang(le,ls,lh), rightArm=ang(re,rs,rh);
  const band = (a:number)=> isNaN(a)?"Unknown": a>=150?"Low": a>=120?"Medium":"High";
  const l = band(leftArm), r = band(rightArm);
  let shoulder:"Low"|"Medium"|"High"|"Unknown"="Low";
  if (l==="High"||r==="High") shoulder="High"; else if (l==="Medium"||r==="Medium") shoulder="Medium";
  if (l==="Unknown" && r==="Unknown") shoulder="Unknown";

  let ankle:"Low"|"Medium"|"High"="Low"; if (knee==="High") ankle="High"; else if (knee==="Medium") ankle="Medium";
  return { ankle, knee, hip, trunk, shoulder };
}
