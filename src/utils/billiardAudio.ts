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
export const BREAK_CLUSTER_COOLDOWN_MS = 7;
export const BREAK_CLUSTER_WINDOW_MS = 85;
export const CUSHION_COOLDOWN_MS = 30;
export const MAX_ROLLING_BED_GAIN = 0.028;

interface WebkitWindow extends Window {
  readonly webkitAudioContext?: typeof AudioContext;
}

class BilliardAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private rollingGain: GainNode | null = null;
  private rollingSourceStarted = false;
  private noiseBuffer: AudioBuffer | null = null;
  private enabled = false;
  private lastClackMs = -9999;
  private lastCushionMs = -9999;
  private lastJawMs = -9999;
  private lastRollMs = -9999;
  private recentClackTimes: number[] = [];

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
    } else {
      this.updateRollingNoise(0);
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Khởi tạo lười (Lazy Init) AudioContext, bộ đệm noise va chạm & nền bi lăn trên mặt nỉ (<= 0.028).
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

          // Bộ đệm tiếng nỉ lăn êm (1.5s loop brown noise -> lowpass 240Hz)
          if (
            typeof ctx.createBufferSource === 'function' &&
            typeof ctx.createBiquadFilter === 'function'
          ) {
            try {
              const rollLen = Math.max(2048, Math.floor(ctx.sampleRate * 1.5));
              const rollBuf = ctx.createBuffer(1, rollLen, ctx.sampleRate);
              const rollData = rollBuf.getChannelData(0);
              let lastOut = 0;
              for (let i = 0; i < rollLen; i += 1) {
                const white = Math.random() * 2 - 1;
                lastOut = (lastOut + 0.04 * white) / 1.04;
                rollData[i] = Math.max(-0.9, Math.min(0.9, lastOut * 3.2));
              }

              const rollSrc = ctx.createBufferSource();
              rollSrc.buffer = rollBuf;
              rollSrc.loop = true;

              const rollFilter = ctx.createBiquadFilter();
              rollFilter.type = 'lowpass';
              rollFilter.frequency.setValueAtTime(240, ctx.currentTime);

              const rGain = ctx.createGain();
              rGain.gain.setValueAtTime(0, ctx.currentTime);

              rollSrc.connect(rollFilter);
              rollFilter.connect(rGain);
              rGain.connect(master);
              rollSrc.start(ctx.currentTime);
              this.rollingGain = rGain;
              this.rollingSourceStarted = true;
            } catch {
              this.rollingGain = null;
            }
          }
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
   * Điều chỉnh âm lượng tiếng bi lăn trên mặt nỉ theo tổng động năng (tự tắt về 0 khi bi đứng yên, trần <= 0.028).
   */
  public updateRollingNoise(kineticEnergyNorm: number): void {
    if (!this.ctx || !this.rollingGain || !this.rollingSourceStarted) return;
    const clamped =
      !this.enabled || kineticEnergyNorm <= 0.002
        ? 0
        : Math.min(MAX_ROLLING_BED_GAIN, Math.max(0, kineticEnergyNorm) * MAX_ROLLING_BED_GAIN);
    try {
      const now = this.ctx.currentTime;
      if (typeof this.rollingGain.gain.setTargetAtTime === 'function') {
        this.rollingGain.gain.setTargetAtTime(clamped, now, 0.045);
      } else {
        this.rollingGain.gain.setValueAtTime(clamped, now);
      }
    } catch {
      // Bỏ qua trong môi trường hạn chế
    }
  }

  /**
   * Định tuyến âm thanh qua StereoPannerNode (-0.85..+0.85) trước khi vào Master Gain -> Compressor.
   * An toàn khi trình duyệt hoặc môi trường test không cung cấp `createStereoPanner`.
   */
  private connectWithPan(ctx: AudioContext, source: AudioNode, pan = 0): void {
    if (!this.masterGain) return;
    const clampedPan = Math.max(-0.85, Math.min(0.85, Number.isFinite(pan) ? pan : 0));
    if (Math.abs(clampedPan) > 0.01 && typeof ctx.createStereoPanner === 'function') {
      try {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(clampedPan, ctx.currentTime);
        source.connect(panner);
        panner.connect(this.masterGain);
        return;
      } catch {
        // Fallback nếu createStereoPanner lỗi
      }
    }
    source.connect(this.masterGain);
  }

  /**
   * 1. Tiếng đầu cơ chạm bi cái (biến thiên theo cường độ xoáy / lơ phấn):
   * - Xung triangle gỗ phong trầm 148Hz -> 56Hz (0.058s)
   * - Tiếng 'tách' đầu da phủ lơ phấn qua bandpass (2400Hz -> 4200Hz mạnh dần khi đánh xoáy sâu).
   */
  public playCueStrike(power: number, pan = 0, spinMag = 0): boolean {
    if (!this.enabled) return false;
    const ctx = this.unlock();
    if (!ctx || !this.masterGain) return false;

    const clamped = Math.max(0.12, Math.min(1, power));
    const clampedSpin = Math.max(0, Math.min(1, Number.isFinite(spinMag) ? spinMag : 0));
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(148 - clampedSpin * 16, now);
      osc.frequency.exponentialRampToValueAtTime(56, now + 0.058);

      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.linearRampToValueAtTime(0.34 * clamped, now + 0.0035);
      oscGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.06);

      osc.connect(oscGain);
      this.connectWithPan(ctx, oscGain, pan);
      osc.start(now);
      osc.stop(now + 0.064);

      if (this.noiseBuffer && typeof ctx.createBufferSource === 'function') {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(2400 + clampedSpin * 1850, now);
        bandpass.Q.setValueAtTime(2.8 - clampedSpin * 0.6, now);

        const noiseGain = ctx.createGain();
        const chalkPeak = (0.16 + clampedSpin * 0.14) * clamped;
        const chalkDur = 0.022 + clampedSpin * 0.014;
        noiseGain.gain.setValueAtTime(0.0001, now);
        noiseGain.gain.linearRampToValueAtTime(chalkPeak, now + 0.002);
        noiseGain.gain.exponentialRampToValueAtTime(0.0008, now + chalkDur);

        noise.connect(bandpass);
        bandpass.connect(noiseGain);
        this.connectWithPan(ctx, noiseGain, pan);
        noise.start(now);
        noise.stop(now + chalkDur + 0.004);
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * 2. Tiếng hai viên bi nhựa Phenolic Aramith va chạm sắc đanh (cộng hưởng 3.45–4.42 kHz + transient click)
   * & Âm thanh phá bi đa thanh khi >= 4 va chạm trong 85ms.
   */
  public playBallClack(impactSpeed: number, pan = 0): boolean {
    const nowMs = this.nowMs();
    this.recentClackTimes = this.recentClackTimes.filter(
      (t) => nowMs - t <= BREAK_CLUSTER_WINDOW_MS,
    );
    const isBreakScatter = this.recentClackTimes.length >= 3;
    const minCooldown = isBreakScatter ? BREAK_CLUSTER_COOLDOWN_MS : BALL_CLACK_COOLDOWN_MS;
    if (nowMs - this.lastClackMs < minCooldown) {
      return false;
    }
    this.lastClackMs = nowMs;
    this.recentClackTimes.push(nowMs);

    if (!this.enabled) return false;
    const ctx = this.unlock();
    if (!ctx || !this.masterGain) return false;

    const clamped = Math.max(0.08, Math.min(1, impactSpeed));
    const now = ctx.currentTime;
    const pitchJitter = isBreakScatter ? 0.93 + Math.random() * 0.14 : 0.985 + Math.random() * 0.03;
    const stereoPan = isBreakScatter
      ? Math.max(-0.85, Math.min(0.85, pan + (Math.random() - 0.5) * 0.52))
      : pan;

    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const bodyFilter = ctx.createBiquadFilter();
      const clackGain = ctx.createGain();

      // Cộng hưởng kép nhựa phenolic đặc (3.45 kHz + 4.42 kHz) tắt nhanh 22ms
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(3450 * pitchJitter, now);
      osc1.frequency.exponentialRampToValueAtTime(2980 * pitchJitter, now + 0.022);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(4420 * pitchJitter, now);
      osc2.frequency.exponentialRampToValueAtTime(3720 * pitchJitter, now + 0.02);

      bodyFilter.type = 'bandpass';
      bodyFilter.frequency.setValueAtTime(3850 * pitchJitter, now);
      bodyFilter.Q.setValueAtTime(2.4, now);

      const peakGain = (isBreakScatter ? 0.24 : 0.3) * clamped;
      clackGain.gain.setValueAtTime(0.0001, now);
      clackGain.gain.linearRampToValueAtTime(peakGain, now + 0.0012);
      clackGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.024);

      osc1.connect(bodyFilter);
      osc2.connect(bodyFilter);
      bodyFilter.connect(clackGain);
      this.connectWithPan(ctx, clackGain, stereoPan);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.027);
      osc2.stop(now + 0.027);

      if (this.noiseBuffer && typeof ctx.createBufferSource === 'function') {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(6200 * pitchJitter, now);

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.0001, now);
        nGain.gain.linearRampToValueAtTime(0.2 * clamped, now + 0.001);
        nGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.011);

        noise.connect(highpass);
        highpass.connect(nGain);
        this.connectWithPan(ctx, nGain, stereoPan);
        noise.start(now);
        noise.stop(now + 0.014);
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * 3. Tiếng bật băng nỉ êm trầm (95Hz -> 48Hz).
   */
  public playCushionBounce(impactSpeed: number, pan = 0): boolean {
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
      this.connectWithPan(ctx, gain, pan);

      osc.start(now);
      osc.stop(now + 0.085);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 4. Tiếng bi rơi hốc da êm sâu + nốt chuông Ngũ cung theo combo.
   */
  public playPocketDrop(comboCount: number, pan = 0): boolean {
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
      // 2 nhịp rơi vào hốc da êm sâu ('thud-thud' lowpass 360Hz, lệch 60ms)
      for (const [idx, delaySec] of [
        [0, 0],
        [1, 0.06],
      ] as const) {
        const leatherOsc = ctx.createOscillator();
        const leatherFilter = ctx.createBiquadFilter();
        const leatherGain = ctx.createGain();
        const startT = now + delaySec;

        leatherOsc.type = 'triangle';
        leatherOsc.frequency.setValueAtTime(idx === 0 ? 115 : 96, startT);
        leatherOsc.frequency.exponentialRampToValueAtTime(46, startT + 0.062);

        leatherFilter.type = 'lowpass';
        leatherFilter.frequency.setValueAtTime(360, startT);

        leatherGain.gain.setValueAtTime(0.0001, startT);
        leatherGain.gain.linearRampToValueAtTime(idx === 0 ? 0.24 : 0.17, startT + 0.005);
        leatherGain.gain.exponentialRampToValueAtTime(0.0008, startT + 0.068);

        leatherOsc.connect(leatherFilter);
        leatherFilter.connect(leatherGain);
        this.connectWithPan(ctx, leatherGain, pan);
        leatherOsc.start(startT);
        leatherOsc.stop(startT + 0.072);
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
      this.connectWithPan(ctx, chimeGain, pan);

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
   * 7. Tiếng "lắc miệng lỗ" (Pocket Jaw / Facing Rattle) gọn, có độ đục gỗ & da khác hẳn băng cao su dài.
   */
  public playJawRattle(impactSpeed: number, pan = 0): boolean {
    const nowMs = this.nowMs();
    if (nowMs - this.lastJawMs < 22) {
      return false;
    }
    this.lastJawMs = nowMs;

    if (!this.enabled) return false;
    const ctx = this.unlock();
    if (!ctx || !this.masterGain) return false;

    const clamped = Math.max(0.1, Math.min(1, impactSpeed));
    const now = ctx.currentTime;

    try {
      const clickOsc = ctx.createOscillator();
      const bodyOsc = ctx.createOscillator();
      const gain = ctx.createGain();

      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(1180, now);
      clickOsc.frequency.exponentialRampToValueAtTime(640, now + 0.024);

      bodyOsc.type = 'sine';
      bodyOsc.frequency.setValueAtTime(540, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(240, now + 0.036);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.22 * clamped, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0007, now + 0.038);

      clickOsc.connect(gain);
      bodyOsc.connect(gain);
      this.connectWithPan(ctx, gain, pan);

      clickOsc.start(now);
      bodyOsc.start(now);
      clickOsc.stop(now + 0.04);
      bodyOsc.stop(now + 0.04);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 8. Tiếng bi lạch cạch nhỏ khi lăn chạm nhau trong máng hồi bi cơ khí bên phải bàn (mặc định pan = +0.82).
   */
  public playMarbleRoll(intensity = 0.5, pan = 0.82): boolean {
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
      this.connectWithPan(ctx, gain, pan);
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

export function playCueStrike(power: number, pan = 0, spinMag = 0): boolean {
  return billiardAudio.playCueStrike(power, pan, spinMag);
}

export function playBallClack(impactSpeed: number, pan = 0): boolean {
  return billiardAudio.playBallClack(impactSpeed, pan);
}

export function playCushionBounce(impactSpeed: number, pan = 0): boolean {
  return billiardAudio.playCushionBounce(impactSpeed, pan);
}

export function playJawRattle(impactSpeed: number, pan = 0): boolean {
  return billiardAudio.playJawRattle(impactSpeed, pan);
}

export function playPocketDrop(comboCount: number, pan = 0): boolean {
  return billiardAudio.playPocketDrop(comboCount, pan);
}

export function playRackClear(): boolean {
  return billiardAudio.playRackClear();
}

export function playTrickShotReward(kind: 'bank' | 'double' | 'combo' = 'bank'): boolean {
  return billiardAudio.playTrickShotReward(kind);
}

export function playMarbleRoll(intensity = 0.5, pan = 0.82): boolean {
  return billiardAudio.playMarbleRoll(intensity, pan);
}

export function updateBilliardRollingSound(kineticEnergyNorm: number): void {
  billiardAudio.updateRollingNoise(kineticEnergyNorm);
}
