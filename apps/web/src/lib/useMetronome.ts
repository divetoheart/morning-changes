import { useCallback, useEffect, useRef, useState } from 'react';

function clampTempo(value: number) {
  return Math.max(35, Math.min(240, Math.round(value)));
}

export function useMetronome(initialTempo: number, onTempoChange: (tempo: number) => void) {
  const [tempo, setTempoState] = useState(clampTempo(initialTempo));
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const contextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const beatRef = useRef(0);
  const tapsRef = useRef<number[]>([]);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
    setBeat(0);
    beatRef.current = 0;
  }, []);

  const click = useCallback((accent: boolean) => {
    const Context = window.AudioContext ?? window.webkitAudioContext;
    if (!Context) return;
    const context = contextRef.current ?? new Context();
    contextRef.current = context;
    if (context.state === 'suspended') void context.resume();

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = accent ? 1120 : 760;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.13, context.currentTime + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.055);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.065);
  }, []);

  const start = useCallback(() => {
    stop();
    const pulse = () => {
      const nextBeat = beatRef.current;
      click(nextBeat === 0);
      setBeat(nextBeat);
      beatRef.current = (nextBeat + 1) % 4;
    };
    pulse();
    timerRef.current = window.setInterval(pulse, 60_000 / tempo);
    setPlaying(true);
  }, [click, stop, tempo]);

  const toggle = useCallback(() => {
    if (playing) stop();
    else start();
  }, [playing, start, stop]);

  const setTempo = useCallback((value: number) => {
    const next = clampTempo(value);
    setTempoState(next);
    onTempoChange(next);
  }, [onTempoChange]);

  const tapTempo = useCallback(() => {
    const now = Date.now();
    tapsRef.current = [...tapsRef.current, now].filter(tap => now - tap < 2_500);
    if (tapsRef.current.length < 2) return;
    const gaps = tapsRef.current.slice(1).map((tap, index) => tap - tapsRef.current[index]);
    const average = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    setTempo(60_000 / average);
  }, [setTempo]);

  useEffect(() => () => stop(), [stop]);
  useEffect(() => {
    if (!playing) return;
    start();
  }, [playing, start, tempo]);

  return { tempo, playing, beat, setTempo, tapTempo, toggle, stop };
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
