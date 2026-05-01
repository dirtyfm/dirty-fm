"use client";

import { useEffect, useRef } from "react";

const squareIndexes = Array.from({ length: 38 }, (_, index) => index);
const middleIndex = (squareIndexes.length - 1) / 2;
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
  const distanceFromMiddle = Math.abs(index - middleIndex);
  return clamp(1 - distanceFromMiddle / middleIndex, 0.14, 1);
}

function renderStrips(time: number) {
  const elapsedFrames = clamp((time - lastTime) / 16.67, 0.4, 2.4);
  const currentScrollY = window.scrollY;
  const scrollDelta = currentScrollY - lastScrollY;
  const scrollVelocity = scrollDelta / elapsedFrames;
  const target = clamp(-scrollVelocity * 1.2, -14, 14);

  springVelocity += (target - offset) * 0.18;
  springVelocity *= 0.72;
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
        const xJitter = Math.sin(time / 170 + index * 0.65) * Math.abs(currentOffset) * weight * 0.035;
        square.style.transform = `translate3d(${xJitter.toFixed(3)}px, ${(currentOffset * weight).toFixed(3)}px, 0)`;
      }
    });
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 flex h-3 items-start gap-2 overflow-hidden px-3 pt-0.5 opacity-60"
      aria-hidden="true"
    >
      {squareIndexes.map((index) => (
        <span
          className="block h-2.5 w-2.5 shrink-0 bg-dirty-yellow/40 will-change-transform"
          key={index}
          ref={(element) => {
            squaresRef.current[index] = element;
          }}
        />
      ))}
    </div>
  );
}
