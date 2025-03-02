"use client";

import NotesApp from "@/components/Notes";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import LoadingPage from "@/components/Loading";

export default function Page() {
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

  // Return actual content once loaded
  return (
    <div className="bg-grid-white/[0.02] min-h-screen bg-black/[0.96] antialiased">
      <Header />
      <NotesApp />
    </div>
  );
}
