"use client";

import { useState, useCallback, useEffect } from "react";
import { NavBar } from "@/components/landing/NavBar";

interface SlideContainerProps {
  children: React.ReactNode[];
}

export function SlideContainer({ children }: SlideContainerProps) {
  const [current, setCurrent] = useState(0);
  const total = children.length;

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < total) setCurrent(index);
    },
    [total]
  );

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next]);

  useEffect(() => {
    let startX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next();
        else prev();
      }
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [prev, next]);

  return (
    <div className="fixed inset-0 bg-[#0F1117] overflow-hidden flex flex-col">
      <div className="z-10">
        <NavBar />
      </div>

      {/* Slides */}
      <div className="flex-1 w-full relative">
        <div
          className="h-full flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {children.map((child, i) => (
            <div key={i} className="h-full w-full flex-shrink-0">
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 z-10">
        <button
          onClick={prev}
          disabled={current === 0}
          className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center text-gray-400 hover:border-terracotta hover:text-terracotta transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          &larr;
        </button>
        <div className="flex gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === current ? "bg-terracotta" : "bg-white/20"
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          disabled={current === total - 1}
          className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center text-gray-400 hover:border-terracotta hover:text-terracotta transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
}
