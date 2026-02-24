import React, { useEffect, useState } from "react";
import { ChatMessage, PillarType, ViewState } from "./types";
import { useWellnessPlan } from "./hooks/useWellnessPlan";
import AppRouter from "./components/AppRouter";

/**
 * Mapping between logical views and their URL hash representation.
 * Keeping this centralized makes it easier to:
 * - Add new screens.
 * - Ensure the URL stays in sync with internal state.
 */
const VIEW_CONFIG: Record<ViewState, { hash: string }> = {
  welcome: { hash: "#welcome" },
  assessment: { hash: "#assessment" },
  dashboard: { hash: "#dashboard" },
  resources: { hash: "#resources" },
  "pillar-detail": { hash: "#pillar-detail" },
  "how-to-use": { hash: "#how-to-use" },
};

const getViewFromLocation = (): ViewState => {
  if (typeof window === "undefined") return "welcome";

  const currentHash = window.location.hash || "#welcome";
  const match = (Object.entries(VIEW_CONFIG) as [ViewState, { hash: string }][]).find(
    ([, config]) => config.hash === currentHash
  );

  return match ? match[0] : "welcome";
};

/**
 * Root application component for Bonita Encode.
 *
 * This component owns:
 * - The global "view state" (which major screen the user is on).
 * - The currently focused `PillarType` (if the user drilled into a specific pillar).
 * - The lifecycle of the `WellnessPlan` via `useWellnessPlan`.
 *
 * It synchronizes view state with the URL hash so that:
 * - Back/forward browser navigation works intuitively.
 * - Specific screens can be deep‑linked and reloaded.
 */
const App: React.FC = () => {
  /**
   * `view` drives which major screen is visible.
   * Initial value is derived from the URL to support deep links and reloads.
   */
  const [view, setView] = useState<ViewState>(() => getViewFromLocation());

  /**
   * The currently focused pillar, if the user has selected one.
   * This value is optional and is used by:
   * - `PillarDetail` (to render the detailed view).
   * - `ChatInterface` (to bias the conversation toward that pillar).
   */
  const [selectedPillar, setSelectedPillar] = useState<PillarType | undefined>(
    undefined
  );

  /**
   * Encapsulated plan lifecycle and error handling.
   * - `plan`: latest generated wellness plan (or null if none).
   * - `isGenerating`: true while AI is synthesizing a plan.
   * - `error`: user-facing error message when plan generation fails.
   */
  const { plan, isGenerating, error, generateFromHistory, reset, clearError } =
    useWellnessPlan();

  /**
   * Keep view state in sync when the user navigates with the browser controls
   * (back/forward) or when the URL hash changes for any other reason.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleHashChange = () => {
      setView(getViewFromLocation());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  /**
   * Whenever the internal `view` changes, update the URL hash.
   * This keeps the address bar aligned with what the user sees.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const config = VIEW_CONFIG[view];
    if (!config) return;

    if (window.location.hash !== config.hash) {
      window.history.pushState(null, "", config.hash);
    }
  }, [view]);

  /**
   * Helper to navigate between views from within this component.
   * All view changes should go through this function so URL state,
   * guards, and any future side effects remain centralized.
   */
  const navigate = (nextView: ViewState) => {
    setView(nextView);
  };

  /**
   * Navigation: user chose to start the assessment from the welcome screen.
   * - Clears any previously selected pillar.
   * - Takes the user into the chat‑based assessment flow.
   */
  const handleStart = () => {
    setSelectedPillar(undefined);
    navigate("assessment");
  };

  /**
   * Navigation: open the static / curated resources view.
   */
  const handleResources = () => {
    navigate("resources");
  };

  /**
   * Navigation: explain how the product works and how to use it.
   */
  const handleHowToUse = () => {
    navigate("how-to-use");
  };

  /**
   * User clicked into a specific wellness pillar from the welcome screen.
   * - Persist which pillar is in focus.
   * - Move into the pillar detail view.
   */
  const handlePillarSelect = (pillar: PillarType) => {
    setSelectedPillar(pillar);
    navigate("pillar-detail");
  };

  /**
   * From the pillar detail page, user wants to start chatting
   * specifically about that pillar.
   *
   * Note: we intentionally do NOT clear `selectedPillar` here;
   * `ChatInterface` reads it from props (`initialPillar`) to personalize
   * the first messages.
   */
  const handleStartPillarChat = () => {
    navigate("assessment");
  };

  /**
   * Allows starting the assessment directly from other entry points
   * (e.g. resources) and optionally passing a pre‑selected pillar.
   */
  const handleDirectChatStart = (pillar?: PillarType) => {
    setSelectedPillar(pillar);
    navigate("assessment");
  };

  /**
   * Called by `ChatInterface` when the assessment conversation is complete.
   *
   * Responsibilities:
   * - Delegate plan creation to `useWellnessPlan`.
   * - Navigate the user to the dashboard once a plan is available.
   *
   * Any errors are handled by the hook and surfaced via `error`.
   */
  const handleAssessmentComplete = async (history: ChatMessage[]) => {
    const generatedPlan = await generateFromHistory(history);
    if (generatedPlan) {
      navigate("dashboard");
    }
  };

  /**
   * Global reset:
   * - Clears the current plan and selected pillar.
   * - Sends the user back to the initial welcome screen.
   *
   * This is typically triggered from the dashboard when the user wants
   * to restart their journey or update their inputs.
   */
  const handleReset = () => {
    reset();
    setSelectedPillar(undefined);
    navigate("welcome");
  };

  /**
   * Exit handler from the assessment chat back to the welcome screen.
   * Keeps any existing plan intact while letting the user start over later.
   */
  const handleExitAssessment = () => {
    navigate("welcome");
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 h-full">
        {/* Inline, dismissible error banner for plan-generation failures. */}
        {error && (
          <div className="mb-4 flex items-start justify-between gap-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="text-xs font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <AppRouter
          view={view}
          isGenerating={isGenerating}
          plan={plan}
          selectedPillar={selectedPillar}
          onStart={handleStart}
          onResources={handleResources}
          onHowToUse={handleHowToUse}
          onPillarSelect={handlePillarSelect}
          onStartPillarChat={handleStartPillarChat}
          onDirectChatStart={handleDirectChatStart}
          onAssessmentComplete={handleAssessmentComplete}
          onExitAssessment={handleExitAssessment}
          onReset={handleReset}
        />
      </div>
    </div>
  );
};

export default App;
