
import React, { useState } from 'react';
import { Pet, NutritionPlan } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { BackIcon, DownloadIcon } from './icons/ActionIcons';
import { NutritionIcon } from './icons/FeatureIcons';
import { SparklesIcon } from './icons/SparklesIcon';

interface NutritionPlannerProps {
  pet: Pet;
  onBack: () => void;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-white/60 rounded-lg p-4 border border-slate-200/80 ${className}`}>
        <h4 className="font-semibold text-slate-800 mb-2 text-base">{title}</h4>
        <div className="text-slate-600 text-sm space-y-1">{children}</div>
    </div>
);

export const NutritionPlanner: React.FC<NutritionPlannerProps> = ({ pet, onBack }) => {
    const [plan, setPlan] = useState<NutritionPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generatePlan = async () => {
        setIsLoading(true);
        setError(null);
        setPlan(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Create a comprehensive nutrition plan for my pet, ${pet.name}.
                Pet Profile:
                - Breed: ${pet.breed}
                - Age: ${pet.age}

                Provide a detailed plan covering daily calories, feeding schedule, specific meal suggestions (breakfast and dinner), healthy snack ideas, foods to avoid, and general tips.
                Your advice is not a substitute for professional medical care. Ensure your response adheres to the provided JSON schema.
            `;

