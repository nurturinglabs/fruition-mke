import type { Metadata } from "next";
import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";
import { TranscriptPreview } from "@/components/landing/TranscriptPreview";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Zara for Fruition MKE — Voice AI Receptionist",
  description:
    "Never miss a call again. Zara answers 24/7 and logs every inquiry.",
  openGraph: {
    title: "Zara for Fruition MKE — Voice AI Receptionist",
    description:
      "Never miss a call again. Zara answers 24/7 and logs every inquiry.",
  },
};

export default function LandingPage() {
  return (
    <div className="h-screen bg-[#0F1117] overflow-hidden relative flex flex-col">
      <NavBar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center pb-12">
        <Hero />
        <TranscriptPreview />
      </main>
      <Footer />
    </div>
  );
}
