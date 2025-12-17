'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  // Banner slides - update these with your actual banner images
  const slides = [
    {
      id: 1,
      image: "/heroakusho.png",
      alt: "AKUSHO - Premium Anime Figures"
    }
  ];

  const current = slides[currentSlide];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    pauseAutoPlay();
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    pauseAutoPlay();
  };

  const goToSlide = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide(index);
    pauseAutoPlay();
  };

  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 12000);
  };

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      pauseAutoPlay();
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      pauseAutoPlay();
    }
  };

  return (
    <section 
      className="relative w-full bg-gray-100 dark:bg-akusho-deepest overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Main Banner Container */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[21/9]">
        
        {/* Slides */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <Image
              src={current.image}
              alt={current.alt}
              fill
              priority
              className="object-cover"
              sizes="100vw"
              quality={90}
            />

            {/* Gradient Overlay for left side text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          </motion.div>
        </AnimatePresence>

        {/* Static Content Overlay - Tagline & Shop Now Button */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-0 flex flex-col justify-start sm:justify-center">
            <div className="max-w-md pointer-events-auto mt-4 sm:mt-0">
              {/* Tagline */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium leading-snug mb-5 sm:mb-6"
                style={{
                  textShadow: '0 2px 20px rgba(0,0,0,0.8)',
                }}
              >
                <span className="text-akusho-neon">Cheapest</span> Anime Figures
                <br />
                with <span className="text-akusho-neon">Best Quality</span>
              </motion.h2>

              {/* Shop Now Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-7 sm:px-9 py-3 sm:py-3.5 bg-akusho-neon text-akusho-deepest font-semibold text-sm sm:text-base rounded-sm hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg shadow-akusho-neon/40 group"
                >
                  Shop Now
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows - Only show when multiple slides */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="hidden sm:flex absolute top-1/2 -translate-y-1/2 left-3 sm:left-4 md:left-6 z-30 w-10 h-10 md:w-12 md:h-12 bg-white/10 dark:bg-akusho-dark/80 backdrop-blur-md border border-white/20 dark:border-akusho-neon/30 items-center justify-center hover:bg-white/20 dark:hover:bg-akusho-neon/20 hover:border-akusho-neon/50 hover:scale-110 transition-all duration-300 rounded-full group"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-akusho-neon transition-colors" />
            </button>

            <button
              onClick={nextSlide}
              className="hidden sm:flex absolute top-1/2 -translate-y-1/2 right-3 sm:right-4 md:right-6 z-30 w-10 h-10 md:w-12 md:h-12 bg-white/10 dark:bg-akusho-dark/80 backdrop-blur-md border border-white/20 dark:border-akusho-neon/30 items-center justify-center hover:bg-white/20 dark:hover:bg-akusho-neon/20 hover:border-akusho-neon/50 hover:scale-110 transition-all duration-300 rounded-full group"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-akusho-neon transition-colors" />
            </button>
          </>
        )}

        {/* Slide Indicators - Only show when multiple slides */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-5 md:bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToSlide(e, index)}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === index 
                    ? 'w-8 sm:w-10 md:w-12 h-2 sm:h-2.5 bg-akusho-neon shadow-lg shadow-akusho-neon/50' 
                    : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/60 dark:bg-white/30 dark:hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Progress Bar - Only show when multiple slides and autoplaying */}
        {slides.length > 1 && isAutoPlaying && (
          <div className="absolute bottom-0 left-0 w-full h-[2px] sm:h-1 bg-white/10 dark:bg-akusho-dark z-20">
            <motion.div 
              className="h-full bg-gradient-to-r from-akusho-neonDark via-akusho-neon to-akusho-neonDark"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 6, ease: 'linear' }}
              key={currentSlide}
              style={{
                boxShadow: '0 0 10px rgba(0,168,255,0.5)',
              }}
            />
          </div>
        )}

        {/* Corner Accents - Visible on larger screens */}
        <div className="hidden md:block absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-akusho-neon/40 z-20" />
        <div className="hidden md:block absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-akusho-neon/40 z-20" />
        <div className="hidden md:block absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-akusho-neon/40 z-20" />
        <div className="hidden md:block absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-akusho-neon/40 z-20" />
      </div>
    </section>
  );
};

export default Hero;