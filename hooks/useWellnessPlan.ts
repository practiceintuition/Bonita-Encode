import { useCallback, useState } from "react";
import { ChatMessage, WellnessPlan } from "../types";
import { createWellnessPlan } from "../services/wellnessPlanService";

interface UseWellnessPlanResult {
  plan: WellnessPlan | null;
  isGenerating: boolean;
  error: string | null;
  generateFromHistory: (history: ChatMessage[]) => Promise<WellnessPlan | null>;
  reset: () => void;
  clearError: () => void;
}

/**
 * Encapsulates the full lifecycle of a wellness plan:
 * - Local plan state
 * - Loading flag while the AI is synthesizing
 * - User-facing error message
 *
 * UI components should use this hook instead of talking directly to
 * the underlying AI service. This makes it easier to test and to swap
 * implementations later.
 */
export function useWellnessPlan(): UseWellnessPlanResult {
  const [plan, setPlan] = useState<WellnessPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFromHistory = useCallback(async (history: ChatMessage[]) => {
    setIsGenerating(true);
    setError(null);

    try {
      const generatedPlan = await createWellnessPlan(history);
      setPlan(generatedPlan);
      return generatedPlan;
    } catch (err) {
      console.error("Failed to generate wellness plan", err);
      setError(
        "We ran into an issue generating your protocols. Please try again in a moment."
      );
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPlan(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    plan,
    isGenerating,
    error,
    generateFromHistory,
    reset,
    clearError,
  };
}

