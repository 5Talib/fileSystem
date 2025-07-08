"use client";
import React from "react";
import Lottie from "lottie-react";

type ModalUploadSpinnerProps = {
  text?: string;
  animation?: object;
};

export default function ModalSpinner({ text, animation }: ModalUploadSpinnerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm w-full">
      <div
        className="relative bg-white/95 backdrop-blur rounded-2xl p-8 shadow-2xl flex flex-col items-center border-2 border-blue-200"
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.23)",
        }}
      >
        {/* Animated glowing border */}
        <div
          className="absolute -inset-1 rounded-2xl pointer-events-none z-[-1] animate-glow"
          style={{
            background: "linear-gradient(270deg, #60a5fa, #38bdf8, #818cf8, #60a5fa)",
            filter: "blur(10px)",
            opacity: 0.7,
          }}
        />
        {/* Lottie Animation */}
        <Lottie
          animationData={animation}
          loop
          autoplay
          style={{ width: 140, height: 140 }}
        />
        {/* Uploading Text */}
        <div className="mt-6 text-xl font-bold text-blue-700 drop-shadow">
          {text}
        </div>
      </div>
      {/* Glowing border animation keyframes */}
      <style jsx>{`
        @keyframes glow {
          0% { filter: blur(10px) hue-rotate(0deg);}
          100% { filter: blur(10px) hue-rotate(360deg);}
        }
        .animate-glow {
          animation: glow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
