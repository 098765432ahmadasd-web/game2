class CockpitAudioEngine {
  private ctx: AudioContext | null = null;
  private oscEngine: OscillatorNode | null = null;
  private gainEngine: GainNode | null = null;
  private isMuted: boolean = true;
  private isRunning: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.isMuted && this.gainEngine) {
      this.gainEngine.gain.setTargetAtTime(0, this.ctx?.currentTime || 0, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playIgnition() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Cranking starter
    const starterOsc = this.ctx.createOscillator();
    const starterGain = this.ctx.createGain();
    starterOsc.type = 'sawtooth';
    starterOsc.frequency.setValueAtTime(45, now);
    starterOsc.frequency.exponentialRampToValueAtTime(140, now + 0.5);

    starterGain.gain.setValueAtTime(0.08, now);
    starterGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    starterOsc.connect(starterGain);
    starterGain.connect(this.ctx.destination);
    starterOsc.start(now);
    starterOsc.stop(now + 0.6);

    // Roar burst
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const t = this.ctx.currentTime;
      const roarOsc = this.ctx.createOscillator();
      const roarGain = this.ctx.createGain();
      roarOsc.type = 'sawtooth';
      roarOsc.frequency.setValueAtTime(240, t);
      roarOsc.frequency.exponentialRampToValueAtTime(80, t + 0.4);

      roarGain.gain.setValueAtTime(0.12, t);
      roarGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      roarOsc.connect(roarGain);
      roarGain.connect(this.ctx.destination);
      roarOsc.start(t);
      roarOsc.stop(t + 0.5);
    }, 550);
  }

  public updateEngine(rpm: number, maxRpm: number, throttle: number) {
    if (this.isMuted) {
      if (this.gainEngine) {
        this.gainEngine.gain.value = 0;
      }
      return;
    }
    this.initContext();
    if (!this.ctx) return;

    if (!this.oscEngine) {
      this.oscEngine = this.ctx.createOscillator();
      this.gainEngine = this.ctx.createGain();
      this.oscEngine.type = 'sawtooth';
      this.gainEngine.gain.value = 0;
      this.oscEngine.connect(this.gainEngine);
      this.gainEngine.connect(this.ctx.destination);
      this.oscEngine.start();
      this.isRunning = true;
    }

    const now = this.ctx.currentTime;
    const normRpm = Math.max(800, Math.min(rpm, maxRpm));
    // Base frequency calculation for a multi-cylinder motorsport engine
    const fundamental = 35 + (normRpm / 11000) * 190;
    if (this.oscEngine) {
      this.oscEngine.frequency.setTargetAtTime(fundamental, now, 0.04);
    }

    if (this.gainEngine) {
      const volume = 0.015 + (throttle / 100) * 0.045;
      this.gainEngine.gain.setTargetAtTime(volume, now, 0.04);
    }
  }

  public playShiftPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playRevLimiterBeep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  public stop() {
    if (this.gainEngine && this.ctx) {
      this.gainEngine.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
  }
}

export const audioEngine = new CockpitAudioEngine();
