export type KP = { name: string; x: number; y: number; score?: number };

export interface JointAngles {
  ankle: number | null;      // Ankle dorsiflexion
  knee: number | null;       // Knee flexion
  hip: number | null;        // Hip flexion
  spine: number | null;      // Spine angle from vertical
  shoulder: number | null;   // Shoulder flexion
  elbow: number | null;      // Elbow extension
  wrist: number | null;      // Wrist extension
}

export interface AngleThresholds {
  ankle: { min: number; max: number; optimal: number };
  knee: { min: number; max: number; optimal: number };
  hip: { min: number; max: number; optimal: number };
  spine: { min: number; max: number; optimal: number };
  shoulder: { min: number; max: number; optimal: number };
  elbow: { min: number; max: number; optimal: number };
  wrist: { min: number; max: number; optimal: number };
}

// Standard overhead squat angle thresholds (in degrees)
export const DEFAULT_THRESHOLDS: AngleThresholds = {
  ankle: { min: 0, max: 45, optimal: 15 },      // Dorsiflexion
  knee: { min: 80, max: 120, optimal: 100 },    // Flexion
  hip: { min: 60, max: 100, optimal: 80 },      // Flexion
  spine: { min: -10, max: 10, optimal: 0 },     // From vertical (negative = forward lean)
  shoulder: { min: 150, max: 180, optimal: 170 }, // Flexion (overhead)
  elbow: { min: 170, max: 180, optimal: 175 },   // Extension
  wrist: { min: 0, max: 30, optimal: 15 },       // Extension
};

/**
 * Calculate angle between three points (A-B-C) where B is the vertex
 * Returns angle in degrees
 */
