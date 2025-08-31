"use client";

import React, { useEffect, useRef, useState } from "react";
import { initMoveNet, estimate } from "@/lib/pose";
import PoseOverlay from "@/components/PoseOverlay";
import { CaelinFilter, type KP as CKP } from "@/lib/caelinFilter";
import { calculateJointAngles, type JointAngles } from "@/lib/jointAngles";
import JointAngleDisplay from "@/components/JointAngleDisplay";
import { computeOHS, type OHSResult } from "@/lib/ohs";
import Results from "@/components/Results";

type KP = { name: string; x: number; y: number; score?: number };

export default function AssessPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [detectorReady, setDetectorReady] = useState(false);
  const [keypoints, setKeypoints] = useState<KP[]>([]);
  const [jointAngles, setJointAngles] = useState<JointAngles>({
    ankle: null, knee: null, hip: null, spine: null, shoulder: null, elbow: null, wrist: null
  });
  const [result, setResult] = useState<OHSResult | null>(null);
  const [view, setView] = useState<"front"|"side">("front"); // <- toggle

  // temporal smoothing
  const filterRef = useRef(new CaelinFilter({
    alphaPos: 0.6, alphaScore: 0.5, minScoreConsider: 0.3, fadeOnMiss: 0.92, maxKeepMiss: 6
  }));

  const isFront = view === "front";
  const flipForDetector = isFront; // IMPORTANT: flip when mirrored

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
            
            // compute results live (you can later gate this per-rep)
            const r = computeOHS(smoothed);
            setResult(r);

            // helpful console readout
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
          } else {
            setKeypoints([]);
            setJointAngles({
              ankle: null, knee: null, hip: null, spine: null, shoulder: null, elbow: null, wrist: null
            });
            setResult(null);
          }
        }
        requestAnimationFrame(loop);
      };
      loop();
    })();

    return () => {
      stop = true;
      filterRef.current.reset();
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
        {videoReady && <PoseOverlay video={videoRef.current} keypoints={keypoints} />}
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
        <div>OHS Assessment: {result ? "✅ Active" : "…waiting"}</div>
        <div style={{ marginTop:8 }}>
          <button onClick={()=>setView(v=> v==="front" ? "side" : "front")}
                  style={{ padding:"6px 10px", borderRadius:8 }}>
            Switch to {view==="front" ? "Side" : "Front"} View
          </button>
          <span style={{ marginLeft:12, opacity:.8 }}>Current: {view}</span>
        </div>
      </div>

      {/* Results Panel */}
      <Results result={result} />
    </div>
  );
}
