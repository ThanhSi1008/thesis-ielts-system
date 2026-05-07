"use client";

import { useState, useEffect } from "react";
import { AUTH_PREVIEW_IMAGES } from "@/constants/previews";

export default function PreviewCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % AUTH_PREVIEW_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 group">
        {AUTH_PREVIEW_IMAGES.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${idx === current
                ? "opacity-100 scale-100 translate-x-0"
                : idx < current
                  ? "opacity-0 scale-95 -translate-x-full"
                  : "opacity-0 scale-95 translate-x-full"
              }`}
          >
            <img
              src={img.url}
              alt={img.title}
              className="w-full h-full object-contain bg-slate-900"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

            <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
              <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">
                {img.title}
              </h3>
              <p className="text-slate-300 text-sm font-medium drop-shadow-md">
                {img.description}
              </p>
            </div>
          </div>
        ))}

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 right-6 flex gap-1.5 z-20">
          {AUTH_PREVIEW_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === current ? "w-6 bg-primary" : "w-1.5 bg-white/30 hover:bg-white/50"
                }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-12 text-center max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h2 className="text-4xl font-extrabold text-white mb-6 leading-[1.15] tracking-tight">
          Master your English,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC600] to-amber-300">Ace your IELTS.</span>
        </h2>
        <p className="text-slate-400 text-lg leading-relaxed font-medium">
          Personalized, AI-powered study plans designed to help you achieve your dream band score.
        </p>
      </div>
    </div>
  );
}
