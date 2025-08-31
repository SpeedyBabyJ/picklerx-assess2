"use client";
import React from "react";
import type { OHSResult } from "@/lib/ohs";

export default function Results({ last, history }: { last: OHSResult | null; history: OHSResult[] }) {
  if (!last) return null;
  const { flags, recommendations } = last;

  const SeverityBadge = ({ severity }: { severity: string }) => {
    const colors = {
      Low: "#10b981",
      Medium: "#f59e0b", 
      High: "#ef4444",
      Unknown: "#9ca3af"
    };
    
    return (
      <span style={{
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "11px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        background: colors[severity as keyof typeof colors],
        color: "white"
      }}>
        {severity}
      </span>
    );
  };

  const Row = ({label, sev, recs}:{label:string; sev:string; recs:string[]}) => (
    <div style={{display:"grid", gridTemplateColumns:"120px 90px 1fr", gap:12, padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.1)"}}>
      <div style={{opacity:.8, fontSize:"14px"}}>{label}</div>
      <SeverityBadge severity={sev} />
      <div style={{opacity:.9, fontSize:"13px"}}>{recs.length ? recs.join(" • ") : "—"}</div>
    </div>
  );

  return (
    <div style={{marginTop:16, color:"white", fontFamily:"system-ui,sans-serif"}}>
      <h3 style={{margin:"8px 0 12px", fontSize:"18px", fontWeight:"600"}}>Last Rep Assessment</h3>
      <Row label="Ankle"    sev={flags.ankle}    recs={recommendations.ankle} />
      <Row label="Knee"     sev={flags.knee}     recs={recommendations.knee} />
      <Row label="Hip"      sev={flags.hip}      recs={recommendations.hip} />
      <Row label="Trunk"    sev={flags.trunk}    recs={recommendations.trunk} />
      <Row label="Shoulder" sev={flags.shoulder} recs={recommendations.shoulder} />
      
      {history.length > 0 && (
        <div style={{marginTop:16, padding:"12px", background:"rgba(255,255,255,0.05)", borderRadius:"8px"}}>
          <div style={{marginBottom:8, fontSize:"14px", fontWeight:"600", opacity:0.8}}>Last 5 Reps</div>
          <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
            {history.slice(0, 5).map((rep, i) => (
              <div key={i} style={{
                padding: "6px 10px",
                borderRadius: "16px",
                fontSize: "11px",
                fontWeight: "600",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                opacity: 0.8
              }}>
                Rep {history.length - i}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
