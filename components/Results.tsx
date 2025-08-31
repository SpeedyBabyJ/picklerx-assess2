"use client";
import React from "react";
import type { OHSResult } from "@/lib/ohs";

export default function Results({ result }: { result: OHSResult | null }) {
  if (!result) return null;
  const { flags, recommendations } = result;

  const Row = ({label, sev, recs}:{label:string; sev:string; recs:string[]}) => (
    <div style={{display:"grid", gridTemplateColumns:"120px 90px 1fr", gap:12, padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,.1)"}}>
      <div style={{opacity:.8}}>{label}</div>
      <div style={{fontWeight:600}}>{sev}</div>
      <div style={{opacity:.9}}>{recs.length ? recs.join(" • ") : "—"}</div>
    </div>
  );

  return (
    <div style={{marginTop:12, color:"white", fontFamily:"system-ui,sans-serif"}}>
      <h3 style={{margin:"8px 0 6px"}}>Results & Correctives</h3>
      <Row label="Ankle"    sev={flags.ankle}    recs={recommendations.ankle} />
      <Row label="Knee"     sev={flags.knee}     recs={recommendations.knee} />
      <Row label="Hip"      sev={flags.hip}      recs={recommendations.hip} />
      <Row label="Trunk"    sev={flags.trunk}    recs={recommendations.trunk} />
      <Row label="Shoulder" sev={flags.shoulder} recs={recommendations.shoulder} />
    </div>
  );
}
