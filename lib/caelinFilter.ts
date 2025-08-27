export type KP = { name: string; x: number; y: number; score?: number };

type Track = { x: number; y: number; score: number; miss: number };

export interface CaelinOpts {
  alphaPos?: number;
  alphaScore?: number;
  minScoreConsider?: number;
  fadeOnMiss?: number;
  maxKeepMiss?: number;
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

    for (const kp of kps) {
      const name = kp.name || "";
      if (!name) continue;
      seen.add(name);

      const prev = this.tracks.get(name);
      const s = kp.score ?? 1;

      if (prev && s >= this.opts.minScoreConsider) {
        const a = this.opts.alphaPos;
        prev.x = a * kp.x + (1 - a) * prev.x;
        prev.y = a * kp.y + (1 - a) * prev.y;
        prev.score = this.opts.alphaScore * s + (1 - this.opts.alphaScore) * prev.score;
        prev.miss = 0;
      } else if (!prev && s >= this.opts.minScoreConsider) {
        this.tracks.set(name, { x: kp.x, y: kp.y, score: s, miss: 0 });
      } else if (prev && s < this.opts.minScoreConsider) {
        prev.score *= this.opts.fadeOnMiss;
        prev.miss += 1;
      }
    }

    for (const [name, tr] of this.tracks) {
      if (!seen.has(name)) {
        tr.score *= this.opts.fadeOnMiss;
        tr.miss += 1;
      }
      if (tr.miss > this.opts.maxKeepMiss) {
        this.tracks.delete(name);
      }
    }

    const out: KP[] = [];
    for (const [name, tr] of this.tracks) {
      out.push({ name, x: tr.x, y: tr.y, score: tr.score });
    }
    return out;
  }
}
