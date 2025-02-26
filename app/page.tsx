"use client";
import Hero from "@/components/Hero";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="bg-grid-white/[0.02] min-h-screen bg-black/[0.96] antialiased">
      <Header />
      <Hero />
    </div>
  );
}
