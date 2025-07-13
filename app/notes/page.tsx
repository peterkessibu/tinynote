"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NotesApp from "@/components/Notes/Notes";
import Header from "@/components/Header";
import { auth } from "@/app/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import LoadingPage from "@/components/Loading";

export default function NotesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push("/");
            }
        });

        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000); // Faster loading

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
            transition={{ duration: 0.5 }} // Faster animation
            className="bg-grid-white/[0.02] min-h-screen bg-black/[0.96] antialiased"
        >
            <Header />
            <NotesApp />
        </motion.div>
    );
} 