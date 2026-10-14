import React from 'react';
import { AnalysisResult, UrgencyLevel } from '../types';
import { ShieldCheckIcon, ExclamationCircleIcon, ShieldAlertIcon, LightBulbIcon, DocumentTextIcon } from './icons/InfoIcons';

const urgencyStyles: { [key in UrgencyLevel]: { bgColor: string, textColor: string, borderColor: string, icon: React.ReactNode, title: string } } = {
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
    title: 'Emergency: See a Vet Immediately'
  }
};

interface AnalysisCardProps {
  analysis: AnalysisResult;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis }) => {
  const styles = urgencyStyles[analysis.urgencyLevel] || urgencyStyles[UrgencyLevel.HomeCare];

  return (
    <div className={`rounded-xl border ${styles.borderColor} ${styles.bgColor} text-sm w-full`}>
      <div className={`p-4 border-b ${styles.borderColor}`}>
        <div className="flex items-center gap-3">
          {styles.icon}
          <h3 className={`text-base font-bold ${styles.textColor}`}>{styles.title}</h3>
        </div>
      </div>
      
      <div className="p-4 space-y-4 text-slate-700">
        <div>
          <h4 className="font-semibold text-slate-800 mb-2">Possible Issues:</h4>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            {analysis.possibleIssues.map((issue, index) => <li key={index}>{issue}</li>)}
          </ul>
        </div>
        
        <div className="bg-white/60 rounded-lg p-3 border border-slate-200/80">
           <div className="flex items-start gap-3">
             <LightBulbIcon className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
             <div>
                <h4 className="font-semibold text-slate-800 mb-1">Recommendations</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{analysis.recommendations}</p>
             </div>
           </div>
        </div>

        <div className="bg-white/60 rounded-lg p-3 border border-slate-200/80">
           <div className="flex items-start gap-3">
             <DocumentTextIcon className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
             <div>
                <h4 className="font-semibold text-slate-800 mb-1">Detailed Explanation</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{analysis.detailedExplanation}</p>
             </div>
           </div>
        </div>
      </div>

      <div className={`p-3 text-xs text-center rounded-b-xl border-t ${styles.borderColor} ${styles.textColor} bg-white/50`}>
        <p><strong>Disclaimer:</strong> {analysis.disclaimer}</p>
      </div>
    </div>
  );
};
