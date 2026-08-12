export function playEmergencyAlarm(): void {
  if (typeof window === "undefined") return;

  try {
    // 1. Device Vibration API (for mobile smartphones)
    if ("vibrate" in navigator) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }

    // 2. Web Audio API Zero-Dependency Synthesizer
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const audioCtx = new AudioCtx();
    const now = audioCtx.currentTime;

    // Create dual-tone emergency siren pulses (High 880Hz / Low 660Hz)
    const tones = [
      { freq: 880, start: now, duration: 0.18 },
      { freq: 660, start: now + 0.2, duration: 0.18 },
      { freq: 880, start: now + 0.4, duration: 0.18 },
      { freq: 660, start: now + 0.6, duration: 0.25 },
    ];

    tones.forEach((tone) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(tone.freq, tone.start);

      gain.gain.setValueAtTime(0.15, tone.start);
      gain.gain.exponentialRampToValueAtTime(0.001, tone.start + tone.duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(tone.start);
      osc.stop(tone.start + tone.duration);
    });

    setTimeout(() => {
      if (audioCtx.state !== "closed") {
        audioCtx.close();
      }
    }, 1200);
  } catch (err) {
    console.warn("Could not play Web Audio API emergency alarm:", err);
  }
}
