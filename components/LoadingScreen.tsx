"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<"closed" | "opening" | "reveal" | "exit">("closed");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Phase timing for cinematic effect
    const openTimer = setTimeout(() => setPhase("opening"), 800);
    const revealTimer = setTimeout(() => setPhase("reveal"), 2500);
    const exitTimer = setTimeout(() => setPhase("exit"), 5000);
    const completeTimer = setTimeout(() => onLoadingComplete(), 5800);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(revealTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onLoadingComplete]);

  return (
    <AnimatePresence mode="wait">
      {phase !== "exit" && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Video Background - Revealed by eye opening */}
          <div className="absolute inset-0">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover scale-110"
            >
              <source src="/herovideo.mp4" type="video/mp4" />
            </video>
            {/* Cinematic overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          </div>

          {/* ============ EYE OPENING CURTAIN EFFECT ============ */}
          
          {/* Upper Eyelid */}
          <motion.div
            className="absolute top-0 left-0 right-0 bg-akusho-deepest z-20 origin-top"
            style={{ height: "52%" }}
            initial={{ y: 0 }}
            animate={{ 
              y: phase === "opening" || phase === "reveal" ? "-100%" : 0 
            }}
            transition={{ 
              duration: 1.4, 
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            {/* Eyelid texture/gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-akusho-deepest via-akusho-darker to-akusho-dark" />
            
            {/* Glowing edge */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-[2px]"
              style={{
                background: "linear-gradient(90deg, transparent 0%, #00A8FF 20%, #00D4FF 50%, #00A8FF 80%, transparent 100%)",
                boxShadow: "0 0 20px #00A8FF, 0 0 40px #00A8FF",
              }}
              animate={{
                opacity: phase === "closed" ? [0.5, 1, 0.5] : 0,
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* Eyelash details */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-6 md:gap-10">
              {[...Array(9)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-[1px] md:w-[2px] h-6 md:h-10 origin-top"
                  style={{ 
                    background: "linear-gradient(to bottom, #00A8FF, transparent)",
                    transform: `rotate(${(i - 4) * 6}deg)`,
                  }}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ 
                    scaleY: phase === "closed" ? 1 : 0, 
                    opacity: phase === "closed" ? 0.6 : 0 
                  }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                />
              ))}
            </div>
          </motion.div>

          {/* Lower Eyelid */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-akusho-deepest z-20 origin-bottom"
            style={{ height: "52%" }}
            initial={{ y: 0 }}
            animate={{ 
              y: phase === "opening" || phase === "reveal" ? "100%" : 0 
            }}
            transition={{ 
              duration: 1.4, 
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            {/* Eyelid texture/gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-akusho-deepest via-akusho-darker to-akusho-dark" />
            
            {/* Glowing edge */}
            <motion.div 
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: "linear-gradient(90deg, transparent 0%, #00A8FF 20%, #00D4FF 50%, #00A8FF 80%, transparent 100%)",
                boxShadow: "0 0 20px #00A8FF, 0 0 40px #00A8FF",
              }}
              animate={{
                opacity: phase === "closed" ? [0.5, 1, 0.5] : 0,
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>

          {/* Center Eye Symbol - Shows while closed */}
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: phase === "closed" ? 1 : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            <svg
              width="80"
              height="40"
              viewBox="0 0 80 40"
              className="opacity-80"
            >
              <motion.path
                d="M 5 20 Q 40 5 75 20 Q 40 35 5 20"
                fill="none"
                stroke="#00A8FF"
                strokeWidth="1.5"
                style={{ filter: "drop-shadow(0 0 10px #00A8FF)" }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <motion.circle
                cx="40"
                cy="20"
                r="6"
                fill="#00A8FF"
                style={{ filter: "drop-shadow(0 0 8px #00A8FF)" }}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 0.5 }}
              />
            </svg>
          </motion.div>

          {/* ============ MAIN CONTENT - TEXT REVEAL ============ */}
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: phase === "reveal" ? 1 : 0,
            }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="text-center px-4">
              {/* Welcome Text */}
              <div className="overflow-hidden">
                <motion.p
                  className="text-white/70 text-base md:text-xl tracking-[0.5em] uppercase font-light mb-3"
                  initial={{ y: 60 }}
                  animate={{ y: phase === "reveal" ? 0 : 60 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                >
                  Welcome to
                </motion.p>
              </div>

              {/* AKUSHO - Main Logo */}
              <div className="overflow-hidden">
                <motion.h1
                  className="font-heading text-6xl md:text-8xl lg:text-[10rem] text-white leading-none"
                  initial={{ y: 150 }}
                  animate={{ y: phase === "reveal" ? 0 : 150 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                >
                  <motion.span
                    className="inline-block"
                    animate={phase === "reveal" ? {
                      textShadow: [
                        "0 0 20px rgba(0,168,255,0.3), 0 0 60px rgba(0,168,255,0.2)",
                        "0 0 40px rgba(0,168,255,0.5), 0 0 100px rgba(0,168,255,0.3)",
                        "0 0 20px rgba(0,168,255,0.3), 0 0 60px rgba(0,168,255,0.2)",
                      ],
                    } : {}}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    AKUSHO
                  </motion.span>
                </motion.h1>
              </div>

              {/* Decorative Line */}
              <motion.div
                className="flex items-center justify-center gap-3 mt-6 md:mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === "reveal" ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <motion.div
                  className="h-[1px] bg-gradient-to-r from-transparent via-akusho-neon to-akusho-neon"
                  initial={{ width: 0 }}
                  animate={{ width: phase === "reveal" ? 80 : 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                />
                <motion.div
                  className="w-2 h-2 border border-akusho-neon rotate-45"
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ 
                    scale: phase === "reveal" ? 1 : 0, 
                    rotate: phase === "reveal" ? 45 : 0 
                  }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                  style={{ boxShadow: "0 0 10px #00A8FF" }}
                />
                <motion.div
                  className="h-[1px] bg-gradient-to-l from-transparent via-akusho-neon to-akusho-neon"
                  initial={{ width: 0 }}
                  animate={{ width: phase === "reveal" ? 80 : 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                />
              </motion.div>

              {/* Tagline */}
              <div className="overflow-hidden mt-6">
                <motion.p
                  className="text-akusho-neon/60 text-xs md:text-sm tracking-[0.4em] uppercase"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ 
                    y: phase === "reveal" ? 0 : 30,
                    opacity: phase === "reveal" ? 1 : 0
                  }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                >
                  Premium Anime Collectibles
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* ============ AMBIENT EFFECTS ============ */}
          
          {/* Floating Particles */}
          <div className="absolute inset-0 z-5 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-akusho-neon/30 rounded-full"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                }}
                animate={{
                  y: [-20, -60],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0.5],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Corner Frames */}
          <motion.div
            className="absolute top-6 left-6 w-12 h-12 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase !== "closed" ? 0.4 : 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-akusho-neon to-transparent" />
            <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-akusho-neon to-transparent" />
          </motion.div>
          <motion.div
            className="absolute top-6 right-6 w-12 h-12 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase !== "closed" ? 0.4 : 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-akusho-neon to-transparent" />
            <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-akusho-neon to-transparent" />
          </motion.div>
          <motion.div
            className="absolute bottom-6 left-6 w-12 h-12 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase !== "closed" ? 0.4 : 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-akusho-neon to-transparent" />
            <div className="absolute bottom-0 left-0 w-[1px] h-full bg-gradient-to-t from-akusho-neon to-transparent" />
          </motion.div>
          <motion.div
            className="absolute bottom-6 right-6 w-12 h-12 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase !== "closed" ? 0.4 : 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-akusho-neon to-transparent" />
            <div className="absolute bottom-0 right-0 w-[1px] h-full bg-gradient-to-t from-akusho-neon to-transparent" />
          </motion.div>

          {/* Vignette */}
          <div 
            className="absolute inset-0 pointer-events-none z-5"
            style={{
              background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
            }}
          />

          {/* Subtle scan lines */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.015] z-50"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}