function calculateAngle(pointA: KP, pointB: KP, pointC: KP): number | null {
  if (!pointA.score || !pointB.score || !pointC.score) return null;
  if (pointA.score < 0.3 || pointB.score < 0.3 || pointC.score < 0.3) return null;

  const AB = Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
  const BC = Math.sqrt(Math.pow(pointC.x - pointB.x, 2) + Math.pow(pointC.y - pointB.y, 2));
  const AC = Math.sqrt(Math.pow(pointC.x - pointA.x, 2) + Math.pow(pointC.y - pointA.y, 2));

  if (AB === 0 || BC === 0) return null;

  // Law of cosines: cos(C) = (a² + b² - c²) / (2ab)
  const cosAngle = (AB * AB + BC * BC - AC * AC) / (2 * AB * BC);
  
  // Clamp to valid range to avoid NaN
  const clampedCos = Math.max(-1, Math.min(1, cosAngle));
  const angleRad = Math.acos(clampedCos);
  const angleDeg = (angleRad * 180) / Math.PI;
  
  return Math.round(angleDeg * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate spine angle from vertical (0° = vertical, negative = forward lean)
 */
function calculateSpineAngle(shoulder: KP, hip: KP): number | null {
  if (!shoulder.score || !hip.score) return null;
  if (shoulder.score < 0.3 || hip.score < 0.3) return null;

  // Calculate angle from vertical (0,0) to (hip.x, hip.y) to (shoulder.x, shoulder.y)
  const verticalPoint: KP = { name: "vertical", x: hip.x, y: hip.y - 100, score: 1 };
  return calculateAngle(verticalPoint, hip, shoulder);
}

/**
 * Calculate all joint angles for overhead squat assessment
 */
export function calculateJointAngles(keypoints: KP[]): JointAngles {
  // Find required keypoints
  const leftAnkle = keypoints.find(k => k.name === "left_ankle");
  const rightAnkle = keypoints.find(k => k.name === "right_ankle");
  const leftKnee = keypoints.find(k => k.name === "left_knee");
  const rightKnee = keypoints.find(k => k.name === "right_knee");
  const leftHip = keypoints.find(k => k.name === "left_hip");
  const rightHip = keypoints.find(k => k.name === "right_hip");
  const leftShoulder = keypoints.find(k => k.name === "left_shoulder");
  const rightShoulder = keypoints.find(k => k.name === "right_shoulder");
  const leftElbow = keypoints.find(k => k.name === "left_elbow");
  const rightElbow = keypoints.find(k => k.name === "right_elbow");
  const leftWrist = keypoints.find(k => k.name === "left_wrist");
  const rightWrist = keypoints.find(k => k.name === "right_wrist");
  const leftEye = keypoints.find(k => k.name === "left_eye");
  const rightEye = keypoints.find(k => k.name === "right_eye");

  // Use left side if available, otherwise right side, otherwise null
  const ankle = leftAnkle || rightAnkle;
  const knee = leftKnee || rightKnee;
  const hip = leftHip || rightHip;
  const shoulder = leftShoulder || rightShoulder;
  const elbow = leftElbow || rightElbow;
  const wrist = leftWrist || rightWrist;
  
  // For spine, use midpoint of shoulders and hips
  const shoulderMid: KP | null = leftShoulder && rightShoulder ? {
    name: "shoulder_mid",
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
    score: Math.min(leftShoulder.score || 0, rightShoulder.score || 0)
  } : null;
  
  const hipMid: KP | null = leftHip && rightHip ? {
    name: "hip_mid",
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
    score: Math.min(leftHip.score || 0, rightHip.score || 0)
  } : null;

  // Calculate angles
  const ankleAngle = ankle && knee && hip ? 
    calculateAngle(ankle, knee, hip) : null;
  
  const kneeAngle = knee && hip && shoulder ? 
    calculateAngle(knee, hip, shoulder) : null;
  
  const hipAngle = hip && shoulder && (leftEye || rightEye) ? 
    calculateAngle(hip, shoulder, leftEye || rightEye!) : null;
  
  const spineAngle = shoulderMid && hipMid ? 
    calculateSpineAngle(shoulderMid, hipMid) : null;
  
  const shoulderAngle = shoulder && elbow && wrist ? 
    calculateAngle(shoulder, elbow, wrist) : null;
  
  const elbowAngle = elbow && shoulder && wrist ? 
    calculateAngle(elbow, shoulder, wrist) : null;
  
  const wristAngle = wrist && elbow && shoulder ? 
    calculateAngle(wrist, elbow, shoulder) : null;

  return {
    ankle: ankleAngle,
    knee: kneeAngle,
    hip: hipAngle,
    spine: spineAngle,
    shoulder: shoulderAngle,
    elbow: elbowAngle,
    wrist: wristAngle,
  };
}

/**
 * Assess joint angles against thresholds and return feedback
 */
export function assessAngles(angles: JointAngles, thresholds: AngleThresholds = DEFAULT_THRESHOLDS): Record<keyof JointAngles, { status: 'optimal' | 'acceptable' | 'needs_improvement'; message: string }> {
  const assessment: Partial<Record<keyof JointAngles, { status: 'optimal' | 'acceptable' | 'needs_improvement'; message: string }>> = {};

  Object.keys(angles).forEach((joint) => {
    const key = joint as keyof JointAngles;
    const angle = angles[key];
    const threshold = thresholds[key];

    if (angle === null) {
      assessment[key] = { status: 'needs_improvement', message: 'Unable to measure' };
      return;
    }

    const { min, max, optimal } = threshold;
    const tolerance = 5; // 5 degree tolerance for "optimal"

    if (Math.abs(angle - optimal) <= tolerance) {
      assessment[key] = { status: 'optimal', message: `${angle}° (optimal: ${optimal}°)` };
    } else if (angle >= min && angle <= max) {
      assessment[key] = { status: 'acceptable', message: `${angle}° (range: ${min}-${max}°)` };
    } else {
      assessment[key] = { status: 'needs_improvement', message: `${angle}° (should be ${min}-${max}°)` };
    }
  });

  return assessment as Record<keyof JointAngles, { status: 'optimal' | 'acceptable' | 'needs_improvement'; message: string }>;
}
