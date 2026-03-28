export function Slide3HowItWorks() {
  const steps = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: "Call comes in",
      description: "Any time, any day — Zara picks up",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: "Zara collects",
      description: "Name, number, what they need, when to call back",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: "You review",
      description: "Dashboard shows every call. One tap to follow up.",
    },
  ];

  return (
    <div className="h-full flex items-center justify-center px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-12 leading-tight">
          &ldquo;Simple. Three steps.&rdquo;
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4 mb-12">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-4">
              <div className="flex flex-col items-center text-center w-52">
                <div className="w-16 h-16 bg-terracotta/15 rounded-2xl flex items-center justify-center text-terracotta mb-4">
                  {step.icon}
                </div>
                <h3 className="font-bold text-white mb-1">{step.label}</h3>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <svg
                  className="w-8 h-8 text-terracotta hidden md:block flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </div>
          ))}
        </div>

        <p className="text-gray-500 italic text-sm">
          No app to download. No technical setup for you. Just a phone number and
          a link.
        </p>
      </div>
    </div>
  );
}
