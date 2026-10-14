import React, { useState } from 'react';
import { Pet } from '../types';
import { GoogleGenAI } from '@google/genai';
import { BackIcon } from './icons/ActionIcons';
import { SearchIcon } from './icons/FeatureIcons';
import { SparklesIcon } from './icons/SparklesIcon';

interface LostAndFoundProps {
  pet: Pet;
  onBack: () => void;
}

type ActiveTab = 'lost' | 'found';

export const LostAndFound: React.FC<LostAndFoundProps> = ({ pet, onBack }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('lost');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // State for Lost Pet Poster
    const [lastSeen, setLastSeen] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [posterText, setPosterText] = useState('');

    // State for Found Pet Advice
    const [foundPetAdvice, setFoundPetAdvice] = useState('');

    const handleGeneratePoster = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setPosterText('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Generate concise and clear text for a lost pet poster. Be friendly but urgent.
                The poster should be easy to read from a distance. Use clear headings.
                
                Pet's Details:
                - Type: ${pet.breed}
                - Name: ${pet.name}
                - Age: ${pet.age}

                Incident Details:
                - Last Seen: ${lastSeen}
                - Contact Info: ${contactInfo}

                Include a call to action. Do not add any placeholder for a photo, just the text content.
            `;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setPosterText(response.text);

        } catch (err) {
            console.error("Error generating poster text:", err);
            setError("Sorry, an error occurred while generating the poster text.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetFoundAdvice = async () => {
        setIsLoading(true);
        setError(null);
        setFoundPetAdvice('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                I have just found a lost pet. What are the immediate, most important steps I should take?
                Provide a clear, actionable checklist. Start with safety and checking for identification.
                Include steps like contacting local shelters and using social media.
                Keep the tone calm and reassuring.
            `;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setFoundPetAdvice(response.text);
        } catch (err) {
            console.error("Error getting found pet advice:", err);
            setError("Sorry, an error occurred while fetching advice.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col min-h-screen">
            <header className="flex items-center justify-between gap-3 mb-8">
                <div className="flex items-center gap-3">
                    <SearchIcon className="h-8 w-8 text-indigo-500" />
                    <h1 className="text-2xl font-bold text-slate-800">Lost & Found Assistant</h1>
                </div>
                <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                    <BackIcon className="w-4 h-4" />
                    Dashboard
                </button>
            </header>

            <div className="mb-6 border-b border-gray-200">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
                    <li className="mr-2">
                        <button onClick={() => setActiveTab('lost')} className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group ${activeTab === 'lost' ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}>
                            Report a Lost Pet
                        </button>
                    </li>
                    <li className="mr-2">
                        <button onClick={() => setActiveTab('found')} className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group ${activeTab === 'found' ? 'text-indigo-600 border-indigo-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}>
                            I Found a Pet
                        </button>
                    </li>
                </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 flex-grow animate-fade-in">
                {activeTab === 'lost' && (
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Lost Pet Poster Generator</h2>
                        <p className="text-slate-500 mt-1 mb-6">Fill in the details below to get AI-generated text for your poster.</p>
                        <form onSubmit={handleGeneratePoster}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="lastSeen" className="block text-sm font-medium text-gray-700">Last Seen Location</label>
                                    <input type="text" id="lastSeen" value={lastSeen} onChange={e => setLastSeen(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
                                </div>
                                <div>
                                    <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">Your Contact Info (Phone/Email)</label>
                                    <input type="text" id="contactInfo" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center justify-center gap-2">
                                    {isLoading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5"/>}
                                    <span>Generate Poster Text</span>
                                </button>
                            </div>
                        </form>
                         {posterText && (
                            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <h3 className="font-bold mb-2">Generated Poster Text (you can copy this):</h3>
                                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{posterText}</pre>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'found' && (
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Found a Pet?</h2>
                        <p className="text-slate-500 mt-1 mb-6">Here's a checklist of what to do next. Click the button to get AI-powered advice.</p>
                        <button onClick={handleGetFoundAdvice} disabled={isLoading} className="w-full bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center justify-center gap-2">
                            {isLoading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5"/>}
                            <span>Get Action Plan</span>
                        </button>
                        {foundPetAdvice && (
                            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <h3 className="font-bold mb-2">Recommended Action Plan:</h3>
                                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{foundPetAdvice}</pre>
                            </div>
                        )}
                    </div>
                )}
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            </div>
        </div>
    );
};
