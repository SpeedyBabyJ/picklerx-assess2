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

export default function PoseOverlay({ video, keypoints }:{ video: HTMLVideoElement|null; keypoints: KP[]; }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c || !video) return;
    const ctx = c.getContext("2d"); if (!ctx) return;

    c.width = video.videoWidth; c.height = video.videoHeight;
    ctx.clearRect(0,0,c.width,c.height);

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

    keypoints.forEach(k=>{
      if ((k.score ?? 1) < 0.5) return;
      ctx.beginPath();
      ctx.arc(k.x, k.y, 5, 0, Math.PI*2);
      ctx.fillStyle = "lime";
      ctx.fill();
    });
  }, [keypoints, video]);

  return <canvas ref={ref} style={{ position:"absolute", inset:0, pointerEvents:"none" }}/>;
}
