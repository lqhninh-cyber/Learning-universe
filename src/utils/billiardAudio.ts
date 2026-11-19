/**
 * BỘ TỔNG HỢP ÂM THANH BIDA KHOÁNG THẠCH WEB AUDIO API (BILLIARD AUDIO ENGINE)
 * - Tổng hợp 100% bằng Web Audio API (0 file âm thanh ngoài, lazy init trên pointerdown).
 * - Chuỗi xử lý: GainNode -> DynamicsCompressorNode -> audioCtx.destination.
 * - 5 hiệu ứng vật lý: playCueStrike, playBallClack, playCushionBounce, playPocketDrop, playRackClear.
 */

export const BILLIARD_COMBO_NOTES: readonly number[] = [
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.0, // A5
  987.77, // B5
  1174.66, // D6
] as const;

export const BALL_CLACK_COOLDOWN_MS = 25;
export const CUSHION_COOLDOWN_MS = 30;

interface WebkitWindow extends Window {
  readonly webkitAudioContext?: typeof AudioContext;
}

class BilliardAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private enabled = false;
  private lastClackMs = -9999;
  private lastCushionMs = -9999;
  private lastRollMs = -9999;

  private nowMs(): number {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }
    return Date.now();
  }

  public setEnabled(next: boolean): void {
    this.enabled = next;
    if (next) {
      this.unlock();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Khởi tạo lười (Lazy Init) AudioContext & bộ đệm white-noise ngắn ngay khi người dùng tương tác.
   */
  public unlock(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    const AudioCtx = window.AudioContext ?? (window as unknown as WebkitWindow).webkitAudioContext;
    if (!AudioCtx) return null;

    try {
      if (!this.ctx) {
        const ctx = new AudioCtx();
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.32, ctx.currentTime);

        if (typeof ctx.createDynamicsCompressor === 'function') {
          const comp = ctx.createDynamicsCompressor();
          comp.threshold.setValueAtTime(-16, ctx.currentTime);
          comp.knee.setValueAtTime(15, ctx.currentTime);
          comp.ratio.setValueAtTime(6, ctx.currentTime);
          comp.attack.setValueAtTime(0.002, ctx.currentTime);
          comp.release.setValueAtTime(0.14, ctx.currentTime);
          master.connect(comp);
          comp.connect(ctx.destination);
        } else {
          master.connect(ctx.destination);
        }

        if (typeof ctx.createBuffer === 'function') {
          const length = Math.max(1024, Math.floor(ctx.sampleRate * 0.12));
          const buf = ctx.createBuffer(1, length, ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < length; i += 1) {
            data[i] = Math.random() * 2 - 1;
          }
          this.noiseBuffer = buf;
        }

        this.ctx = ctx;
        this.masterGain = master;
      }

      if (this.ctx.state === 'suspended' && typeof this.ctx.resume === 'function') {
        void this.ctx.resume().catch(() => undefined);
      }
    } catch {
      return null;
    }

    return this.ctx;
  }

  /**
   * 1. Tiếng đầu cơ chạm bi cái:
   * - Xung triangle trầm 140Hz -> 55Hz (0.06s)
   * - Kết hợp tiếng 'tách' lơ phấn ngắn qua bandpass noise (2200Hz, 0.025s).
   */
  public playCueStrike(power: number): boolean {
    if (!this.enabled) return false;
    const ctx = this.unlock();
    if (!ctx || !this.masterGain) return false;

    const clamped = Math.max(0.12, Math.min(1, power));
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.06);

      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.linearRampToValueAtTime(0.34 * clamped, now + 0.004);
      oscGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.06);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.065);

      if (this.noiseBuffer && typeof ctx.createBufferSource === 'function') {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(2200, now);
        bandpass.Q.setValueAtTime(2.6, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.0001, now);
        noiseGain.gain.linearRampToValueAtTime(0.18 * clamped, now + 0.002);
        noiseGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.025);

        noise.connect(bandpass);
        bandpass.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(now);
        noise.stop(now + 0.028);
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * 2. Tiếng hai viên bi khoáng thạch va chạm sắc gọn:
   * - 2 sóng cộng hưởng ngắn (1850Hz và 3400Hz, 0.032s)
   * - Xung noise cao tần tỷ lệ trực tiếp với impactSpeed, cooldown 25ms.
   */
  public playBallClack(impactSpeed: number): boolean {
    const nowMs = this.nowMs();
    if (nowMs - this.lastClackMs < BALL_CLACK_COOLDOWN_MS) {
      return false;
    }
    this.lastClackMs = nowMs;

    if (!this.enabled) return false;
    const ctx = this.unlock();
    if (!ctx || !this.masterGain) return false;

    const clamped = Math.max(0.08, Math.min(1, impactSpeed));
    const now = ctx.currentTime;

    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const clackGain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1850, now);
      osc1.frequency.exponentialRampToValueAtTime(1420, now + 0.032);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(3400, now);
      osc2.frequency.exponentialRampToValueAtTime(2650, now + 0.032);

      clackGain.gain.setValueAtTime(0.0001, now);
      clackGain.gain.linearRampToValueAtTime(0.28 * clamped, now + 0.0018);
      clackGain.gain.exponentialRampToValueAtTime(0.0006, now + 0.032);

      osc1.connect(clackGain);
      osc2.connect(clackGain);
      clackGain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.035);
      osc2.stop(now + 0.035);

      if (this.noiseBuffer && typeof ctx.createBufferSource === 'function') {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(2800, now);

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.0001, now);
        nGain.gain.linearRampToValueAtTime(0.16 * clamped, now + 0.0015);
        nGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.018);

        noise.connect(highpass);
        highpass.connect(nGain);
        nGain.connect(this.masterGain);
        noise.start(now);
        noise.stop(now + 0.02);
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * 3. Tiếng bật băng nỉ êm trầm:
   * - lowpass 240Hz, sine 95Hz -> 48Hz (0.08s).
   */
  public playCushionBounce(impactSpeed: number): boolean {
    const nowMs = this.nowMs();
    if (nowMs - this.lastCushionMs < CUSHION_COOLDOWN_MS) {
      return false;
    }
    this.lastCushionMs = nowMs;

    if (!this.enabled) return false;
    const ctx = this.unlock();
    if (!ctx || !this.masterGain) return false;

    const clamped = Math.max(0.1, Math.min(1, impactSpeed));
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(48, now + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.24 * clamped, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.085);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 4. Tiếng bi rơi lỗ:
   * - 2 nhịp 'cộc-cộc' gỗ trầm lệch nhau 60ms
   * - Hòa kèm 1 nốt chuông Ngũ cung tăng dần cao độ theo comboCount (D5, E5, G5, A5, B5, D6).
   */
  public playPocketDrop(comboCount: number): boolean {
    if (!this.enabled) return false;
    const ctx = this.unlock();
    if (!ctx || !this.masterGain) return false;

    const now = ctx.currentTime;
    const safeComboIdx = Math.max(
      0,
      Math.min(BILLIARD_COMBO_NOTES.length - 1, Math.floor(comboCount) - 1),
    );
    const chimeFreq = BILLIARD_COMBO_NOTES[safeComboIdx] ?? 587.33;

    try {
      // 2 nhịp 'cộc-cộc' gỗ trầm lệch nhau 60ms
      for (const [idx, delaySec] of [
        [0, 0],
        [1, 0.06],
      ] as const) {
        const woodOsc = ctx.createOscillator();
        const woodGain = ctx.createGain();
        const startT = now + delaySec;

        woodOsc.type = 'triangle';
        woodOsc.frequency.setValueAtTime(idx === 0 ? 165 : 138, startT);
        woodOsc.frequency.exponentialRampToValueAtTime(68, startT + 0.048);

        woodGain.gain.setValueAtTime(0.0001, startT);
        woodGain.gain.linearRampToValueAtTime(idx === 0 ? 0.22 : 0.17, startT + 0.004);
        woodGain.gain.exponentialRampToValueAtTime(0.0008, startT + 0.05);

        woodOsc.connect(woodGain);
        woodGain.connect(this.masterGain);
        woodOsc.start(startT);
        woodOsc.stop(startT + 0.055);
      }

      // Nốt chuông Ngũ cung theo comboCount
      const chimeOsc = ctx.createOscillator();
      const overtoneOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(chimeFreq, now + 0.02);

      overtoneOsc.type = 'sine';
      overtoneOsc.frequency.setValueAtTime(chimeFreq * 2, now + 0.02);

      chimeGain.gain.setValueAtTime(0.0001, now + 0.02);
      chimeGain.gain.linearRampToValueAtTime(0.18, now + 0.036);
      chimeGain.gain.exponentialRampToValueAtTime(0.0007, now + 0.95);

      chimeOsc.connect(chimeGain);
      overtoneOsc.connect(chimeGain);
      chimeGain.connect(this.masterGain);

      chimeOsc.start(now + 0.02);
      overtoneOsc.start(now + 0.02);
      chimeOsc.stop(now + 0.98);
      overtoneOsc.stop(now + 0.55);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 5. Hợp âm Ngũ cung rải 4 nốt hân hoan (D5 - G5 - A5 - D6) khi dọn sạch cả 6 bi.
   */
  public playRackClear(): boolean {
    if (!this.enabled) return false;
    const ctx = this.unlock();
    if (!ctx || !this.masterGain) return false;

    const now = ctx.currentTime;
    const arpeggio = [587.33, 783.99, 880.0, 1174.66] as const;

    try {
      arpeggio.forEach((freq, idx) => {
        const startT = now + idx * 0.085;
        const osc = ctx.createOscillator();
        const harmonic = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startT);

        harmonic.type = 'triangle';
        harmonic.frequency.setValueAtTime(freq * 2, startT);

        gain.gain.setValueAtTime(0.0001, startT);
        gain.gain.linearRampToValueAtTime(0.16, startT + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0006, startT + 1.15);

        osc.connect(gain);
        harmonic.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(startT);
        harmonic.start(startT);
        osc.stop(startT + 1.18);
        harmonic.stop(startT + 0.65);
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 6. Tiếng chuông thưởng Ngũ cung kép khi thực hiện pha đánh đẹp (BANK SHOT! / DOUBLE POT! / COMBO ×N!).
   */
  public playTrickShotReward(kind: 'bank' | 'double' | 'combo' = 'bank'): boolean {
    if (!this.enabled) return false;
    const ctx = this.unlock();
    if (!ctx || !this.masterGain) return false;

    const now = ctx.currentTime;
    const notes =
      kind === 'double'
        ? ([783.99, 1174.66] as const) // G5 -> D6
        : kind === 'bank'
          ? ([659.25, 987.77] as const) // E5 -> B5
          : ([587.33, 880.0] as const); // D5 -> A5

    try {
      notes.forEach((freq, idx) => {
        const startT = now + idx * 0.055;
        const osc = ctx.createOscillator();
        const overtone = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startT);

        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(freq * 2, startT);

        gain.gain.setValueAtTime(0.0001, startT);
        gain.gain.linearRampToValueAtTime(0.17, startT + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0006, startT + 0.75);

        osc.connect(gain);
        overtone.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(startT);
        overtone.start(startT);
        osc.stop(startT + 0.78);
        overtone.stop(startT + 0.45);
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 7. Tiếng bi lạch cạch nhỏ khi lăn chạm nhau trong máng hồi bi cơ khí bên phải bàn.
   */
  public playMarbleRoll(intensity = 0.5): boolean {
    const nowMs = this.nowMs();
    if (nowMs - this.lastRollMs < 40) {
      return false;
    }
    this.lastRollMs = nowMs;

    if (!this.enabled) return false;
    const ctx = this.unlock();
    if (!ctx || !this.masterGain) return false;

    const clamped = Math.max(0.1, Math.min(1, intensity));
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(920 + clamped * 380, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.028);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.11 * clamped, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0006, now + 0.03);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.032);
      return true;
    } catch {
      return false;
    }
  }
}

export const billiardAudio = new BilliardAudioEngine();

export function setBilliardSoundEnabled(enabled: boolean): void {
  billiardAudio.setEnabled(enabled);
}

export function isBilliardSoundEnabled(): boolean {
  return billiardAudio.isEnabled();
}

export function unlockBilliardAudio(): AudioContext | null {
  return billiardAudio.unlock();
}

export function playCueStrike(power: number): boolean {
  return billiardAudio.playCueStrike(power);
}

export function playBallClack(impactSpeed: number): boolean {
  return billiardAudio.playBallClack(impactSpeed);
}

export function playCushionBounce(impactSpeed: number): boolean {
  return billiardAudio.playCushionBounce(impactSpeed);
}

export function playPocketDrop(comboCount: number): boolean {
  return billiardAudio.playPocketDrop(comboCount);
}

export function playRackClear(): boolean {
  return billiardAudio.playRackClear();
}

export function playTrickShotReward(kind: 'bank' | 'double' | 'combo' = 'bank'): boolean {
  return billiardAudio.playTrickShotReward(kind);
}

export function playMarbleRoll(intensity = 0.5): boolean {
  return billiardAudio.playMarbleRoll(intensity);
}
