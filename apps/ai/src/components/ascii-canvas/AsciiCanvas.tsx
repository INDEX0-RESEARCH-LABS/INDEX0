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

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface AsciiCanvasProps {
  className?: string;
}

export function AsciiCanvas({ className = "" }: AsciiCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 3.6;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3D Geometry: TorusKnot + Wireframe Icosahedron
    const knotGroup = new THREE.Group();
    const knotGeo = new THREE.TorusKnotGeometry(0.85, 0.28, 100, 16);
    const knotMat = new THREE.MeshNormalMaterial({ wireframe: false });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    knotGroup.add(knotMesh);

    const wireGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const wireMat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xf54e00, transparent: true, opacity: 0.25 });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    knotGroup.add(wireMesh);

    scene.add(knotGroup);

    // Offscreen render target for the 3D scene
    const renderTarget = new THREE.WebGLRenderTarget(width, height);

    // Orthographic camera & quad for the ASCII post-processing pass
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postScene = new THREE.Scene();

    // Procedural ASCII GLSL Shader
    const asciiShader = {
      uniforms: {
        tDiffuse: { value: renderTarget.texture },
        u_resolution: { value: new THREE.Vector2(width, height) },
        u_time: { value: 0 },
        u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
        u_ripple: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        /*
         * Copyright (c) 2026 INDEX0 AI Inc. All Rights Reserved.
         */
        precision highp float;
        uniform sampler2D tDiffuse;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse;
        uniform float u_ripple;
        varying vec2 vUv;

        float getLuminance(vec3 color) {
          return 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
        }

        // Procedural 5x7 ASCII character renderer
        // Glyphs: " ", ".", ":", "-", "=", "+", "*", "#", "%", "@"
        float drawGlyph(vec2 uv, int charIndex) {
          vec2 p = uv * vec2(5.0, 7.0);
          vec2 cell = floor(p);
          vec2 f = fract(p);

          if (charIndex == 0) return 0.0; // Space
          if (charIndex == 1) { // .
            return (cell.x == 2.0 && cell.y == 1.0) ? 1.0 : 0.0;
          }
          if (charIndex == 2) { // :
            return (cell.x == 2.0 && (cell.y == 2.0 || cell.y == 4.0)) ? 1.0 : 0.0;
          }
          if (charIndex == 3) { // -
            return (cell.y == 3.0 && cell.x >= 1.0 && cell.x <= 3.0) ? 1.0 : 0.0;
          }
          if (charIndex == 4) { // =
            return ((cell.y == 2.0 || cell.y == 4.0) && cell.x >= 1.0 && cell.x <= 3.0) ? 1.0 : 0.0;
          }
          if (charIndex == 5) { // +
            return ((cell.x == 2.0 && cell.y >= 1.0 && cell.y <= 5.0) || (cell.y == 3.0 && cell.x >= 0.0 && cell.x <= 4.0)) ? 1.0 : 0.0;
          }
          if (charIndex == 6) { // *
            return ((cell.x == cell.y - 1.0) || (cell.x == 5.0 - cell.y)) && cell.y >= 1.0 && cell.y <= 5.0 ? 1.0 : 0.0;
          }
          if (charIndex == 7) { // #
            return ((cell.x == 1.0 || cell.x == 3.0) && cell.y >= 1.0 && cell.y <= 5.0) ||
                   ((cell.y == 2.0 || cell.y == 4.0) && cell.x >= 0.0 && cell.x <= 4.0) ? 1.0 : 0.0;
          }
          if (charIndex == 8) { // %
            return ((cell.x == 1.0 && cell.y == 5.0) || (cell.x == 3.0 && cell.y == 1.0) || (cell.x == 4.0 - cell.y)) ? 1.0 : 0.0;
          }
          // @
          return (cell.x >= 1.0 && cell.x <= 3.0 && (cell.y == 1.0 || cell.y == 5.0)) ||
                 (cell.x == 0.0 && cell.y >= 2.0 && cell.y <= 4.0) ||
                 (cell.x == 4.0 && cell.y >= 2.0 && cell.y <= 5.0) ||
                 (cell.x == 2.0 && cell.y == 3.0) ? 1.0 : 0.0;
        }

        void main() {
          // Kinetic ripple deflection from mouse
          vec2 mouseDist = vUv - u_mouse;
          float dist = length(mouseDist);
          float ripple = sin(dist * 25.0 - u_time * 4.0) * exp(-dist * 4.0) * 0.015 * u_ripple;
          vec2 uv = vUv + normalize(mouseDist + 0.0001) * ripple;

          // ASCII cell size: 10px by 14px
          vec2 charSize = vec2(10.0, 14.0);
          vec2 numChars = floor(u_resolution / charSize);
          vec2 cellCoord = floor(uv * numChars);
          vec2 cellUV = fract(uv * numChars);

          // Sample scene luminance at cell center
          vec2 sampleUV = (cellCoord + 0.5) / numChars;
          vec4 sceneColor = texture2D(tDiffuse, sampleUV);
          float lum = getLuminance(sceneColor.rgb);

          int charIdx = int(floor(lum * 9.5));
          charIdx = clamp(charIdx, 0, 9);

          float charPixel = drawGlyph(cellUV, charIdx);

          // CRT scanline pass
          float scanline = sin(gl_FragCoord.y * 1.4) * 0.08;

          // Color palette: Warm Cursor Orange highlight + Ink base
          vec3 inkColor = vec3(0.15, 0.14, 0.12);
          vec3 orangeColor = vec3(0.96, 0.31, 0.0); // #f54e00
          vec3 charColor = mix(inkColor, orangeColor, lum * 1.3);

          vec3 finalColor = charColor * charPixel - scanline;
          float alpha = charPixel > 0.0 ? clamp(lum * 1.5 + 0.1, 0.0, 1.0) : 0.0;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    };

    const postMat = new THREE.ShaderMaterial({
      vertexShader: asciiShader.vertexShader,
      fragmentShader: asciiShader.fragmentShader,
      uniforms: asciiShader.uniforms,
      transparent: true,
    });

    const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat);
    postScene.add(postQuad);

    // Mouse Interaction
    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetRotX = 0;
    let targetRotY = 0;
    let rippleStrength = 0.5;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      mouseX = x;
      mouseY = y;
      targetRotY = (x - 0.5) * 2.5;
      targetRotX = (y - 0.5) * 2.5;
      rippleStrength = 1.0;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderTarget.setSize(w, h);
      asciiShader.uniforms.u_resolution.value.set(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth rotation
      knotGroup.rotation.x += 0.008 + (targetRotX - knotGroup.rotation.x) * 0.05;
      knotGroup.rotation.y += 0.012 + (targetRotY - knotGroup.rotation.y) * 0.05;
      wireMesh.rotation.z = -elapsedTime * 0.2;

      // Update shader uniforms
      asciiShader.uniforms.u_time.value = elapsedTime;
      asciiShader.uniforms.u_mouse.value.set(mouseX, mouseY);
      rippleStrength *= 0.96;
      asciiShader.uniforms.u_ripple.value = rippleStrength;

      // Render 3D scene to offscreen target
      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);

      // Render ASCII post-processing pass to canvas
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      renderTarget.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[380px] md:min-h-[480px] overflow-hidden ${className}`}
      title="GPU-Accelerated WebGL ASCII Motion Engine"
    />
  );
}
