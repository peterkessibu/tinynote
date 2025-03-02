"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingPage() {
  const [rotation, setRotation] = useState(0);
  const [direction, setDirection] = useState(1);

  // Change rotation direction every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection((prev) => prev * -1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Update rotation angle based on direction
  useEffect(() => {
    const rotateStep = () => {
      setRotation((prev) => {
        const nextRotation = prev + direction * 2;

        // Switch direction if reaching thresholds
        if (nextRotation > 45 || nextRotation < -45) {
          setDirection((prevDir) => prevDir * -1);
          return prev;
        }

        return nextRotation;
      });

      animationFrame = requestAnimationFrame(rotateStep);
    };

    let animationFrame = requestAnimationFrame(rotateStep);
    return () => cancelAnimationFrame(animationFrame);
  }, [direction]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950">
      <div className="relative flex h-32 w-32 items-center justify-center">
        {/* Outer spinner */}
        <motion.div
          className="absolute h-full w-full rounded-full border-4 border-transparent border-r-blue-500 border-t-purple-500"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            ease: "linear",
            repeat: Infinity,
          }}
        />

        {/* Inner spinner (opposite direction) */}
        <motion.div
          className="absolute h-3/4 w-3/4 rounded-full border-4 border-transparent border-b-pink-500 border-l-orange-500"
          animate={{ rotate: -360 }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity,
          }}
        />

        {/* Sparkles icon with bidirectional rotation */}
        <motion.div
          animate={{ rotate: rotation }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 shadow-lg shadow-purple-500/20"
        >
          <Sparkles
            className="text-gradient-to-r h-8 w-8 from-purple-500 to-pink-500"
            strokeWidth={1.5}
          />
        </motion.div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-xl"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}
