// "Caelin filter" = fast temporal smoother for 2D keypoints.
// - EMA for x/y (single-frame latency)
// - Fades through short dropouts to avoid blinking joints

export type KP = { name: string; x: number; y: number; score?: number };

type Track = { x: number; y: number; score: number; miss: number };

export interface CaelinOpts {
  alphaPos?: number;        // 0..1, higher = snappier, lower = smoother
  alphaScore?: number;      // smooth score as well
  minScoreConsider?: number;// ignore current point if below
  fadeOnMiss?: number;      // per-frame score decay when missing
  maxKeepMiss?: number;     // keep last known for up to N frames
}

export class CaelinFilter {
  private tracks = new Map<string, Track>();
  private opts: Required<CaelinOpts>;

  constructor(opts: CaelinOpts = {}) {
    this.opts = {
      alphaPos: opts.alphaPos ?? 0.6,
      alphaScore: opts.alphaScore ?? 0.5,
      minScoreConsider: opts.minScoreConsider ?? 0.3,
      fadeOnMiss: opts.fadeOnMiss ?? 0.92,
      maxKeepMiss: opts.maxKeepMiss ?? 6,
    };
  }

  reset() { this.tracks.clear(); }

  apply(kps: KP[]): KP[] {
    const seen = new Set<string>();

    // Update with current detections
    for (const kp of kps) {
      const name = kp.name || "";
      if (!name) continue;
      seen.add(name);

      const prev = this.tracks.get(name);
      const s = kp.score ?? 1;

      if (prev && s >= this.opts.minScoreConsider) {
        // EMA blend
        const a = this.opts.alphaPos;
        prev.x = a * kp.x + (1 - a) * prev.x;
        prev.y = a * kp.y + (1 - a) * prev.y;
        prev.score = this.opts.alphaScore * s + (1 - this.opts.alphaScore) * prev.score;
        prev.miss = 0;
      } else if (!prev && s >= this.opts.minScoreConsider) {
        // Initialize track
        this.tracks.set(name, { x: kp.x, y: kp.y, score: s, miss: 0 });
      } else if (prev && s < this.opts.minScoreConsider) {
        // Low-confidence current: keep last, fade score
        prev.score *= this.opts.fadeOnMiss;
        prev.miss += 1;
      }
    }

    // Handle tracks not seen this frame (possible dropout)
    for (const [name, tr] of this.tracks) {
      if (!seen.has(name)) {
        tr.score *= this.opts.fadeOnMiss;
        tr.miss += 1;
      }
      // prune long-missed
      if (tr.miss > this.opts.maxKeepMiss) {
        this.tracks.delete(name);
      }
    }

    // Produce output list (tracks + current kps names union)
    const out: KP[] = [];
    for (const [name, tr] of this.tracks) {
      out.push({ name, x: tr.x, y: tr.y, score: tr.score });
    }
    return out;
  }
}
