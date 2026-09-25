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

import React, { useState, useRef, useEffect, useCallback } from "react";

const WIDE_VIDEOS = [
  "/videos/wide/wide-1.mp4",
  "/videos/wide/wide-2.mp4",
  "/videos/wide/wide-3.mp4",
  "/videos/wide/wide-4.mp4",
];

interface AutoWideVideoBannerProps {
  className?: string;
}

export function AutoWideVideoBanner({ className = "" }: AutoWideVideoBannerProps) {
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleEnded = useCallback(() => {
    setActiveVideoIdx((prev) => (prev + 1) % WIDE_VIDEOS.length);
  }, []);

  useEffect(() => {
    const currentVideo = videoRefs.current[activeVideoIdx];
    if (currentVideo) {
      currentVideo.currentTime = 0;
      currentVideo.play().catch(() => {});
    }
  }, [activeVideoIdx]);

  return (
    <section className={`relative w-full border-oklab-b border-oklab-t overflow-hidden aspect-[16/9] max-h-[80vh] bg-black ${className}`}>
      {WIDE_VIDEOS.map((src, index) => {
        const isActive = index === activeVideoIdx;
        return (
          <video
            key={src}
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            src={src}
            autoPlay={index === 0}
            muted
            playsInline
            onEnded={isActive ? handleEnded : undefined}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out pointer-events-none select-none ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          />
        );
      })}
    </section>
  );
}
