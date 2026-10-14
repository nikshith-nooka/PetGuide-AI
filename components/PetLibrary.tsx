
import React, { useState, useMemo } from 'react';
import { PetLibraryEntry } from '../types';
import { BackIcon, CloseIcon } from './icons/ActionIcons';
import { BookOpenIcon, SearchIcon } from './icons/FeatureIcons';
import { PawPrintIcon } from './icons/PawPrintIcon';
import { PET_LIBRARY_DATA } from './pet-library-data';

interface PetLibraryProps {
  onBack: () => void;
}

const alphabet = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

const cardColors = [
    'from-indigo-50 to-blue-100',
    'from-green-50 to-teal-100',
    'from-pink-50 to-rose-100',
    'from-yellow-50 to-amber-100',
    'from-sky-50 to-cyan-100',
];

export const PetLibrary: React.FC<PetLibraryProps> = ({ onBack }) => {
    const [pets] = useState<PetLibraryEntry[]>(PET_LIBRARY_DATA);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeLetter, setActiveLetter] = useState('All');
    
    const [selectedPet, setSelectedPet] = useState<PetLibraryEntry | null>(null);

    const filteredPets = useMemo(() => {
        return pets.filter(pet => {
            const matchesLetter = activeLetter === 'All' || pet.name.toUpperCase().startsWith(activeLetter);
            const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesLetter && matchesSearch;
        });
    }, [pets, searchTerm, activeLetter]);

    const groupedPets = useMemo(() => {
        return filteredPets.reduce((acc, pet) => {
            (acc[pet.category] = acc[pet.category] || []).push(pet);
            return acc;
        }, {} as Record<string, PetLibraryEntry[]>);
    }, [filteredPets]);

    const handleSelectPet = (pet: PetLibraryEntry) => {
        setSelectedPet(pet);
    };

    return (
        <div className="w-full min-h-screen flex flex-col paw-print-background">
            <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col flex-grow">
                <header className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <BookOpenIcon className="h-8 w-8 text-indigo-500" />
                        <h1 className="text-2xl font-bold text-slate-800">Pet Library</h1>
                    </div>
                    <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                        <BackIcon className="w-4 h-4" />
                        Back
                    </button>
                </header>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-slate-200 sticky top-4 z-20">
                    <div className="relative">
                        <input
                            type="search"
                            placeholder="Search for any pet..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex justify-center flex-wrap gap-1 mt-4">
                        <button onClick={() => setActiveLetter('All')} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${activeLetter === 'All' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>All</button>
                        {alphabet.map(letter => (
                            <button key={letter} onClick={() => setActiveLetter(letter)} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${activeLetter === letter ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>{letter}</button>
                        ))}
                    </div>
                </div>
                
                <main className="flex-grow">
                    <div className="space-y-8 animate-fade-in">
                        {Object.keys(groupedPets).length > 0 ? Object.keys(groupedPets).sort().map(category => (
                            <div key={category}>
                                <h2 className="text-xl font-bold text-slate-700 border-b-2 border-indigo-200 pb-2 mb-4">{category}</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {groupedPets[category].map((pet, index) => (
                                        <button
                                            key={pet.name}
                                            onClick={() => handleSelectPet(pet)}
                                            className={`group text-left p-3 rounded-xl shadow-sm border border-slate-200/80 hover:border-indigo-400/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center text-center bg-gradient-to-br ${cardColors[index % cardColors.length]}`}
                                        >
                                            <PawPrintIcon className="w-8 h-8 text-indigo-300 group-hover:text-indigo-400 transition-colors mb-2" />
                                            <span className="font-bold text-slate-800 text-sm leading-tight">{pet.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-slate-500 mt-8 flex flex-col items-center">
                               <p>No pets found for your query.</p>
                            </div>
                        )}
                    </div>
                </main>

                {selectedPet && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm" onClick={() => setSelectedPet(null)}>
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            <header className="p-4 border-b flex justify-between items-center shrink-0">
                                <h2 className="text-xl font-bold">{selectedPet.name}</h2>
                                <button onClick={() => setSelectedPet(null)} className="p-1 rounded-full hover:bg-slate-100">
                                    <CloseIcon className="w-6 h-6 text-slate-600" />
                                </button>
                            </header>
                            <div className="flex-grow overflow-y-auto p-6">
                                <div className="space-y-4 animate-fade-in">
                                    <div>
                                        <h3 className="text-lg font-bold mb-2 text-slate-800">History & Origin</h3>
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedPet.details.history}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-2 text-slate-800">Temperament</h3>
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedPet.details.temperament}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-2 text-slate-800">Physical Characteristics</h3>
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedPet.details.physicalCharacteristics}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-2 text-slate-800">Care Requirements</h3>
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedPet.details.careRequirements}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
