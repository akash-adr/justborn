'use client';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function OrderSuccessClient() {
  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E63946', '#DC2626', '#FF6B6B', '#FFD166'],
      });
    } catch {}
  }, []);

  return null;
}
