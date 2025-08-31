export type RepPhase = "idle" | "descending" | "bottom" | "ascending";
export type RepEvent = { type: "bottom"; t: number };

export class RepDetector {
  private window: number;
  private minDepthPx: number;
  private eps: number;
  private buffer: number[] = [];
  private phase: RepPhase = "idle";
  private peakY: number | null = null;
  private lastEventTime: number = 0;
  private eventCooldown: number = 1000; // 1 second between events

  constructor(opts?: { window?: number; minDepthPx?: number; eps?: number }) {
    this.window = opts?.window ?? 6;
    this.minDepthPx = opts?.minDepthPx ?? 40;
    this.eps = opts?.eps ?? 0.25;
  }

  reset(): void {
    this.buffer = [];
    this.phase = "idle";
    this.peakY = null;
    this.lastEventTime = 0;
  }

  update(ySignal: number, t: number): RepEvent[] {
    // Add to circular buffer
    this.buffer.push(ySignal);
    if (this.buffer.length > this.window) {
      this.buffer.shift();
    }

    // Need enough data to compute velocity
    if (this.buffer.length < 2) {
      return [];
    }

    // Compute simple moving average for smoothing
    const sma = this.buffer.reduce((sum, val) => sum + val, 0) / this.buffer.length;
    
    // Compute velocity (finite difference)
    const velocity = this.buffer[this.buffer.length - 1] - this.buffer[0];
    
    // Track peak position during descent
    if (this.phase === "idle" && velocity > this.eps) {
      this.phase = "descending";
      this.peakY = sma;
    } else if (this.phase === "descending") {
      // Update peak if we're going higher
      if (sma < (this.peakY ?? sma)) {
        this.peakY = sma;
      }
      
      // Detect bottom when velocity crosses from positive to near-zero
      if (velocity <= this.eps && velocity > -this.eps) {
        this.phase = "bottom";
      }
    } else if (this.phase === "bottom") {
      // Check if we have enough depth to count as a rep
      if (this.peakY !== null && Math.abs(sma - this.peakY) >= this.minDepthPx) {
        // Check cooldown to avoid multiple events
        if (t - this.lastEventTime > this.eventCooldown) {
          this.lastEventTime = t;
          this.phase = "ascending";
          
          // Return bottom event
          return [{ type: "bottom", t }];
        }
      }
      
      // Move to ascending if velocity becomes negative
      if (velocity < -this.eps) {
        this.phase = "ascending";
      }
    } else if (this.phase === "ascending") {
      // Return to idle when velocity becomes small
      if (Math.abs(velocity) <= this.eps) {
        this.phase = "idle";
        this.peakY = null;
      }
    }

    return [];
  }
}
