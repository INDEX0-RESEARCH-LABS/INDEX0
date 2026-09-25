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

import React, { useState, useCallback, useRef, useEffect } from "react";
import { AsciiCanvas } from "./ascii-canvas/AsciiCanvas";

interface RetroComputerTerminalProps {
  className?: string;
}

export function RetroComputerTerminal({ className = "" }: RetroComputerTerminalProps) {
  const [powerOn, setPowerOn] = useState(true);
  const [driveAActive, setDriveAActive] = useState(true);
  const [driveBActive, setDriveBActive] = useState(false);
  const [contrastLevel, setContrastLevel] = useState(1);
  const [colorMode, setColorMode] = useState<"original" | "monochrome">("original");
  const [displayMode, setDisplayMode] = useState<"video" | "3d">("video");

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (powerOn) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [powerOn, displayMode]);

  // Synthesized retro sound effects using pure Web Audio API
  const playRetroSound = useCallback((type: "power" | "floppy" | "dial") => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (type === "power") {
        // CRT Degauss / Power Thump
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      } else if (type === "floppy") {
        // Floppy 5.25" Stepper Motor Seek Chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.03);
        osc.frequency.setValueAtTime(450, ctx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.13);
      } else if (type === "dial") {
        // Rotary switch click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch {
      // Audio autoplay policy or unavailable context: silent fallback
    }
  }, []);

  const togglePower = () => {
    playRetroSound("power");
    setPowerOn((prev) => !prev);
  };

  const toggleDriveA = () => {
    playRetroSound("floppy");
    setDriveAActive((prev) => !prev);
  };

  const toggleDriveB = () => {
    playRetroSound("floppy");
    setDriveBActive((prev) => !prev);
  };

  const cycleContrast = () => {
    playRetroSound("dial");
    setContrastLevel((prev) => (prev % 3) + 1);
  };

  const currentImageSrc = colorMode === "original" ? "/images/retro-pc-color.png" : "/images/retro-pc.png";

  return (
    <div className={`w-full flex flex-col items-center select-none font-mono ${className}`}>
      {/* ============================================================ */}
      {/* REAL RETRO COMPUTER CHASSIS (Schneider PC 1512 DD)           */}
      {/* ============================================================ */}
      <div className="relative w-full max-w-[500px] aspect-[903/1024] select-none mx-auto">
        {/* Base: High-Resolution Real Photograph of Schneider / Amstrad PC 1512 DD */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={currentImageSrc}
          src={currentImageSrc}
          alt={`Schneider PC 1512 DD Vintage Workstation (${colorMode})`}
          className="w-full h-full object-contain pointer-events-none select-none transition-opacity duration-200"
        />

        {/* ============================================================ */}
        {/* CRT SCREEN APERTURE (Inside the Real Bezel Window)            */}
        {/* ============================================================ */}
        <div
          className="absolute overflow-hidden bg-[#080808]"
          style={{
            left: "18.35%",
            top: "8.85%",
            width: "64.9%",
            height: "44.4%",
            borderRadius: "4%",
          }}
        >
          {powerOn ? (
            <>
              {/* Screen Motion Art Container (Video or 3D ASCII Canvas) */}
              <div
                className={`absolute inset-0 z-0 flex items-center justify-center bg-black transition-opacity duration-300 ${
                  contrastLevel === 1 ? "opacity-95" : contrastLevel === 2 ? "opacity-100" : "opacity-80"
                }`}
              >
                {displayMode === "video" ? (
                  <video
                    ref={videoRef}
                    src="/videos/ascii-motion.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  <AsciiCanvas />
                )}
              </div>

              {/* CRT Telemetry HUD Overlay */}
              <div className="absolute top-2.5 left-3 right-3 z-10 flex items-center justify-between text-[9px] sm:text-[10px] text-white/70 font-mono pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>[SYS: FIRECRACKER_0.4ms]</span>
                </div>
                <span>
                  {displayMode === "video" ? "[FEED: SARAPORTIERI_ASCII]" : "[AST_REPL: 60FPS]"}
                </span>
              </div>

              <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-center justify-between text-[9px] sm:text-[10px] text-white/60 font-mono pointer-events-none">
                <span className="text-white font-semibold">INDEX0&gt; _</span>
                <span>[80x24_ASCII]</span>
              </div>

              {/* CRT Curved Glass Glare Sheen (Zero Shadows) */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20 z-20"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 45%, rgba(0,0,0,0.5) 100%)",
                }}
              />

              {/* CRT Tube Frame Aperture */}
              <div className="absolute inset-0 rounded-[4%] pointer-events-none z-20" />
            </>
          ) : (
            /* CRT Screen Off State (Phosphor Collapse) */
            <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-white/30 space-y-1 bg-[#060606]">
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-ping" />
              <span>[TERMINAL_POWER_OFF]</span>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* INTERACTIVE HOTSPOTS ON REAL COMPUTER PHOTOGRAPH             */}
        {/* ============================================================ */}
        {/* Floppy Drive A Latch Click Hotspot */}
        <button
          type="button"
          onClick={toggleDriveA}
          className="absolute z-30 cursor-pointer border border-transparent hover:border-white/30 rounded transition-all group"
          style={{
            left: "11%",
            top: "80.5%",
            width: "37.5%",
            height: "10.5%",
          }}
          title="Click Floppy Drive A to Insert/Eject 5.25&quot; Disk"
        >
          <span className="sr-only">Toggle Drive A</span>
          <span className="absolute -top-5 left-2 px-1.5 py-0.5 rounded bg-black/85 text-[8px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/20 whitespace-nowrap">
            DRIVE A: {driveAActive ? "READING 1.2MB" : "EJECTED"}
          </span>
        </button>

        {/* Floppy Drive B Latch Click Hotspot */}
        <button
          type="button"
          onClick={toggleDriveB}
          className="absolute z-30 cursor-pointer border border-transparent hover:border-white/30 rounded transition-all group"
          style={{
            left: "51.5%",
            top: "80.5%",
            width: "37.5%",
            height: "10.5%",
          }}
          title="Click Floppy Drive B to Toggle Air-Gap Disk"
        >
          <span className="sr-only">Toggle Drive B</span>
          <span className="absolute -top-5 right-2 px-1.5 py-0.5 rounded bg-black/85 text-[8px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/20 whitespace-nowrap">
            DRIVE B: {driveBActive ? "ONLINE" : "AIR-GAP LOCKED"}
          </span>
        </button>

        {/* Chassis Power LED / Button Hotspot */}
        <button
          type="button"
          onClick={togglePower}
          className="absolute z-30 cursor-pointer border border-transparent hover:border-white/30 rounded-full transition-all group"
          style={{
            left: "6.5%",
            top: "69.5%",
            width: "4.5%",
            height: "4%",
          }}
          title="Click Chassis Power Button"
        >
          <span className="sr-only">Toggle Power</span>
          <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-black/85 text-[8px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/20 whitespace-nowrap">
            POWER: {powerOn ? "ON" : "OFF"}
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* VINTAGE CONTROL CONSOLE (Strict Dark, White, and Gray)       */}
      {/* ============================================================ */}
      <div className="w-full max-w-[500px] mt-4 p-3.5 rounded-xl bg-[var(--surface-200)] border border-oklab space-y-3">
        {/* Model Spec Bar */}
        <div className="flex items-center justify-between text-[10px] text-[var(--meta)] border-b border-oklab pb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[var(--surface-100)] border border-oklab text-[10px] font-bold text-[var(--fg)] tracking-wider">
              SCHNEIDER PC 1512 DD
            </span>
            <span className="hidden sm:inline text-[9px] text-[var(--muted)]">AMSTRAD SYSTEMEINHEIT</span>
          </div>
          <span className="text-[9px] text-[var(--muted)]">DUAL 5.25&quot; // 8086</span>
        </div>

        {/* Mode Selectors: Chassis Color & Screen Source */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
          {/* Chassis Color Mode */}
          <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-lg bg-[var(--surface-100)] border border-oklab">
            <span className="text-[9px] text-[var(--meta)] font-semibold tracking-wider">
              COLOR:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  playRetroSound("dial");
                  setColorMode("original");
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer ${
                  colorMode === "original"
                    ? "bg-white text-black font-bold"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
                title="View original vintage photograph colors"
              >
                ORIGINAL
              </button>
              <button
                type="button"
                onClick={() => {
                  playRetroSound("dial");
                  setColorMode("monochrome");
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer ${
                  colorMode === "monochrome"
                    ? "bg-white text-black font-bold"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
                title="View monochrome version"
              >
                MONO
              </button>
            </div>
          </div>

          {/* Screen Motion Source */}
          <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-lg bg-[var(--surface-100)] border border-oklab">
            <span className="text-[9px] text-[var(--meta)] font-semibold tracking-wider">
              SCREEN:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  playRetroSound("dial");
                  setDisplayMode("video");
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer ${
                  displayMode === "video"
                    ? "bg-white text-black font-bold"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
                title="Play ASCII Video Loop in monitor"
              >
                VIDEO
              </button>
              <button
                type="button"
                onClick={() => {
                  playRetroSound("dial");
                  setDisplayMode("3d");
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer ${
                  displayMode === "3d"
                    ? "bg-white text-black font-bold"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
                title="Play Interactive 3D WebGL ASCII Canvas"
              >
                3D ASCII
              </button>
            </div>
          </div>
        </div>

        {/* Tactile Controls: Power, Contrast Dial, Drive Status */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
          {/* Drive Indicators */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleDriveA}
              className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-mono transition-colors cursor-pointer ${
                driveAActive
                  ? "border-[var(--accent)] bg-[var(--surface-100)] text-[var(--fg)]"
                  : "border-oklab bg-[var(--surface-warm)] text-[var(--muted)]"
              }`}
              title="Click to Toggle Floppy Drive A"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  driveAActive ? "bg-white animate-pulse" : "bg-neutral-600"
                }`}
              />
              <span>DRIVE A</span>
            </button>

            <button
              type="button"
              onClick={toggleDriveB}
              className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-mono transition-colors cursor-pointer ${
                driveBActive
                  ? "border-[var(--accent)] bg-[var(--surface-100)] text-[var(--fg)]"
                  : "border-oklab bg-[var(--surface-warm)] text-[var(--muted)]"
              }`}
              title="Click to Toggle Floppy Drive B"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  driveBActive ? "bg-white animate-pulse" : "bg-neutral-600"
                }`}
              />
              <span>DRIVE B</span>
            </button>
          </div>

          {/* Dials & Power Switch */}
          <div className="flex items-center gap-2.5">
            {/* Contrast / Brightness Dial */}
            <button
              type="button"
              onClick={cycleContrast}
              className="flex items-center gap-1 text-[9px] text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
              title="Rotate CRT Contrast Dial"
            >
              <span>CRT DIAL</span>
              <div className="w-5 h-5 rounded-full border border-oklab bg-[var(--surface-100)] flex items-center justify-center text-[8px] font-bold text-[var(--fg)]">
                {contrastLevel}
              </div>
            </button>

            {/* Power Toggle Rocker */}
            <button
              type="button"
              onClick={togglePower}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-oklab bg-[var(--surface-100)] hover:bg-[var(--surface-warm)] text-[10px] font-medium text-[var(--fg)] transition-all cursor-pointer"
              title="Toggle Monitor Power"
            >
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  powerOn ? "bg-white" : "bg-neutral-600"
                }`}
              />
              <span>{powerOn ? "PWR: ON" : "PWR: OFF"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
