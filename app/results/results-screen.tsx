"use client";
import React from "react";
import { AssessmentResult } from "@/lib/types";
import { buildPrescriptions } from "@/lib/selectors";
import { prescriptionMap } from "@/lib/prescriptionMap";
import { DYSFUNCTIONS } from "@/lib/dysfunctions";
import { EXERCISES } from "@/lib/exerciseLibrary";
import HeatmapBody from "./components/HeatmapBody";

type OpenMap = Partial<Record<AssessmentResult["checkpoints"][number]["checkpoint"], boolean>>;
const RANK: Record<"LOW"|"MEDIUM"|"HIGH", number> = { LOW:0, MEDIUM:1, HIGH:2 };

export default function ResultsScreen({ result }: { result: AssessmentResult }) {
  const perCheckpoint = buildPrescriptions(result, prescriptionMap);
  const [open, setOpen] = React.useState<OpenMap>({});
  
  React.useEffect(()=>{
    // open the highest-risk panel by default
    let top = result.checkpoints[0];
    for (const c of result.checkpoints) if (RANK[c.risk] > RANK[top.risk]) top = c;
    setOpen({ [top.checkpoint]: true });
  }, [result]);

  function toggle(cp: AssessmentResult["checkpoints"][number]["checkpoint"]){ setOpen((o)=>({ ...o, [cp]: !o[cp] })); }
  function jump(cp: AssessmentResult["checkpoints"][number]["checkpoint"]){ setOpen({ [cp]: true }); document.getElementById(`cp-${cp}`)?.scrollIntoView({behavior:"smooth", block:"center"}); }

  return (
    <div className="p-6 space-y-6">
      <Header result={result} />
      <HeatmapBody result={result} onJump={jump} />
      <div className="grid md:grid-cols-2 gap-6">
        {result.checkpoints
          .slice()
          .sort((a,b)=>RANK[b.risk]-RANK[a.risk])  // highest risk first
          .map((cp) => (
          <section key={cp.checkpoint} id={`cp-${cp.checkpoint}`} className="rounded-2xl border p-0 bg-white overflow-hidden">
            <button onClick={()=>toggle(cp.checkpoint)} className="w-full flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">{pretty(cp.checkpoint)}</h3>
                <span className="text-xs text-gray-500">Score: {cp.score}</span>
              </div>
              <div className="flex items-center gap-3">
                <RiskChip risk={cp.risk} />
                <svg width="16" height="16" viewBox="0 0 20 20" className={`transition-transform ${open[cp.checkpoint] ? "rotate-180" : ""}`}><path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
              </div>
            </button>

            {open[cp.checkpoint] && (
              <div className="p-4 border-t">
                {cp.dysfunctions.length === 0 && (
                  <p className="text-sm text-gray-600">No major dysfunction detected.</p>
                )}

                {cp.dysfunctions.map((dId) => {
                  const tag = DYSFUNCTIONS[dId];
                  const rxList = (perCheckpoint[cp.checkpoint] || []).filter((p) => p.dysfunctionId === dId);
                  return (
                    <div key={dId} className="mt-3 rounded-xl bg-gray-50 p-3">
                      <div className="font-medium">{tag?.label ?? dId}</div>
                      <div className="text-xs text-gray-600">{tag?.reason}</div>

                      {rxList.map((rx) => (
                        <div key={rx.dysfunctionId} className="mt-2">
                          <h4 className="text-sm font-semibold">Your Prescription</h4>
                          <div className="mt-1 grid md:grid-cols-3 gap-2">
                            <Column title="Strength ×3" items={rx.strength} selectable />
                            <Column title="Stretch ×2" items={rx.stretch} selectable />
                            <Column title="Foam Roll ×2" items={rx.foamRoll} selectable />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function Column({ title, items, selectable }: { title: string; items: string[]; selectable?: boolean }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide mb-1">{title}</div>
      <ul className="space-y-1">
        {items.map((id) => {
          const ex = EXERCISES[id];
          return (
            <li key={id} className="rounded-lg border bg-white p-2">
              <div className="text-sm font-medium">{ex?.name ?? id}</div>
              <div className="text-xs text-gray-600">{ex?.prescription}</div>
              {ex?.cue && <div className="text-[11px] text-gray-500 italic">{ex.cue}</div>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function pretty(cp: AssessmentResult["checkpoints"][number]["checkpoint"]) {
  return { ANKLE: "Ankles/Feet", KNEE: "Knees", HIP: "Hips", TRUNK: "Trunk/Core", SHOULDER: "Shoulders/Arms", SYMMETRY: "Symmetry" }[cp];
}

function RiskChip({ risk }: { risk: "LOW" | "MEDIUM" | "HIGH" }) {
  const color = risk === "HIGH" ? "bg-rose-100 text-rose-700 border-rose-300" :
                risk === "MEDIUM" ? "bg-amber-100 text-amber-700 border-amber-300" :
                "bg-emerald-100 text-emerald-700 border-emerald-300";
  return <span className={`text-xs px-2 py-1 rounded-full border ${color}`}>{risk}</span>;
}

function Header({ result }: { result: AssessmentResult }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold">Movement Assessment — Results</h1>
        <p className="text-sm text-gray-600">
          Tier: <span className="font-semibold">{result.tier}</span> · Symmetry {result.symmetryScore}
        </p>
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded-lg border">Retake</button>
        <button className="px-3 py-2 rounded-lg border">Download PDF</button>
        <button className="px-3 py-2 rounded-lg border">Send to Email</button>
      </div>
    </div>
  );
}
