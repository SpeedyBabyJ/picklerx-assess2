"use client";

import React, { useEffect, useRef, useState } from "react";
import { initMoveNet, estimate } from "@/lib/pose";
import PoseOverlay from "@/components/PoseOverlay";
import { CaelinFilter, type KP as CKP } from "@/lib/caelinFilter";

type KP = { name: string; x: number; y: number; score?: number };

export default function AssessPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [detectorReady, setDetectorReady] = useState(false);
  const [keypoints, setKeypoints] = useState<KP[]>([]);
  const [view, setView] = useState<"front" | "side">("front");

  // Caelin filter instance (persist across renders)
  const filterRef = useRef(new CaelinFilter({
    alphaPos: 0.6,         // tune: 0.5–0.8 is a good range
    alphaScore: 0.5,
    minScoreConsider: 0.3, // ignore very low-confidence blips
    fadeOnMiss: 0.92,      // slowly fade through short dropouts
    maxKeepMiss: 6,        // keep tracks for ~6 frames when missing
  }));

  useEffect(() => {
    let stop = false;

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
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
          const poses = await estimate(v, view === "front");
          const p = poses[0];

          if (p?.keypoints?.length) {
            // map raw -> KP
            const raw: CKP[] = p.keypoints.map((k: any) => ({
              name: k.name ?? k.part ?? "",
              x: k.x, y: k.y, score: k.score
            }));
            // smooth with Caelin filter
            const smoothed = filterRef.current.apply(raw) as KP[];
            setKeypoints(smoothed);
          } else {
            setKeypoints([]);
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
  }, [view]);

  return (
    <div style={{ position:"relative", width:"100%", minHeight:"100vh", background:"black" }}>
      <div style={{ position:"relative", width:"100%", maxWidth:900, margin:"0 auto" }}>
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width:"100%",
            height:"auto",
            transform: view === "front" ? "scaleX(-1)" : "none",
            borderRadius:12,
            display: videoReady ? "block" : "none",
          }}
        />
        {videoReady && <PoseOverlay video={videoRef.current} keypoints={keypoints} />}
      </div>

      <div style={{ padding:12, color:"white", fontFamily:"system-ui,sans-serif" }}>
        <div>Camera: {videoReady ? "✅ Ready" : "…starting"}</div>
        <div>Detector: {detectorReady ? "✅ Ready" : "…loading"}</div>
        <div>Keypoints/frame (smoothed): {keypoints.length}</div>
        <div style={{ marginTop:8 }}>
          <button onClick={()=>setView(v=> v==="front" ? "side" : "front")}
                  style={{ padding:"6px 10px", borderRadius:8 }}>
            Switch to {view==="front" ? "Side" : "Front"} View
          </button>
          <span style={{ marginLeft:12, opacity:.8 }}>Current: {view}</span>
        </div>
      </div>
    </div>
  );
}
