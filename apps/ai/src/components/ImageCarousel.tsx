/*
 * Copyright (c) 2026 INDEX0 AI Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL CODE.
 * NOTICE: All information contained herein is, and remains the property of INDEX0 AI Inc.
 * The intellectual and technical concepts contained herein are proprietary to INDEX0 AI Inc.
 * and may be covered by U.S. and Foreign Patents, patents in process, and are protected by
 * trade secret or copyright law. Dissemination of this information or reproduction of this
 * material is strictly forbidden unless prior written permission is obtained from INDEX0 AI Inc.
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { IconChevronLeft, IconChevronRight, IconPlayerPlay, IconPlayerPause } from "@tabler/icons-react";

interface SlideItem {
  id: string;
  src: string;
  alt: string;
  label: string;
  caption?: string;
}

const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: "yellow-flowers",
    src: "/images/yellow-flowers.png",
    alt: "Yellow Flowers against Sky",
    label: "01 // CHRYSANTHEMUM HORIZON",
    caption: "Deep Azure & Field Flora Telemetry",
  },
  {
    id: "grass-field",
    src: "/images/grass-field.png",
    alt: "Person Resting in Grass Field",
    label: "02 // OVERHEAD MEADOW VIEW",
    caption: "Zenith Canopy & Meadow Grounding",
  },
];

interface ImageCarouselProps {
  className?: string;
  slides?: SlideItem[];
  autoPlayInterval?: number;
}

export function ImageCarousel({
  className = "",
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 5000,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Auto-play loop (pauses when user hovers or explicitly pauses)
  useEffect(() => {
    if (!isPlaying || isHovered || total <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, autoPlayInterval, nextSlide, total]);

  // Keyboard navigation when focused
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className={`relative w-full border-oklab-b border-oklab-t overflow-hidden select-none bg-black ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Visual Archive Carousel"
    >
      {/* ============================================================ */}
      {/* 1. SLIDES SLIDER TRACK                                       */}
      {/* ============================================================ */}
      <div
        className="relative w-full h-[50vh] sm:h-[65vh] md:h-[75vh] min-h-[380px] max-h-[850px] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="w-full h-full flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className="w-full h-full flex-shrink-0 relative flex items-center justify-center bg-black"
              aria-hidden={idx !== currentIndex}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover select-none pointer-events-none"
              />

              {/* Slide Meta Badge Overlay */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-md bg-black/75 border border-white/15 text-white font-mono text-[10px] sm:text-xs flex items-center gap-2 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>{slide.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. NAVIGATION ARROWS (Zero Shadows, Clean Brutalist)         */}
      {/* ============================================================ */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 hover:border-white flex items-center justify-center transition-all cursor-pointer"
      >
        <IconChevronLeft size={22} strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 hover:border-white flex items-center justify-center transition-all cursor-pointer"
      >
        <IconChevronRight size={22} strokeWidth={2} />
      </button>

      {/* ============================================================ */}
      {/* 3. BOTTOM CAROUSEL HUD CONTROLS BAR                          */}
      {/* ============================================================ */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Slide Counter HUD */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/75 border border-white/15 text-white font-mono text-[10px] sm:text-xs pointer-events-auto">
          <span className="font-bold text-white">
            {String(currentIndex + 1).padStart(2, "0")}
          </span>
          <span className="text-white/40">/</span>
          <span className="text-white/60">
            {String(total).padStart(2, "0")}
          </span>
          <span className="hidden sm:inline text-white/40 ml-1">
            [{slides[currentIndex]?.caption || "ARCHIVE"}]
          </span>
        </div>

        {/* Indicators Pill Bar */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/75 border border-white/15 pointer-events-auto">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? "w-6 sm:w-8 bg-white"
                  : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}

          {/* Play/Pause Toggle */}
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            aria-label={isPlaying ? "Pause Carousel" : "Play Carousel"}
            className="ml-1 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <IconPlayerPause size={12} strokeWidth={2} />
            ) : (
              <IconPlayerPlay size={12} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
