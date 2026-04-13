export class AudioVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private analyser: AnalyserNode | null = null;
  private audioCtx: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array = new Uint8Array(0);
  private animationId: number = 0;
  private connected = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  connect(audioEl: HTMLAudioElement): void {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }

    if (this.connected) return;

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8; 

    this.source = this.audioCtx.createMediaElementSource(audioEl);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.connected = true;
  }

  resume(): void {
    this.audioCtx?.resume();
  }

  start(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.draw();
  }

  stop(): void {
    cancelAnimationFrame(this.animationId);
    this.drawIdle();
  }

  private draw = (): void => {
    this.animationId = requestAnimationFrame(this.draw);

    if (!this.analyser) {
      this.drawIdle();
      return;
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    const W = this.canvas.width;
    const H = this.canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(W, H) / 2 - 8;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * dpr;
    this.canvas.height = this.canvas.offsetHeight * dpr;
    this.ctx.scale(dpr, dpr);

    const cw = this.canvas.offsetWidth;
    const ch = this.canvas.offsetHeight;
    const ccx = cw / 2;
    const ccy = ch / 2;
    const cr = Math.min(cw, ch) / 2 - 8;

    this.ctx.clearRect(0, 0, cw, ch);

    // --- Círculo exterior ---
    this.ctx.beginPath();
    this.ctx.arc(ccx, ccy, cr, 0, Math.PI * 2);
    this.ctx.strokeStyle = "#C8A96E";
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(ccx, ccy, cr - 2, 0, Math.PI * 2);
    this.ctx.clip();

    const usedBins = 32;
    const lineWidth = (cr * 2);
    const segmentW = lineWidth / (usedBins - 1);

    this.ctx.beginPath();
    for (let i = 0; i < usedBins; i++) {
      const amplitude = this.dataArray[i] / 255; 
      const maxDisplace = cr * 0.65;
      const y = ccy + (amplitude - 0.5) * maxDisplace * 2;
      const x = ccx - cr + i * segmentW;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        const prevX = ccx - cr + (i - 1) * segmentW;
        const prevAmp = this.dataArray[i - 1] / 255;
        const prevY = ccy + (prevAmp - 0.5) * maxDisplace * 2;
        const cpX = (prevX + x) / 2;
        this.ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    }

    this.ctx.strokeStyle = "#C8A96E";
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = "#C8A96E";
    this.ctx.shadowBlur = 6;
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    this.ctx.restore();
  };

  private drawIdle(): void {
    const cw = this.canvas.offsetWidth || 200;
    const ch = this.canvas.offsetHeight || 200;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = cw * dpr;
    this.canvas.height = ch * dpr;
    this.ctx.scale(dpr, dpr);

    const ccx = cw / 2;
    const ccy = ch / 2;
    const cr = Math.min(cw, ch) / 2 - 8;

    this.ctx.clearRect(0, 0, cw, ch);

    this.ctx.beginPath();
    this.ctx.arc(ccx, ccy, cr, 0, Math.PI * 2);
    this.ctx.strokeStyle = "#C8A96E66";
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(ccx - cr + 8, ccy);
    this.ctx.lineTo(ccx + cr - 8, ccy);
    this.ctx.strokeStyle = "#C8A96E66";
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
  }
}
