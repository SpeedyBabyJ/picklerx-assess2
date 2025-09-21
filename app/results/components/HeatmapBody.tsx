"use client";
import React from "react";
import { AssessmentResult, RiskLevel, Checkpoint } from "@/lib/types";

const RISK_COLOR: Record<RiskLevel, string> = {
  LOW:   "#10B981",   // emerald-500
  MEDIUM:"#F59E0B",   // amber-500
  HIGH:  "#EF4444",   // red-500
};

type Props = { result: AssessmentResult; onJump?: (cp: Checkpoint) => void };

export default function HeatmapBody({ result, onJump }: Props) {
  // map checkpoint → risk (highest seen in that section)
  const best: Record<Checkpoint, RiskLevel> = { ANKLE:"LOW", KNEE:"LOW", HIP:"LOW", TRUNK:"LOW", SHOULDER:"LOW", SYMMETRY:"LOW" };
  const order: RiskLevel[] = ["LOW","MEDIUM","HIGH"];
  for (const c of result.checkpoints) {
    if (order.indexOf(c.risk) > order.indexOf(best[c.checkpoint])) best[c.checkpoint] = c.risk;
  }

  // simple SVG body w/ 6 dots
  const dot = (cx:number, cy:number, cp:Checkpoint) => {
    const risk = best[cp];
    return (
      <circle key={cp} cx={cx} cy={cy} r="7" fill={RISK_COLOR[risk]} stroke="white" strokeWidth={2}
        style={{cursor:"pointer"}} onClick={()=>onJump?.(cp)} />
    );
  };

  return (
    <div className="flex items-center justify-center">
      <svg width="160" height="260" viewBox="0 0 160 260" role="img" aria-label="Risk heatmap body">
        {/* silhouette */}
        <rect x="60" y="20" width="40" height="40" rx="20" fill="#E5E7EB" />
        <rect x="55" y="60" width="50" height="90" rx="18" fill="#E5E7EB" />
        <rect x="45" y="150" width="30" height="80" rx="12" fill="#E5E7EB" />
        <rect x="85" y="150" width="30" height="80" rx="12" fill="#E5E7EB" />
        <rect x="35" y="70" width="18" height="55" rx="10" fill="#E5E7EB" />
        <rect x="107" y="70" width="18" height="55" rx="10" fill="#E5E7EB" />
        {/* dots */}
        {dot(80, 40, "SHOULDER")}
        {dot(80, 95, "TRUNK")}
        {dot(80, 140,"HIP")}
        {dot(62, 190,"KNEE")}
        {dot(98, 190,"KNEE")}
        {dot(80, 230,"ANKLE")}
      </svg>
    </div>
  );
}
