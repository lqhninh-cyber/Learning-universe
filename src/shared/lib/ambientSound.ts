/**
 * Procedural Ambient Sound Generator sử dụng Web Audio API (Không cần tải file mp3 bên ngoài)
 * Tạo âm thanh sinh thái môi trường: tiếng nước suối róc rách và tiếng dế đêm rả rích.
 */
class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentTheme: 'day' | 'night' = 'night';
  private timerId: number | null = null;
  private streamSource: AudioBufferSourceNode | null = null;
  private dropIntervalId: number | null = null;

  private initContext() {
    if (typeof window === 'undefined') return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime); // Âm lượng 18% dịu nhẹ
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Tạo tiếng nước róc rách liên tục
  private createWaterStream() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(420, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const streamGain = this.ctx.createGain();
    streamGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(streamGain);
    streamGain.connect(this.masterGain);
    whiteNoise.start();
    this.streamSource = whiteNoise;

    // Giọt nước rơi ngẫu nhiên
    this.dropIntervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100 + Math.random() * 300, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.12);

      dropGain.gain.setValueAtTime(0.06, now);
      dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(dropGain);
      dropGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.13);
    }, 2800);
  }

  // Tạo tiếng dế đêm rả rích khi ở chế độ Đêm
  private triggerCricketChirp() {
    if (!this.ctx || !this.masterGain || this.currentTheme !== 'night') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const chirpGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(4800, now);

    // Xung nhấp nháy 3 nhịp dế kêu
    chirpGain.gain.setValueAtTime(0, now);
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.045;
      chirpGain.gain.setValueAtTime(0.025, t);
      chirpGain.gain.setValueAtTime(0, t + 0.025);
    }

    osc.connect(chirpGain);
    chirpGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public start(theme: 'day' | 'night') {
    this.initContext();
    this.currentTheme = theme;
    this.isPlaying = true;
    this.createWaterStream();

    this.timerId = window.setInterval(() => {
      if (this.currentTheme === 'night' && Math.random() > 0.4) {
        this.triggerCricketChirp();
      }
    }, 3500);

    return () => {
      this.stop();
    };
  }

  public updateTheme(theme: 'day' | 'night') {
    this.currentTheme = theme;
  }

  public stop() {
    this.isPlaying = false;
    if (this.streamSource) {
      try {
        this.streamSource.stop();
        this.streamSource.disconnect();
      } catch {
        // Bỏ qua nếu đã ngắt
      }
      this.streamSource = null;
    }
    if (this.dropIntervalId) {
      clearInterval(this.dropIntervalId);
      this.dropIntervalId = null;
    }
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.suspend();
      } catch {
        // Bỏ qua
      }
    }
  }

  public getStatus() {
    return this.isPlaying;
  }
}

export const ambientSound = new AmbientSoundEngine();
export default ambientSound;
