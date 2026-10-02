import type { Album } from "./catalog";

/** A quiet original synth loop; no song files, samples, or external audio. */
export class RecordSound {
  private readonly context = new AudioContext();
  private readonly output = this.context.createGain();
  private readonly voices = new Set<OscillatorNode>();
  private timer: ReturnType<typeof setInterval> | undefined;
  private generation = 0;

  constructor() {
    this.output.gain.value = 0.075;
    this.output.connect(this.context.destination);
  }

  async unlock() {
    await this.context.resume();
  }

  async start(album: Album, trackIndex: number, offset: number) {
    this.stop();
    const generation = this.generation;
    await this.context.resume();
    if (generation !== this.generation) return;

    const beatLength = 60 / album.tempo;
    let beat = Math.floor(offset / beatLength);
    let nextBeat = this.context.currentTime + 0.04;

    const schedule = () => {
      while (nextBeat < this.context.currentTime + 0.2) {
        const note = album.notes[(beat + trackIndex * 2) % album.notes.length];
        this.note(note, nextBeat, beatLength * 1.65, "sine", 0.45);
        if (beat % 4 === 0)
          this.note(note - 24, nextBeat, beatLength * 3.4, "triangle", 0.3);
        if (beat % 2 === 1)
          this.note(
            note + 12,
            nextBeat + beatLength * 0.5,
            beatLength * 0.8,
            "sine",
            0.12,
          );
        nextBeat += beatLength;
        beat += 1;
      }
    };
    schedule();
    this.timer = setInterval(schedule, 100);
  }

  stop() {
    this.generation += 1;
    clearInterval(this.timer);
    this.timer = undefined;
    for (const voice of this.voices) voice.stop();
    this.voices.clear();
  }

  close() {
    this.stop();
    void this.context.close();
  }

  private note(
    midi: number,
    when: number,
    duration: number,
    type: OscillatorType,
    volume: number,
  ) {
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(volume, when + 0.025);
    envelope.gain.exponentialRampToValueAtTime(0.001, when + duration);
    oscillator.connect(envelope);
    envelope.connect(this.output);
    this.voices.add(oscillator);
    oscillator.onended = () => {
      this.voices.delete(oscillator);
      oscillator.disconnect();
      envelope.disconnect();
    };
    oscillator.start(when);
    oscillator.stop(when + duration + 0.05);
  }
}
