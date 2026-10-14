
import React, { useState, useRef, useEffect } from 'react';
import { Pet, Message, AnalysisResult, UrgencyLevel } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { SparklesIcon } from './icons/SparklesIcon';
import { SendIcon } from './icons/SendIcon';
import { AnalysisCard } from './AnalysisCard';
import { BackIcon } from './icons/ActionIcons';

interface SymptomCheckerProps {
  pet: Pet;
  onBack: () => void;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({ pet, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: 'model',
      text: `Hello! I'm PetGuide AI. I can help you with a preliminary analysis of your pet's symptoms. What's concerning you about ${pet.name} today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        A pet owner is concerned about their pet. Here is the pet's profile and the owner's description of the symptoms.

        Pet Profile:
        - Name: ${pet.name}
        - Age: ${pet.age}
        - Breed: ${pet.breed}

        Symptoms described by owner:
        "${userMessage.text}"

        Analyze the symptoms and provide a preliminary assessment. You are an AI assistant and not a veterinarian. Your advice is not a substitute for professional medical care. Ensure your response adheres to the provided JSON schema.
      `;
      
      const schema = {
        type: Type.OBJECT,
        properties: {
            possibleIssues: {
                type: Type.ARRAY,
                description: "A list of 2-3 possible general issues based on the symptoms (e.g., 'Upset stomach', 'Minor skin irritation').",
                items: { type: Type.STRING }
            },
            urgencyLevel: {
                type: Type.STRING,
                description: `Classify the urgency. Must be one of: '${UrgencyLevel.HomeCare}', '${UrgencyLevel.VetVisitSoon}', or '${UrgencyLevel.Emergency}'.`,
                enum: [UrgencyLevel.HomeCare, UrgencyLevel.VetVisitSoon, UrgencyLevel.Emergency]
            },
            recommendations: {
                type: Type.STRING,
                description: "Provide a few simple, safe, and clear recommendations. For 'Home Care', suggest monitoring, providing water, etc. For higher urgencies, the primary recommendation must be to see a vet."
            },
            detailedExplanation: {
                type: Type.STRING,
                description: "Provide a concise, easy-to-understand explanation of why these issues might be occurring, what the urgency level means, and what to watch out for."
            },
            disclaimer: {
                type: Type.STRING,
                description: "Provide a standard disclaimer: 'This is an AI analysis and not a substitute for professional veterinary advice. Please consult a licensed veterinarian for any health concerns.'"
            }
        },
        required: ["possibleIssues", "urgencyLevel", "recommendations", "detailedExplanation", "disclaimer"]
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
        const analysisResult: AnalysisResult = JSON.parse(jsonText);
        const modelMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: '',
          analysis: analysisResult,
        };
        setMessages(prev => [...prev, modelMessage]);
      } catch (parseError) {
          console.error('Failed to parse analysis JSON:', parseError);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: `I'm having a little trouble structuring my thoughts right now. Based on what you've said, it's always best to keep a close eye on ${pet.name}. If symptoms persist or worsen, consulting a vet is the safest option.`
          };
          setMessages(prev => [...prev, errorMessage]);
      }

    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm sorry, I encountered an error while analyzing the symptoms. Please try again or rephrase your concern."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col h-screen">
        <div className="bg-white rounded-2xl shadow-lg flex flex-col h-full w-full animate-fade-in">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <SparklesIcon className="h-6 w-6 text-indigo-500" />
                    <h2 className="text-lg font-semibold text-slate-800">Symptom Checker</h2>
                </div>
                <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                    <BackIcon className="w-4 h-4" />
                    Dashboard
                </button>
            </div>
            <div className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-6">
                {messages.map((msg) => (
                <div key={msg.id} className={`flex items-end gap-3 max-w-xl ${msg.role === 'user' ? 'justify-end ml-auto' : 'justify-start'}`}>
                    {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 self-start"><SparklesIcon className="w-5 h-5 text-indigo-500" /></div>}
                    <div className={`rounded-2xl ${msg.role === 'user' ? 'bg-indigo-500 text-white p-3 rounded-br-none' : 'bg-slate-100 text-slate-700'}`}>
                    {msg.text && <p className="text-sm p-3 whitespace-pre-wrap">{msg.text}</p>}
                    {msg.analysis && <AnalysisCard analysis={msg.analysis} />}
                    </div>
                </div>
                ))}
                {isLoading && (
                <div className="flex items-end gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 self-start"><SparklesIcon className="w-5 h-5 text-indigo-500" /></div>
                    <div className="bg-slate-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Describe ${pet.name}'s symptoms...`}
                    className="flex-grow px-4 py-2 bg-slate-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    disabled={isLoading}
                    aria-label="Symptom input"
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="bg-indigo-500 text-white rounded-full p-2.5 hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" aria-label="Send message">
                    <SendIcon className="w-5 h-5" />
                </button>
                </form>
            </div>
        </div>
    </div>
  );
};
