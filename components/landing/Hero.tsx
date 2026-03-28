"use client";

import Link from "next/link";

function WaveformBars() {
  return (
    <div className="flex items-center gap-[3px] h-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-[3px] bg-amber-400 rounded-full"
          style={{
            animation: `waveform 1.2s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <div className="flex flex-col justify-center h-full">
      {/* Eyebrow pill */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">
            Voice AI Receptionist &middot; Fruition MKE
          </span>
        </div>
      </div>

      {/* Headline */}
      <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
        <span className="text-white">Fruition MKE</span>
        <br />
        <span className="text-amber-400">Voice Receptionist</span>
      </h1>

      {/* Subheadline */}
      <p className="text-gray-400 text-base md:text-lg max-w-lg leading-relaxed mb-10">
        Never miss a call again. Zara answers 24/7, collects what you need, and
        logs every inquiry &mdash; so you can follow up on your terms.
      </p>

      {/* CTA Row */}
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-10">
        {/* Phone number box */}
        <a
          href="tel:+14145550000"
          className="flex items-center gap-4 px-5 py-3.5 bg-[#1A1D27] rounded-xl border border-white/10 hover:border-amber-400/30 transition-colors group"
        >
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-0.5">
              Call Zara
            </span>
            <span className="text-amber-400 font-bold text-lg">
              (414) XXX-XXXX
            </span>
          </div>
          <WaveformBars />
        </a>

        {/* Dashboard button */}
        <Link
          href="/dashboard"
          className="px-6 py-3.5 bg-terracotta text-white rounded-xl font-semibold text-sm hover:bg-terracotta/90 transition-colors"
        >
          View Dashboard &rarr;
        </Link>
      </div>

      {/* Stat pills */}
      <div className="flex items-center gap-0">
        {[
          { stat: "24/7", label: "Always Available" },
          { stat: "~2 min", label: "Avg. Call Length" },
          { stat: "0", label: "Missed Calls" },
        ].map((item, i) => (
          <div key={item.label} className="flex items-center">
            {i > 0 && (
              <div className="w-px h-8 bg-white/10 mx-5" />
            )}
            <div>
              <span className="text-white font-bold text-lg block">
                {item.stat}
              </span>
              <span className="text-gray-500 text-xs">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
