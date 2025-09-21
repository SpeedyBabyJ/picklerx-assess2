import { Prescription } from "./types";

export const prescriptionMap: Record<string, Prescription> = {
  feet_turn_out: { checkpoint: "ANKLE", dysfunctionId: "feet_turn_out",
    strength: ["wall_tib_raises","clam_shells","lateral_band_walk"],
    stretch: ["gastroc_stretch","soleus_stretch_knee_bent"],
    foamRoll: ["smr_calf","smr_tfl"] },

  excessive_pronation: { checkpoint: "ANKLE", dysfunctionId: "excessive_pronation",
    strength: ["wall_tib_raises","single_leg_rdl_reach","hip_airplane"],
    stretch: ["tfl_stretch","gastroc_stretch"],
    foamRoll: ["smr_tfl","smr_adductors"] },

  limited_dorsiflexion: { checkpoint: "ANKLE", dysfunctionId: "limited_dorsiflexion",
    strength: ["wall_tib_raises","glute_bridge_iso","single_leg_rdl_reach"],
    stretch: ["soleus_stretch_knee_bent","gastroc_stretch"],
    foamRoll: ["smr_calf","smr_tfl"] },

  knee_valgus: { checkpoint: "KNEE", dysfunctionId: "knee_valgus",
    strength: ["clam_shells","lateral_band_walk","hip_airplane"],
    stretch: ["tfl_stretch","gastroc_stretch"],
    foamRoll: ["smr_tfl","smr_adductors"] },

  knee_varus: { checkpoint: "KNEE", dysfunctionId: "knee_varus",
    strength: ["wall_tib_raises","single_leg_rdl_reach","dead_bug_press"],
    stretch: ["gastroc_stretch","soleus_stretch_knee_bent"],
    foamRoll: ["smr_calf","smr_lats"] },

  excessive_hip_internal_rotation: { checkpoint: "HIP", dysfunctionId: "excessive_hip_internal_rotation",
    strength: ["hip_airplane","single_leg_rdl_reach","clam_shells"],
    stretch: ["tfl_stretch","hip_flexor_half_kneel_pnf"],
    foamRoll: ["smr_tfl","smr_adductors"] },

  anterior_pelvic_tilt: { checkpoint: "HIP", dysfunctionId: "anterior_pelvic_tilt",
    strength: ["glute_bridge_iso","dead_bug_press","anti_extension_plank_walkout"],
    stretch: ["hip_flexor_half_kneel_pnf","lat_doorway_stretch"],
    foamRoll: ["smr_lats","smr_tfl"] },

  excessive_forward_lean: { checkpoint: "TRUNK", dysfunctionId: "excessive_forward_lean",
    strength: ["dead_bug_press","anti_extension_plank_walkout","glute_bridge_iso"],
    stretch: ["hip_flexor_half_kneel_pnf","lat_doorway_stretch"],
    foamRoll: ["smr_lats","smr_tfl"] },

  low_back_arch: { checkpoint: "TRUNK", dysfunctionId: "low_back_arch",
    strength: ["dead_bug_press","glute_bridge_iso","anti_extension_plank_walkout"],
    stretch: ["hip_flexor_half_kneel_pnf","lat_doorway_stretch"],
    foamRoll: ["smr_lats","smr_tfl"] },

  low_back_round: { checkpoint: "TRUNK", dysfunctionId: "low_back_round",
    strength: ["glute_bridge_iso","single_leg_rdl_reach","prone_y_t_w"],
    stretch: ["lat_doorway_stretch","hip_flexor_half_kneel_pnf"],
    foamRoll: ["smr_lats","smr_adductors"] },

  arms_fall_forward: { checkpoint: "SHOULDER", dysfunctionId: "arms_fall_forward",
    strength: ["prone_y_t_w","face_pull_band","dead_bug_press"],
    stretch: ["lat_doorway_stretch","tfl_stretch"],
    foamRoll: ["smr_lats","smr_tfl"] },

  scapular_winging: { checkpoint: "SHOULDER", dysfunctionId: "scapular_winging",
    strength: ["face_pull_band","prone_y_t_w","anti_extension_plank_walkout"],
    stretch: ["lat_doorway_stretch","hip_flexor_half_kneel_pnf"],
    foamRoll: ["smr_lats","smr_tfl"] },

  asym_weight_shift: { checkpoint: "SYMMETRY", dysfunctionId: "asym_weight_shift",
    strength: ["single_leg_rdl_reach","hip_airplane","clam_shells"],
    stretch: ["tfl_stretch","gastroc_stretch"],
    foamRoll: ["smr_tfl","smr_adductors"] },
};
