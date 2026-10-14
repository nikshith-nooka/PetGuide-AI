import React from 'react';
import { WoundAnalysisResult, UrgencyLevel, FeatureView } from '../types';
import { ShieldCheckIcon, ExclamationCircleIcon, ShieldAlertIcon, LightBulbIcon, EyeIcon } from './icons/InfoIcons';
import { VetIcon, ChatBubbleIcon, StethoscopeIcon } from './icons/FeatureIcons';

const urgencyStyles: { [key in UrgencyLevel]: { bgColor: string, textColor: string, borderColor: string, icon: JSX.Element, title: string } } = {
  [UrgencyLevel.HomeCare]: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
    icon: <ShieldCheckIcon className="h-6 w-6 text-green-500" />,
    title: 'Home Care Recommended'
  },
  [UrgencyLevel.VetVisitSoon]: {
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-400',
    icon: <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />,
    title: 'Vet Visit Recommended Soon'
  },
  [UrgencyLevel.Emergency]: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-400',
    icon: <ShieldAlertIcon className="h-6 w-6 text-red-500" />,
    title: 'Emergency: See a Vet'
  }
};

interface WoundAnalysisCardProps {
  analysis: WoundAnalysisResult;
  onSelectFeature: (view: FeatureView) => void;
}

export const WoundAnalysisCard: React.FC<WoundAnalysisCardProps> = ({ analysis, onSelectFeature }) => {
  const styles = urgencyStyles[analysis.urgencyLevel] || urgencyStyles[UrgencyLevel.HomeCare];

  return (
    <div className={`rounded-xl border ${styles.borderColor} ${styles.bgColor} text-sm w-full`}>
      <div className={`p-4 border-b ${styles.borderColor}`}>
        <div className="flex items-center gap-3">
          {styles.icon}
          <div>
            <h3 className={`text-base font-bold ${styles.textColor}`}>{styles.title}</h3>
            <p className="text-slate-600">AI identified the issue as: <span className="font-semibold">{analysis.issueType}</span></p>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4 text-slate-700">
        <div className="bg-white/60 rounded-lg p-3 border border-slate-200/80">
           <div className="flex items-start gap-3">
             <LightBulbIcon className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
             <div>
                <h4 className="font-semibold text-slate-800 mb-1">Care Recommendations</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{analysis.careRecommendations}</p>
             </div>
           </div>
        </div>

        <div className="bg-white/60 rounded-lg p-3 border border-slate-200/80">
           <div className="flex items-start gap-3">
             <EyeIcon className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
             <div>
                <h4 className="font-semibold text-slate-800 mb-1">What to Watch For</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {analysis.thingsToWatchFor.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
             </div>
           </div>
        </div>
      </div>

      <div className="px-4 pt-2 pb-4">
        <h4 className="text-sm font-semibold text-slate-800 mb-3 text-center">Next Steps</h4>
        <div className="flex flex-col sm:flex-row gap-3">
            <button
                onClick={() => onSelectFeature('vet_finder')}
                className="flex-1 flex items-center justify-center gap-2 text-center py-2 px-3 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-200 transition-colors"
                aria-label="Find a Nearby Vet"
            >
                <VetIcon className="w-4 h-4" />
                Find a Vet
            </button>
            <button
                onClick={() => onSelectFeature('chatbot')}
                className="flex-1 flex items-center justify-center gap-2 text-center py-2 px-3 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
                aria-label="Ask AI Vet"
            >
                <ChatBubbleIcon className="w-4 h-4" />
                Ask AI Vet
            </button>
            <button
                onClick={() => onSelectFeature('checker')}
                 className="flex-1 flex items-center justify-center gap-2 text-center py-2 px-3 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
                 aria-label="Go to Symptom Checker"
            >
                <StethoscopeIcon className="w-4 h-4" />
                Symptom Checker
            </button>
        </div>
      </div>

      <div className={`p-3 text-xs text-center rounded-b-xl border-t ${styles.borderColor} ${styles.textColor} bg-white/50`}>
        <p><strong>Disclaimer:</strong> {analysis.disclaimer}</p>
      </div>
    </div>
  );
};