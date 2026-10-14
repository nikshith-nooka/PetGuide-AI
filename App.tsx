

import React, { useState, useEffect } from 'react';
import { Pet, PetAnalysisDetails, FeatureView } from './types';
import { SymptomChecker } from './components/SymptomChecker';
import { Welcome } from './components/Welcome';
import { PetAnalyzer } from './components/PetAnalyzer';
import { AnalysisResultDisplay } from './components/AnalysisResultDisplay';
import { Dashboard } from './components/Dashboard';
import { VirtualVetChatbot } from './components/VirtualVetChatbot';
import { NutritionPlanner } from './components/NutritionPlanner';
import { NearbyVetFinder } from './components/NearbyVetFinder';
import { GroomingGuides } from './components/GroomingGuides';
import { LostAndFound } from './components/LostAndFound';
import { WoundScanner } from './components/WoundScanner';


type View = 'welcome' | 'analyzer' | 'analysisResult' | 'dashboard' | FeatureView;

const App: React.FC = () => {
  const [pet, setPet] = useState<Pet | null>(null);
  const [analysisDetails, setAnalysisDetails] = useState<PetAnalysisDetails | null>(null);
  const [isApiKeyOk, setIsApiKeyOk] = useState<boolean>(false);
  const [view, setView] = useState<View>('welcome');

  useEffect(() => {
    // In a real app, this would be a more robust check.
    if (process.env.API_KEY) {
      setIsApiKeyOk(true);
    } else {
      setIsApiKeyOk(false);
    }
  }, []);

  const handleAnalysisComplete = (details: PetAnalysisDetails) => {
    setAnalysisDetails(details);
    setView('analysisResult');
  };
  
  const handleProfileCreation = (petName: string) => {
    if (analysisDetails) {
      const newPet: Pet = {
        name: petName,
        age: analysisDetails.estimatedAgeSpan,
        breed: analysisDetails.breed,
      };
      setPet(newPet);
      setView('dashboard');
    }
  };

  const handleStartOver = () => {
    setPet(null);
    setAnalysisDetails(null);
    setView('analyzer');
  }
  
  const handleBackToDashboard = () => {
    setView('dashboard');
  }
  
  const handleBackToWelcome = () => {
    setView('welcome');
  }

  const renderContent = () => {
    if (!isApiKeyOk) {
      return (
        <div className="w-full h-screen flex items-center justify-center p-4 bg-slate-100">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md max-w-lg mx-auto" role="alert">
                <p className="font-bold">Configuration Error</p>
                <p>API key is not configured. Please ensure the API_KEY is set correctly to use this application.</p>
            </div>
        </div>
      );
    }

    switch(view) {
      case 'welcome':
        return <Welcome onGetStarted={() => setView('analyzer')} />;
      case 'analyzer':
        return <PetAnalyzer onAnalysisComplete={handleAnalysisComplete} onBack={handleBackToWelcome} />;
      case 'analysisResult':
        return <AnalysisResultDisplay analysis={analysisDetails!} onConfirm={handleProfileCreation} />;
      case 'dashboard':
        return pet ? <Dashboard pet={pet} onSelectFeature={(featureView) => setView(featureView)} onStartOver={handleStartOver} /> : <p>Loading profile...</p>;
      case 'checker':
        return pet ? <SymptomChecker pet={pet} onBack={handleBackToDashboard} /> : <p>No pet profile found.</p>;
      case 'chatbot':
         return pet ? <VirtualVetChatbot pet={pet} onBack={handleBackToDashboard} /> : <p>No pet profile found.</p>;
      case 'nutrition':
        return pet ? <NutritionPlanner pet={pet} onBack={handleBackToDashboard} /> : <p>No pet profile found.</p>;
      case 'vet_finder':
        return pet ? <NearbyVetFinder pet={pet} onBack={handleBackToDashboard} /> : <p>No pet profile found.</p>;
      case 'grooming':
        return pet ? <GroomingGuides pet={pet} onBack={handleBackToDashboard} /> : <p>No pet profile found.</p>;
      case 'lost_found':
        return pet ? <LostAndFound pet={pet} onBack={handleBackToDashboard} /> : <p>No pet profile found.</p>;
      case 'wound_scanner':
        return pet ? <WoundScanner pet={pet} onBack={handleBackToDashboard} onSelectFeature={(featureView) => setView(featureView)} /> : <p>No pet profile found.</p>;
      default:
        return pet ? <Dashboard pet={pet} onSelectFeature={(featureView) => setView(featureView)} onStartOver={handleStartOver} /> : <p>Loading...</p>;
    }
  }

  return (
    <div className={`min-h-screen ${view !== 'welcome' && view !== 'analyzer' ? 'bg-gray-50' : ''} text-slate-800 font-sans transition-colors duration-500`}>
        {renderContent()}
    </div>
  );
};

export default App;