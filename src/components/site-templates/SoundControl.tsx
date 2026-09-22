"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SOUNDS } from "@/lib/wizard-options";
import styles from "./site.module.css";

type Props = {
  soundId: string;
};

/** Subtle optional ambience via Web Audio — never autoplays. */
export default function SoundControl({ soundId }: Props) {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode } | null>(
    null
  );

  const label = SOUNDS.find((s) => s.id === soundId)?.label ?? "Som";

  const stop = useCallback(() => {
    const nodes = nodesRef.current;
    const ctx = ctxRef.current;
    if (nodes && ctx) {
      try {
        nodes.gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        window.setTimeout(() => {
          try {
            nodes.osc.stop();
          } catch {
            /* already stopped */
          }
          nodesRef.current = null;
        }, 400);
      } catch {
        nodesRef.current = null;
      }
    }
    setOn(false);
  }, []);

  const start = useCallback(async () => {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = ctxRef.current ?? new AudioCtx();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") await ctx.resume();

    if (nodesRef.current) return;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    // Soft low pad — different seed per soundId without needing assets
    const seed = soundId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    osc.type = "sine";
    osc.frequency.value = 90 + (seed % 40);
    filter.type = "lowpass";
    filter.frequency.value = 280 + (seed % 120);
    gain.gain.value = 0.0001;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.018, ctx.currentTime + 0.6);

    nodesRef.current = { osc, gain, filter };
    setOn(true);
  }, [soundId]);

  useEffect(() => {
    return () => {
      try {
        nodesRef.current?.osc.stop();
      } catch {
        /* ignore */
      }
      void ctxRef.current?.close();
    };
  }, []);

  return (
    <button
      type="button"
      className={styles.soundControl}
      aria-pressed={on}
      aria-label={on ? `Desligar ${label}` : `Ligar ${label} (sem autoplay)`}
      onClick={() => {
        if (on) stop();
        else void start();
      }}
    >
      {on ? "Som ligado" : "Som"}
    </button>
  );
}
