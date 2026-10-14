
import React, { useState, useEffect } from 'react';
import { Pet, GroomingGuide } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { BackIcon } from './icons/ActionIcons';
import { GroomingIcon } from './icons/FeatureIcons';
import { ChevronDownIcon } from './icons/InfoIcons';

interface GroomingGuidesProps {
  pet: Pet;
  onBack: () => void;
}

const AccordionItem: React.FC<{ guide: GroomingGuide; isOpen: boolean; onClick: () => void; }> = ({ guide, isOpen, onClick }) => (
    <div className="border-b border-slate-200">
        <h2>
            <button
                type="button"
                className="flex items-center justify-between w-full p-5 font-medium text-left text-slate-700 hover:bg-slate-50"
                onClick={onClick}
                aria-expanded={isOpen}
            >
                <span>{guide.topic}</span>
                <ChevronDownIcon className={`w-5 h-5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
            </button>
        </h2>
        <div className={`p-5 border-t border-slate-200 bg-white ${isOpen ? '' : 'hidden'}`}>
            <div className="text-sm text-slate-600 space-y-4">
                <p className="whitespace-pre-wrap">{guide.guide}</p>
                {guide.tools.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Recommended Tools:</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {guide.tools.map((tool, index) => <li key={index}>{tool}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    </div>
);


export const GroomingGuides: React.FC<GroomingGuidesProps> = ({ pet, onBack }) => {
    const [guides, setGuides] = useState<GroomingGuide[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    useEffect(() => {
        const fetchGuides = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const prompt = `
                    Generate a set of grooming guides for a ${pet.breed}.
                    Cover essential topics like Brushing/Coat Care, Bathing Frequency, Nail Trimming, and Ear Cleaning.
                    For each topic, provide a step-by-step guide and a list of recommended tools.
                    Ensure your response adheres to the provided JSON schema.
                `;

                const schema = {
                    type: Type.ARRAY,
                    description: "A list of grooming guides for the pet.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            topic: { type: Type.STRING, description: "The grooming topic (e.g., 'Brushing Frequency')." },
                            guide: { type: Type.STRING, description: "A step-by-step guide for this topic, written in a friendly tone." },
                            tools: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of recommended tools for this task." }
                        },
                        required: ["topic", "guide", "tools"]
                    }
                };

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: schema
                    }
                });

                const rawText = response.text.trim();
                const jsonText = rawText.replace(/```json\n?/, '').replace(/```$/, '');
                try {
                    setGuides(JSON.parse(jsonText));
                } catch(parseError) {
                    console.error("Failed to parse grooming guides JSON:", parseError);
                    setError("Sorry, the AI returned an unexpected response format. Please try refreshing the page.");
                }

            } catch (err) {
                console.error("Error generating grooming guides:", err);
                setError("Sorry, I couldn't fetch grooming guides at the moment. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchGuides();
    }, [pet.breed]);
    
    const handleAccordionClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col min-h-screen">
             <header className="flex items-center justify-between gap-3 mb-8">
                <div className="flex items-center gap-3">
                    <GroomingIcon className="h-8 w-8 text-indigo-500" />
                    <h1 className="text-2xl font-bold text-slate-800">Grooming Guides</h1>
                </div>
                <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                    <BackIcon className="w-4 h-4" />
                    Dashboard
                </button>
            </header>

            {isLoading && (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-600 font-semibold">Fetching grooming guides for a {pet.breed}...</p>
                </div>
            )}
            
            {error && (
                 <div className="flex-grow flex flex-col items-center justify-center text-center bg-red-50 p-8 rounded-lg">
                    <p className="text-red-600 font-semibold">{error}</p>
                 </div>
            )}

            {!isLoading && guides.length > 0 && (
                <div className="animate-fade-in bg-white shadow-lg rounded-2xl overflow-hidden border border-slate-200">
                    <div className="p-5 bg-slate-50 border-b border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800">Grooming for {pet.name} the {pet.breed}</h2>
                        <p className="text-sm text-slate-500">Click on a topic below to see the guide.</p>
                    </div>
                    {guides.map((guide, index) => (
                        <AccordionItem
                            key={index}
                            guide={guide}
                            isOpen={openIndex === index}
                            onClick={() => handleAccordionClick(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
