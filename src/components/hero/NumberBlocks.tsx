'use client';

import React from 'react';

interface NumberBlocksProps {
  onSetRef?: (index: number, el: SVGElement | null) => void;
}

export function NumberBlocks({ onSetRef }: NumberBlocksProps) {
  return (
    <g className="number-blocks-group cursor-pointer select-none">
      {/* ----------------- BLOCK 1: RED [1] ----------------- */}
      <g
        ref={(el) => {
          onSetRef?.(0, el);
        }}
        className="block-item block-1 transition-transform duration-300 hover:scale-110"
        transform="translate(1110, 48) rotate(-14 26 26)"
      >
        {/* Contact Shadow */}
        <rect
          x="3"
          y="6"
          width="48"
          height="48"
          rx="12"
          fill="rgba(15, 23, 42, 0.16)"
          filter="blur(2.5px)"
        />
        {/* 3D Extrusion Side */}
        <rect
          x="0"
          y="2.5"
          width="48"
          height="48"
          rx="12"
          fill="#9E1019"
        />
        {/* Front Face */}
        <rect
          x="0"
          y="0"
          width="48"
          height="48"
          rx="12"
          fill="url(#block-red-grad)"
          stroke="#FCA5A5"
          strokeWidth="1.2"
        />
        {/* Top Glare Highlight */}
        <path
          d="M 6 4 Q 24 2 42 4"
          stroke="rgba(255, 255, 255, 0.65)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Number 1 */}
        <text
          x="24"
          y="34"
          textAnchor="middle"
          fontSize="30"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FFFFFF"
          filter="drop-shadow(0px 1px 1px rgba(0,0,0,0.3))"
        >
          1
        </text>
      </g>

      {/* ----------------- BLOCK 2: GREEN [2] ----------------- */}
      <g
        ref={(el) => {
          onSetRef?.(1, el);
        }}
        className="block-item block-2 transition-transform duration-300 hover:scale-110"
        transform="translate(1168, 56) rotate(8 26 26)"
      >
        {/* Contact Shadow */}
        <rect
          x="3"
          y="6"
          width="48"
          height="48"
          rx="12"
          fill="rgba(15, 23, 42, 0.16)"
          filter="blur(2.5px)"
        />
        {/* 3D Extrusion Side */}
        <rect
          x="0"
          y="2.5"
          width="48"
          height="48"
          rx="12"
          fill="#036932"
        />
        {/* Front Face */}
        <rect
          x="0"
          y="0"
          width="48"
          height="48"
          rx="12"
          fill="url(#block-green-grad)"
          stroke="#86EFAC"
          strokeWidth="1.2"
        />
        {/* Top Glare Highlight */}
        <path
          d="M 6 4 Q 24 2 42 4"
          stroke="rgba(255, 255, 255, 0.65)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Number 2 */}
        <text
          x="24"
          y="34"
          textAnchor="middle"
          fontSize="30"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FFFFFF"
          filter="drop-shadow(0px 1px 1px rgba(0,0,0,0.3))"
        >
          2
        </text>
      </g>

      {/* ----------------- BLOCK 3: BLUE [3] ----------------- */}
      <g
        ref={(el) => {
          onSetRef?.(2, el);
        }}
        className="block-item block-3 transition-transform duration-300 hover:scale-110"
        transform="translate(1226, 66) rotate(18 26 26)"
      >
        {/* Contact Shadow */}
        <rect
          x="3"
          y="6"
          width="48"
          height="48"
          rx="12"
          fill="rgba(15, 23, 42, 0.16)"
          filter="blur(2.5px)"
        />
        {/* 3D Extrusion Side */}
        <rect
          x="0"
          y="2.5"
          width="48"
          height="48"
          rx="12"
          fill="#1E40AF"
        />
        {/* Front Face */}
        <rect
          x="0"
          y="0"
          width="48"
          height="48"
          rx="12"
          fill="url(#block-blue-grad)"
          stroke="#93C5FD"
          strokeWidth="1.2"
        />
        {/* Top Glare Highlight */}
        <path
          d="M 6 4 Q 24 2 42 4"
          stroke="rgba(255, 255, 255, 0.65)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Number 3 */}
        <text
          x="24"
          y="34"
          textAnchor="middle"
          fontSize="30"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FFFFFF"
          filter="drop-shadow(0px 1px 1px rgba(0,0,0,0.3))"
        >
          3
        </text>
      </g>
    </g>
  );
}
