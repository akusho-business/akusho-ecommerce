"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Check if user has already seen the loading screen this session
    const hasSeenIntro = sessionStorage.getItem("akusho-intro-seen");
    
    if (hasSeenIntro) {
      setIsLoading(false);
      setShowContent(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    // Mark that user has seen the intro
    sessionStorage.setItem("akusho-intro-seen", "true");
    setIsLoading(false);
    // Small delay to ensure smooth transition
    setTimeout(() => setShowContent(true), 100);
  };

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      <div 
        className={`transition-opacity duration-500 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
        style={{ visibility: showContent ? "visible" : "hidden" }}
      >
        {children}
      </div>
    </>
  );
}