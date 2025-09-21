"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAssessmentStore } from "@/lib/store";
import { AssessmentResult } from "@/lib/types";

export default function QA() {
  const set = useAssessmentStore((s)=>s.setLastResult);
  const router = useRouter();

  useEffect(()=>{
    const mock: AssessmentResult = {
      createdAt: new Date().toISOString(),
      tier: "AMATEUR",
      symmetryScore: 91,
      checkpoints: [
        { checkpoint: "KNEE", score: 70, risk: "HIGH", dysfunctions: ["knee_valgus"] },
        { checkpoint: "ANKLE", score: 75, risk: "MEDIUM", dysfunctions: ["excessive_pronation"] },
        { checkpoint: "HIP", score: 82, risk: "LOW", dysfunctions: ["anterior_pelvic_tilt"] },
        { checkpoint: "TRUNK", score: 86, risk: "LOW", dysfunctions: [] },
        { checkpoint: "SHOULDER", score: 80, risk: "LOW", dysfunctions: [] },
        { checkpoint: "SYMMETRY", score: 91, risk: "LOW", dysfunctions: ["asym_weight_shift"] },
      ],
    };
    set(mock);
    // basic runtime assertions in console
    console.assert(mock.checkpoints[0].risk === "HIGH", "Highest risk should be HIGH");
    console.assert(mock.checkpoints.some(c=>c.dysfunctions.includes("knee_valgus")), "knee_valgus exists");
    router.push("/results");
  }, [set, router]);

  return <div className="p-6 text-sm">Loading QA mock → Results…</div>;
}
