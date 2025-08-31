"use client";
import React, { useEffect, useRef } from "react";

type KP = { name: string; x: number; y: number; score?: number };

const LINKS: [string, string][]= [
  ["left_shoulder","right_shoulder"],
  ["left_shoulder","left_elbow"],["left_elbow","left_wrist"],
  ["right_shoulder","right_elbow"],["right_elbow","right_wrist"],
  ["left_hip","right_hip"],["left_shoulder","left_hip"],["right_shoulder","right_hip"],
  ["left_hip","left_knee"],["left_knee","left_ankle"],
  ["right_hip","right_knee"],["right_knee","right_ankle"],
  ["left_eye","right_eye"],
];

export default function PoseOverlay({ video, keypoints, frame }:{
  video: HTMLVideoElement|null; keypoints: KP[]; frame: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current; if (!c || !video) return;
    const ctx = c.getContext("2d"); if (!ctx) return;

    // Size canvas to the DISPLAYED video rect (portrait-safe), honoring DPR.
    // This must happen every frame to ensure proper overlay positioning
    const rect = video.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width  = Math.max(1, Math.round(rect.width  * dpr));
    c.height = Math.max(1, Math.round(rect.height * dpr));
    c.style.width  = `${rect.width}px`;
    c.style.height = `${rect.height}px`;

    // Scale drawing so TF coordinates match CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Bones
    LINKS.forEach(([a,b])=>{
      const ka = keypoints.find(k => k.name===a && (k.score ?? 1) >= 0.5);
      const kb = keypoints.find(k => k.name===b && (k.score ?? 1) >= 0.5);
      if (!ka || !kb) return;
      ctx.beginPath();
      ctx.moveTo(ka.x, ka.y);
      ctx.lineTo(kb.x, kb.y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "cyan";
      ctx.stroke();
    });

    // Joints
    keypoints.forEach(k=>{
      if ((k.score ?? 1) < 0.5) return;
      ctx.beginPath();
      ctx.arc(k.x, k.y, 5, 0, Math.PI*2);
      ctx.fillStyle = "lime";
      ctx.fill();
    });
  }, [keypoints, video, frame]); // Now depends on frame to redraw every frame

  return <canvas ref={ref} style={{ position:"absolute", inset:0, pointerEvents:"none" }} />;
}
