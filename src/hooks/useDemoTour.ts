import { useState, useCallback } from 'react';
import { DEMO_TOUR_STEPS, type TourStep } from '../types/tour';
import type { AppSection } from '../types/outdrobe';

export interface UseDemoTourReturn {
  // Modal & tour states
  showWelcomeModal: boolean;
  isTourActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep;
  totalSteps: number;
  hasSkipped: boolean;
  hasCompleted: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;

  // Actions
  openWelcomeModal: () => void;
  closeWelcomeModal: () => void;
  startTour: () => void;
  exploreOnOwn: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  finishTour: () => void;
  restartTour: () => void;
  resetTour: () => void;
  goToStep: (index: number) => void;
}

export function useDemoTour(onNavigateSection?: (section: AppSection) => void): UseDemoTourReturn {
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [hasSkipped, setHasSkipped] = useState<boolean>(false);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);

  const totalSteps = DEMO_TOUR_STEPS.length;
  const currentStep = DEMO_TOUR_STEPS[currentStepIndex] || DEMO_TOUR_STEPS[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const navigateToStep = useCallback(
    (index: number) => {
      const step = DEMO_TOUR_STEPS[index];
      if (step && onNavigateSection) {
        onNavigateSection(step.targetSection);
      }
    },
    [onNavigateSection]
  );

  const openWelcomeModal = useCallback(() => {
    setShowWelcomeModal(true);
  }, []);

  const closeWelcomeModal = useCallback(() => {
    setShowWelcomeModal(false);
  }, []);

  const startTour = useCallback(() => {
    setShowWelcomeModal(false);
    setIsTourActive(true);
    setCurrentStepIndex(0);
    setHasSkipped(false);
    setHasCompleted(false);
    navigateToStep(0);
  }, [navigateToStep]);

  const exploreOnOwn = useCallback(() => {
    setShowWelcomeModal(false);
    setIsTourActive(false);
    setHasSkipped(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      navigateToStep(nextIdx);
    } else {
      setIsTourActive(false);
      setHasCompleted(true);
    }
  }, [currentStepIndex, totalSteps, navigateToStep]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      navigateToStep(prevIdx);
    }
  }, [currentStepIndex, navigateToStep]);

  const skipTour = useCallback(() => {
    setIsTourActive(false);
    setHasSkipped(true);
  }, []);

  const finishTour = useCallback(() => {
    setIsTourActive(false);
    setHasCompleted(true);
  }, []);

  const restartTour = useCallback(() => {
    setShowWelcomeModal(false);
    setIsTourActive(true);
    setCurrentStepIndex(0);
    setHasCompleted(false);
    setHasSkipped(false);
    navigateToStep(0);
  }, [navigateToStep]);

  const resetTour = useCallback(() => {
    setShowWelcomeModal(false);
    setIsTourActive(false);
    setCurrentStepIndex(0);
    setHasSkipped(false);
    setHasCompleted(false);
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSteps) {
        setCurrentStepIndex(index);
        navigateToStep(index);
      }
    },
    [totalSteps, navigateToStep]
  );

  return {
    showWelcomeModal,
    isTourActive,
    currentStepIndex,
    currentStep,
    totalSteps,
    hasSkipped,
    hasCompleted,
    isFirstStep,
    isLastStep,
    openWelcomeModal,
    closeWelcomeModal,
    startTour,
    exploreOnOwn,
    nextStep,
    prevStep,
    skipTour,
    finishTour,
    restartTour,
    resetTour,
    goToStep,
  };
}
