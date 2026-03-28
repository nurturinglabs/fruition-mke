export function Slide1Problem() {
  return (
    <div className="h-full flex items-center justify-center px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
          &ldquo;Every missed call is a missed booking.&rdquo;
        </h1>

        {/* Visual: split illustration */}
        <div className="flex items-center justify-center gap-8 mb-10">
          <div className="flex flex-col items-center opacity-40">
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-sm text-gray-500 mt-2">Voicemail</span>
          </div>
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <div className="flex flex-col items-center opacity-40">
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-sm text-gray-500 mt-2">Empty room</span>
          </div>
        </div>

        <div className="text-base text-gray-400 leading-relaxed mb-8">
          <p>We called Fruition MKE three times.</p>
          <p>
            Evenings — voicemail.
            <br />
            During hours — &ldquo;let me check with the owner.&rdquo;
            <br />
            Web form — 7 days to reply.
          </p>
        </div>

        <p className="text-5xl md:text-6xl font-heading font-bold text-terracotta mb-2">
          62%
        </p>
        <p className="text-base text-gray-400">
          of callers won&apos;t leave a voicemail. They just call the next place.
        </p>
      </div>
    </div>
  );
}
