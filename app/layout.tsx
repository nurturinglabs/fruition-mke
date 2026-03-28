import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fruition MKE — Call Dashboard",
  description:
    "Voice AI receptionist dashboard for Fruition MKE creative coworking space.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
