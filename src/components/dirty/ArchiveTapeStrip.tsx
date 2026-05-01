"use client";

import { useEffect, useRef } from "react";

const squareIndexes = Array.from({ length: 28 }, (_, index) => index);
const stripSubscribers = new Set<(offset: number, time: number) => void>();

let frameId = 0;
let lastTime = 0;
let lastScrollY = 0;
let offset = 0;
let springVelocity = 0;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSquareWeight(index: number) {
  const normalizedPosition = index / (squareIndexes.length - 1);
  const anchoredArc = Math.sin(normalizedPosition * Math.PI);

  return Math.pow(anchoredArc, 1.55);
}

function renderStrips(time: number) {
  const elapsedFrames = clamp((time - lastTime) / 16.67, 0.4, 2.4);
  const currentScrollY = window.scrollY;
  const scrollDelta = currentScrollY - lastScrollY;
  const scrollVelocity = scrollDelta / elapsedFrames;
  const target = clamp(-scrollVelocity * 1.55, -22, 22);

  springVelocity += (target - offset) * 0.115;
  springVelocity *= 0.84;
  offset += springVelocity;

  if (Math.abs(scrollDelta) < 0.02 && Math.abs(offset) < 0.02 && Math.abs(springVelocity) < 0.02) {
    offset = 0;
    springVelocity = 0;
  }

  for (const subscriber of stripSubscribers) {
    subscriber(offset, time);
  }

  lastTime = time;
  lastScrollY = currentScrollY;
  frameId = window.requestAnimationFrame(renderStrips);
}

function subscribeToTapeSpring(subscriber: (offset: number, time: number) => void) {
  stripSubscribers.add(subscriber);

  if (stripSubscribers.size === 1) {
    lastTime = performance.now();
    lastScrollY = window.scrollY;
    frameId = window.requestAnimationFrame(renderStrips);
  }

  return () => {
    stripSubscribers.delete(subscriber);

    if (stripSubscribers.size === 0) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
      offset = 0;
      springVelocity = 0;
    }
  };
}

export function ArchiveTapeStrip() {
  const squaresRef = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotionQuery.matches) {
      return undefined;
    }

    return subscribeToTapeSpring((currentOffset, time) => {
      for (const [index, square] of squaresRef.current.entries()) {
        if (!square) {
          continue;
        }

        const weight = getSquareWeight(index);
        const xJitter = Math.sin(time / 170 + index * 0.65) * Math.abs(currentOffset) * weight * 0.025;
        square.style.transform = `translate3d(${xJitter.toFixed(3)}px, ${(currentOffset * weight).toFixed(3)}px, 0)`;
      }
    });
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 -top-1 z-20 grid h-10 grid-cols-[repeat(28,minmax(0,1fr))] items-start overflow-visible px-4 pt-0.5 opacity-60"
      aria-hidden="true"
    >
      {squareIndexes.map((index) => (
        <span
          className="mx-auto block h-3 w-3 bg-dirty-yellow/40 will-change-transform"
          key={index}
          ref={(element) => {
            squaresRef.current[index] = element;
          }}
        />
      ))}
    </div>
  );
}
