"use client";

import { useEffect, useState } from "react";

const messages = [
  {
    speaker: "zara",
    text: "Hi! Thanks for calling Fruition MKE. This is Zara, your virtual assistant. What can I help you with today?",
  },
  {
    speaker: "caller",
    text: "Hi, I'd like to book your event space for next Saturday.",
  },
  {
    speaker: "zara",
    text: "I'd love to help with that! Can I get your name and how many guests you're expecting?",
  },
];

const intentTags = [
  "Event Booking",
  "Coworking",
  "Makerspace",
  "Cafe",
  "General Info",
];

export function TranscriptPreview() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [currentChars, setCurrentChars] = useState(0);

  useEffect(() => {
    if (visibleMessages >= messages.length) {
      const resetTimer = setTimeout(() => {
        setVisibleMessages(0);
        setCurrentChars(0);
      }, 3000);
      return () => clearTimeout(resetTimer);
    }

    const currentMessage = messages[visibleMessages];
    if (currentChars >= currentMessage.text.length) {
      const nextTimer = setTimeout(() => {
        setVisibleMessages((prev) => prev + 1);
        setCurrentChars(0);
      }, 800);
      return () => clearTimeout(nextTimer);
    }

    const charTimer = setTimeout(() => {
      setCurrentChars((prev) => prev + 1);
    }, 30);
    return () => clearTimeout(charTimer);
  }, [visibleMessages, currentChars]);

  return (
    <div className="flex flex-col h-full justify-center">
      {/* Transcript card */}
      <div className="bg-[#1A1D27] rounded-2xl border border-white/10 overflow-hidden">
        {/* Card header */}
        <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
            Zara Active &middot; Fruition MKE
          </span>
        </div>

        {/* Messages */}
        <div className="p-5 min-h-[260px] space-y-3 relative">
          {messages.map((msg, i) => {
            if (i > visibleMessages) return null;
            const isZara = msg.speaker === "zara";
            const text =
              i === visibleMessages
                ? msg.text.slice(0, currentChars)
                : msg.text;
            if (!text) return null;

            return (
              <div
                key={i}
                className={`flex ${isZara ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isZara
                      ? "bg-white/5 text-gray-200 rounded-tl-sm"
                      : "bg-terracotta/20 text-gray-200 rounded-tr-sm"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1">
                    {isZara ? "Zara" : "Caller"}
                  </span>
                  &ldquo;{text}&rdquo;
                  {i === visibleMessages &&
                    currentChars < msg.text.length && (
                      <span className="inline-block w-0.5 h-3.5 bg-amber-400 animate-pulse ml-0.5 align-middle" />
                    )}
                </div>
              </div>
            );
          })}

          {/* Fade at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#1A1D27] to-transparent pointer-events-none" />
        </div>

        {/* Intent tags */}
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          {intentTags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-[11px] font-medium border border-white/10 text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-[#1A1D27] rounded-xl border border-white/10 px-4 py-3">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">
            Built for
          </span>
          <span className="text-white text-sm font-semibold">
            Fruition MKE
          </span>
          <span className="text-gray-500 text-xs block">
            North 27th St, Milwaukee
          </span>
        </div>
        <div className="bg-[#1A1D27] rounded-xl border border-white/10 px-4 py-3">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">
            Powered by
          </span>
          <span className="text-white text-sm font-semibold">Voice AI</span>
        </div>
      </div>
    </div>
  );
}
