/**
 * Ambient sound for the 3D landscape, synthesised in the browser with the
 * Web Audio API: wind, moving water and occasional bird calls (crickets at
 * dusk). Nothing is downloaded, so there are no audio files to license.
 *
 * Sound only ever starts from a visitor's click on the sound button.
 */
export type Soundscape = {
  start: () => Promise<void>;
  stop: () => void;
  /** 0 = forest, 1 = at the water's edge. Shifts the balance of wind and water. */
  setProgress: (p: number) => void;
  dispose: () => void;
};

export function createSoundscape(night: boolean): Soundscape | null {
  const Ctor: typeof AudioContext | undefined =
    typeof window === "undefined" ? undefined : window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;

  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let water: GainNode | null = null;
  let wind: GainNode | null = null;
  let timer: number | undefined;
  let running = false;

  function build() {
    ctx = new Ctor!();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Two seconds of noise, looped, is the raw material for wind and water.
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      // Slightly smoothed noise sounds less harsh than pure white noise.
      last = last * 0.6 + (Math.random() * 2 - 1) * 0.4;
      data[i] = last;
    }
    const source = (rate: number) => {
      const n = ctx!.createBufferSource();
      n.buffer = buffer;
      n.loop = true;
      n.playbackRate.value = rate;
      n.start();
      return n;
    };

    // Wind: low band of noise that swells and fades slowly.
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.value = 420;
    windFilter.Q.value = 0.5;
    wind = ctx.createGain();
    wind.gain.value = 0.5;
    const swell = ctx.createOscillator();
    swell.frequency.value = 0.07;
    const swellDepth = ctx.createGain();
    swellDepth.gain.value = 0.22;
    swell.connect(swellDepth).connect(wind.gain);
    swell.start();
    source(0.8).connect(windFilter).connect(wind).connect(master);

    // Water: bright, quiet hiss that grows as the camera nears the lake.
    const waterFilter = ctx.createBiquadFilter();
    waterFilter.type = "highpass";
    waterFilter.frequency.value = 2400;
    water = ctx.createGain();
    water.gain.value = 0.02;
    source(1.3).connect(waterFilter).connect(water).connect(master);
  }

  /** A short rising-and-falling whistle, repeated a few times. */
  function birdCall() {
    if (!ctx || !master) return;
    const t0 = ctx.currentTime + 0.05;
    const base = 2200 + Math.random() * 1800;
    const notes = 2 + Math.floor(Math.random() * 4);
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) pan.pan.value = Math.random() * 1.6 - 0.8;
    const out = ctx.createGain();
    out.gain.value = 0.05 + Math.random() * 0.05;
    if (pan) out.connect(pan).connect(master);
    else out.connect(master);
    for (let i = 0; i < notes; i++) {
      const start = t0 + i * (0.11 + Math.random() * 0.05);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(base * (0.9 + Math.random() * 0.2), start);
      osc.frequency.exponentialRampToValueAtTime(base * (1.15 + Math.random() * 0.3), start + 0.05);
      osc.frequency.exponentialRampToValueAtTime(base * 0.95, start + 0.09);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, start);
      env.gain.linearRampToValueAtTime(1, start + 0.012);
      env.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
      osc.connect(env).connect(out);
      osc.start(start);
      osc.stop(start + 0.12);
    }
  }

  /** A soft, pulsing trill. */
  function cricket() {
    if (!ctx || !master) return;
    const t0 = ctx.currentTime + 0.05;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 3900 + Math.random() * 600;
    const env = ctx.createGain();
    env.gain.value = 0;
    const pulses = 6 + Math.floor(Math.random() * 10);
    for (let i = 0; i < pulses; i++) {
      const s = t0 + i * 0.07;
      env.gain.setValueAtTime(0, s);
      env.gain.linearRampToValueAtTime(0.022, s + 0.012);
      env.gain.linearRampToValueAtTime(0, s + 0.045);
    }
    osc.connect(env).connect(master);
    osc.start(t0);
    osc.stop(t0 + pulses * 0.07 + 0.1);
  }

  function schedule() {
    if (!running) return;
    if (night) cricket();
    else birdCall();
    timer = window.setTimeout(schedule, night ? 700 + Math.random() * 2600 : 1800 + Math.random() * 5200);
  }

  return {
    async start() {
      if (!ctx) build();
      if (!ctx || !master) return;
      if (ctx.state === "suspended") await ctx.resume();
      running = true;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.55, ctx.currentTime, 0.6);
      window.clearTimeout(timer);
      timer = window.setTimeout(schedule, 900);
    },
    stop() {
      running = false;
      window.clearTimeout(timer);
      if (!ctx || !master) return;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
      const c = ctx;
      window.setTimeout(() => {
        if (!running && c.state === "running") void c.suspend();
      }, 1200);
    },
    setProgress(p) {
      if (!ctx || !water || !wind) return;
      const v = Math.min(1, Math.max(0, p));
      water.gain.setTargetAtTime(0.02 + v * v * 0.2, ctx.currentTime, 0.4);
      wind.gain.setTargetAtTime(0.5 - v * 0.2, ctx.currentTime, 0.4);
    },
    dispose() {
      running = false;
      window.clearTimeout(timer);
      void ctx?.close();
      ctx = null;
    },
  };
}
