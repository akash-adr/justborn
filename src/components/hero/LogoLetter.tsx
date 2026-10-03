'use client';

import React from 'react';

export interface LetterConfig {
  id: string;
  char: string;
  className: string;
  faceGradientId: string;
  depthColor: string;
  rimStrokeId: string;
  path: string;
  innerPaths?: string[]; // for counters/holes like in o, b
  highlightPath?: string;
  defaultRotation: number;
  centerOrigin: { x: number; y: number };
}

interface LogoLetterProps {
  config: LetterConfig;
  letterRef?: (el: SVGElement | null) => void;
}

export function LogoLetter({ config, letterRef }: LogoLetterProps) {
  const {
    id,
    char,
    className,
    faceGradientId,
    depthColor,
    rimStrokeId,
    path,
    innerPaths = [],
    highlightPath,
    defaultRotation,
    centerOrigin,
  } = config;

  return (
    <g
      id={id}
      ref={letterRef}
      className={`logo-letter ${className} cursor-pointer group`}
      style={{
        transformOrigin: `${centerOrigin.x}px ${centerOrigin.y}px`,
        transform: `rotate(${defaultRotation}deg)`,
      }}
      data-letter={char}
    >
      {/* 1. AMBIENT CONTACT SHADOW (onto the storefront white panel) */}
      <path
        d={path}
        fill="rgba(15, 23, 42, 0.18)"
        transform="translate(4, 9)"
        filter="blur(4px)"
        className="pointer-events-none"
      />
      <path
        d={path}
        fill="rgba(15, 23, 42, 0.12)"
        transform="translate(2, 4)"
        filter="blur(1.5px)"
        className="pointer-events-none"
      />

      {/* 2. 3D METALLIC CHANNEL EXTRUSION / SIDE DEPTH */}
      <path
        d={path}
        fill={depthColor}
        transform="translate(1.5, 3.5)"
        stroke={depthColor}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* 3. SILVER / CHROME METALLIC BEZEL RIM (Storefront Channel Letter Edging) */}
      <path
        d={path}
        fill="none"
        stroke={`url(#${rimStrokeId})`}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="drop-shadow(0px 1px 1px rgba(0,0,0,0.15))"
      />

      {/* 4. MAIN GLOSSY ACRYLIC LETTER FACE */}
      <path
        d={path}
        fill={`url(#${faceGradientId})`}
        className="transition-all duration-300 group-hover:brightness-105"
      />

      {/* 5. INNER COUNTERS / HOLES (for letters like b and o) */}
      {innerPaths.map((innerD, idx) => (
        <g key={idx}>
          {/* Inner hole depth */}
          <path
            d={innerD}
            fill="#CBD5E1"
            stroke={`url(#${rimStrokeId})`}
            strokeWidth="3.5"
          />
          <path
            d={innerD}
            fill="#F8FAFC"
            transform="translate(-0.5, -0.5)"
          />
          {/* Inner shadow */}
          <path
            d={innerD}
            fill="none"
            stroke="rgba(0, 0, 0, 0.15)"
            strokeWidth="2"
          />
        </g>
      ))}

      {/* 6. TOP SPECULAR DAYLIGHT HIGHLIGHT (Acrylic Reflection) */}
      {highlightPath && (
        <path
          d={highlightPath}
          fill="none"
          stroke="rgba(255, 255, 255, 0.55)"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="pointer-events-none transition-opacity duration-300 group-hover:stroke-white"
        />
      )}
    </g>
  );
}
