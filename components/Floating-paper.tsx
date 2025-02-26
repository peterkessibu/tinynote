"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

// Simple seeded random number generator
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function FloatingPaper({ count = 5 }) {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    // Update dimensions only on client side
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative h-full w-full">
      {Array.from({ length: count }).map((_, i) => {
        const randomX = seededRandom(i + 1); // Use a seed based on the index
        const randomY = seededRandom(i + 10); // Use a different seed for Y
        const randomDelay = seededRandom(i + 20); // Use a different seed for the delay

        return (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: randomX * dimensions.width,
              y: randomY * dimensions.height,
            }}
            animate={{
              x: [
                seededRandom(i + 30) * dimensions.width,
                seededRandom(i + 40) * dimensions.width,
                seededRandom(i + 50) * dimensions.width,
              ],
              y: [
                seededRandom(i + 60) * dimensions.height,
                seededRandom(i + 70) * dimensions.height,
                seededRandom(i + 80) * dimensions.height,
              ],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20 + seededRandom(i + 90) * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: randomDelay * 2, // Add a small delay
            }}
          >
            <div className="relative flex h-20 w-16 transform items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm transition-transform hover:scale-110">
              <FileText className="h-8 w-8 text-purple-400/50" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
