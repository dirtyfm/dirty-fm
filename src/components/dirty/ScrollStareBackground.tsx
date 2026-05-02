"use client";

import { useEffect, useState } from "react";

const SCROLL_IDLE_DELAY_MS = 80;

export function ScrollStareBackground() {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let scrollTimer: number | undefined;

    function stopWatching() {
      if (scrollTimer) {
        window.clearTimeout(scrollTimer);
        scrollTimer = undefined;
      }

      setIsScrolling(false);
    }

    function handleScroll() {
      if (motionQuery.matches) {
        stopWatching();
        return;
      }

      setIsScrolling(true);

      if (scrollTimer) {
        window.clearTimeout(scrollTimer);
      }

      scrollTimer = window.setTimeout(() => {
        setIsScrolling(false);
        scrollTimer = undefined;
      }, SCROLL_IDLE_DELAY_MS);
    }

    function handleMotionPreferenceChange() {
      if (motionQuery.matches) {
        stopWatching();
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    motionQuery.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      motionQuery.removeEventListener("change", handleMotionPreferenceChange);
      stopWatching();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="scroll-stare-background"
      data-scrolling={isScrolling ? "true" : "false"}
    >
      <span className="scroll-stare-face scroll-stare-face-one" />
      <span className="scroll-stare-face scroll-stare-face-two" />
      <span className="scroll-stare-face scroll-stare-face-three" />
    </div>
  );
}
