

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pet, WoundAnalysisResult, FeatureView, UrgencyLevel } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { BackIcon, CameraIcon, UploadIcon, CloseIcon, RefreshIcon } from './icons/ActionIcons';
import { FirstAidIcon } from './icons/FeatureIcons';
import { SparklesIcon } from './icons/SparklesIcon';
import { WoundAnalysisCard } from './WoundAnalysisCard';

interface WoundScannerProps {
  pet: Pet;
  onBack: () => void;
  onSelectFeature: (view: FeatureView) => void;
}

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const WoundScanner: React.FC<WoundScannerProps> = ({ pet, onBack, onSelectFeature }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<WoundAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dragCounter = useRef(0);

    useEffect(() => {
        let objectUrl: string | null = null;
        if (imageFile) {
            objectUrl = URL.createObjectURL(imageFile);
            setPreviewUrl(objectUrl);
            setError(null);
            setAnalysis(null);
        } else {
            setPreviewUrl(null);
        }
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [imageFile]);

    const handleFileSelect = (file: File | null | undefined) => {
        if (file) {
            const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(file.name);
            if (isImage) {
                setImageFile(file);
            } else {
                setError("Please select a valid image file (e.g., JPEG, PNG, GIF, WebP).");
            }
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleClear = useCallback(() => {
        setImageFile(null);
        setAnalysis(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);
    
    const handleAnalyze = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = await fileToGenerativePart(imageFile);
            const textPart = { text: `Analyze the provided image showing a skin condition on a ${pet.breed} named ${pet.name}. Identify the likely issue, assess its urgency, and provide simple care advice and symptoms to monitor. You are an AI assistant, not a vet. Your response must be in the specified JSON format.` };
            
            const schema = {
                type: Type.OBJECT,
                properties: {
                    issueType: { type: Type.STRING, description: "A likely name for the issue (e.g., 'Minor Abrasion', 'Possible Allergic Dermatitis', 'Insect Bite')." },
                    urgencyLevel: { type: Type.STRING, enum: [UrgencyLevel.HomeCare, UrgencyLevel.VetVisitSoon, UrgencyLevel.Emergency], description: "Urgency classification." },
                    careRecommendations: { type: Type.STRING, description: "Simple, safe, at-home care advice. For serious issues, this must primarily state to see a vet." },
                    thingsToWatchFor: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 symptoms that would indicate the issue is worsening." },
                    disclaimer: { type: Type.STRING, description: "Standard AI disclaimer about not being a substitute for professional veterinary advice." }
                },
                required: ["issueType", "urgencyLevel", "careRecommendations", "thingsToWatchFor", "disclaimer"]
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
                config: { responseMimeType: "application/json", responseSchema: schema },
            });
            
            const rawText = response.text.trim();
            const jsonText = rawText.replace(/```json\n?/, '').replace(/```$/, '');
            try {
                setAnalysis(JSON.parse(jsonText));
            } catch(parseError) {
                console.error("Failed to parse wound analysis JSON:", parseError);
                setError("The AI returned an unexpected response format. Please try again with a different image.");
            }

        } catch (err) {
            console.error("Error analyzing wound image:", err);
            setError("Failed to analyze the image. Please try a clearer photo or try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const closeCamera = useCallback(() => setIsCameraOpen(false), []);

    useEffect(() => {
        if (!isCameraOpen) return;
        let stream: MediaStream;
        const startStream = async () => {
          if (navigator.mediaDevices?.getUserMedia) {
            try {
              stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
              if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
               console.error(`Error opening ${facingMode} camera`, err);
               if (facingMode === 'environment') {
                   setFacingMode('user');
               } else {
                   setError('Could not access camera. Please grant permission.');
                   closeCamera();
               }
            }
          }
        };
        startStream();
        return () => {
          if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
          }
        };
      }, [isCameraOpen, facingMode, closeCamera]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                if (facingMode === 'user') {
                    context.scale(-1, 1);
                    context.drawImage(video, -video.videoWidth, 0, video.videoWidth, video.videoHeight);
                } else {
                    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                }
            }
            closeCamera();
            canvas.toBlob(blob => {
                if(blob) handleFileSelect(new File([blob], "wound_capture.jpg", { type: "image/jpeg" }));
            }, 'image/jpeg', 0.95);
        }
    };

    return (
        <div 
            className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col min-h-screen"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <header className="flex items-center justify-between gap-3 mb-8">
                <div className="flex items-center gap-3">
                    <FirstAidIcon className="h-8 w-8 text-indigo-500" />
                    <h1 className="text-2xl font-bold text-slate-800">AI Wound & Rash Scanner</h1>
                </div>
                <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                    <BackIcon className="w-4 h-4" />
                    Dashboard
                </button>
            </header>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border flex-grow flex flex-col">
                {!analysis && (
                    <div className="flex flex-col items-center justify-center text-center w-full max-w-md mx-auto">
                        <label 
                            htmlFor={!imageFile && !isLoading ? "wound-scanner-upload" : ""}
                            className={`w-full aspect-video rounded-xl border-2 border-dashed flex items-center justify-center mb-4 transition-all duration-300 relative overflow-hidden ${!imageFile && !isLoading ? 'cursor-pointer hover:border-indigo-400 hover:bg-slate-100' : 'cursor-default'} ${isDragging ? 'scale-105 border-indigo-400 bg-indigo-50' : 'border-slate-300 bg-slate-50'}`}
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover"/>
                            ) : (
                                <div className="text-slate-500 flex flex-col items-center pointer-events-none">
                                    <UploadIcon className={`w-8 h-8 mb-2 transition-colors ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`}/>
                                    <p className={`font-semibold transition-colors ${isDragging ? 'text-indigo-600' : 'text-slate-500'}`}>{isDragging ? 'Drop to upload' : 'Upload Photo'}</p>
                                    <p className="text-xs text-slate-400">{isDragging ? '' : 'Or click here to browse'}</p>
                                </div>
                            )}
                        </label>

                         <div className="w-full flex items-center gap-3">
                            <label htmlFor={isLoading ? "" : "wound-scanner-upload"} className={`w-full py-2 px-4 rounded-lg font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center justify-center gap-2 ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                <UploadIcon className="w-5 h-5"/> Browse
                            </label>
                            <div className="text-slate-400 text-sm">OR</div>
                            <button onClick={() => setIsCameraOpen(true)} disabled={isLoading} className="w-full py-2 px-4 rounded-lg font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <CameraIcon className="w-5 h-5" /> Use Camera
                            </button>
                        </div>

                        {imageFile && (
                            <div className="w-full mt-6 flex flex-col items-center gap-3">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isLoading}
                                    className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                         <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <SparklesIcon className="w-5 h-5"/>
                                    )}
                                   
                                    <span>{isLoading ? 'Analyzing...' : `Analyze Image for ${pet.name}`}</span>
                                </button>
                                <button onClick={handleClear} disabled={isLoading} className="text-sm text-slate-500 hover:text-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed">Use a different image</button>
                            </div>
                        )}
                        
                         {!imageFile && !isLoading && (
                            <p className="text-xs text-slate-500 mt-4 max-w-sm">For best results, use a clear, well-lit photo of the affected area.</p>
                         )}

                         {isLoading && (
                            <div className="mt-6 text-center">
                               <p className="text-slate-600 font-semibold">AI is analyzing the image...</p>
                            </div>
                         )}
                    </div>
                )}
                
                {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}

                {analysis && (
                    <div className="animate-fade-in">
                        <WoundAnalysisCard analysis={analysis} onSelectFeature={onSelectFeature} />
                        <div className="text-center mt-6">
                            <button onClick={handleClear} className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                                Scan Another Image
                            </button>
                        </div>
                    </div>
                )}
            </div>
             {isCameraOpen && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center animate-fade-in">
                   <video ref={videoRef} muted autoPlay playsInline className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`} />
                   <div className="absolute top-4 right-4 z-50">
                      <button onClick={closeCamera} className="p-2 rounded-full bg-black/50 hover:bg-black/70" aria-label="Close camera">
                        <CloseIcon className="w-8 h-8 text-white" />
                      </button>
                   </div>
                   <div className="absolute bottom-10 w-full px-10 flex items-center justify-between z-50">
                      <button onClick={() => setFacingMode(p => p === 'user' ? 'environment' : 'user')} className="p-4 rounded-full bg-black/50 hover:bg-black/70 w-16 h-16 flex items-center justify-center" aria-label="Switch camera">
                        <RefreshIcon className="w-7 h-7 text-white" />
                      </button>
                      <button onClick={handleCapture} className="p-2 rounded-full bg-white/20" aria-label="Capture photo">
                         <div className="p-4 rounded-full bg-white">
                            <CameraIcon className="w-8 h-8 text-slate-900" />
                         </div>
                      </button>
                      <div className="w-16 h-16" />
                   </div>
                </div>
            )}
            <input id="wound-scanner-upload" type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files?.[0])} accept="image/*" className="hidden" />
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
};
