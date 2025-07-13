"use client";
import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingPage from "@/components/Loading";
import { Toaster } from "sonner";
import Feature from "@/components/Feature";

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
    <div className="bg-grid-white/[0.02] flex min-h-screen w-full flex-col justify-between bg-black/[0.96]">
      <Header />
      <main className="flex w-full items-center justify-center overflow-hidden">
        <div className="w-full">
          <Hero />
          <Feature />
        </div>
      </main>
      <Footer />
      <Toaster richColors position="top-center" />
    </div>
  );
}
