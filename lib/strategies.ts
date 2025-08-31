export type RiskLevel = "Low" | "Medium" | "High" | "Unknown";

export interface CorrectiveStrategies {
  ankle: Record<RiskLevel, string[]>;
  knee: Record<RiskLevel, string[]>;
  hip: Record<RiskLevel, string[]>;
  trunk: Record<RiskLevel, string[]>;
  shoulder: Record<RiskLevel, string[]>;
}

export const strategies: CorrectiveStrategies = {
  ankle: {
    Low: [],
    Medium: [
      "Calf SMR with lacrosse ball",
      "Ankle mobility drill: wall ankle slides",
      "Balance reach exercises",
      "Band ankle mobilization"
    ],
    High: [
      "Deep tissue calf massage",
      "Ankle dorsiflexion stretches",
      "Mobility work: ankle circles and alphabet",
      "Progressive ankle strengthening",
      "Consider orthotic consultation"
    ],
    Unknown: []
  },
  knee: {
    Low: [],
    Medium: [
      "Glute medius activation drills",
      "Single-leg balance work",
      "Lateral tube walks",
      "Hip abduction exercises"
    ],
    High: [
      "Immediate form correction focus",
      "Glute medius and hip stabilizer work",
      "Lateral movement training",
      "Single-leg strength development",
      "Consider physical therapy assessment"
    ],
    Unknown: []
  },
  hip: {
    Low: [],
    Medium: [
      "Hip flexor stretching",
      "Core activation drills",
      "Wall slides practice",
      "TVA bracing exercises"
    ],
    High: [
      "Comprehensive hip mobility work",
      "Core stability training",
      "Posterior chain strengthening",
      "Movement pattern retraining",
      "Professional movement assessment"
    ],
    Unknown: []
  },
  trunk: {
    Low: [],
    Medium: [
      "Wall slides practice",
      "TVA bracing exercises",
      "Dead bug variations",
      "Bird dog exercises"
    ],
    High: [
      "Core stability foundation work",
      "Anti-rotation training",
      "Breathing pattern work",
      "Postural awareness training",
      "Consider professional assessment"
    ],
    Unknown: []
  },
  shoulder: {
    Low: [],
    Medium: [
      "Latissimus dorsi stretching",
      "Thoracic spine mobility",
      "Shoulder blade retraction",
      "Overhead carry drills"
    ],
    High: [
      "Comprehensive shoulder mobility work",
      "Lat and chest stretching",
      "Thoracic extension exercises",
      "Scapular stability training",
      "Professional shoulder assessment"
    ],
    Unknown: []
  }
};

export function getStrategiesForJoint(joint: keyof CorrectiveStrategies, riskLevel: RiskLevel): string[] {
  return strategies[joint][riskLevel] || [];
}

export function getAllStrategies(flags: Record<string, RiskLevel>): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  
  Object.entries(flags).forEach(([joint, riskLevel]) => {
    if (joint in strategies) {
      result[joint] = getStrategiesForJoint(joint as keyof CorrectiveStrategies, riskLevel);
    }
  });
  
  return result;
}
