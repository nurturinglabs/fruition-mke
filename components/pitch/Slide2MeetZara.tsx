"use client";

import { useEffect, useState } from "react";

const transcript = [
  { speaker: "Caller", text: '"Hi, I want to book your event space for next Saturday..."' },
  { speaker: "Zara", text: '"Of course! Let me get a few details from you..."' },
];

export function Slide2MeetZara() {
  const [visibleChars, setVisibleChars] = useState(0);
  const fullText = transcript.map((t) => `${t.speaker}: ${t.text}`).join("\n");

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleChars((prev) => {
        if (prev >= fullText.length) {
          setTimeout(() => setVisibleChars(0), 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [fullText.length]);

  const displayText = fullText.slice(0, visibleChars);

  return (
    <div className="h-full flex items-center justify-center px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
          &ldquo;Meet Zara. She never misses a call.&rdquo;
        </h1>

        {/* Phone mockup */}
        <div className="mx-auto w-64 mb-10">
          <div className="bg-black rounded-3xl p-4 shadow-xl border border-white/10">
            <div className="bg-[#1A1D27] rounded-2xl p-4">
              <div className="text-center mb-3">
                <div className="w-12 h-12 bg-terracotta/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <p className="font-semibold text-sm text-white">Zara</p>
                <p className="text-xs text-gray-500">Fruition MKE Assistant</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 min-h-[80px]">
                <pre className="text-xs text-left text-gray-300 whitespace-pre-wrap font-body leading-relaxed">
                  {displayText}
                  <span className="inline-block w-0.5 h-3 bg-amber-400 animate-pulse ml-0.5" />
                </pre>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xl mx-auto">
          Zara is a voice AI assistant — built specifically for Fruition MKE.
          She answers every call, 24 hours a day, 7 days a week. She collects
          the caller&apos;s name, number, what they need, and when to call back.
          Then she logs it — so you never lose a lead again.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {["Answers 24/7", "Collects caller details", "Notifies you instantly"].map(
            (label) => (
              <span
                key={label}
                className="px-4 py-2 rounded-full border-2 border-terracotta text-terracotta text-sm font-medium"
              >
                {label}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
