
import React from 'react';
import { PawPrintIcon } from './icons/PawPrintIcon';

interface WelcomeProps {
  onGetStarted: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onGetStarted }) => {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex items-center justify-center bg-slate-900">
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
      >
        <source src="https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <div className="relative z-20 flex flex-col items-center text-center text-white animate-fade-in p-4">
        <div className="bg-black/30 p-4 rounded-full mb-6 ring-1 ring-white/25 backdrop-blur-sm">
            <PawPrintIcon className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>PetGuide AI</h1>
        <p className="mt-4 text-lg max-w-md" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
            Your AI companion for pet wellness.
            <br/>
            Snap a photo to get started.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
                onClick={onGetStarted}
                className="py-3 px-8 border border-transparent rounded-full shadow-lg text-base font-semibold text-slate-900 bg-white hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white transition-all duration-300 transform hover:scale-105"
            >
                Get Started
            </button>
        </div>
      </div>
    </div>
  );
};