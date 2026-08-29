/**
 * Audio synthesis Service for POS & Kitchen Display System (Web Audio API)
 */

export type SoundPreset = 
  | 'cheerful' 
  | 'service_bell' 
  | 'kitchen_alert' 
  | 'marimba_breeze' 
  | 'counter_ding' 
  | 'cozy_fanfare' 
  | 'success';

class SoundService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private isUnlocked: boolean = false;

  constructor() {
    // Sound is ALWAYS active and enabled by default
    this.soundEnabled = true;
    try {
      localStorage.setItem('pos_sound_enabled', 'true');
    } catch {
      // ignore
    }

    // Auto-unlock AudioContext on first user interaction anywhere on the screen
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.initCtx();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().then(() => {
            this.isUnlocked = true;
          }).catch(() => {});
        } else if (this.ctx && this.ctx.state === 'running') {
          this.isUnlocked = true;
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };

      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
    }
  }

  isSoundEnabled(): boolean {
    return true; // Always active
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem('pos_sound_enabled', String(enabled));
    } catch {
      // ignore
    }
  }

  public initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Play rich harmonic chime for new incoming orders (6 unique presets)
   */
  playNewOrderChime(preset: SoundPreset = 'cheerful') {
    this.vibrate([200, 100, 200]);

    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      if (preset === 'service_bell') {
        // 1. Classic Restaurant Dinner Bell (Ding-Dong)
        const notes = [1046.50, 1318.51, 1567.98]; // C6, E6, G6
        notes.forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0, now + i * 0.1);
          gain.gain.linearRampToValueAtTime(0.35, now + i * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.85);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.85);
        });
      } else if (preset === 'kitchen_alert') {
        // 2. High-clarity kitchen dual alert
        [880, 1174.66, 880, 1174.66].forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          gain.gain.setValueAtTime(0, now + idx * 0.15);
          gain.gain.linearRampToValueAtTime(0.32, now + idx * 0.15 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.5);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.5);
        });
      } else if (preset === 'marimba_breeze') {
        // 3. Warm Cafe Marimba Breeze (Acoustic wood timbre)
        const notes = [392.00, 493.88, 587.33, 783.99]; // G4, B4, D5, G5
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.11);
          gain.gain.setValueAtTime(0, now + idx * 0.11);
          gain.gain.linearRampToValueAtTime(0.4, now + idx * 0.11 + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.6);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.11);
          osc.stop(now + idx * 0.11 + 0.6);
        });
      } else if (preset === 'counter_ding') {
        // 4. Counter Double Ding (Crisp bright double ping)
        const notes = [1318.51, 1760.00]; // E6, A6
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.18);
          gain.gain.setValueAtTime(0, now + idx * 0.18);
          gain.gain.linearRampToValueAtTime(0.38, now + idx * 0.18 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.95);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.18);
          osc.stop(now + idx * 0.18 + 0.95);
        });
      } else if (preset === 'cozy_fanfare') {
        // 5. Cozy Cafe Fanfare (Uplifting melody)
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);
          gain.gain.setValueAtTime(0, now + idx * 0.09);
          gain.gain.linearRampToValueAtTime(0.32, now + idx * 0.09 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.65);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.65);
        });
      } else {
        // 6. Cheerful 4-Note Harmonic Chord (D5, F#5, A5, D6)
        const notes = [587.33, 739.99, 880.00, 1174.66];
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0, now + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.1 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.75);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.75);
        });
      }
    } catch {
      // Audio context might be restricted
    }
  }

  /**
   * Positive completion sound
   */
  playSuccessChime() {
    if (!this.soundEnabled) return;
    this.vibrate([100]);

    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Short pleasant pop for button clicks
   */
  playClickPop() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // ignore
    }
  }

  /**
   * Haptic vibration for mobile POS
   */
  vibrate(pattern: number[]) {
    try {
      if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch {
      // ignore
    }
  }
}

export const soundService = new SoundService();

