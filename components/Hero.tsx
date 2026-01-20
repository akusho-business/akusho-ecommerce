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
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const minSwipeDistance = 50;

  // 14 banner slides (1.png to 14.png)
  const slides = Array.from({ length: 14 }, (_, i) => ({
    id: i + 1,
    image: `/${i + 1}.png`,
    alt: `AKUSHO Banner ${i + 1}`,
  }));

  const current = slides[currentSlide];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleImageError = (slideId: number) => {
    console.error(`Failed to load image: /${slideId}.png`);
    setImageErrors((prev) => new Set(prev).add(slideId));
  };

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
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000);
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000);
    }
  };

  return (
    <section 
      className="relative w-full bg-akusho-deepest"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Added pt-14 for mobile to account for navbar */}
      <div className="relative w-full pt-14 sm:pt-0">
        <div className="relative w-full aspect-[16/9] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[21/9]">
          
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
              <Link href="/shop" className="block w-full h-full cursor-pointer">
                {imageErrors.has(current.id) ? (
                  <div className="w-full h-full bg-akusho-darker flex items-center justify-center">
                    <span className="text-gray-500">Banner {current.id}</span>
                  </div>
                ) : (
                  <Image
                    src={current.image}
                    alt={current.alt}
                    fill
                    priority={currentSlide < 3}
                    className="object-contain md:object-cover object-[center_65%] md:object-[center_30%]"
                    sizes="100vw"
                    quality={90}
                    unoptimized
                    onError={() => handleImageError(current.id)}
                  />
                )}
              </Link>

              {/* Subtle hover overlay */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 left-3 sm:left-4 md:left-6 z-30 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 rounded-full shadow-xl"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-akusho-deepest" />
          </button>

          <button
            onClick={nextSlide}
            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 right-3 sm:right-4 md:right-6 z-30 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 rounded-full shadow-xl"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-akusho-deepest" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-3 sm:bottom-5 md:bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2">
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={(e) => goToSlide(e, index)}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === index 
                    ? 'w-6 sm:w-8 md:w-10 h-2 bg-akusho-neon shadow-lg shadow-akusho-neon/50' 
                    : imageErrors.has(slide.id)
                      ? 'w-2 h-2 bg-red-500/50'
                      : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <div className="absolute bottom-3 sm:bottom-5 md:bottom-6 right-3 sm:right-6 z-30 bg-black/50 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
            <span className="text-white text-xs sm:text-sm font-medium">
              <span className="text-akusho-neon">{currentSlide + 1}</span>
              <span className="text-white/60"> / {slides.length}</span>
            </span>
          </div>

          {/* Progress Bar */}
          {isAutoPlaying && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-akusho-dark/50 z-20">
              <motion.div 
                className="h-full bg-akusho-neon"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: 'linear' }}
                key={currentSlide}
                style={{
                  boxShadow: '0 0 10px rgba(0,168,255,0.5)',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;