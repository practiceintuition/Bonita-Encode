import React from "react";
import { Loader2 } from "lucide-react";
import { ChatMessage, PillarType, ViewState, WellnessPlan } from "../types";
import Welcome from "./Welcome";
import Resources from "./Resources";
import HowToUse from "./HowToUse";
import PillarDetail from "./PillarDetail";
import ChatInterface from "./ChatInterface";
import Dashboard from "./Dashboard";

interface AppRouterProps {
  view: ViewState;
  isGenerating: boolean;
  plan: WellnessPlan | null;
  selectedPillar?: PillarType;
  onStart: () => void;
  onResources: () => void;
  onHowToUse: () => void;
  onPillarSelect: (pillar: PillarType) => void;
  onStartPillarChat: () => void;
  onDirectChatStart: (pillar?: PillarType) => void;
  onAssessmentComplete: (history: ChatMessage[]) => void;
  onExitAssessment: () => void;
  onReset: () => void;
}

/**
 * Pure "view renderer" for the major application screens.
 *
 * This component:
 * - Receives READ-ONLY state and callback props from `App`.
 * - Decides which screen to render based on `view` and related state.
 * - Does NOT manage business logic or side effects.
 *
 * That separation keeps `App` focused on navigation / orchestration and makes
 * this router easier to test in isolation.
 */
const AppRouter: React.FC<AppRouterProps> = ({
  view,
  isGenerating,
  plan,
  selectedPillar,
  onStart,
  onResources,
  onHowToUse,
  onPillarSelect,
  onStartPillarChat,
  onDirectChatStart,
  onAssessmentComplete,
  onExitAssessment,
  onReset,
}) => {
  return (
    <>
      {/* Landing experience:
          - Introduces the product.
          - Lets users start the assessment, browse resources, or deep‑dive into pillars. */}
      {view === "welcome" && (
        <Welcome
          onStart={onStart}
          onResources={onResources}
          onPillarSelect={onPillarSelect}
          onHowToUse={onHowToUse}
        />
      )}

      {/* Static / curated content hub with educational resources.
          Users can return home or jump straight into an assessment (optionally pillar‑scoped). */}
      {view === "resources" && (
        <Resources onBack={onStart} onStartAssessment={onDirectChatStart} />
      )}

      {/* Product education: explains how to use Bonita Encode and
          what to expect from the protocols. */}
      {view === "how-to-use" && (
        <HowToUse onBack={onStart} onSignup={onStart} />
      )}

      {/* Detailed view for a single pillar.
          - Depends on `selectedPillar` being set.
          - Can route into a pillar‑focused chat. */}
      {view === "pillar-detail" && selectedPillar && (
        <PillarDetail
          pillar={selectedPillar}
          onBack={onStart}
          onChat={onStartPillarChat}
        />
      )}

      {/* Chat‑based assessment experience.
          Hidden while we are generating protocols to avoid confusing the user. */}
      {view === "assessment" && !isGenerating && (
        <ChatInterface
          onComplete={onAssessmentComplete}
          onExit={onExitAssessment}
          initialPillar={selectedPillar}
        />
      )}

      {/* Full‑screen loading state while Gemini synthesizes the wellness plan.
          This replaces the chat view so the user clearly sees that their
          inputs are being processed. */}
      {isGenerating && (
        <div className="h-screen flex flex-col items-center justify-center animate-pulse">
          <Loader2 className="animate-spin text-pink-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-700">
            Synthesizing Protocols...
          </h2>
          <p className="text-gray-500 mt-2">
            Calibrating IQ, EQ, and KQ metrics.
          </p>
        </div>
      )}

      {/* Once a plan has been generated, the dashboard becomes the primary view.
          From here the user can review protocols and choose to reset if needed. */}
      {view === "dashboard" && plan && (
        <Dashboard plan={plan} onReset={onReset} />
      )}
    </>
  );
};

export default AppRouter;

