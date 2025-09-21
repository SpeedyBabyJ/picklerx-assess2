"use client";
import { useAssessmentStore } from "@/lib/store";
import ResultsScreen from "./results-screen";

export default function ResultsPage() {
  const result = useAssessmentStore((s) => s.lastResult);
  if (!result) return <div className="p-6 text-sm">No result found. Please run an assessment.</div>;
  return <ResultsScreen result={result} />;
}
