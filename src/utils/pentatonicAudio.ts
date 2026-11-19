/**
 * BỘ TỔNG HỢP ÂM THANH NGŨ CUNG WEB AUDIO API (PENTATONIC AUDIO ENGINE)
 * - Tổng hợp âm thanh thuần toán học bằng Web Audio API (Zero external MP3/WAV).
 * - Thang âm Ngũ cung Rê trưởng (D-Major Pentatonic: D4, E4, G4, A4, B4, D5) 2 quãng tám trong trẻo.
 * - Master Bus: GainNode (0.26) -> DynamicsCompressorNode -> destination.
 * - Hỗ trợ 2 âm sắc: 'pluck' (Đàn Tranh / Dây Đồng) và 'chime' (Chuông Gió Khoáng Thạch).
 * - Giới hạn đa âm (polyphony <= 12) và cooldown chống chồng âm.
 */

export type PentatonicVoiceMode = 'pluck' | 'chime';

export const PENTATONIC_STRING_NOTES = ['D4', 'E4', 'G4', 'A4', 'B4', 'D5'] as const;
export type PentatonicNoteLabel = (typeof PENTATONIC_STRING_NOTES)[number];

export const PENTATONIC_STRING_FREQS: readonly number[] = [
  293.66, // D4
  329.63, // E4
  392.0, // G4
  440.0, // A4
  493.88, // B4
  587.33, // D5
] as const;

export const PENTATONIC_PEG_FREQS: readonly number[] = [
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.0, // A5
  987.77, // B5
  1174.66, // D6
] as const;

export const MASTER_BUS_GAIN = 0.26;
export const MAX_POLYPHONY = 12;
export const STRING_COOLDOWN_MS = 55;
export const MARBLE_CLICK_COOLDOWN_MS = 40;
export const PEG_COOLDOWN_MS = 22;

interface WebkitWindow extends Window {
  readonly webkitAudioContext?: typeof AudioContext;
}

class PentatonicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeVoiceEndTimes: number[] = [];
  private stringLastTriggerMs: Map<number, number> = new Map();
  private pegLastTriggerMs: Map<number, number> = new Map();
  private lastMarbleClickMs = -9999;

  private nowMs(): number {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }
    return Date.now();
  }

  /**
   * Khởi tạo lười (Lazy Init) và đánh thức AudioContext ngay trong sự kiện tương tác người dùng.
   */
  public unlock(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    const AudioCtx = window.AudioContext ?? (window as unknown as WebkitWindow).webkitAudioContext;
    if (!AudioCtx) return null;

    try {
      if (!this.ctx) {
        const ctx = new AudioCtx();
        const master = ctx.createGain();
        master.gain.setValueAtTime(MASTER_BUS_GAIN, ctx.currentTime);

        if (typeof ctx.createDynamicsCompressor === 'function') {
          const comp = ctx.createDynamicsCompressor();
          comp.threshold.setValueAtTime(-18, ctx.currentTime);
          comp.knee.setValueAtTime(18, ctx.currentTime);
          comp.ratio.setValueAtTime(6, ctx.currentTime);
          comp.attack.setValueAtTime(0.003, ctx.currentTime);
          comp.release.setValueAtTime(0.18, ctx.currentTime);
          master.connect(comp);
          comp.connect(ctx.destination);
        } else {
          master.connect(ctx.destination);
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

  private pruneVoices(currentTimeSec: number): void {
    this.activeVoiceEndTimes = this.activeVoiceEndTimes.filter((endSec) => endSec > currentTimeSec);
  }

  private tryAllocateVoice(currentTimeSec: number, durationSec: number): boolean {
    this.pruneVoices(currentTimeSec);
    if (this.activeVoiceEndTimes.length >= MAX_POLYPHONY) {
      return false;
    }
    this.activeVoiceEndTimes.push(currentTimeSec + durationSec);
    return true;
  }

  public getActiveVoiceCount(): number {
    if (this.ctx) {
      this.pruneVoices(this.ctx.currentTime);
    }
    return this.activeVoiceEndTimes.length;
  }

  /**
   * Gảy dây đàn ngũ cung theo chỉ số dây (0..5), vận tốc chuẩn hóa (0..1) và chế độ âm sắc ('pluck' | 'chime').
   */
  public playStringPluck(
    stringIndex: number,
    velocity: number,
    mode: PentatonicVoiceMode = 'pluck',
  ): boolean {
    const safeIdx =
      ((Math.floor(stringIndex) % PENTATONIC_STRING_FREQS.length) +
        PENTATONIC_STRING_FREQS.length) %
      PENTATONIC_STRING_FREQS.length;
    const nowMs = this.nowMs();
    const lastMs = this.stringLastTriggerMs.get(safeIdx) ?? -9999;
    if (nowMs - lastMs < STRING_COOLDOWN_MS) {
      return false;
    }

    const ctx = this.unlock();
    if (!ctx || !this.masterGain) {
      this.stringLastTriggerMs.set(safeIdx, nowMs);
      return false;
    }

    const durationSec = mode === 'pluck' ? 1.1 : 1.6;
    const now = ctx.currentTime;
    if (!this.tryAllocateVoice(now, durationSec)) {
      return false;
    }
    this.stringLastTriggerMs.set(safeIdx, nowMs);

    const clampedVel = Math.max(0.08, Math.min(1, velocity));
    const f0 = PENTATONIC_STRING_FREQS[safeIdx] ?? 293.66;

    try {
      if (mode === 'pluck') {
        // 'pluck' (Đàn Tranh / Dây Đồng): triangle (f0) + sine (2*f0) -> BiquadFilterNode lowpass (2800Hz -> 450Hz trong 0.25s), tắt dần 1.1s
        const oscFundamental = ctx.createOscillator();
        const oscHarmonic = ctx.createOscillator();
        const harmonicGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const voiceGain = ctx.createGain();

        oscFundamental.type = 'triangle';
        oscFundamental.frequency.setValueAtTime(f0, now);

        oscHarmonic.type = 'sine';
        oscHarmonic.frequency.setValueAtTime(f0 * 2, now);
        harmonicGain.gain.setValueAtTime(0.32 * clampedVel, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2800, now);
        filter.frequency.exponentialRampToValueAtTime(450, now + 0.25);
        filter.Q.setValueAtTime(1.8, now);

        const peakGain = 0.22 * clampedVel;
        voiceGain.gain.setValueAtTime(0.0001, now);
        voiceGain.gain.linearRampToValueAtTime(peakGain, now + 0.012);
        voiceGain.gain.exponentialRampToValueAtTime(0.0008, now + 1.1);

        oscFundamental.connect(filter);
        oscHarmonic.connect(harmonicGain);
        harmonicGain.connect(filter);
        filter.connect(voiceGain);
        voiceGain.connect(this.masterGain);

        oscFundamental.start(now);
        oscHarmonic.start(now);
        oscFundamental.stop(now + 1.12);
        oscHarmonic.stop(now + 1.12);
      } else {
        // 'chime' (Chuông Gió Khoáng Thạch): sine (f0) + họa âm chuông 2.756*f0 + 5.4*f0 nhẹ, ADSR tắt dần 1.6s
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        const gain3 = ctx.createGain();
        const voiceGain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(f0, now);
        gain1.gain.setValueAtTime(0.68, now);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(f0 * 2.756, now);
        gain2.gain.setValueAtTime(0.22, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(f0 * 5.4, now);
        gain3.gain.setValueAtTime(0.08, now);
        gain3.gain.exponentialRampToValueAtTime(0.0008, now + 0.55);

        const peakGain = 0.2 * clampedVel;
        voiceGain.gain.setValueAtTime(0.0001, now);
        voiceGain.gain.linearRampToValueAtTime(peakGain, now + 0.016);
        voiceGain.gain.exponentialRampToValueAtTime(0.0006, now + 1.6);

        osc1.connect(gain1);
        osc2.connect(gain2);
        osc3.connect(gain3);
        gain1.connect(voiceGain);
        gain2.connect(voiceGain);
        gain3.connect(voiceGain);
        voiceGain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        osc1.stop(now + 1.62);
        osc2.stop(now + 1.0);
        osc3.stop(now + 0.6);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Tiếng 'tách' đồng thau siêu ngắn (0.045s, gain <= 0.07) khi viên bi chạm chốt đồng.
   */
  public playPegTap(pegIndex: number, velocity: number): boolean {
    const safeIdx =
      ((Math.floor(pegIndex) % PENTATONIC_PEG_FREQS.length) + PENTATONIC_PEG_FREQS.length) %
      PENTATONIC_PEG_FREQS.length;
    const nowMs = this.nowMs();
    const lastMs = this.pegLastTriggerMs.get(safeIdx) ?? -9999;
    if (nowMs - lastMs < PEG_COOLDOWN_MS) {
      return false;
    }

    const ctx = this.unlock();
    if (!ctx || !this.masterGain) {
      this.pegLastTriggerMs.set(safeIdx, nowMs);
      return false;
    }

    const now = ctx.currentTime;
    if (!this.tryAllocateVoice(now, 0.05)) {
      return false;
    }
    this.pegLastTriggerMs.set(safeIdx, nowMs);

    const clampedVel = Math.max(0.1, Math.min(1, velocity));
    const freq = PENTATONIC_PEG_FREQS[safeIdx] ?? 880.0;
    const peakGain = Math.min(0.07, 0.022 + 0.048 * clampedVel);

    try {
      const osc = ctx.createOscillator();
      const tapGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 1.15, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.045);

      tapGain.gain.setValueAtTime(0.0001, now);
      tapGain.gain.linearRampToValueAtTime(peakGain, now + 0.004);
      tapGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.045);

      osc.connect(tapGain);
      tapGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.048);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Tiếng va chạm sỏi/ngọc dịu nhẹ khi 2 viên bi khoáng thạch va nhau mạnh (cooldown 40ms).
   */
  public playMarbleClick(velocity: number): boolean {
    const nowMs = this.nowMs();
    if (nowMs - this.lastMarbleClickMs < MARBLE_CLICK_COOLDOWN_MS) {
      return false;
    }

    const ctx = this.unlock();
    if (!ctx || !this.masterGain) {
      this.lastMarbleClickMs = nowMs;
      return false;
    }

    const now = ctx.currentTime;
    if (!this.tryAllocateVoice(now, 0.04)) {
      return false;
    }
    this.lastMarbleClickMs = nowMs;

    const clampedVel = Math.max(0.12, Math.min(1, velocity));
    const peakGain = Math.min(0.06, 0.018 + 0.042 * clampedVel);

    try {
      const osc = ctx.createOscillator();
      const clickGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1480, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.032);

      clickGain.gain.setValueAtTime(0.0001, now);
      clickGain.gain.linearRampToValueAtTime(peakGain, now + 0.003);
      clickGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.034);

      osc.connect(clickGain);
      clickGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.036);
      return true;
    } catch {
      return false;
    }
  }
}

export const pentatonicAudio = new PentatonicAudioEngine();

export function unlockPentatonicAudio(): AudioContext | null {
  return pentatonicAudio.unlock();
}

export function playStringPluck(
  stringIndex: number,
  velocity: number,
  mode: PentatonicVoiceMode = 'pluck',
): boolean {
  return pentatonicAudio.playStringPluck(stringIndex, velocity, mode);
}

export function playPegTap(pegIndex: number, velocity: number): boolean {
  return pentatonicAudio.playPegTap(pegIndex, velocity);
}

export function playMarbleClick(velocity: number): boolean {
  return pentatonicAudio.playMarbleClick(velocity);
}
