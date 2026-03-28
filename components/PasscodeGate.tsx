"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function PasscodeGate() {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError(false);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (value && index === 5) {
      const pin = newDigits.join("");
      if (pin.length === 6) {
        submitPin(pin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitPin = async (pin: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: pin }),
      });

      if (res.ok) {
        router.replace("/dashboard");
      } else {
        setError(true);
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warmwhite flex items-center justify-center px-4">
      <div
        className={`bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center ${
          error ? "shake" : ""
        }`}
      >
        <h1 className="font-heading text-3xl font-bold text-terracotta mb-2">
          Fruition MKE
        </h1>
        <p className="text-warmgrey text-sm mb-8">
          Enter your PIN to access the call dashboard
        </p>

        <div className="flex justify-center gap-3 mb-6">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className="w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 border-gray-200 focus:border-terracotta focus:outline-none transition-colors bg-warmwhite"
              style={{
                WebkitTextSecurity: digit ? "disc" : "none",
              } as React.CSSProperties}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">Incorrect PIN. Try again.</p>
        )}

        {loading && (
          <p className="text-warmgrey text-sm">Verifying...</p>
        )}
      </div>
    </div>
  );
}
