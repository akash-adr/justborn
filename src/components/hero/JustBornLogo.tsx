'use client';

import React from 'react';
import { LogoLetter, LetterConfig } from './LogoLetter';
import { NumberBlocks } from './NumberBlocks';

interface JustBornLogoProps {
  svgRef?: React.RefObject<SVGSVGElement | null>;
  onSetLetterRef?: (index: number, el: SVGElement | null) => void;
  onSetBlockRef?: (index: number, el: SVGElement | null) => void;
  className?: string;
}

export function JustBornLogo({
  svgRef,
  onSetLetterRef,
  onSetBlockRef,
  className = '',
}: JustBornLogoProps) {
  // Configurations for all 8 letters matching the physical storefront sign
  const lettersConfig: LetterConfig[] = [
    // 1. J - Royal Blue
    {
      id: 'letter-j',
      char: 'J',
      className: 'letter-j',
      faceGradientId: 'blue-royal-grad',
      depthColor: '#032454',
      rimStrokeId: 'chrome-rim',
      path: 'M 52,75 L 165,75 L 165,205 C 165,248 135,268 85,268 C 48,268 25,245 25,205 L 75,205 C 75,222 86,228 98,228 C 112,228 118,218 118,198 L 118,118 L 52,118 Z',
      highlightPath: 'M 60,82 L 158,82 M 158,90 L 158,190',
      defaultRotation: -2,
      centerOrigin: { x: 95, y: 170 },
    },
    // 2. u - Royal Blue
    {
      id: 'letter-u',
      char: 'u',
      className: 'letter-u',
      faceGradientId: 'blue-royal-grad',
      depthColor: '#032454',
      rimStrokeId: 'chrome-rim',
      path: 'M 182,125 L 228,125 L 228,205 C 228,218 238,226 248,226 C 258,226 268,218 268,205 L 268,125 L 314,125 L 314,265 L 268,265 L 268,248 C 258,262 242,268 225,268 C 196,268 182,248 182,216 Z',
      highlightPath: 'M 188,131 L 222,131 M 274,131 L 308,131',
      defaultRotation: 1,
      centerOrigin: { x: 248, y: 195 },
    },
    // 3. s - Royal Blue
    {
      id: 'letter-s',
      char: 's',
      className: 'letter-s',
      faceGradientId: 'blue-royal-grad',
      depthColor: '#032454',
      rimStrokeId: 'chrome-rim',
      path: 'M 345,158 C 348,138 368,124 398,124 C 432,124 452,142 452,166 C 452,212 370,195 370,225 C 370,234 380,238 396,238 C 412,238 424,230 428,218 L 468,218 C 462,250 435,268 396,268 C 358,268 328,248 328,218 C 328,172 410,190 410,160 C 410,152 402,146 392,146 C 378,146 368,154 366,168 Z',
      highlightPath: 'M 370,131 C 385,128 415,128 435,138',
      defaultRotation: -1,
      centerOrigin: { x: 395, y: 195 },
    },
    // 4. t - Royal Blue
    {
      id: 'letter-t',
      char: 't',
      className: 'letter-t',
      faceGradientId: 'blue-royal-grad',
      depthColor: '#032454',
      rimStrokeId: 'chrome-rim',
      path: 'M 505,92 L 550,92 L 550,125 L 576,125 L 576,158 L 550,158 L 550,222 C 550,232 556,238 566,238 C 572,238 576,236 578,234 L 578,265 C 570,268 558,269 544,269 C 516,269 505,252 505,224 L 505,158 L 468,158 L 468,125 L 505,125 Z',
      highlightPath: 'M 510,98 L 545,98 M 474,131 L 570,131',
      defaultRotation: 1.5,
      centerOrigin: { x: 520, y: 180 },
    },
    // 5. b - Vibrant Cerulean Blue
    {
      id: 'letter-b',
      char: 'b',
      className: 'letter-b',
      faceGradientId: 'blue-cerulean-grad',
      depthColor: '#013E78',
      rimStrokeId: 'chrome-rim',
      path: 'M 625,75 L 670,75 L 670,142 C 685,130 706,124 728,124 C 772,124 808,158 808,198 C 808,238 772,268 728,268 C 705,268 684,262 670,250 L 670,265 L 625,265 Z',
      innerPaths: [
        'M 718,162 C 695,162 670,178 670,198 C 670,218 695,232 718,232 C 742,232 764,218 764,198 C 764,178 742,162 718,162 Z',
      ],
      highlightPath: 'M 632,82 L 664,82 M 700,131 C 730,128 770,138 785,160',
      defaultRotation: -1,
      centerOrigin: { x: 715, y: 170 },
    },
    // 6. o - Vibrant Cerulean Blue
    {
      id: 'letter-o',
      char: 'o',
      className: 'letter-o',
      faceGradientId: 'blue-cerulean-grad',
      depthColor: '#013E78',
      rimStrokeId: 'chrome-rim',
      path: 'M 875,124 C 922,124 956,157 956,196 C 956,235 922,268 875,268 C 828,268 794,235 794,196 C 794,157 828,124 875,124 Z',
      innerPaths: [
        'M 875,162 C 854,162 838,177 838,196 C 838,215 854,230 875,230 C 896,230 912,215 912,196 C 912,177 896,162 875,162 Z',
      ],
      highlightPath: 'M 835,142 C 855,130 895,130 915,142',
      defaultRotation: 1,
      centerOrigin: { x: 875, y: 196 },
    },
    // 7. r - Soft Playful Pink
    {
      id: 'letter-r',
      char: 'r',
      className: 'letter-r',
      faceGradientId: 'pink-playful-grad',
      depthColor: '#B84A5B',
      rimStrokeId: 'chrome-rim',
      path: 'M 975,125 L 1020,125 L 1020,150 C 1032,132 1052,124 1074,124 C 1084,124 1092,126 1098,128 L 1090,165 C 1082,162 1074,160 1064,160 C 1042,160 1020,174 1020,202 L 1020,265 L 975,265 Z',
      highlightPath: 'M 982,131 L 1014,131 M 1035,132 C 1055,128 1075,132 1088,140',
      defaultRotation: -1.2,
      centerOrigin: { x: 1035, y: 195 },
    },
    // 8. n - Toy Emerald Green
    {
      id: 'letter-n',
      char: 'n',
      className: 'letter-n',
      faceGradientId: 'green-toy-grad',
      depthColor: '#015628',
      rimStrokeId: 'chrome-rim',
      path: 'M 1115,125 L 1160,125 L 1160,148 C 1172,132 1195,124 1218,124 C 1248,124 1268,144 1268,178 L 1268,265 L 1222,265 L 1222,185 C 1222,168 1212,158 1198,158 C 1182,158 1160,170 1160,192 L 1160,265 L 1115,265 Z',
      highlightPath: 'M 1122,131 L 1154,131 M 1175,132 C 1205,128 1245,138 1258,165',
      defaultRotation: 1,
      centerOrigin: { x: 1190, y: 195 },
    },
  ];

  return (
    <div className={`relative flex items-center justify-center w-full ${className}`}>
      {/* Semantic accessible label */}
      <span className="sr-only">Just Born - Premium Toy Store</span>

      <svg
        ref={svgRef}
        viewBox="0 0 1320 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-[55vh] select-none overflow-visible drop-shadow-md"
        role="img"
        aria-label="Just Born Storefront Logo"
      >
        <defs>
          {/* 1. CHROME / METALLIC SILVER BEZEL RIM */}
          <linearGradient id="chrome-rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#CBD5E1" />
            <stop offset="55%" stopColor="#94A3B8" />
            <stop offset="85%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>

          {/* 2. ROYAL BLUE GRADIENT (J, u, s, t) */}
          <linearGradient id="blue-royal-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#126DE2" />
            <stop offset="40%" stopColor="#0B52B0" />
            <stop offset="100%" stopColor="#063D85" />
          </linearGradient>

          {/* 3. CERULEAN / SKY BLUE GRADIENT (b, o) */}
          <linearGradient id="blue-cerulean-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E9BFF" />
            <stop offset="45%" stopColor="#0077D8" />
            <stop offset="100%" stopColor="#005BAB" />
          </linearGradient>

          {/* 4. PLAYFUL PINK GRADIENT (r) */}
          <linearGradient id="pink-playful-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFB8C2" />
            <stop offset="50%" stopColor="#F79CA8" />
            <stop offset="100%" stopColor="#E07080" />
          </linearGradient>

          {/* 5. TOY EMERALD GREEN GRADIENT (n) */}
          <linearGradient id="green-toy-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1FE082" />
            <stop offset="45%" stopColor="#05A852" />
            <stop offset="100%" stopColor="#017838" />
          </linearGradient>

          {/* 6. TOY NUMBER BLOCKS GRADIENTS */}
          <linearGradient id="block-red-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#D9232E" />
          </linearGradient>

          <linearGradient id="block-green-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#05A852" />
          </linearGradient>

          <linearGradient id="block-blue-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        {/* ---------------- 8 INDEPENDENT PHYSICAL LETTERS ---------------- */}
        <g id="letters-container" className="letters-container">
          {lettersConfig.map((config, i) => (
            <LogoLetter
              key={config.id}
              config={config}
              letterRef={(el) => {
                onSetLetterRef?.(i, el);
              }}
            />
          ))}
        </g>

        {/* ---------------- TOY COUNTING NUMBER BLOCKS (1 2 3) ---------------- */}
        <NumberBlocks onSetRef={onSetBlockRef} />
      </svg>
    </div>
  );
}
