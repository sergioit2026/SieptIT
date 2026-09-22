"use client";

import { useEffect, useState } from "react";
import type { IntroStyle } from "@/lib/site-config";
import styles from "./site.module.css";

type Props = {
  name: string;
  slogan: string;
  introStyle: IntroStyle;
  enabled: boolean;
  onDone: () => void;
};

export default function IntroOverlay({
  name,
  slogan,
  introStyle,
  enabled,
  onDone,
}: Props) {
  const [exit, setExit] = useState(false);
  const [gone, setGone] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      onDone();
      return;
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const hold = reduced ? 400 : 1600;
    const fade = reduced ? 200 : 550;
    const t1 = window.setTimeout(() => setExit(true), hold);
    const t2 = window.setTimeout(() => {
      setGone(true);
      onDone();
    }, hold + fade);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [enabled, onDone]);

  if (gone) return null;

  return (
    <div
      className={`${styles.intro} ${exit ? styles.exit : ""}`}
      data-style={introStyle}
      role="presentation"
      aria-hidden={exit}
    >
      <div>
        <p className={styles.eyebrow}>Bem-vindo</p>
        <h1 className={styles.introName}>{name || "O seu negócio"}</h1>
        {slogan ? <p className={styles.introSlogan}>{slogan}</p> : null}
      </div>
    </div>
  );
}
