import type { BgmProfile } from '../levelBgm';

type BgmConfig = { profile: BgmProfile; src?: string };

/** Frequency lookup for melody composition */
const N = {
  E2: 82.41, G2: 98, A2: 110, B2: 123.47, C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196,
  A3: 220, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392,
  A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
  A5: 880, B5: 987.77, C6: 1046.5, E6: 1318.5, G6: 1568,
} as const;

type MelodyStep = {
  freq: number;
  dur: number;
  type?: OscillatorType;
  vol?: number;
  gap?: number;
};

type ProceduralHandle = {
  oscillators: OscillatorNode[];
  intervals: ReturnType<typeof setInterval>[];
  timeouts: ReturnType<typeof setTimeout>[];
  master: GainNode;
};

class AudioEngine {
  ctx: AudioContext | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private proceduralCleanup: (() => void) | null = null;
  private bgmEnabled = false;
  private currentProfile: BgmProfile | null = null;
  private proceduralHandle: ProceduralHandle | null = null;

  initCtx() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (Ctx) this.ctx = new Ctx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (!enabled) this.stopBgm();
  }

  isBgmEnabled() {
    return this.bgmEnabled;
  }

  async playLevelBgm(config: BgmConfig) {
    if (!this.bgmEnabled) return;
    const sameProfilePlaying =
      this.currentProfile === config.profile &&
      ((this.bgmAudio && !this.bgmAudio.paused) || this.proceduralHandle !== null);
    if (sameProfilePlaying) return;

    this.stopBgm();
    this.currentProfile = config.profile;

    if (config.src) {
      const ok = await this.tryPlayMp3(config.src);
      if (ok) return;
    }

    this.startProcedural(config.profile);
  }

  stopBgm() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.src = '';
      this.bgmAudio = null;
    }
    if (this.proceduralHandle) {
      const { oscillators, intervals, timeouts, master } = this.proceduralHandle;
      intervals.forEach(clearInterval);
      timeouts.forEach(clearTimeout);
      oscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          /* already stopped */
        }
      });
      master.disconnect();
      this.proceduralHandle = null;
    }
    this.proceduralCleanup?.();
    this.proceduralCleanup = null;
    this.currentProfile = null;
  }

  private tryPlayMp3(src: string): Promise<boolean> {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        if (!ok) {
          audio.pause();
          audio.removeAttribute('src');
        }
        resolve(ok);
      };

      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = 0.7;
      audio.preload = 'auto';

      audio.addEventListener('error', () => finish(false), { once: true });
      audio.addEventListener(
        'canplaythrough',
        () => {
          audio
            .play()
            .then(() => {
              this.bgmAudio = audio;
              finish(true);
            })
            .catch(() => finish(false));
        },
        { once: true },
      );

      audio.load();
      window.setTimeout(() => finish(false), 3000);
    });
  }

  private startProcedural(profile: BgmProfile) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const ctx = this.ctx;
      const master = ctx.createGain();
      master.gain.value = profile === 'alarm-tension' ? 0.14 : 0.2;
      master.connect(ctx.destination);

      const oscillators: OscillatorNode[] = [];
      const intervals: ReturnType<typeof setInterval>[] = [];
      const timeouts: ReturnType<typeof setTimeout>[] = [];

      const playTone = (
        freq: number,
        durSec: number,
        type: OscillatorType = 'triangle',
        vol = 0.12,
      ) => {
        if (freq <= 0) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        const t = ctx.currentTime;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.02);
        gain.gain.setValueAtTime(vol * 0.85, t + durSec * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, t + durSec);
        osc.connect(gain);
        gain.connect(master);
        osc.start(t);
        osc.stop(t + durSec + 0.05);
      };

      const addDrone = (freq: number, type: OscillatorType, vol: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = vol;
        osc.connect(gain);
        gain.connect(master);
        osc.start();
        oscillators.push(osc);
      };

      const schedule = (fn: () => void, ms: number) => {
        const id = window.setTimeout(fn, ms);
        timeouts.push(id);
      };

      const playMelodyLoop = (
        steps: MelodyStep[],
        loopPause = 600,
        defaultType: OscillatorType = 'triangle',
      ) => {
        let i = 0;

        const tick = () => {
          const step = steps[i];
          playTone(step.freq, step.dur / 1000, step.type ?? defaultType, step.vol ?? 0.12);
          i += 1;
          const gap = step.gap ?? 60;
          if (i >= steps.length) {
            i = 0;
            schedule(tick, step.dur + gap + loopPause);
          } else {
            schedule(tick, step.dur + gap);
          }
        };

        tick();
      };

      switch (profile) {
        case 'mystery-night':
          // Slow minor detective motif
          addDrone(N.A2, 'sine', 0.018);
          playMelodyLoop([
            { freq: N.A4, dur: 520, type: 'sine', vol: 0.1 },
            { freq: N.C5, dur: 520, type: 'sine', vol: 0.1 },
            { freq: N.E5, dur: 680, type: 'sine', vol: 0.11 },
            { freq: N.D5, dur: 380, type: 'sine', vol: 0.09 },
            { freq: N.C5, dur: 380, type: 'sine', vol: 0.09 },
            { freq: N.B4, dur: 560, type: 'sine', vol: 0.1 },
            { freq: N.A4, dur: 900, type: 'sine', vol: 0.11 },
          ], 1400, 'sine');
          break;

        case 'alarm-tension':
          // Uneasy pulse — stays low so alarm beeps stay audible
          addDrone(N.A2, 'sawtooth', 0.006);
          {
            let pulse = 0;
            const id = window.setInterval(() => {
              const f = pulse % 2 === 0 ? N.C3 : N.F3;
              playTone(f, 0.18, 'square', 0.04);
              if (pulse % 4 === 3) playTone(N.B4, 0.08, 'sawtooth', 0.025);
              pulse += 1;
            }, 480);
            intervals.push(id);
          }
          break;

        case 'investigation':
          // Staccato noir climbing phrase
          addDrone(N.C3, 'sine', 0.015);
          playMelodyLoop([
            { freq: N.E4, dur: 180, vol: 0.11 },
            { freq: N.G4, dur: 180, vol: 0.11 },
            { freq: N.A4, dur: 180, vol: 0.11 },
            { freq: N.B4, dur: 320, vol: 0.12 },
            { freq: 0, dur: 200 },
            { freq: N.C5, dur: 180, vol: 0.12 },
            { freq: N.B4, dur: 180, vol: 0.11 },
            { freq: N.A4, dur: 360, vol: 0.11 },
            { freq: N.G4, dur: 180, vol: 0.1 },
            { freq: N.E4, dur: 180, vol: 0.1 },
            { freq: N.C4, dur: 420, vol: 0.1 },
          ], 500, 'triangle');
          break;

        case 'intermission':
          // Gentle waltz — 3/4 feel
          addDrone(N.G3, 'sine', 0.014);
          playMelodyLoop([
            { freq: N.C4, dur: 280, vol: 0.1 },
            { freq: N.E4, dur: 280, vol: 0.1 },
            { freq: N.G4, dur: 420, vol: 0.11 },
            { freq: N.E4, dur: 280, vol: 0.1 },
            { freq: N.C4, dur: 280, vol: 0.1 },
            { freq: N.G3, dur: 420, vol: 0.1 },
            { freq: 0, dur: 160 },
          ], 900, 'sine');
          break;

        case 'dorm-warm':
          // Nostalgic ascending then falling
          addDrone(N.G2, 'triangle', 0.016);
          playMelodyLoop([
            { freq: N.G4, dur: 440, type: 'sine', vol: 0.11 },
            { freq: N.B4, dur: 440, type: 'sine', vol: 0.11 },
            { freq: N.D5, dur: 560, type: 'sine', vol: 0.12 },
            { freq: N.G5, dur: 720, type: 'sine', vol: 0.13 },
            { freq: N.F5, dur: 440, type: 'sine', vol: 0.11 },
            { freq: N.E5, dur: 440, type: 'sine', vol: 0.11 },
            { freq: N.D5, dur: 560, type: 'sine', vol: 0.11 },
            { freq: N.B4, dur: 720, type: 'sine', vol: 0.1 },
            { freq: N.G4, dur: 880, type: 'sine', vol: 0.11 },
          ], 1100, 'sine');
          break;

        case 'art-elegant':
          // Minuet-style flowing line
          addDrone(N.A3, 'sine', 0.012);
          playMelodyLoop([
            { freq: N.E5, dur: 260, type: 'sine', vol: 0.11 },
            { freq: N.D5, dur: 260, type: 'sine', vol: 0.1 },
            { freq: N.C5, dur: 260, type: 'sine', vol: 0.1 },
            { freq: N.D5, dur: 260, type: 'sine', vol: 0.1 },
            { freq: N.E5, dur: 260, type: 'sine', vol: 0.11 },
            { freq: N.E5, dur: 260, type: 'sine', vol: 0.11 },
            { freq: N.E5, dur: 480, type: 'sine', vol: 0.12 },
            { freq: N.D5, dur: 260, type: 'sine', vol: 0.1 },
            { freq: N.D5, dur: 260, type: 'sine', vol: 0.1 },
            { freq: N.D5, dur: 480, type: 'sine', vol: 0.11 },
            { freq: N.E5, dur: 260, type: 'sine', vol: 0.11 },
            { freq: N.G5, dur: 260, type: 'sine', vol: 0.12 },
            { freq: N.G5, dur: 520, type: 'sine', vol: 0.12 },
          ], 700, 'sine');
          break;

        case 'piano-room':
          // Recognizable lullaby phrase (public-domain style)
          playMelodyLoop([
            { freq: N.C5, dur: 380, type: 'triangle', vol: 0.13 },
            { freq: N.C5, dur: 380, type: 'triangle', vol: 0.12 },
            { freq: N.G5, dur: 380, type: 'triangle', vol: 0.12 },
            { freq: N.G5, dur: 380, type: 'triangle', vol: 0.12 },
            { freq: N.A5, dur: 380, type: 'triangle', vol: 0.12 },
            { freq: N.A5, dur: 380, type: 'triangle', vol: 0.12 },
            { freq: N.G5, dur: 720, type: 'triangle', vol: 0.13 },
            { freq: N.F5, dur: 380, type: 'triangle', vol: 0.11 },
            { freq: N.F5, dur: 380, type: 'triangle', vol: 0.11 },
            { freq: N.E5, dur: 380, type: 'triangle', vol: 0.11 },
            { freq: N.E5, dur: 380, type: 'triangle', vol: 0.11 },
            { freq: N.D5, dur: 380, type: 'triangle', vol: 0.11 },
            { freq: N.D5, dur: 380, type: 'triangle', vol: 0.11 },
            { freq: N.C5, dur: 900, type: 'triangle', vol: 0.13 },
          ], 400, 'triangle');
          break;

        case 'primary-innocent':
          // Bouncy playground melody
          addDrone(N.C3, 'sine', 0.014);
          playMelodyLoop([
            { freq: N.C5, dur: 220, vol: 0.12 },
            { freq: N.D5, dur: 220, vol: 0.12 },
            { freq: N.E5, dur: 220, vol: 0.12 },
            { freq: N.C5, dur: 220, vol: 0.12 },
            { freq: N.E5, dur: 220, vol: 0.12 },
            { freq: N.F5, dur: 220, vol: 0.12 },
            { freq: N.G5, dur: 440, vol: 0.13 },
            { freq: 0, dur: 120 },
            { freq: N.G5, dur: 180, vol: 0.12 },
            { freq: N.A5, dur: 180, vol: 0.12 },
            { freq: N.G5, dur: 180, vol: 0.12 },
            { freq: N.F5, dur: 180, vol: 0.12 },
            { freq: N.E5, dur: 180, vol: 0.12 },
            { freq: N.C5, dur: 180, vol: 0.12 },
            { freq: N.D5, dur: 180, vol: 0.12 },
            { freq: N.C5, dur: 520, vol: 0.13 },
          ], 600, 'triangle');
          break;

        case 'gym-final':
          // Driving bass + heroic ascending run
          addDrone(N.E2, 'sine', 0.022);
          {
            let beat = 0;
            const bassId = window.setInterval(() => {
              playTone(beat % 2 === 0 ? N.E2 : N.B2, 0.14, 'sine', 0.08);
              beat += 1;
            }, 420);
            intervals.push(bassId);
          }
          playMelodyLoop([
            { freq: N.E4, dur: 200, vol: 0.13 },
            { freq: N.G4, dur: 200, vol: 0.13 },
            { freq: N.B4, dur: 200, vol: 0.13 },
            { freq: N.E5, dur: 320, vol: 0.14 },
            { freq: N.E5, dur: 200, vol: 0.13 },
            { freq: N.D5, dur: 200, vol: 0.12 },
            { freq: N.B4, dur: 200, vol: 0.12 },
            { freq: N.G4, dur: 480, vol: 0.12 },
          ], 400, 'square');
          break;

        case 'graduation':
          // Celebratory fanfare
          addDrone(N.C3, 'triangle', 0.018);
          addDrone(N.G3, 'sine', 0.012);
          playMelodyLoop([
            { freq: N.C5, dur: 240, vol: 0.13 },
            { freq: N.E5, dur: 240, vol: 0.13 },
            { freq: N.G5, dur: 240, vol: 0.14 },
            { freq: N.C6, dur: 560, vol: 0.15 },
            { freq: N.G5, dur: 320, vol: 0.13 },
            { freq: N.E5, dur: 320, vol: 0.12 },
            { freq: N.C5, dur: 640, vol: 0.13 },
            { freq: 0, dur: 200 },
            { freq: N.E5, dur: 200, vol: 0.12 },
            { freq: N.G5, dur: 200, vol: 0.12 },
            { freq: N.C6, dur: 200, vol: 0.13 },
            { freq: N.E6, dur: 200, vol: 0.13 },
            { freq: N.G6, dur: 720, vol: 0.15 },
          ], 800, 'triangle');
          break;
      }

      this.proceduralHandle = { oscillators, intervals, timeouts, master };
      this.proceduralCleanup = () => {
        intervals.forEach(clearInterval);
        timeouts.forEach(clearTimeout);
        oscillators.forEach((osc) => {
          try {
            osc.stop();
          } catch {
            /* already stopped */
          }
        });
        master.disconnect();
        this.proceduralHandle = null;
      };
    } catch (err) {
      console.warn('Procedural BGM error:', err);
    }
  }

  playBeep(freq: number, duration: number, type: OscillatorType = 'sine') {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (err) {
      console.warn('Audio Context error:', err);
    }
  }

  startAlarmBeeps(): () => void {
    try {
      this.initCtx();
      if (!this.ctx) return () => {};
      let intervalId: ReturnType<typeof setInterval>;
      const beep = () => this.playBeep(880, 0.4, 'triangle');
      beep();
      intervalId = setInterval(beep, 1000);
      return () => clearInterval(intervalId);
    } catch (err) {
      console.warn(err);
      return () => {};
    }
  }

  playPianoNote(note: number) {
    const freqs = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];
    const freq = freqs[note - 1] || 261.63;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.2);
    } catch (err) {
      console.warn(err);
    }
  }

  playSuccessGain() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [261.63, 329.63, 392, 523.25].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.1);
        gain.gain.setValueAtTime(0.12, t + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 0.4);
      });
    } catch (err) {
      console.warn('Victory sound error:', err);
    }
  }
}

export const audioEngine = new AudioEngine();
