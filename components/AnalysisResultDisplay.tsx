
import React, { useState } from 'react';
import { PetAnalysisDetails } from '../types';

interface AnalysisResultDisplayProps {
  analysis: PetAnalysisDetails;
  onConfirm: (petName: string) => void;
}

export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ analysis, onConfirm }) => {
  const [petName, setPetName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (petName.trim()) {
      onConfirm(petName.trim());
    }
  };
  
  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 border">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-slate-800">Analysis Complete!</h2>
          <p className="text-slate-600 mt-2">Our AI thinks your pet is a <span className="font-semibold text-indigo-600">{analysis.breed}</span>.</p>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200 space-y-4">
           <div>
             <strong className="font-semibold text-slate-700">Ideal Living Conditions:</strong>
             <p className="text-slate-600">{analysis.idealLivingConditions}</p>
           </div>
           <div>
             <strong className="font-semibold text-slate-700">Common Eating Habits:</strong>
             <p className="text-slate-600">{analysis.commonEatingHabits}</p>
           </div>
           <div>
             <strong className="font-semibold text-slate-700">Suggested Food Items:</strong>
             <ul className="list-disc list-inside text-slate-600 mt-1">{analysis.suggestedFoodItems.map((item, i) => <li key={i}>{item}</li>)}</ul>
           </div>
           <div>
             <strong className="font-semibold text-slate-700">Possible Health Concerns:</strong>
             <ul className="list-disc list-inside text-slate-600 mt-1">{analysis.possibleDiseases.map((item, i) => <li key={i}>{item}</li>)}</ul>
           </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <p className="text-lg font-semibold text-slate-700 text-center mb-4">Finally, what's your pet's name?</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              required
              className="flex-grow block w-full px-4 py-3 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-base"
              placeholder="e.g., Buddy"
            />
            <button
              type="submit"
              disabled={!petName.trim()}
              className="w-full sm:w-auto flex-shrink-0 py-3 px-8 border border-transparent rounded-md shadow-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-500/50 disabled:cursor-not-allowed transition-colors"
            >
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};