'use client';

import Image from 'next/image';

export default function MAAGAPLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maagap-blue to-blue-900">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="animate-pulse">
            <Image 
              src="/logo.png" 
              alt="MAAGAP Logo" 
              width={150} 
              height={150} 
              className="mx-auto drop-shadow-2xl"
              priority
            />
          </div>
          {/* Spinning Ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            MAAGAP GUARDIANS
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-white/80 text-sm">Loading...</p>
        </div>
      </div>
    </div>
  );
}
