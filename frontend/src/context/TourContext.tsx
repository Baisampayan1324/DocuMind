import React, { createContext, useContext, useState, useEffect } from 'react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface TourContextType {
  isTourOpen: boolean;
  currentStep: number;
  startTour: () => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  steps: TourStep[];
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TourStep[] = [
    {
      target: 'sidebar-dashboard',
      title: 'Neural Dashboard',
      content: 'This is your central hub for interacting with your document library using AI.',
      position: 'right'
    },
    {
      target: 'sidebar-documents',
      title: 'Knowledge Library',
      content: 'Upload, manage, and organize your documents here. We support PDF, DOCX, and more.',
      position: 'right'
    },
    {
      target: 'sidebar-stats',
      title: 'Intelligence Insights',
      content: 'Monitor your usage, token consumption, and document metrics in real-time.',
      position: 'right'
    },
    {
      target: 'sidebar-settings',
      title: 'System Configuration',
      content: 'Customize your experience, switch themes, and manage your AI model preferences.',
      position: 'right'
    }
  ];

  const startTour = () => {
    setCurrentStep(0);
    setIsTourOpen(true);
  };

  const stopTour = () => {
    setIsTourOpen(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      stopTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <TourContext.Provider value={{ isTourOpen, currentStep, startTour, stopTour, nextStep, prevStep, steps }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
