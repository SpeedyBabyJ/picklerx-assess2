"use client";
import React from "react";
import { JointAngles, assessAngles, type AngleThresholds } from "@/lib/jointAngles";

interface JointAngleDisplayProps {
  angles: JointAngles;
  thresholds?: AngleThresholds;
  showAssessment?: boolean;
}

const JOINT_LABELS: Record<keyof JointAngles, string> = {
  ankle: "Ankle",
  knee: "Knee", 
  hip: "Hip",
  spine: "Spine",
  shoulder: "Shoulder",
  elbow: "Elbow",
  wrist: "Wrist"
};

const JOINT_DESCRIPTIONS: Record<keyof JointAngles, string> = {
  ankle: "Dorsiflexion",
  knee: "Flexion",
  hip: "Flexion", 
  spine: "From Vertical",
  shoulder: "Flexion (Overhead)",
  elbow: "Extension",
  wrist: "Extension"
};

const STATUS_COLORS = {
  optimal: "#10b981",        // Green
  acceptable: "#f59e0b",     // Amber
  needs_improvement: "#ef4444" // Red
};

export default function JointAngleDisplay({ 
  angles, 
  thresholds, 
  showAssessment = true 
}: JointAngleDisplayProps) {
  const assessment = showAssessment ? assessAngles(angles, thresholds) : null;

  return (
    <div className="joint-angles-display" style={{
      background: "rgba(0,0,0,0.8)",
      borderRadius: "12px",
      padding: "16px",
      color: "white",
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
      maxWidth: "400px",
      backdropFilter: "blur(10px)"
    }}>
      <h3 style={{ 
        margin: "0 0 16px 0", 
        fontSize: "18px", 
        fontWeight: "600",
        textAlign: "center",
        color: "#fbbf24"
      }}>
        Joint Angles - Overhead Squat
      </h3>
      
      <div style={{ display: "grid", gap: "8px" }}>
        {Object.entries(angles).map(([joint, angle]) => {
          const jointKey = joint as keyof JointAngles;
          const assessmentData = assessment?.[jointKey];
          const status = assessmentData?.status;
          
          return (
            <div key={joint} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              background: status ? `rgba(${status === 'optimal' ? '16, 185, 129' : status === 'acceptable' ? '245, 158, 11' : '239, 68, 68'}, 0.1)` : "rgba(255,255,255,0.05)",
              borderRadius: "8px",
              border: status ? `1px solid ${STATUS_COLORS[status]}` : "1px solid rgba(255,255,255,0.1)"
            }}>
              <div>
                <div style={{ fontWeight: "600", color: "#fbbf24" }}>
                  {JOINT_LABELS[jointKey]}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.7 }}>
                  {JOINT_DESCRIPTIONS[jointKey]}
                </div>
              </div>
              
              <div style={{ textAlign: "right" }}>
                <div style={{ 
                  fontSize: "18px", 
                  fontWeight: "700",
                  color: status ? STATUS_COLORS[status] : "#9ca3af"
                }}>
                  {angle !== null ? `${angle}°` : "---"}
                </div>
                
                {assessmentData && status && (
                  <div style={{ 
                    fontSize: "11px", 
                    opacity: 0.8,
                    color: STATUS_COLORS[status]
                  }}>
                    {assessmentData.message}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAssessment && (
        <div style={{ 
          marginTop: "16px", 
          padding: "12px", 
          background: "rgba(255,255,255,0.05)", 
          borderRadius: "8px",
          fontSize: "12px"
        }}>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ 
                width: "8px", 
                height: "8px", 
                borderRadius: "50%", 
                background: STATUS_COLORS.optimal 
              }} />
              <span>Optimal</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ 
                width: "8px", 
                height: "8px", 
                borderRadius: "50%", 
                background: STATUS_COLORS.acceptable 
              }} />
              <span>Acceptable</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ 
                width: "8px", 
                height: "8px", 
                borderRadius: "50%", 
                background: STATUS_COLORS.needs_improvement 
              }} />
              <span>Needs Work</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
