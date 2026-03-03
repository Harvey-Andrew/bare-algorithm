'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Palette } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

export default function PixelProcessingDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [operation, setOperation] = useState<'invert' | 'grayscale' | 'redChannel'>('invert');

  const processImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 200, 200);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.5, '#4ecdc4');
    gradient.addColorStop(1, '#45b7d1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 200, 200);

    const imageData = ctx.getImageData(0, 0, 200, 200);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      if (operation === 'invert') {
        data[i] = 255 ^ r; // XOR 取反
        data[i + 1] = 255 ^ g;
        data[i + 2] = 255 ^ b;
      } else if (operation === 'grayscale') {
        const gray = (r + g + b) / 3;
        data[i] = data[i + 1] = data[i + 2] = gray;
      } else if (operation === 'redChannel') {
        data[i + 1] = data[i + 2] = 0; // 只保留红通道
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, [operation]);

  useEffect(() => {
    processImage();
  }, [processImage]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/bit-manipulation" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/20">
                <ImageIcon className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">像素处理与 Canvas</h1>
                <p className="text-sm text-slate-400">位运算处理 RGBA</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="rounded-xl border border-slate-700"
          />
          <div className="flex gap-2">
            {(['invert', 'grayscale', 'redChannel'] as const).map((op) => (
              <button
                key={op}
                onClick={() => setOperation(op)}
                className={`px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2
                  ${operation === op ? 'bg-pink-500 text-black' : 'bg-slate-700'}`}
              >
                <Palette className="w-4 h-4" />
                {op === 'invert' ? '反相 (XOR)' : op === 'grayscale' ? '灰度' : '红通道'}
              </button>
            ))}
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
            <code className="text-emerald-400">data[i] = 255 ^ data[i]</code>
            <p className="text-sm text-slate-400 mt-2">使用 XOR 实现颜色反相</p>
          </div>
        </div>
      </main>
    </div>
  );
}
