import { Exercise } from "./types";

export const EXERCISES: Record<string, Exercise> = {
  // Strength / Correctives
  clam_shells: { id: "clam_shells", name: "Clamshells", type: "STRENGTH", tags: ["glute_med"], cue: "Heels together, pelvis still.", prescription: "2×12/side" },
  lateral_band_walk: { id: "lateral_band_walk", name: "Lateral Band Walk", type: "STRENGTH", tags: ["glute_med"], cue: "Level hips, toes forward.", prescription: "2×10 steps/dir" },
  single_leg_rdl_reach: { id: "single_leg_rdl_reach", name: "Single-Leg RDL Reach", type: "STRENGTH", tags: ["posterior_chain","balance"], cue: "Square hips, long spine.", prescription: "2×8/side" },
  wall_tib_raises: { id: "wall_tib_raises", name: "Wall Tib Raises", type: "STRENGTH", tags: ["ant_tib"], cue: "Pull toes up fast, control down.", prescription: "2×15" },
  hip_airplane: { id: "hip_airplane", name: "Hip Airplanes", type: "STRENGTH", tags: ["hip_control","glute_med"], cue: "Pivot from hip, square pelvis.", prescription: "2×6/side" },
  dead_bug_press: { id: "dead_bug_press", name: "Dead Bug Press", type: "STRENGTH", tags: ["core"], cue: "Ribs down, no arch.", prescription: "2×8/side" },
  prone_y_t_w: { id: "prone_y_t_w", name: "Prone Y-T-W", type: "STRENGTH", tags: ["lower_trap"], cue: "Thumbs up, neck long.", prescription: "2×8 each" },
  face_pull_band: { id: "face_pull_band", name: "Band Face Pull", type: "STRENGTH", tags: ["scapular"], cue: "Squeeze lower traps.", prescription: "2×12" },
  anti_extension_plank_walkout: { id: "anti_extension_plank_walkout", name: "Plank Walkouts", type: "STRENGTH", tags: ["core"], cue: "No low-back sag.", prescription: "2×6" },
  glute_bridge_iso: { id: "glute_bridge_iso", name: "Bridge ISO", type: "STRENGTH", tags: ["glute_max"], cue: "Posterior tilt, ribs down.", prescription: "3×20–30s" },

  // Stretch
  gastroc_stretch: { id: "gastroc_stretch", name: "Gastroc Wall Stretch", type: "STRETCH", tags: ["calf"], prescription: "45–60s" },
  soleus_stretch_knee_bent: { id: "soleus_stretch_knee_bent", name: "Soleus Stretch (Knee Bent)", type: "STRETCH", tags: ["calf"], prescription: "45–60s" },
  hip_flexor_half_kneel_pnf: { id: "hip_flexor_half_kneel_pnf", name: "Half-Kneel Hip Flexor (PNF)", type: "STRETCH", tags: ["hip_flexor"], prescription: "2×(5s press/15s relax)" },
  tfl_stretch: { id: "tfl_stretch", name: "TFL/ITB Lean", type: "STRETCH", tags: ["tfl"], prescription: "45–60s" },
  lat_doorway_stretch: { id: "lat_doorway_stretch", name: "Lat Doorway Stretch", type: "STRETCH", tags: ["lat"], prescription: "45–60s" },

  // Foam Roll
  smr_calf: { id: "smr_calf", name: "SMR: Calf (Gastroc/Soleus)", type: "FOAM_ROLL", tags: ["calf"], prescription: "45–60s/area" },
  smr_tfl: { id: "smr_tfl", name: "SMR: TFL/ITB", type: "FOAM_ROLL", tags: ["tfl"], prescription: "45–60s/side" },
  smr_adductors: { id: "smr_adductors", name: "SMR: Adductors", type: "FOAM_ROLL", tags: ["adductors"], prescription: "45–60s/side" },
  smr_lats: { id: "smr_lats", name: "SMR: Lats", type: "FOAM_ROLL", tags: ["lat"], prescription: "45–60s/side" },
};
