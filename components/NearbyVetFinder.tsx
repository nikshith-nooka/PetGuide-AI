import React, { useState } from 'react';
import { Pet, Vet, GroundingSource } from '../types';
import { GoogleGenAI } from '@google/genai';
import { BackIcon } from './icons/ActionIcons';
import { VetIcon, SearchIcon } from './icons/FeatureIcons';
import { MapPinIcon, PhoneIcon, LinkIcon, GpsIcon } from './icons/InfoIcons';

interface NearbyVetFinderProps {
  pet: Pet;
  onBack: () => void;
}

export const NearbyVetFinder: React.FC<NearbyVetFinderProps> = ({ pet, onBack }) => {
    const [location, setLocation] = useState('');
    const [vets, setVets] = useState<Vet[]>([]);
    const [sources, setSources] = useState<GroundingSource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);
    const [searchQueryDisplay, setSearchQueryDisplay] = useState('');

    const executeSearch = async (searchQuery: string) => {
        setIsLoading(true);
        setError(null);
        setLocationError(null);
        setVets([]);
        setSources([]);
        setSearched(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Based on Google Search results, list veterinary clinics and animal hospitals near "${searchQuery}". Respond with ONLY a JSON array of objects. Each object should have "name", "address", and "phone" keys. If a detail is unavailable, omit the key. Do not include any text outside of the JSON array.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            const rawText = response.text.trim();
            const jsonText = rawText.replace(/```json\n?/, '').replace(/```$/, '');

            try {
                const parsedVets: Vet[] = JSON.parse(jsonText);
                setVets(parsedVets);
            } catch (parseError) {
                 console.error("Failed to parse vet list:", parseError);
                 setError("Could not read the search results. The format from the AI was unexpected. You can check the search sources below.");
            }
           
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
            const webSources = groundingChunks
                .map((chunk: any) => chunk.web)
                .filter((web): web is GroundingSource => !!(web && web.uri));

            const uniqueSources = Array.from(new Map(webSources.map(s => [s.uri, s])).values());
            setSources(uniqueSources);

        } catch (err) {
            console.error("Error finding vets:", err);
            setError("Sorry, I couldn't find vets at the moment. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location.trim()) {
            setError("Please enter a location.");
            return;
        }
        setSearchQueryDisplay(`"${location}"`);
        await executeSearch(location);
    };

    const handleFindNearMe = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            return;
        }

        setIsLocating(true);
        setLocationError(null);
        setError(null);
        setSearched(false);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setIsLocating(false);
                setSearchQueryDisplay("your current location");
                await executeSearch(`${latitude}, ${longitude}`);
            },
            (err) => {
                setIsLocating(false);
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setLocationError("You denied Geolocation. Please enable it in browser settings or enter a location manually.");
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setLocationError("Location information is unavailable.");
                        break;
                    case err.TIMEOUT:
                        setLocationError("The request to get user location timed out.");
                        break;
                    default:
                        setLocationError("An unknown error occurred while getting your location.");
                        break;
                }
            }
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col min-h-screen">
            <header className="flex items-center justify-between gap-3 mb-8">
                <div className="flex items-center gap-3">
                    <VetIcon className="h-8 w-8 text-indigo-500" />
                    <h1 className="text-2xl font-bold text-slate-800">Nearby Vet Finder</h1>
                </div>
                <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                    <BackIcon className="w-4 h-4" />
                    Dashboard
                </button>
            </header>

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border">
                <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row items-center gap-3">
                    <label htmlFor="location-input" className="sr-only">Your Location</label>
                    <input
                        id="location-input"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter your City or Zip Code"
                        className="flex-grow w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                        disabled={isLoading || isLocating}
                    />
                    <button type="submit" disabled={isLoading || isLocating || !location.trim()} className="w-full sm:w-auto bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center justify-center gap-2">
                        <SearchIcon className="w-5 h-5" />
                        <span>Search</span>
                    </button>
                </form>
                <div className="relative flex py-4 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Or</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>
                <button
                    onClick={handleFindNearMe}
                    disabled={isLocating || isLoading}
                    className="w-full bg-slate-100 text-slate-700 font-semibold py-2 px-6 rounded-lg hover:bg-slate-200 border border-slate-200 disabled:bg-slate-200 disabled:text-slate-400 transition-colors flex items-center justify-center gap-2"
                >
                    {isLocating ? (
                        <div className="w-5 h-5 border-2 border-slate-400/50 border-t-slate-500 rounded-full animate-spin"></div>
                    ) : (
                       <GpsIcon className="w-5 h-5" />
                    )}
                    <span>{isLocating ? 'Getting Location...' : 'Find Vets Near Me'}</span>
                </button>
                {locationError && <p className="text-red-500 text-sm mt-3 text-center">{locationError}</p>}
                {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            </div>

            {(isLoading || isLocating) && (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-600 font-semibold">
                        {isLocating ? 'Getting your location...' : `Searching for vets near ${searchQueryDisplay}...`}
                    </p>
                </div>
            )}

            {!isLoading && !isLocating && searched && (
                <div className="animate-fade-in">
                    {vets.length > 0 && (
                        <>
                            <h2 className="text-lg font-bold text-slate-700 mb-4">Found {vets.length} Vet Clinics:</h2>
                             <div className="space-y-4">
                                {vets.map((vet, index) => (
                                    <div key={index} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                                        <h3 className="font-bold text-slate-800">{vet.name}</h3>
                                        {vet.address && (
                                            <a 
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${vet.name}, ${vet.address}`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-2 mt-1 group"
                                            >
                                                <MapPinIcon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-indigo-700 transition-colors"/> 
                                                <span>{vet.address}</span>
                                            </a>
                                        )}
                                        {vet.phone && (
                                            <a href={`tel:${vet.phone.replace(/\D/g, '')}`} className="text-sm text-slate-600 flex items-center gap-2 mt-1 group hover:text-indigo-600 transition-colors">
                                                <PhoneIcon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-indigo-600"/>
                                                <span>{vet.phone}</span>
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {sources.length > 0 && (
                       <div className="mt-8">
                            <h3 className="text-md font-bold text-slate-600 mb-3">Search Sources:</h3>
                            <div className="space-y-2">
                                {sources.map((source, index) => (
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" key={index} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 p-2 rounded-lg transition-colors">
                                        <LinkIcon className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{source.title || source.uri}</span>
                                    </a>
                                ))}
                            </div>
                       </div>
                    )}

                    {vets.length === 0 && !error && (
                         <div className="text-center bg-white rounded-lg p-8 mt-4 border">
                            <h3 className="font-semibold text-slate-700">No vet clinics were found in the results.</h3>
                            <p className="text-sm text-slate-500">Try a different location or check the search sources provided.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};