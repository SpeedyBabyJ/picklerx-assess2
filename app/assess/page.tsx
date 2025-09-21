"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAssessmentStore } from "@/lib/store";
import type { AssessmentResult } from "@/lib/types";
import { initMoveNet, estimate } from "@/lib/pose";
import PoseOverlay from "@/components/PoseOverlay";
import { CaelinFilter, type KP as CKP } from "@/lib/caelinFilter";
import { calculateJointAngles, type JointAngles } from "@/lib/jointAngles";
import JointAngleDisplay from "@/components/JointAngleDisplay";
import { computeOHS, type OHSResult } from "@/lib/ohs";
import { RepDetector } from "@/lib/rep";
import Results from "@/components/Results";

type KP = { name: string; x: number; y: number; score?: number };

export default function AssessPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [detectorReady, setDetectorReady] = useState(false);
  const [keypoints, setKeypoints] = useState<KP[]>([]);
  const [jointAngles, setJointAngles] = useState<JointAngles>({
    ankle: null, knee: null, hip: null, spine: null, shoulder: null, elbow: null, wrist: null
  });
  const [lastResult, setLastResult] = useState<OHSResult | null>(null);
  const [history, setHistory] = useState<OHSResult[]>([]);
  const [view, setView] = useState<"front"|"side">("front"); // <- toggle
  
  // Track results for both views
  const [frontResult, setFrontResult] = useState<OHSResult | null>(null);
  const [sideResult, setSideResult] = useState<OHSResult | null>(null);
  const [assessmentComplete, setAssessmentComplete] = useState(false);

  // temporal smoothing
  const filterRef = useRef(new CaelinFilter({
    alphaPos: 0.6, alphaScore: 0.5, minScoreConsider: 0.3, fadeOnMiss: 0.92, maxKeepMiss: 6
  }));
  
  // rep detection
  const rep = useRef(new RepDetector({ window: 6, minDepthPx: 40, eps: 0.25 }));

  // frame counter for PoseOverlay redraws
  const frameRef = useRef(0);

  function onAssessmentComplete(payload: AssessmentResult) {
    // payload must include createdAt, tier, symmetryScore, checkpoints[], and optional frames
    useAssessmentStore.getState().setLastResult(payload);
    router.push("/results");
  }

  function processCompleteAssessment(front: OHSResult, side: OHSResult) {
    if (assessmentComplete) return; // Prevent duplicate processing
    setAssessmentComplete(true);

    // Convert OHS results to AssessmentResult format
    const checkpoints = [
      {
        checkpoint: "ANKLE" as const,
        score: calculateScore(front.flags.ankle, side.flags.ankle),
        risk: determineRisk(front.flags.ankle, side.flags.ankle),
        dysfunctions: getDysfunctions("ANKLE", front.flags.ankle, side.flags.ankle)
      },
      {
        checkpoint: "KNEE" as const,
        score: calculateScore(front.flags.knee, side.flags.knee),
        risk: determineRisk(front.flags.knee, side.flags.knee),
        dysfunctions: getDysfunctions("KNEE", front.flags.knee, side.flags.knee)
      },
      {
        checkpoint: "HIP" as const,
        score: calculateScore(front.flags.hip, side.flags.hip),
        risk: determineRisk(front.flags.hip, side.flags.hip),
        dysfunctions: getDysfunctions("HIP", front.flags.hip, side.flags.hip)
      },
      {
        checkpoint: "TRUNK" as const,
        score: calculateScore(front.flags.trunk, side.flags.trunk),
        risk: determineRisk(front.flags.trunk, side.flags.trunk),
        dysfunctions: getDysfunctions("TRUNK", front.flags.trunk, side.flags.trunk)
      },
      {
        checkpoint: "SHOULDER" as const,
        score: calculateScore(front.flags.shoulder, side.flags.shoulder),
        risk: determineRisk(front.flags.shoulder, side.flags.shoulder),
        dysfunctions: getDysfunctions("SHOULDER", front.flags.shoulder, side.flags.shoulder)
      },
      {
        checkpoint: "SYMMETRY" as const,
        score: calculateSymmetryScore(front, side),
        risk: determineSymmetryRisk(front, side),
        dysfunctions: getSymmetryDysfunctions(front, side)
      }
    ];

    const avgScore = checkpoints.reduce((sum, cp) => sum + cp.score, 0) / checkpoints.length;
    const highCount = checkpoints.filter(cp => cp.risk === "HIGH").length;
    
    const result: AssessmentResult = {
      createdAt: new Date().toISOString(),
      tier: tierFromScores(avgScore, highCount),
      symmetryScore: checkpoints.find(cp => cp.checkpoint === "SYMMETRY")?.score || 0,
      checkpoints
    };

    onAssessmentComplete(result);
  }

  function calculateScore(front: string, side: string): number {
    const severityToScore = { "Low": 90, "Medium": 60, "High": 30, "Unknown": 50 };
    const frontScore = severityToScore[front as keyof typeof severityToScore] || 50;
    const sideScore = severityToScore[side as keyof typeof severityToScore] || 50;
    return Math.round((frontScore + sideScore) / 2);
  }

  function determineRisk(front: string, side: string): "LOW" | "MEDIUM" | "HIGH" {
    if (front === "High" || side === "High") return "HIGH";
    if (front === "Medium" || side === "Medium") return "MEDIUM";
    return "LOW";
  }

  function getDysfunctions(checkpoint: string, front: string, side: string): string[] {
    const dysfunctions: string[] = [];
    
    // Map OHS flags to dysfunction IDs based on checkpoint
    if (checkpoint === "ANKLE") {
      if (front === "High" || side === "High") {
        dysfunctions.push("feet_turn_out", "excessive_pronation", "limited_dorsiflexion");
      }
    } else if (checkpoint === "KNEE") {
      if (front === "High" || side === "High") {
        dysfunctions.push("knee_valgus", "knee_varus");
      }
    } else if (checkpoint === "HIP") {
      if (front === "High" || side === "High") {
        dysfunctions.push("excessive_hip_internal_rotation", "anterior_pelvic_tilt");
      }
    } else if (checkpoint === "TRUNK") {
      if (front === "High" || side === "High") {
        dysfunctions.push("excessive_forward_lean", "low_back_arch", "low_back_round");
      }
    } else if (checkpoint === "SHOULDER") {
      if (front === "High" || side === "High") {
        dysfunctions.push("arms_fall_forward", "scapular_winging");
      }
    }
    
    return dysfunctions;
  }

  function calculateSymmetryScore(front: OHSResult, side: OHSResult): number {
    // Simple symmetry calculation based on differences between left/right metrics
    const kneeDiff = Math.abs(front.metrics.kneeLeftDX - front.metrics.kneeRightDX);
    const shoulderDiff = Math.abs(front.metrics.shoulderLeftAngle - front.metrics.shoulderRightAngle);
    
    // Convert to 0-100 score (higher is better)
    const kneeScore = Math.max(0, 100 - kneeDiff * 2);
    const shoulderScore = Math.max(0, 100 - shoulderDiff);
    
    return Math.round((kneeScore + shoulderScore) / 2);
  }

  function determineSymmetryRisk(front: OHSResult, side: OHSResult): "LOW" | "MEDIUM" | "HIGH" {
    const score = calculateSymmetryScore(front, side);
    if (score >= 80) return "LOW";
    if (score >= 60) return "MEDIUM";
    return "HIGH";
  }

  function getSymmetryDysfunctions(front: OHSResult, side: OHSResult): string[] {
    const dysfunctions: string[] = [];
    const score = calculateSymmetryScore(front, side);
    
    if (score < 70) {
      dysfunctions.push("asym_weight_shift");
    }
    
    return dysfunctions;
  }

  function tierFromScores(avg: number, highCount: number): AssessmentResult["tier"] {
    if (avg >= 90 && highCount === 0) return "ELITE";
    if ((avg >= 80 && avg < 90) || (highCount <= 1 && avg >= 85)) return "PRO";
    if ((avg >= 65 && avg < 80) || highCount === 2) return "AMATEUR";
    return "NOVICE";
  }

  const isFront = view === "front";
  const flipForDetector = isFront; // IMPORTANT: flip when mirrored
  
  // Force PoseOverlay to recompute canvas geometry on resize
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const handleResize = () => forceUpdate(prev => prev + 1);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  useEffect(() => {
    let stop = false;

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      const v = videoRef.current!;
      v.srcObject = stream;
      await v.play();
      setVideoReady(true);

      try {
        await initMoveNet();
        setDetectorReady(true);
      } catch (e) {
        console.error("Detector init error:", e);
      }

      const loop = async () => {
        if (stop) return;
        if (v.readyState >= 2) {
          const poses = await estimate(v, flipForDetector);
          const p = poses[0];

          if (p?.keypoints?.length) {
            const raw: CKP[] = p.keypoints.map((k: { name?: string; part?: string; x: number; y: number; score?: number }) => ({
              name: k.name ?? k.part ?? "",
              x: k.x, y: k.y, score: k.score
            }));
            const smoothed = filterRef.current.apply(raw) as KP[];
            setKeypoints(smoothed);
            
            // Calculate joint angles
            const angles = calculateJointAngles(smoothed);
            setJointAngles(angles);
            
            // Build ySignal for rep detection (hip midpoint Y position)
            const leftHip = smoothed.find(k => k.name === "left_hip");
            const rightHip = smoothed.find(k => k.name === "right_hip");
            if (leftHip && rightHip) {
              const hipMidY = (leftHip.y + rightHip.y) / 2;
              const events = rep.current.update(hipMidY, performance.now());
              
              // If we detected a rep bottom, compute OHS assessment
              if (events.some(e => e.type === "bottom")) {
                const r = computeOHS(smoothed);
                setLastResult(r);
                setHistory(h => [r, ...h].slice(0, 5)); // keep last 5 reps
                
                // Store result for current view
                if (isFront) {
                  setFrontResult(r);
                } else {
                  setSideResult(r);
                }
                
                // Check if both views are complete
                if (isFront && sideResult) {
                  // Both views complete, process results
                  processCompleteAssessment(frontResult || r, sideResult);
                } else if (!isFront && frontResult) {
                  // Both views complete, process results
                  processCompleteAssessment(frontResult, r);
                }
                
                // helpful console readout per rep
                console.table({
                  ankle: r.flags.ankle,
                  knee: r.flags.knee,
                  hip: r.flags.hip,
                  trunk: r.flags.trunk,
                  shoulder: r.flags.shoulder,
                  trunkAngle: r.metrics.trunkAngleFromVertical.toFixed(1),
                  kneeLdx: r.metrics.kneeLeftDX.toFixed(1),
                  kneeRdx: r.metrics.kneeRightDX.toFixed(1)
                });
              }
            }
          } else {
            setKeypoints([]);
            setJointAngles({
              ankle: null, knee: null, hip: null, spine: null, shoulder: null, elbow: null, wrist: null
            });
            setLastResult(null);
          }
        }
        
        // Increment frame counter for PoseOverlay redraws
        frameRef.current++;
        
        requestAnimationFrame(loop);
      };
      loop();
    })();

    return () => {
      stop = true;
      filterRef.current.reset();
      rep.current.reset();
      const s = videoRef.current?.srcObject as MediaStream | null;
      s?.getTracks().forEach(t => t.stop());
    };
  }, [flipForDetector]); // rewire when view changes

  return (
    <div style={{ position:"relative", width:"100%", minHeight:"100vh", background:"black" }}>
      <div style={{
        position:"relative",
        width:"100%",
        maxWidth: 900,
        margin:"0 auto",
        aspectRatio: "9 / 16" // play nice in portrait
      }}>
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width:"100%",
            height:"100%",
            objectFit:"contain",
            transform: isFront ? "scaleX(-1)" : "none", // mirror only front view
            borderRadius:12,
            display: videoReady ? "block" : "none",
          }}
        />
        {videoReady && <PoseOverlay video={videoRef.current} keypoints={keypoints} frame={frameRef.current} />}
      </div>

      {/* Joint Angle Display */}
      {videoReady && detectorReady && (
        <div style={{ 
          position: "absolute", 
          top: "20px", 
          right: "20px", 
          zIndex: 10 
        }}>
          <JointAngleDisplay angles={jointAngles} />
        </div>
      )}

      <div style={{ padding:12, color:"white", fontFamily:"system-ui,sans-serif" }}>
        <div>Camera: {videoReady ? "✅ Ready" : "…starting"}</div>
        <div>Detector: {detectorReady ? "✅ Ready" : "…loading"}</div>
        <div>Keypoints/frame (smoothed): {keypoints.length}</div>
        <div>Joint Angles: {Object.values(jointAngles).some(a => a !== null) ? "✅ Active" : "…waiting"}</div>
        <div>OHS Assessment: {lastResult ? "✅ Active" : "…waiting"}</div>
        
        {/* Assessment Progress */}
        <div style={{ marginTop:12, padding:8, background:"rgba(255,255,255,0.1)", borderRadius:8 }}>
          <div style={{ fontWeight:"bold", marginBottom:4 }}>Assessment Progress</div>
          <div>Front View: {frontResult ? "✅ Complete" : "⏳ Pending"}</div>
          <div>Side View: {sideResult ? "✅ Complete" : "⏳ Pending"}</div>
          {assessmentComplete && <div style={{ color:"#4ade80", fontWeight:"bold" }}>🎉 Assessment Complete! Redirecting...</div>}
        </div>
        
        <div style={{ marginTop:8 }}>
          <button onClick={()=>setView(v=> v==="front" ? "side" : "front")}
                  style={{ padding:"6px 10px", borderRadius:8 }}
                  disabled={assessmentComplete}>
            Switch to {view==="front" ? "Side" : "Front"} View
          </button>
          <span style={{ marginLeft:12, opacity:.8 }}>Current: {view}</span>
        </div>
      </div>

      {/* Results Panel */}
      <Results last={lastResult} history={history} />
    </div>
  );
}
