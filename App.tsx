import React, { useState } from 'react';
import { ViewState, ChatMessage, WellnessPlan, PillarType } from './types';
import { generateWellnessPlan } from './services/geminiService';
import Welcome from './components/Welcome';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import Resources from './components/Resources';
import PillarDetail from './components/PillarDetail';
import HowToUse from './components/HowToUse';
import { Loader2 } from 'lucide-react';

/**
 * Root application component for Bonita Encode.
 *
 * This component owns:
 * - The global "view state" (which major screen the user is on).
 * - The currently generated `WellnessPlan` (if any).
 * - The currently focused `PillarType` (if the user drilled into a specific pillar).
 * - The loading flag while the AI is synthesizing protocols.
 *
 * Think of this as the "router + orchestrator":
 * - Child components handle detailed UI / interactions.
 * - App coordinates when to show which child and passes the right props down.
 */
const App: React.FC = () => {
  /**
   * `view` drives which major screen is visible.
   * Valid values are defined in `ViewState` and should stay in sync with the
   * conditional branches in the JSX below.
   */
  const [view, setView] = useState<ViewState>('welcome');

  /**
   * The full wellness plan returned from the AI.
   * - `null` means the user has not generated a plan yet or has reset.
   * - When set, the dashboard becomes available.
   */
  const [plan, setPlan] = useState<WellnessPlan | null>(null);

  /**
   * Tracks whether we are currently waiting for `generateWellnessPlan`.
   * While `true`, we hide the chat and show a full‑screen loading state
   * to avoid the user interacting with stale UI.
   */
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * The currently focused pillar, if the user has selected one.
   * This value is optional and is used by:
   * - `PillarDetail` (to render the detailed view).
   * - `ChatInterface` (to bias the conversation toward that pillar).
   */
  const [selectedPillar, setSelectedPillar] = useState<PillarType | undefined>(undefined);

  /**
   * Navigation: user chose to start the assessment from the welcome screen.
   * - Clears any previously selected pillar.
   * - Takes the user into the chat‑based assessment flow.
   */
  const handleStart = () => {
    setSelectedPillar(undefined);
    setView('assessment');
  };

  /**
   * Navigation: open the static / curated resources view.
   */
  const handleResources = () => {
    setView('resources');
  };

  /**
   * Navigation: explain how the product works and how to use it.
   */
  const handleHowToUse = () => {
    setView('how-to-use');
  };

  /**
   * User clicked into a specific wellness pillar from the welcome screen.
   * - Persist which pillar is in focus.
   * - Move into the pillar detail view.
   */
  const handlePillarSelect = (pillar: PillarType) => {
    setSelectedPillar(pillar);
    setView('pillar-detail');
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
    setView('assessment');
    // selectedPillar stays set, which ChatInterface will read
  };

  /**
   * Allows starting the assessment directly from other entry points
   * (e.g. resources) and optionally passing a pre‑selected pillar.
   */
  const handleDirectChatStart = (pillar?: PillarType) => {
    setSelectedPillar(pillar);
    setView('assessment');
  };

  /**
   * Called by `ChatInterface` when the assessment conversation is complete.
   *
   * Responsibilities:
   * - Flip the loading state on.
   * - Call the Gemini service with the full chat history.
   * - Persist the returned wellness plan.
   * - Navigate the user to the dashboard view.
   *
   * If anything fails, we log to the console for debugging and surface a
   * user‑friendly alert so they can try again.
   */
  const handleAssessmentComplete = async (history: ChatMessage[]) => {
    setIsGenerating(true);
    try {
      const generatedPlan = await generateWellnessPlan(history);
      setPlan(generatedPlan);
      setView('dashboard');
    } catch (error) {
      console.error("Failed to generate plan", error);
      alert("We encountered an issue generating your protocols. Please try again.");
    } finally {
      setIsGenerating(false);
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
    setPlan(null);
    setSelectedPillar(undefined);
    setView('welcome');
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 h-full">
        {/* Landing experience:
            - Introduces the product.
            - Lets users start the assessment, browse resources, or deep‑dive into pillars. */}
        {view === 'welcome' && (
          <Welcome 
            onStart={handleStart} 
            onResources={handleResources}
            onPillarSelect={handlePillarSelect}
            onHowToUse={handleHowToUse}
          />
        )}

        {/* Static / curated content hub with educational resources.
            Users can return home or jump straight into an assessment (optionally pillar‑scoped). */}
        {view === 'resources' && (
          <Resources 
            onBack={() => setView('welcome')} 
            onStartAssessment={handleDirectChatStart}
          />
        )}

        {/* Product education: explains how to use Bonita Encode and
            what to expect from the protocols. */}
        {view === 'how-to-use' && (
          <HowToUse 
            onBack={() => setView('welcome')}
            onSignup={handleStart}
          />
        )}

        {/* Detailed view for a single pillar.
            - Depends on `selectedPillar` being set.
            - Can route into a pillar‑focused chat. */}
        {view === 'pillar-detail' && selectedPillar && (
          <PillarDetail 
            pillar={selectedPillar} 
            onBack={() => setView('welcome')} 
            onChat={handleStartPillarChat}
          />
        )}

        {/* Chat‑based assessment experience.
            Hidden while we are generating protocols to avoid confusing the user. */}
        {view === 'assessment' && !isGenerating && (
          <ChatInterface 
            onComplete={handleAssessmentComplete} 
            onExit={() => setView('welcome')}
            initialPillar={selectedPillar}
          />
        )}

        {/* Full‑screen loading state while Gemini synthesizes the wellness plan.
            This replaces the chat view so the user clearly sees that their
            inputs are being processed. */}
        {isGenerating && (
          <div className="h-screen flex flex-col items-center justify-center animate-pulse">
            <Loader2 className="animate-spin text-pink-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-700">Synthesizing Protocols...</h2>
            <p className="text-gray-500 mt-2">Calibrating IQ, EQ, and KQ metrics.</p>
          </div>
        )}

        {/* Once a plan has been generated, the dashboard becomes the primary view.
            From here the user can review protocols and choose to reset if needed. */}
        {view === 'dashboard' && plan && (
          <Dashboard plan={plan} onReset={handleReset} />
        )}
      </div>
    </div>
  );
};

export default App;