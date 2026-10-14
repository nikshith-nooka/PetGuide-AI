import React from 'react';
import { Feature } from '../types';

interface FeatureCardProps {
  feature: Feature;
  onSelect: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      disabled={!feature.enabled}
      className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg disabled:shadow-md transition-all duration-300 text-left flex flex-col items-start gap-4 h-full relative group disabled:cursor-not-allowed transform hover:-translate-y-1 disabled:transform-none border border-transparent hover:border-indigo-200"
    >
        {!feature.enabled && (
            <div className="absolute top-4 right-4 bg-slate-200 text-slate-600 text-xs font-semibold px-2 py-1 rounded-full">
                Coming Soon
            </div>
        )}
      <div className={`p-3 rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300 ${!feature.enabled && 'opacity-60'}`}>
        {React.cloneElement(feature.icon, { className: 'h-6 w-6' })}
      </div>
      <div className="flex-grow">
        <h3 className={`text-lg font-bold text-slate-800 ${!feature.enabled && 'text-slate-400'}`}>{feature.title}</h3>
        <p className={`mt-1 text-sm text-slate-500 ${!feature.enabled && 'text-slate-400'}`}>{feature.description}</p>
      </div>
       <div className={`mt-auto text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors ${!feature.enabled && 'text-slate-400'}`}>
        {feature.enabled ? 'Get Started →' : 'Unavailable'}
      </div>
    </button>
  );
};