import * as tf from "@tensorflow/tfjs";
import * as posedetection from "@tensorflow-models/pose-detection";

let detector: posedetection.PoseDetector | null = null;

export async function initMoveNet() {
  if (detector) return detector;
  try { await tf.setBackend("webgl"); } catch {}
  await tf.ready();

  const cfg = {
    modelType: posedetection.SupportedModels.MoveNet,
    enableSmoothing: true,
  };

  detector = await posedetection.createDetector(
    posedetection.SupportedModels.MoveNet,
    cfg
  );
  console.log("[pose] MoveNet ready:", cfg.modelType, "backend:", tf.getBackend());
  return detector;
}

// flipHorizontal MUST be true when the video is mirrored (front view)
export async function estimate(video: HTMLVideoElement, flipHorizontal: boolean) {
  if (!detector) return [];
  return detector.estimatePoses(video, { flipHorizontal });
}
