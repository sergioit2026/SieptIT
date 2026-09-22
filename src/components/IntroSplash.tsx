"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./IntroSplash.module.css";

type IntroSplashProps = {
  onComplete: () => void;
};

const SIEPT = ["S", "i", "e", "p", "t"] as const;
const IT = ["I", "T"] as const;
const TAGLINE = "Identidade digital. Desenvolvimento com propósito.";
const COUNT_MS = 820;
const LETTER_MS = 145;
const IT_LETTER_MS = 240;
const HOLD_MS = 1150;
const FADE_MS = 720;

type Phase =
  | "countdown"
  | "brand"
  | "exit"
  | "done";

export default function IntroSplash({ onComplete }: IntroSplashProps) {
  const [phase, setPhase] = useState<Phase>("countdown");
  const [count, setCount] = useState(5);
  const [countPulse, setCountPulse] = useState(true);
  const [sieptCount, setSieptCount] = useState(0);
  const [itCount, setItCount] = useState(0);
  const [showTagline, setShowTagline] = useState(false);
  const [hide, setHide] = useState(false);

  const assetsReady = useRef(false);
  const countdownDone = useRef(false);
  const revealStarted = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const timers: number[] = [];
    let cancelled = false;

    if (reduced) {
      setPhase("brand");
      setSieptCount(SIEPT.length);
      setItCount(IT.length);
      setShowTagline(true);
      timers.push(
        window.setTimeout(() => {
          setHide(true);
          setPhase("exit");
        }, 500)
      );
      timers.push(
        window.setTimeout(() => {
          setPhase("done");
          onCompleteRef.current();
        }, 750)
      );
      return () => timers.forEach((t) => window.clearTimeout(t));
    }

    const markAssetsReady = () => {
      assetsReady.current = true;
      tryReveal();
    };

    const onLoad = () => markAssetsReady();

    if (document.readyState === "complete") {
      markAssetsReady();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    void (async () => {
      try {
        if (document.fonts?.ready) await document.fonts.ready;
      } catch {
        /* ignore */
      }
      if (!cancelled) markAssetsReady();
    })();

    // Never wait forever for assets
    timers.push(window.setTimeout(markAssetsReady, 5500));

    function finishAndExit() {
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setHide(true);
          setPhase("exit");
          timers.push(
            window.setTimeout(() => {
              if (cancelled) return;
              setPhase("done");
              onCompleteRef.current();
            }, FADE_MS)
          );
        }, HOLD_MS)
      );
    }

    function runBrandSequence() {
      setPhase("brand");
      let i = 0;
      const nextSiept = () => {
        if (cancelled) return;
        i += 1;
        setSieptCount(i);
        if (i < SIEPT.length) {
          timers.push(window.setTimeout(nextSiept, LETTER_MS));
        } else {
          timers.push(
            window.setTimeout(() => {
              if (cancelled) return;
              let j = 0;
              const nextIt = () => {
                if (cancelled) return;
                j += 1;
                setItCount(j);
                if (j < IT.length) {
                  timers.push(window.setTimeout(nextIt, IT_LETTER_MS));
                } else {
                  timers.push(
                    window.setTimeout(() => {
                      if (cancelled) return;
                      setShowTagline(true);
                      finishAndExit();
                    }, 400)
                  );
                }
              };
              nextIt();
            }, 300)
          );
        }
      };
      nextSiept();
    }

    function tryReveal() {
      if (revealStarted.current || cancelled) return;
      if (!(countdownDone.current && assetsReady.current)) return;
      revealStarted.current = true;
      // brief beat after 0 fades
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          runBrandSequence();
        }, 380)
      );
    }

    // Countdown 5 → 4 → 3 → 2 → 1 → 0
    let n = 5;
    setCount(5);
    setCountPulse(true);

    const stepCount = () => {
      if (cancelled) return;
      setCountPulse(false);
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          n -= 1;
          setCount(n);
          setCountPulse(true);
          if (n === 0) {
            timers.push(
              window.setTimeout(() => {
                if (cancelled) return;
                setCountPulse(false);
                countdownDone.current = true;
                tryReveal();
              }, COUNT_MS)
            );
          } else {
            timers.push(window.setTimeout(stepCount, COUNT_MS));
          }
        }, 100)
      );
    };

    timers.push(window.setTimeout(stepCount, COUNT_MS));

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("load", onLoad);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`${styles.splash} ${hide ? styles.splashHidden : ""}`}
      aria-hidden={hide}
      role="presentation"
    >
      <div className={styles.inner}>
        {phase === "countdown" && (
          <div
            className={`${styles.countdown} ${
              countPulse ? styles.countdownVisible : styles.countdownOut
            }`}
            key={count}
          >
            {count}
          </div>
        )}

        {phase !== "countdown" && (
          <>
            <div className={styles.brandRow} aria-label="Siept IT">
              <span className={styles.siept}>
                {SIEPT.map((letter, i) => (
                  <span
                    key={`s-${i}`}
                    className={`${styles.letter} ${
                      i < sieptCount ? styles.letterIn : ""
                    }`}
                  >
                    {letter}
                  </span>
                ))}
              </span>
              <span className={styles.gap} aria-hidden="true">
                {"\u00A0"}
              </span>
              <span className={styles.it}>
                {IT.map((letter, i) => (
                  <span
                    key={`it-${i}`}
                    className={`${styles.itLetter} ${
                      i < itCount ? styles.itLetterIn : ""
                    }`}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            </div>
            <p
              className={`${styles.tagline} ${
                showTagline ? styles.taglineVisible : ""
              }`}
            >
              {TAGLINE}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
