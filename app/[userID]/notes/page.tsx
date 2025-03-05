"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import NotesApp from "@/components/Notes";
import Header from "@/components/Header";
import { auth } from "@/app/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { motion } from "framer-motion";
import LoadingPage from "@/components/Loading";

export default function Page({
  params,
}: {
  params: Promise<{ userID: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [, setUser] = useState<FirebaseUser | null>(null);
  const resolvedParams = use(params);
  const userID = resolvedParams.userID;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.uid !== userID) {
          router.push("/unauthorized");
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router, userID]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-grid-white/[0.02] min-h-screen bg-black/[0.96] antialiased"
    >
      <Header />
      <NotesApp />
    </motion.div>
  );
}
