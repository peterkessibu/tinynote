"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { FloatingPaper } from "@/components/Floating-paper";
import { RoboAnimation } from "@/components/robo-animation";
import { useState, useEffect } from "react";
import AuthHandler from "@/components/AuthHandler";
import SpeechModal from "@/components/Notes/SpeechModal";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase";
import { toast } from "sonner";

export default function Hero() {
  const [showAuth, setShowAuth] = useState(false);
  const [showSpeechModal, setShowSpeechModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthClose = (authenticated = false) => {
    setShowAuth(false);
    if (authenticated) {
      router.push('/notes');
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // If already authenticated, go directly to notes page
      router.push('/notes');
    } else {
      // Otherwise show auth popup
      setShowAuth(true);
    }
  };

  const handleSpeechNoteSave = (noteData: { title: string; content: string; tags: string }) => {
    // Note data received but not saved on landing page - requires authentication
    void noteData; // Acknowledge parameter but don't use it

    if (isAuthenticated) {
      // If authenticated, redirect to notes page where they can save properly
      router.push('/notes');
    } else {
      // Show auth required message
      toast.error("Authentication required", {
        description: "Please sign in to save your voice note"
      });
      setShowSpeechModal(false);
      setShowAuth(true);
    }
  };

  const handleOpenNotesModal = () => {
    if (isAuthenticated) {
      router.push('/notes');
    } else {
      setShowSpeechModal(false);
      setShowAuth(true);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-76px)] items-center">
      {/* Floating papers background */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingPaper count={6} />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl lg:text-7xl">
              Transform Your
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                {" "}
                Voice & Text
              </span>
              <br />
              with
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {" "}
                AI Power
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mb-8 max-w-2xl text-xl text-gray-400"
          >
            Write or speak your notes, and our AI will transform them into clear
            summaries, engaging presentations, and interactive insights.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-4 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              className="rounded-xl bg-purple-600 px-8 text-white outline outline-offset-4 outline-blue-300 transition-all duration-300 hover:scale-[1.03] hover:bg-purple-700 active:scale-[1.01]"
              onClick={handleGetStarted}
            >
              <FileText className="h-5 w-5" />
              <span className="text-base">Get Started</span>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Animated robot */}
      <div className="absolute bottom-2 right-0 hidden h-96 w-96 md:top-3 md:block">
        <RoboAnimation />
      </div>

      {showAuth && (
        <AuthHandler handleClose={(success) => handleAuthClose(success)} />
      )}

      {showSpeechModal && (
        <SpeechModal
          isOpen={showSpeechModal}
          onClose={() => setShowSpeechModal(false)}
          onSaveNote={handleSpeechNoteSave}
          onOpenNotesModal={handleOpenNotesModal}
        />
      )}
    </div>
  );
}
