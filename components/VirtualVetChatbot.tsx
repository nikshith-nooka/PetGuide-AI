import React, { useState, useRef, useEffect } from 'react';
import { Pet, Message } from '../types';
import { GoogleGenAI } from '@google/genai';
import { ChatBubbleIcon } from './icons/FeatureIcons';
import { SendIcon } from './icons/SendIcon';
import { BackIcon } from './icons/ActionIcons';

interface VirtualVetChatbotProps {
  pet: Pet;
  onBack: () => void;
}

export const VirtualVetChatbot: React.FC<VirtualVetChatbotProps> = ({ pet, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: 'model',
      text: `Hi! I'm the Virtual Vet Assistant. You can ask me general questions about caring for ${pet.name}, like diet, grooming, or training tips.`,
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
        You are a helpful and friendly virtual vet assistant for a pet named ${pet.name}, a ${pet.breed}. 
        A user is asking the following question: "${userMessage.text}".
        Answer general pet care questions about topics like diet, grooming, training, and routine wellness. 
        Do not provide medical diagnoses or specific treatments for illnesses. 
        Always include a friendly reminder that your advice is not a substitute for professional veterinary care for any health concerns.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
      };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm sorry, I encountered an error. Please try your question again."
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
            <ChatBubbleIcon className="h-6 w-6 text-indigo-500" />
            <h2 className="text-lg font-semibold text-slate-800">Virtual Vet Chatbot</h2>
          </div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
            <BackIcon className="w-4 h-4" />
            Dashboard
          </button>
        </div>
        <div className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-3 max-w-xl ${msg.role === 'user' ? 'justify-end ml-auto' : 'justify-start'}`}>
              {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 self-start"><ChatBubbleIcon className="w-5 h-5 text-indigo-500" /></div>}
              <div className={`rounded-2xl p-3 ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-slate-100 text-slate-700 rounded-bl-none'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 self-start"><ChatBubbleIcon className="w-5 h-5 text-indigo-500" /></div>
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
              placeholder={`Ask a question about ${pet.name}...`}
              className="flex-grow px-4 py-2 bg-slate-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              disabled={isLoading}
              aria-label="Chat input"
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