
import type { ReactNode } from 'react';

export interface Pet {
  name: string;
  age: string;
  breed: string;
}

export enum UrgencyLevel {
  HomeCare = 'Home Care',
  VetVisitSoon = 'Vet Visit Soon',
  Emergency = 'Emergency',
}

export interface AnalysisResult {
  possibleIssues: string[];
  urgencyLevel: UrgencyLevel;
  recommendations: string;
  detailedExplanation: string;
  disclaimer: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  analysis?: AnalysisResult;
}

export interface PetAnalysisDetails {
  breed: string;
  estimatedAgeSpan: string;
  commonEatingHabits: string;
  idealLivingConditions: string;
  possibleDiseases: string[];
  suggestedFoodItems: string[];
}

export type FeatureView = 'checker' | 'chatbot' | 'nutrition' | 'vet_finder' | 'grooming' | 'lost_found' | 'wound_scanner';

export interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
  view: FeatureView;
  enabled: boolean;
}

export interface NutritionPlan {
  dailyCalories: string;
  feedingSchedule: string;
  mealSuggestions: {
    meal: string;
    food: string;
    portion: string;
  }[];
  healthySnacks: string[];
  foodsToAvoid: string[];
  generalTips: string;
  disclaimer: string;
}

export interface GroomingGuide {
  topic: string;
  guide: string;
  tools: string[];
}

export interface Vet {
  name: string;
  address?: string;
  phone?: string;
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface WoundAnalysisResult {
    issueType: string;
    urgencyLevel: UrgencyLevel;
    careRecommendations: string;
    thingsToWatchFor: string[];
    disclaimer: string;
}

export interface PetBrief {
    name: string;
    category: string;
}

export interface PetLibraryDetails {
    history: string;
    temperament: string;
    physicalCharacteristics: string;
    careRequirements: string;
}

export interface PetLibraryEntry {
    name: string;
    category: string;
    details: PetLibraryDetails;
}