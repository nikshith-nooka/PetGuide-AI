

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { PetAnalysisDetails } from '../types';
import { UploadIcon, CameraIcon, CloseIcon, RefreshIcon } from './icons/ActionIcons';
import { SparklesIcon } from './icons/SparklesIcon';

interface PetAnalyzerProps {
  onAnalysisComplete: (details: PetAnalysisDetails) => void;
  onBack: () => void;
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

const petImages = [
    "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", // Dogs
    "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", // Cat
    "https://images.pexels.com/photos/209149/pexels-photo-209149.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", // Parrot
    "https://images.pexels.com/photos/4001296/pexels-photo-4001296.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", // Rabbit
];

export const PetAnalyzer: React.FC<PetAnalyzerProps> = ({ onAnalysisComplete, onBack }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (imageFile) {
      objectUrl = URL.createObjectURL(imageFile);
      setPreviewUrl(objectUrl);
      setError(null); // Clear previous errors on new image
    } else {
      setPreviewUrl(null);
    }
    
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageFile]);

  const closeCamera = useCallback(() => {
    setIsCameraOpen(false);
  }, []);

  useEffect(() => {
    if (!isCameraOpen) {
      return;
    }

    let stream: MediaStream;
    const startStream = async () => {
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(err => console.error("Video play failed:", err));
            }
          }
        } catch (err) {
          console.error(`Error accessing ${facingMode} camera:`, err);
          if (facingMode === 'environment') {
            console.warn('Environment camera not found or failed, attempting to use user camera.');
            setFacingMode('user');
          } else {
            setError('Could not access camera. Please ensure permissions are granted and try again.');
            closeCamera();
          }
        }
      } else {
        setError('Camera not supported on this device.');
        closeCamera();
      }
    };

    startStream();

    return () => {
      if (videoRef.current?.srcObject) {
        const currentStream = videoRef.current.srcObject as MediaStream;
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen, facingMode, closeCamera]);


  const handleClear = useCallback(() => {
    setImageFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);
  
  const handleFileSelect = (file: File | null | undefined) => {
    if (file) {
      // More robust check for various image types, including extension fallback
      const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(file.name);
      if (isImage) {
        setImageFile(file);
      } else {
        setError("Please select a valid image file (e.g., JPEG, PNG, GIF, WebP).");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError("Please provide an image to analyze.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const imagePart = await fileToGenerativePart(imageFile);
      const textPart = { text: "Analyze the image of this pet. Based on its likely breed, provide a detailed analysis. The user will name their pet later. Your response must adhere to the provided JSON schema." };
      const schema = {
        type: Type.OBJECT,
        properties: {
          breed: { type: Type.STRING, description: "The most likely breed of the pet in the image." },
          estimatedAgeSpan: { type: Type.STRING, description: "The typical age span for this breed (e.g., '10-15 years')." },
          commonEatingHabits: { type: Type.STRING, description: "A brief summary of common eating habits for this breed." },
          idealLivingConditions: { type: Type.STRING, description: "A brief summary of ideal living conditions for this breed (e.g., 'active family, needs a yard')." },
          possibleDiseases: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of common health issues or diseases this breed is prone to." },
          suggestedFoodItems: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of suggested types of food or ingredients beneficial for this breed." },
        },
        required: ["breed", "estimatedAgeSpan", "commonEatingHabits", "idealLivingConditions", "possibleDiseases", "suggestedFoodItems"]
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: { responseMimeType: "application/json", responseSchema: schema },
      });

      const rawText = response.text.trim();
      const jsonText = rawText.replace(/```json\n?/, '').replace(/```$/, '');

      try {
        const analysisResult: PetAnalysisDetails = JSON.parse(jsonText);
        onAnalysisComplete(analysisResult);
      } catch(parseError) {
        console.error("Failed to parse analysis JSON:", parseError);
        setError("The AI returned an unexpected response. Please try again with a different image.");
      }

    } catch (err) {
      console.error("Error analyzing image: ", err);
      setError("Failed to analyze image. The pet may not be clearly visible, or an API error occurred. Please try another image.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleOpenCamera = () => {
    setError(null);
    setIsCameraOpen(true);
  };

  const switchCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

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
            if(blob) {
                handleFileSelect(new File([blob], "capture.jpg", { type: "image/jpeg" }));
            }
        }, 'image/jpeg', 0.95);
    }
  };

  return (
    <div 
        className="w-full h-screen flex flex-col text-white overflow-hidden"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
      {/* Collage Background */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 -z-10">
          {petImages.map((src, i) => (
              <div key={i} className="overflow-hidden">
                  <img src={src} alt={`Pet background ${i+1}`} className="w-full h-full object-cover" style={{ animation: `zoom-in-out 20s infinite alternate`, animationDelay: `${i * -5}s`}}/>
              </div>
          ))}
      </div>
      <div className="absolute inset-0 bg-black/70 -z-10"></div>
      
      <header className="w-full p-4 z-20 flex justify-between items-center shrink-0">
          <h1 className="text-xl font-bold text-shadow-lg">Create Your Pet's Profile</h1>
          <button onClick={onBack} className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors" aria-label="Back to Welcome">
              <CloseIcon className="w-6 h-6" />
          </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 z-10">
        <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center gap-6 bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
          <label 
            htmlFor={!imageFile && !isLoading ? "pet-analyzer-upload" : ""}
            className={`w-full aspect-square rounded-2xl bg-white/5 border-2 border-dashed overflow-hidden flex items-center justify-center shadow-lg relative transition-all duration-300 ${!imageFile && !isLoading ? 'cursor-pointer' : 'cursor-default'} ${isDragging ? 'bg-white/20 scale-105 border-indigo-400' : 'border-white/20'}`}
          >
            {previewUrl ? (
                <img src={previewUrl} alt="Pet preview" className="object-cover w-full h-full animate-fade-in" />
            ) : (
                <div className="relative z-10 flex flex-col items-center p-6 text-center pointer-events-none">
                  <UploadIcon className={`w-10 h-10 mb-4 transition-transform duration-300 ${isDragging ? 'scale-110 text-indigo-300' : 'text-white'}`} />
                  <p className="text-xl font-bold text-white text-shadow">Drag & Drop a Photo</p>
                  <p className="text-slate-300 text-shadow-sm">or <span className="text-indigo-300 font-semibold">click to browse</span></p>
                </div>
            )}
          </label>

          {error && (
              <div className="w-full text-center bg-red-500/20 border border-red-500/30 text-red-300 text-sm px-4 py-2 rounded-lg">
                  {error}
              </div>
          )}

          <div className="w-full flex flex-col gap-3 pt-2">
            {imageFile ? (
                <>
                    <button 
                        onClick={handleAnalyze} 
                        disabled={isLoading}
                        className="w-full py-4 px-6 rounded-xl text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400/50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-indigo-500/50"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <SparklesIcon className="w-6 h-6" />
                        )}
                        <span>{isLoading ? 'Analyzing...' : 'Analyze Pet'}</span>
                    </button>
                    <button onClick={handleClear} disabled={isLoading} className="w-full text-sm font-medium text-slate-300 hover:text-white transition-colors py-2">
                        Use a different photo
                    </button>
                </>
            ) : (
                 <div className="w-full flex items-center gap-3">
                    <label htmlFor={isLoading ? "" : "pet-analyzer-upload"} className={`w-full py-3 px-4 rounded-xl font-semibold bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                        <UploadIcon className="w-5 h-5"/>
                        Upload Photo
                    </label>
                    <div className="text-slate-400 text-sm font-bold">OR</div>
                    <button onClick={handleOpenCamera} disabled={isLoading} className="w-full py-3 px-4 rounded-xl font-semibold bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 flex items-center justify-center gap-2 shadow-md">
                        <CameraIcon className="w-5 h-5" />
                        Use Camera
                    </button>
                </div>
            )}
          </div>
        </div>
      </main>
      
      {isCameraOpen && (
        <div className="absolute inset-0 bg-black z-40 flex flex-col items-center justify-center animate-fade-in">
           <video ref={videoRef} muted autoPlay playsInline className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`} />
           <div className="absolute top-4 right-4 z-50">
              <button onClick={closeCamera} className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors" aria-label="Close camera">
                <CloseIcon className="w-6 h-6" />
              </button>
           </div>
           <div className="absolute bottom-10 w-full px-10 flex items-center justify-between z-50">
              <div className="w-16 h-16" /> {/* Placeholder to balance the layout */}
              
              <button onClick={handleCapture} className="p-2 rounded-full bg-white/20 backdrop-blur-sm" aria-label="Capture photo">
                 <div className="p-4 rounded-full bg-white hover:bg-slate-200 transition-colors">
                    <CameraIcon className="w-8 h-8 text-slate-900" />
                 </div>
              </button>

              <button onClick={switchCamera} className="p-4 rounded-full bg-black/50 hover:bg-black/70 transition-colors flex items-center justify-center w-16 h-16" aria-label="Switch camera">
                <RefreshIcon className="w-7 h-7 text-white" />
              </button>
           </div>
        </div>
      )}
      
      <input id="pet-analyzer-upload" type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files?.[0])} accept="image/*" className="hidden" />
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};
