"use client";

import { useEffect, useRef, type ReactNode } from "react";

const stampSubscribers = new Set<(bend: number) => void>();

let frameId = 0;
let lastTime = 0;
let lastScrollY = 0;
let bend = 0;
let bendVelocity = 0;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function renderStamps(time: number) {
  const elapsedFrames = clamp((time - lastTime) / 16.67, 0.4, 2.4);
  const currentScrollY = window.scrollY;
  const scrollDelta = currentScrollY - lastScrollY;
  const scrollVelocity = scrollDelta / elapsedFrames;
  const target = clamp(scrollVelocity * 0.16, -7, 7);

  bendVelocity += (target - bend) * 0.12;
  bendVelocity *= 0.82;
  bend += bendVelocity;

  if (Math.abs(scrollDelta) < 0.02 && Math.abs(bend) < 0.02 && Math.abs(bendVelocity) < 0.02) {
    bend = 0;
    bendVelocity = 0;
  }

  for (const subscriber of stampSubscribers) {
    subscriber(bend);
  }

  lastTime = time;
  lastScrollY = currentScrollY;
  frameId = window.requestAnimationFrame(renderStamps);
}

function subscribeToStampSpring(subscriber: (bend: number) => void) {
  stampSubscribers.add(subscriber);

  if (stampSubscribers.size === 1) {
    lastTime = performance.now();
    lastScrollY = window.scrollY;
    frameId = window.requestAnimationFrame(renderStamps);
  }

  return () => {
    stampSubscribers.delete(subscriber);

    if (stampSubscribers.size === 0) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
      bend = 0;
      bendVelocity = 0;
    }
  };
}

export type FloppyStampProps = {
  children: ReactNode;
  className: string;
};

export function FloppyStamp({ children, className }: FloppyStampProps) {
  const stampRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotionQuery.matches) {
      return undefined;
    }

    return subscribeToStampSpring((currentBend) => {
      if (!stampRef.current) {
        return;
      }

      const rotate = -1 + currentBend;
      const skew = currentBend * -0.45;
      const lift = Math.abs(currentBend) * -0.16;

      stampRef.current.style.transform = `translate3d(0, ${lift.toFixed(3)}px, 0) rotate(${rotate.toFixed(3)}deg) skewY(${skew.toFixed(3)}deg)`;
    });
  }, []);

  return (
    <div
      className={className}
      ref={stampRef}
      style={{ transform: "rotate(-1deg)", transformOrigin: "left center" }}
    >
      {children}
    </div>
  );
}
