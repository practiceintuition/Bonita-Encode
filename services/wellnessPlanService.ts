import { ChatMessage, WellnessPlan } from "../types";
import { generateWellnessPlan } from "./geminiService";

/**
 * Interface describing how a wellness plan should be generated.
 * This allows swapping implementations (e.g. different models, mocks for tests)
 * without changing the rest of the app.
 */
export interface WellnessPlanService {
  generateFromHistory(history: ChatMessage[]): Promise<WellnessPlan>;
}

/**
 * Default implementation backed by the Gemini service.
 */
export const defaultWellnessPlanService: WellnessPlanService = {
  generateFromHistory: generateWellnessPlan,
};

/**
 * High-level helper used by UI code to obtain a wellness plan.
 * Consumers can optionally pass a custom service (for testing or experiments).
 */
export async function createWellnessPlan(
  history: ChatMessage[],
  service: WellnessPlanService = defaultWellnessPlanService
): Promise<WellnessPlan> {
  return service.generateFromHistory(history);
}

