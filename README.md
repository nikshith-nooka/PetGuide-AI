# PetGuide AI 🐾

<div align="center">

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)

**An intelligent, multimodal pet wellness and veterinary triage platform powered by Google Gemini.**  
*Instant breed identification, AI-assisted health triage, wound scanning, tailored nutrition, and live local clinic discovery.*

[Explore Features](#-key-features) • [System Architecture](#-system-architecture) • [Getting Started](#-getting-started) • [Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [1. Multimodal Pet Analyzer & Profile Builder](#1-multimodal-pet-analyzer--profile-builder)
  - [2. AI Wound & Rash Scanner](#2-ai-wound--rash-scanner)
  - [3. Intelligent Symptom Checker](#3-intelligent-symptom-checker)
  - [4. Personalized Nutrition & Diet Planner](#4-personalized-nutrition--diet-planner)
  - [5. Grounded Nearby Vet & Emergency Clinic Finder](#5-grounded-nearby-vet--emergency-clinic-finder)
  - [6. Virtual Vet Assistant Chatbot](#6-virtual-vet-assistant-chatbot)
  - [7. Home Grooming Guides](#7-home-grooming-guides)
  - [8. Lost & Found Emergency Toolkit](#8-lost--found-emergency-toolkit)
  - [9. Pet Encyclopedia & Breed Library](#9-pet-encyclopedia--breed-library)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [Available Scripts](#-available-scripts)
- [Veterinary & Medical Disclaimer](#-veterinary--medical-disclaimer)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🌟 Overview

Caring for pets brings immeasurable joy, but unexpected symptoms, sudden skin lesions, or dietary uncertainties can leave owners feeling overwhelmed. Access to licensed veterinary clinics can sometimes take hours or days, making it critical to have trustworthy, immediate preliminary triage.

**PetGuide AI** bridges this gap as a modern, high-performance web application designed for pet parents. Combining computer vision, structured clinical prompting, and Google Search grounding via the `@google/genai` SDK, PetGuide AI helps owners understand their companion's needs, assess symptom urgency, prepare tailored nutrition plans, and find veterinary care in real time.

---

## ✨ Key Features

### 1. Multimodal Pet Analyzer & Profile Builder
- **Visual Breed Classification**: Upload an existing photo or capture one directly using your device's webcam (with environment/user camera toggle).
- **Comprehensive Life Insights**: Generates an instant profile including breed determination, estimated age span, dietary habits, optimal living environments, and predisposed hereditary conditions.
- **Custom Companion Profile**: Saves your pet's context so all downstream tools (symptom checker, chatbot, meal planner) are personalized to their exact breed and age.

### 2. AI Wound & Rash Scanner
- **Topical Skin & Lesion Analysis**: Inspect cuts, hot spots, tick bites, allergic rashes, or abrasions using high-resolution image analysis.
- **Color-Coded Urgency Triage**:
  - 🟢 **Home Care**: Safe at-home cleansing, antiseptics, and monitoring steps.
  - 🟡 **Vet Visit Soon**: Non-critical conditions needing appointment scheduling within 24–48 hours.
  - 🔴 **Emergency**: Red-flag indicators (deep lacerations, severe purulent discharge, necrosis) directing owners to immediately seek emergency veterinary attention.
- **Warning Checklist**: Highlights specific red flags to watch for (fever, spreading redness, foul odor).

### 3. Intelligent Symptom Checker
- **Interactive Clinical Q&A**: Chat-based symptom intake tailored to your pet's age, species, and breed history.
- **Structured Assessment**: Provides possible underlying causes, actionable home-care recommendations, and clear guidance on whether an in-person exam is urgent.
- **Safety Safeguards**: Built-in disclaimers reminding owners when immediate clinical intervention is required.

### 4. Personalized Nutrition & Diet Planner
- **Caloric & Portion Calculations**: Computes recommended daily caloric intake calibrated to breed size, weight distribution, and life stage.
- **Balanced Feeding Schedules**: Generates breakfast, dinner, and snack portion recommendations.
- **Toxicity Warning List**: Curates breed-specific safe treats alongside an exhaustive list of toxic human foods (chocolate, xylitol, grapes, alliums).
- **Downloadable Plan**: Export your pet's meal plan directly as a clean Markdown file for offline reference.

### 5. Grounded Nearby Vet & Emergency Clinic Finder
- **Live Search Grounding**: Employs Gemini's Google Search Grounding (`googleSearch` tool) to pull up-to-date, real-world veterinary practices and 24/7 emergency hospitals.
- **One-Click Geolocation**: Detects coordinates with browser GPS or accepts city/ZIP code inputs.
- **Actionable Contacts**: Displays hospital name, verified physical address, telephone number with direct click-to-call, and live citation links back to Google Search source results.

### 6. Virtual Vet Assistant Chatbot
- **Conversational Caretaker**: 24/7 assistant ready to answer questions about puppy crate training, cat litter preferences, dental care, travel stress, and routine wellness.
- **Friendly & Responsible**: Programmed to provide helpful educational guidance without issuing unauthorized prescription medical advice.

### 7. Home Grooming Guides
- **Species & Coat Specifics**: Specialized hygiene guides for double-coated breeds, short-hair varieties, curly coats, and sensitive skin.
- **Essential Toolkit**: Recommends the exact grooming tools (slicker brushes, de-shedding rakes, ear cleansers, styptic powder).

### 8. Lost & Found Emergency Toolkit
- **High-Visibility Poster Generator**: Formats an urgent, printable missing-pet notice featuring your pet’s identifiable markers, last known location, and emergency contact numbers.
- **Found Animal Protocol**: Quick guide on safely approaching, checking for microchips, and notifying local shelters when finding a lost animal.

### 9. Pet Encyclopedia & Breed Library
- **Filterable Knowledge Base**: Search by species or alphabetize across dogs, cats, exotic birds, and small mammals.
- **In-Depth Profiles**: Historical origins, temperament ratings, exercise thresholds, and grooming difficulty metrics.

---

## 🏗️ System Architecture

```
                    ┌──────────────────────────────────────────┐
                    │               User Device                │
                    │   (Desktop / Tablet / Mobile Browser)    │
                    └─────────────────────┬────────────────────┘
                                          │
                                          ▼
                    ┌──────────────────────────────────────────┐
                    │       PetGuide AI React 19 Frontend      │
                    │       (Vite 6 + Tailwind CSS)            │
                    │                                          │
                    │  • Welcome Hero & Camera/Media Capture   │
                    │  • Dashboard & Dynamic Module Views      │
                    │  • Local State Management (Pet Profile)  │
                    └─────────────────────┬────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌─────────────────────────┐                     ┌─────────────────────────┐
     │  Google Gemini Vision   │                     │  Google Gemini 2.5 +   │
     │  (@google/genai SDK)    │                     │  Google Search Grounding│
     │                         │                     │                         │
     │  • Pet Breed Analyzer   │                     │  • Nearby Vet Finder    │
     │  • Wound & Rash Scanner │                     │  • Symptom Checker      │
     │  • Structured JSON Schema                     │  • Nutrition Generator  │
     └─────────────────────────┘                     └─────────────────────────┘
```

---

## 💻 Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) | Modern concurrent UI architecture with modular component hierarchy |
| **Language** | [TypeScript 5.8](https://www.typescriptlang.org/) | Strict type-safety across schemas, diagnostics, and domain models |
| **Build Tooling** | [Vite 6](https://vitejs.dev/) | Ultra-fast development server with ES modules and production bundler |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Responsive, accessible utility-first styling with custom paw print patterns |
| **AI / Multimodal** | [@google/genai](https://www.npmjs.com/package/@google/genai) | Official Google GenAI TypeScript SDK |
| **AI Models** | `gemini-2.5-flash` | Ultra-fast multimodal reasoning, structured JSON schemas, and live web search tools |
| **Hardware APIs** | `MediaDevices.getUserMedia` | Native device camera access with multi-camera environment switching |
| **Location API** | `Navigator.geolocation` | Browser geolocation for instant emergency clinic radius calculation |

---

## 📁 Project Structure

```
.
├── .env.example                  # Template for required environment variables
├── .gitignore                    # Git ignore file (excludes secrets, build artifacts)
├── App.tsx                       # Main application state machine and view router
├── components/
│   ├── AnalysisCard.tsx          # Symptom assessment diagnostic card
│   ├── AnalysisResultDisplay.tsx # Onboarding breed analysis review & confirmation
│   ├── Dashboard.tsx             # Central navigation hub for all wellness modules
│   ├── FeatureCard.tsx           # Interactive module card component
│   ├── GroomingGuides.tsx        # Step-by-step grooming instructions & tool lists
│   ├── LostAndFound.tsx          # Lost pet poster generator & found pet guide
│   ├── NearbyVetFinder.tsx       # Geolocation-powered vet finder with web search grounding
│   ├── NutritionPlanner.tsx      # Custom meal schedule & calorie planner
│   ├── PetAnalyzer.tsx           # Webcam/file photo upload with breed detection
│   ├── PetLibrary.tsx            # A-Z filterable breed encyclopedia
│   ├── PetProfile.tsx            # Active pet summary badge
│   ├── SymptomChecker.tsx        # Conversational triage with structured urgency output
│   ├── VirtualVetChatbot.tsx     # 24/7 general wellness consultation chat
│   ├── Welcome.tsx               # Fullscreen video hero welcome screen
│   ├── WoundAnalysisCard.tsx     # Urgency-colored wound assessment card
│   ├── WoundScanner.tsx          # Camera/photo wound scanner with AI analysis
│   ├── icons/                    # Modular SVG iconography (Action, Feature, Info, Paw)
│   └── pet-library-data.ts       # Offline pet breed directory dataset
├── index.html                    # HTML entry point with metadata & web fonts
├── index.tsx                     # React DOM root render
├── metadata.json                 # AI Studio capability and permission configuration
├── package.json                  # Dependencies and project run scripts
├── tsconfig.json                 # TypeScript compiler options
├── types.ts                      # Core domain types, enums (UrgencyLevel), and interfaces
└── vite.config.ts                # Vite build config with path aliases and environment mapping
```

---

## 🚀 Getting Started

Follow these steps to run PetGuide AI on your local machine.

### Prerequisites

- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **Package Manager**: `npm`, `pnpm`, or `bun`
- **Google Gemini API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/petguide-ai.git
   cd petguide-ai
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

### Environment Configuration

1. Create a local environment file by copying the example:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and insert your Gemini API key:
   ```env
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   ```

> **Note**: Vite automatically injects `GEMINI_API_KEY` into `process.env.API_KEY` via `vite.config.ts`. Never commit your real API key to public source control.

### Running the Application

1. **Start the local development server**:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. Allow camera and location permissions when prompted to enable real-time camera photo analysis and nearby clinic discovery.

---

## 🛠️ Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Starts the Vite development server on `http://localhost:3000` |
| `npm run build` | Compiles TypeScript and creates optimized production assets in `/dist` |
| `npm run preview` | Serves the production build locally to test performance |

---

## ⚕️ Veterinary & Medical Disclaimer

> **IMPORTANT NOTICE**:  
> **PetGuide AI is an educational guidance and preliminary triage tool; it is NOT a substitute for licensed veterinary medical advice, diagnosis, or treatment.**  
>
> If your pet is experiencing severe trauma, difficulty breathing, ingestion of poisons, collapse, persistent seizures, or unresponsiveness, **do not rely on an AI assessment**. Contact your nearest 24-hour veterinary emergency hospital immediately.

---

## 🤝 Contributing

Contributions, feature suggestions, and improvements are welcome! Here is how you can help:

1. **Fork the Project**
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "feat: add vaccination tracking reminder module"
   ```
4. **Push to your Branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

Please ensure that your code complies with TypeScript strict mode and passes the build before opening a PR (`npm run build`).

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

## 🙏 Acknowledgments

- [Google AI Studio & Gemini API](https://aistudio.google.com/) for cutting-edge multimodal vision and structured output models.
- [React](https://react.dev/) & [Vite](https://vitejs.dev/) for an ultra-responsive frontend development experience.
- [Tailwind CSS](https://tailwindcss.com/) for accessible utility-driven UI components.
- [Pexels](https://www.pexels.com/) for royalty-free preview imagery and hero video media.
