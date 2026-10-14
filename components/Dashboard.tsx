import React from 'react';
import { Pet, Feature, FeatureView } from '../types';
import { DogIcon } from './icons/DogIcon';
import { FeatureCard } from './FeatureCard';
import { StethoscopeIcon, ChatBubbleIcon, NutritionIcon, VetIcon, GroomingIcon, SearchIcon, FirstAidIcon } from './icons/FeatureIcons';

interface DashboardProps {
  pet: Pet;
  onSelectFeature: (view: FeatureView) => void;
  onStartOver: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ pet, onSelectFeature, onStartOver }) => {

    const features: Feature[] = [
        {
            title: 'Symptom Checker',
            description: 'Get an AI-powered analysis of your pet\'s symptoms.',
            icon: <StethoscopeIcon />,
            view: 'checker',
            enabled: true,
        },
        {
            title: 'AI Wound & Rash Scanner',
            description: 'Upload a photo of a skin issue for an AI analysis.',
            icon: <FirstAidIcon />,
            view: 'wound_scanner',
            enabled: true,
        },
        {
            title: 'Virtual Vet Chatbot',
            description: 'Ask general questions about pet care, diet, and training.',
            icon: <ChatBubbleIcon />,
            view: 'chatbot',
            enabled: true,
        },
        {
            title: 'Nutrition Planner',
            description: 'Generate a custom diet plan for your pet\'s needs.',
            icon: <NutritionIcon />,
            view: 'nutrition',
            enabled: true,
        },
        {
            title: 'Nearby Vet Finder',
            description: 'Locate emergency clinics and vets in your area.',
            icon: <VetIcon />,
            view: 'vet_finder',
            enabled: true,
        },
         {
            title: 'Grooming Guides',
            description: 'Access tutorials for home grooming and care.',
            icon: <GroomingIcon />,
            view: 'grooming',
            enabled: true,
        },
        {
            title: 'Lost & Found',
            description: 'Report or search for lost and adoptable pets.',
            icon: <SearchIcon />,
            view: 'lost_found',
            enabled: true,
        },
    ];

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 animate-fade-in bg-gray-50">
       <header className="w-full max-w-5xl mb-6 sm:mb-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full shadow-sm border border-slate-200">
                    <DogIcon className="h-8 w-8 text-indigo-500" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">PetGuide AI</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-white py-2 px-3 rounded-lg shadow-sm border border-slate-200">
                    <span className="font-semibold">{pet.name}</span>
                    <span className="text-slate-300">|</span>
                    <span className="hidden sm:inline text-slate-400 text-xs uppercase tracking-wider">Age</span> 
                    <span className="hidden sm:inline">{pet.age}</span>
                    <span className="text-slate-300 hidden sm:inline">|</span>
                    <span>{pet.breed}</span>
                </div>
                <button onClick={onStartOver} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap">
                    New Pet
                </button>
            </div>
        </header>

        <main className="w-full max-w-5xl flex-grow">
            <h2 className="text-xl font-bold text-slate-700 mb-2">Welcome, {pet.name}!</h2>
            <p className="text-slate-500 mb-6">What would you like to do today?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.sort((a,b) => a.title.localeCompare(b.title)).map(feature => (
                    <FeatureCard key={feature.view} feature={feature} onSelect={() => onSelectFeature(feature.view)} />
                ))}
            </div>
        </main>

       <footer className="w-full max-w-5xl mt-8 text-center text-xs text-slate-500">
            <p>PetGuide AI is for informational purposes only and is not a substitute for professional veterinary advice. Always consult a licensed veterinarian for any health concerns.</p>
        </footer>
    </div>
  );
};