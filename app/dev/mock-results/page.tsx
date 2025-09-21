"use client";
import { useRouter } from "next/navigation";
import { useAssessmentStore } from "@/lib/store";
import { AssessmentResult } from "@/lib/types";

export default function MockResults() {
  const set = useAssessmentStore((s)=>s.setLastResult);
  const router = useRouter();
  function loadMock() {
    const mock: AssessmentResult = {
      createdAt: new Date().toISOString(),
      tier: "AMATEUR",
      symmetryScore: 95,
      checkpoints: [
        { checkpoint: "KNEE", score: 78, risk: "MEDIUM", dysfunctions: ["knee_valgus"] },
        { checkpoint: "ANKLE", score: 70, risk: "MEDIUM", dysfunctions: ["excessive_pronation"] },
        { checkpoint: "HIP", score: 82, risk: "LOW", dysfunctions: ["anterior_pelvic_tilt"] },
        { checkpoint: "TRUNK", score: 86, risk: "LOW", dysfunctions: [] },
        { checkpoint: "SHOULDER", score: 80, risk: "LOW", dysfunctions: [] },
        { checkpoint: "SYMMETRY", score: 91, risk: "LOW", dysfunctions: ["asym_weight_shift"] },
      ],
    };
    set(mock);
    router.push("/results");
  }
  return <div className="p-6"><button onClick={loadMock} className="px-4 py-2 border rounded-lg">Load Mock Result → Results</button></div>;
}
