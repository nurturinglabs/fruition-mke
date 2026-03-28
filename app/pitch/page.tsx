import type { Metadata } from "next";
import { SlideContainer } from "@/components/pitch/SlideContainer";
import { Slide1Problem } from "@/components/pitch/Slide1Problem";
import { Slide2MeetZara } from "@/components/pitch/Slide2MeetZara";
import { Slide3HowItWorks } from "@/components/pitch/Slide3HowItWorks";
import { Slide4TheOffer } from "@/components/pitch/Slide4TheOffer";

export const metadata: Metadata = {
  title: "Zara for Fruition MKE — Voice AI Receptionist",
  description:
    "See how a voice assistant can help Fruition MKE never miss a call again.",
  openGraph: {
    title: "Zara for Fruition MKE — Voice AI Receptionist",
    description:
      "See how a voice assistant can help Fruition MKE never miss a call again.",
  },
};

export default function PitchPage() {
  return (
    <SlideContainer>
      <Slide1Problem />
      <Slide2MeetZara />
      <Slide3HowItWorks />
      <Slide4TheOffer />
    </SlideContainer>
  );
}
