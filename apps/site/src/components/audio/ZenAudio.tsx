import { useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

class ZenAudioEngine {
  private ctx: AudioContext | null = null;
  private droneGain: GainNode | null = null;
  private oscA: OscillatorNode | null = null;
  private oscB: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private isRunning = false;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();

    // Master volume limiter
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    masterGain.connect(this.ctx.destination);

    // Drone Gain
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.droneGain.connect(masterGain);

    // Resonant nocturnal drone: 110Hz (A2) + 164.81Hz (E3)
    this.oscA = this.ctx.createOscillator();
    this.oscA.type = "sine";
    this.oscA.frequency.setValueAtTime(110, this.ctx.currentTime);

    this.oscB = this.ctx.createOscillator();
    this.oscB.type = "triangle";
    this.oscB.frequency.setValueAtTime(164.81, this.ctx.currentTime);

    // Low frequency oscillator for organic breathing movement (0.15Hz)
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = "sine";
    this.lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.droneGain.gain);

    this.oscA.connect(this.droneGain);
    this.oscB.connect(this.droneGain);

    this.oscA.start();
    this.oscB.start();
    this.lfo.start();
  }

  public setMuted(muted: boolean) {
    if (!this.ctx) {
      if (!muted) this.init();
      else return;
    }
    if (this.ctx && this.ctx.state === "suspended" && !muted) {
      this.ctx.resume();
    }
    if (this.droneGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.droneGain.gain.cancelScheduledValues(now);
      if (muted) {
        this.droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        this.isRunning = false;
      } else {
        this.droneGain.gain.exponentialRampToValueAtTime(0.08, now + 1.2);
        this.isRunning = true;
      }
    }
  }

  public playChime(freq = 528) {
    if (!this.ctx || !this.isRunning) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 3.2);
    } catch {
      // Audio trigger silently ignorable
    }
  }
}

const engine = new ZenAudioEngine();

export function useZenAudio() {
  const [muted, setMuted] = useState(true);

  const toggle = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      engine.setMuted(next);
      if (!next) {
        // Play welcome chime
        setTimeout(() => engine.playChime(660), 300);
      }
      return next;
    });
  }, []);

  const triggerChime = useCallback((freq?: number) => {
    engine.playChime(freq);
  }, []);

  return { muted, toggle, triggerChime };
}

export function ZenAudioToggle() {
  const { muted, toggle } = useZenAudio();

  return (
    <button
      onClick={toggle}
      className={`relative flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-mono transition-all duration-300 ${
        muted
          ? "border-line bg-card/60 text-fog hover:border-white/20 hover:text-snow"
          : "border-amber/40 bg-amber/10 text-amber shadow-[0_0_20px_rgba(245,158,11,0.25)]"
      }`}
      aria-label={muted ? "Unmute Zen Soundscape" : "Mute Soundscape"}
      title={muted ? "Enable Zen nocturnal soundscape" : "Mute soundscape"}
    >
      {muted ? (
        <>
          <VolumeX className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ambience [Off]</span>
        </>
      ) : (
        <>
          <Volume2 className="h-3.5 w-3.5 animate-pulse text-amber" />
          <span className="hidden sm:inline">Zen [On]</span>
          <span className="flex h-1.5 w-1.5 rounded-full bg-amber animate-ping" />
        </>
      )}
    </button>
  );
}

export { engine as zenAudioEngine };
