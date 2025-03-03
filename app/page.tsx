"use client";
import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import Header from "@/components/Header";
import LoadingPage from "@/components/Loading";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="bg-grid-white/[0.02] min-h-screen bg-black/[0.96] antialiased">
      <Header />
      <Hero />
    </div>
  );
}