            const schema = {
                type: Type.OBJECT,
                properties: {
                    dailyCalories: { type: Type.STRING, description: `Estimated daily calorie needs for a ${pet.breed} of age ${pet.age}.` },
                    feedingSchedule: { type: Type.STRING, description: "Recommended feeding schedule (e.g., 'Twice a day, morning and evening')." },
                    mealSuggestions: {
                        type: Type.ARRAY,
                        description: "A list of meal suggestions.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                meal: { type: Type.STRING, description: "The meal time (e.g., 'Breakfast', 'Dinner')." },
                                food: { type: Type.STRING, description: "A specific type of food suggestion (e.g., 'High-quality dry kibble')." },
                                portion: { type: Type.STRING, description: "A recommended portion size (e.g., '1/2 to 1 cup')." }
                            },
                             required: ["meal", "food", "portion"]
                        }
                    },
                    healthySnacks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 healthy snack ideas." },
                    foodsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of common foods that are toxic or unhealthy for this pet." },
                    generalTips: { type: Type.STRING, description: "General nutrition tips for this breed, including water intake." },
                    disclaimer: { type: Type.STRING, description: "Provide a standard disclaimer: 'This is an AI-generated plan and not a substitute for professional veterinary advice. Consult a vet for your pet's specific dietary needs.'" }
                },
                required: ["dailyCalories", "feedingSchedule", "mealSuggestions", "healthySnacks", "foodsToAvoid", "generalTips", "disclaimer"]
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
                setPlan(JSON.parse(jsonText));
            } catch(parseError) {
                console.error("Failed to parse nutrition plan JSON:", parseError);
                setError("Sorry, the AI returned an unexpected response format. Please try generating the plan again.");
            }

        } catch (err) {
            console.error("Error generating nutrition plan:", err);
            setError("Sorry, I couldn't generate a nutrition plan at the moment. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!plan) return;

        const mealSuggestionsText = plan.mealSuggestions.map(ms => 
`    - ${ms.meal}:
        Food: ${ms.food}
        Portion: ${ms.portion}`
        ).join('\n\n');

        const content = `
Nutrition Plan for ${pet.name}
=======================================
Pet Profile: ${pet.breed}, Age: ${pet.age}
=======================================

Est. Daily Calories:
${plan.dailyCalories}

---

Feeding Schedule:
${plan.feedingSchedule}

---

Meal Suggestions:
${mealSuggestionsText}

---

Healthy Snacks:
${plan.healthySnacks.map(s => `- ${s}`).join('\n')}

---

Foods to Avoid:
${plan.foodsToAvoid.map(f => `- ${f}`).join('\n')}

---

General Tips:
${plan.generalTips}

---

Disclaimer:
${plan.disclaimer}
        `;

        const blob = new Blob([content.trim()], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nutrition-plan-for-${pet.name.toLowerCase().replace(/\s/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col min-h-screen">
             <header className="flex items-center justify-between gap-3 mb-8">
                <div className="flex items-center gap-3">
                    <NutritionIcon className="h-8 w-8 text-indigo-500" />
                    <h1 className="text-2xl font-bold text-slate-800">Nutrition Planner</h1>
                </div>
                <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                    <BackIcon className="w-4 h-4" />
                    Dashboard
                </button>
            </header>

            {!plan && !isLoading && !error && (
                 <div className="text-center flex-grow flex flex-col items-center justify-center bg-white rounded-2xl shadow-lg p-8">
                    <div className="bg-indigo-100 p-4 rounded-full mb-4">
                        <NutritionIcon className="w-12 h-12 text-indigo-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-700">Ready to create a personalized diet for {pet.name}?</h2>
                    <p className="text-slate-500 mt-2 mb-6 max-w-md">Get AI-powered recommendations for meals, portions, and snacks tailored to your pet's needs.</p>
                    <button onClick={generatePlan} className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5"/>
                        Generate Nutrition Plan
                    </button>
                </div>
            )}
            
             {isLoading && (
                <div className="flex-grow flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-600 font-semibold">Crafting the perfect meal plan for {pet.name}...</p>
                </div>
            )}

            {error && (
                 <div className="flex-grow flex flex-col items-center justify-center text-center bg-red-50 p-8 rounded-lg">
                    <p className="text-red-600 font-semibold">{error}</p>
                    <button onClick={generatePlan} className="mt-4 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                        Try Again
                    </button>
                </div>
            )}

            {plan && (
                <div className="animate-fade-in space-y-6">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-slate-800">Nutrition Plan for {pet.name}</h2>
                        <p className="text-slate-500">Based on a {pet.breed} of age: {pet.age}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <InfoCard title="Est. Daily Calories" className="items-center justify-center flex flex-col">
                            <p className="text-2xl font-bold text-indigo-600">{plan.dailyCalories}</p>
                        </InfoCard>
                         <InfoCard title="Feeding Schedule" className="items-center justify-center flex flex-col">
                            <p className="text-lg font-semibold text-slate-700">{plan.feedingSchedule}</p>
                        </InfoCard>
                    </div>
                    <InfoCard title="Meal Suggestions">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {plan.mealSuggestions.map(ms => (
                                <div key={ms.meal} className="bg-slate-50 p-3 rounded-md border border-slate-200">
                                    <h5 className="font-bold text-slate-700">{ms.meal}</h5>
                                    <p><span className="font-semibold">Food:</span> {ms.food}</p>
                                    <p><span className="font-semibold">Portion:</span> {ms.portion}</p>
                                </div>
                            ))}
                        </div>
                    </InfoCard>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoCard title="Healthy Snacks">
                            <ul className="list-disc list-inside space-y-1">{plan.healthySnacks.map((item, i) => <li key={i}>{item}</li>)}</ul>
                        </InfoCard>
                        <InfoCard title="Foods to Avoid">
                             <ul className="list-disc list-inside space-y-1 text-red-700">{plan.foodsToAvoid.map((item, i) => <li key={i} className="font-medium">{item}</li>)}</ul>
                        </InfoCard>
                    </div>
                    <InfoCard title="General Tips">
                        <p className="whitespace-pre-wrap">{plan.generalTips}</p>
                    </InfoCard>
                    <div className="p-4 text-xs text-center rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200">
                        <p><strong>Disclaimer:</strong> {plan.disclaimer}</p>
                    </div>
                    <div className="text-center pt-4 flex items-center justify-center gap-4">
                         <button onClick={generatePlan} className="bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5"/>
                            Regenerate Plan
                        </button>
                        <button onClick={handleDownload} className="bg-green-100 text-green-700 font-semibold py-2 px-4 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2">
                            <DownloadIcon className="w-5 h-5"/>
                            Download Plan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
