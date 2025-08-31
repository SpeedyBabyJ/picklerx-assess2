"use client";
import React from "react";
import { OHSFlags } from "@/lib/ohs";
import { getAllStrategies, type RiskLevel } from "@/lib/strategies";

interface ResultsPanelProps {
  flags: OHSFlags;
  isVisible: boolean;
}

const JOINT_LABELS: Record<keyof OHSFlags, string> = {
  ankle: "Ankle",
  knee: "Knee",
  hip: "Hip",
  trunk: "Trunk",
  shoulder: "Shoulder"
};

const RISK_COLORS: Record<RiskLevel, string> = {
  Low: "#10b981",        // Green
  Medium: "#f59e0b",     // Amber
  High: "#ef4444",       // Red
  Unknown: "#9ca3af"     // Gray
};

export default function ResultsPanel({ flags, isVisible }: ResultsPanelProps) {
  if (!isVisible) return null;

  const strategies = getAllStrategies(flags);

  return (
    <div className="results-panel" style={{
      background: "rgba(0,0,0,0.9)",
      borderRadius: "12px",
      padding: "20px",
      color: "white",
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
      maxWidth: "500px",
      margin: "20px auto",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.1)"
    }}>
      <h2 style={{ 
        margin: "0 0 20px 0", 
        fontSize: "24px", 
        fontWeight: "700",
        textAlign: "center",
        color: "#fbbf24",
        textTransform: "uppercase",
        letterSpacing: "1px"
      }}>
        Overhead Squat Assessment Results
      </h2>
      
      <div style={{ display: "grid", gap: "16px" }}>
        {Object.entries(flags).map(([joint, riskLevel]) => {
          const jointKey = joint as keyof OHSFlags;
          const jointStrategies = strategies[joint] || [];
          const color = RISK_COLORS[riskLevel];
          
          return (
            <div key={joint} style={{
              border: `2px solid ${color}`,
              borderRadius: "8px",
              padding: "16px",
              background: `${color}10`
            }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "12px"
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: "18px", 
                  fontWeight: "600",
                  color: "#fbbf24"
                }}>
                  {JOINT_LABELS[jointKey]}
                </h3>
                <div style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  background: color,
                  color: "white",
                  fontWeight: "700",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  {riskLevel}
                </div>
              </div>
              
              {jointStrategies.length > 0 ? (
                <div>
                  <div style={{ 
                    fontSize: "12px", 
                    color: "#9ca3af",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Corrective Strategies:
                  </div>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: "20px",
                    fontSize: "13px",
                    lineHeight: "1.4"
                  }}>
                    {jointStrategies.map((strategy, index) => (
                      <li key={index} style={{ marginBottom: "4px" }}>
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div style={{ 
                  fontSize: "13px", 
                  color: "#9ca3af",
                  fontStyle: "italic"
                }}>
                  {riskLevel === "Low" ? "No corrective strategies needed" : "Unable to assess"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ 
        marginTop: "20px", 
        padding: "16px", 
        background: "rgba(255,255,255,0.05)", 
        borderRadius: "8px",
        fontSize: "12px",
        textAlign: "center"
      }}>
        <div style={{ marginBottom: "8px", fontWeight: "600", color: "#fbbf24" }}>
          Risk Level Guide:
        </div>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: RISK_COLORS.Low }} />
            <span>Low</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: RISK_COLORS.Medium }} />
            <span>Medium</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: RISK_COLORS.High }} />
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
