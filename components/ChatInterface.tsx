import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Sparkles, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Thermometer, Moon, Activity, Frown, Smile, ShieldAlert, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Sender, PillarType, CoachResponse, UserCheckIn } from '../types';
import { chatWithBonita } from '../services/geminiService';
import { logEvent } from '../services/telemetry';

interface ChatInterfaceProps {
  onComplete: (history: ChatMessage[]) => void;
  onExit: () => void;
  initialPillar?: PillarType;
}

// --- SUB-COMPONENTS ---

const CheckInForm = ({ onSave }: { onSave: (data: UserCheckIn) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<UserCheckIn>({
    sleepHours: 7,
    energy: 3,
    mood: 3,
    pain: 0,
    note: '',
    timestamp: Date.now()
  });

  const handleSave = () => {
    localStorage.setItem('bonita_last_checkin', JSON.stringify(data));
    logEvent('user_checkin', data);
    onSave(data);
    setIsOpen(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem('bonita_last_checkin');
    if (saved) setData(JSON.parse(saved));
  }, []);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="mx-auto flex items-center gap-2 text-xs font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 px-4 py-2 rounded-full transition-colors mb-4 border border-pink-200"
      >
        <Activity size={14} /> Daily Check-In (Optional)
      </button>
    );
  }

  return (
    <div className="mx-4 mb-4 p-4 bg-white border border-pink-100 rounded-xl shadow-sm animate-fade-in text-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800">Quick Check-In</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">Close</button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <label className="block text-gray-500 text-xs mb-1">Sleep (Hours)</label>
          <div className="flex items-center gap-2">
            <Moon size={14} className="text-indigo-400" />
            <input 
              type="number" 
              value={data.sleepHours}
              onChange={e => setData({...data, sleepHours: Number(e.target.value)})}
              className="w-full bg-gray-50 border border-gray-200 rounded p-1"
              aria-label="Sleep hours"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-500 text-xs mb-1">Pain (0-10)</label>
          <div className="flex items-center gap-2">
            <Thermometer size={14} className="text-red-400" />
            <input 
              type="range" 
              min="0" max="10" 
              value={data.pain}
              onChange={e => setData({...data, pain: Number(e.target.value)})}
              className="w-full"
              aria-label="Pain level from 0 to 10"
            />
            <span className="text-xs w-4">{data.pain}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <label className="block text-gray-500 text-xs mb-1">Energy (1-5)</label>
          <div className="flex justify-between bg-gray-50 rounded p-1">
             {[1,2,3,4,5].map(v => (
               <button 
                key={v}
                onClick={() => setData({...data, energy: v})}
                className={`w-6 h-6 rounded text-xs ${data.energy === v ? 'bg-yellow-400 text-white' : 'text-gray-400'}`}
               >
                 {v}
               </button>
             ))}
          </div>
        </div>
        <div>
          <label className="block text-gray-500 text-xs mb-1">Mood (1-5)</label>
          <div className="flex justify-between bg-gray-50 rounded p-1">
             {[1,2,3,4,5].map(v => (
               <button 
                key={v}
                onClick={() => setData({...data, mood: v})}
                className={`w-6 h-6 rounded text-xs ${data.mood === v ? 'bg-pink-400 text-white' : 'text-gray-400'}`}
               >
                 {v}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="mb-3">
         <label className="block text-gray-500 text-xs mb-1">Quick Note</label>
         <input 
            type="text" 
            placeholder="Woke up feeling..."
            value={data.note}
            onChange={e => setData({...data, note: e.target.value})}
            className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs"
         />
      </div>

      <button onClick={handleSave} className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors">
        Save Context
      </button>
    </div>
  );
};

const ProtocolCard = ({ data }: { data: CoachResponse }) => {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [showWhy, setShowWhy] = useState(false);

  const toggleStep = (idx: number) => {
    const newState = !checkedSteps[idx];
    setCheckedSteps(prev => ({...prev, [idx]: newState}));
    if (newState) {
      logEvent('protocol_step_complete', { protocol: data.todayProtocol.title, stepIndex: idx });
    }
  };

  const getTierColor = (tier: string) => {
    if (tier === 'A') return 'bg-blue-100 text-blue-700 border-blue-200'; // Clinical
    if (tier === 'B') return 'bg-emerald-100 text-emerald-700 border-emerald-200'; // Mechanistic
    return 'bg-amber-100 text-amber-700 border-amber-200'; // Traditional
  };

  const getTierLabel = (tier: string) => {
    if (tier === 'A') return 'Clinical Evidence (Tier A)';
    if (tier === 'B') return 'Mechanistic Evidence (Tier B)';
    return 'Traditional Wisdom (Tier C)';
  };

  return (
    <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-start">
        <div>
          <div className="flex gap-2 mb-1">
             <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
               {data.primaryPillar}
             </span>
             <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getTierColor(data.evidenceTier)}`}>
               {getTierLabel(data.evidenceTier)}
             </span>
          </div>
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Sparkles size={16} className="text-pink-500" />
            {data.todayProtocol.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
             <Activity size={12} /> Time Cost: {data.todayProtocol.timeCostMin} min
          </p>
        </div>
      </div>

      {/* Safety Notes */}
      {data.safetyNotes && data.safetyNotes.length > 0 && (
        <div className="bg-red-50 p-3 border-b border-red-100">
           {data.safetyNotes.map((note, i) => (
             <div key={i} className="flex items-start gap-2 text-xs text-red-700 font-semibold">
               <ShieldAlert size={14} className="shrink-0 mt-0.5" />
               {note}
             </div>
           ))}
        </div>
      )}

      {/* Steps Checklist */}
      <div className="p-4 space-y-3">
        {data.todayProtocol.steps.map((step, idx) => (
          <div 
            key={idx} 
            onClick={() => toggleStep(idx)}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${checkedSteps[idx] ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:border-gray-200'}`}
          >
            <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${checkedSteps[idx] ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
              {checkedSteps[idx] && <CheckCircle2 size={12} className="text-white" />}
            </div>
            <div className={checkedSteps[idx] ? 'opacity-50 line-through text-gray-500' : 'text-gray-700'}>
              <p className="text-sm font-medium">{step.text}</p>
              {step.durationMin && <p className="text-xs text-gray-400 mt-0.5">{step.durationMin} min</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Accordions */}
      <div className="border-t border-gray-100">
        <button 
          onClick={() => setShowWhy(!showWhy)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-600 transition-colors"
        >
          <span>Why this works</span>
          {showWhy ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showWhy && (
          <div className="p-3 bg-white text-xs text-gray-600 space-y-2 leading-relaxed border-t border-gray-100">
            {data.whyItWorks.map((item, i) => (
              <p key={i} className="flex gap-2">
                <Info size={12} className="shrink-0 mt-0.5 text-blue-400" />
                {item}
              </p>
            ))}
          </div>
        )}
      </div>

       {/* Signals Footer */}
       <div className="bg-gray-50 p-3 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Watch For (Good)</span>
            <div className="flex flex-wrap gap-1">
              {data.todayProtocol.signalsToWatch.map((s, i) => (
                <span key={i} className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Stop If (Bad)</span>
            <div className="flex flex-wrap gap-1">
              {data.todayProtocol.stopSignals.map((s, i) => (
                <span key={i} className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">{s}</span>
              ))}
            </div>
          </div>
       </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onComplete, onExit, initialPillar }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [checkInContext, setCheckInContext] = useState<UserCheckIn | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting logic
  useEffect(() => {
    let initialText = "";

    if (initialPillar) {
      initialText += `Hello, love. I see you're focusing on the **${initialPillar.toUpperCase()}** pillar. That's a great place to start.\n\nWhat specifically is challenging you with your ${initialPillar === 'time' ? 'schedule or sleep' : initialPillar === 'space' ? 'physical body or environment' : 'mental or emotional state'} right now?`;
    } else {
      initialText += "Hello, love. I am the Bonita Baddies System. I'm here to help you optimize your Time, Space, and Self.\n\nTo begin, tell me: what is your biggest challenge right now? Is it schedule/sleep (Time), physical health (Space), or emotional wellbeing (Self)?";
    }

    const initialGreeting: ChatMessage = {
      id: 'init',
      sender: Sender.BOT,
      text: initialText,
      timestamp: new Date()
    };
    setMessages([initialGreeting]);
    
    // Default suggestions
    setQuickReplies([
      "I'm feeling tired all the time",
      "I have back pain",
      "I feel anxious and scattered"
    ]);
  }, [initialPillar]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    setQuickReplies([]); // Clear suggestions
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: Sender.USER,
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Check if disclaimer seen
      const hasSeenDisclaimer = messages.some(m => 
        m.structuredData?.includeDisclaimer === true || m.text.includes("MEDICAL DISCLAIMER")
      );

      const response = await chatWithBonita(messages, textToSend, checkInContext, hasSeenDisclaimer);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: Sender.BOT,
        text: response.messageText || "Here is your protocol.",
        timestamp: new Date(),
        structuredData: response
      };

      setMessages(prev => [...prev, botMsg]);
      
      // Update quick replies based on context
      const newReplies = [];
      if (response.clarifyingQuestions && response.clarifyingQuestions.length > 0) {
        // We don't autofill these as replies, but we could. 
        // Instead, let's use the check-in prompts for the NEXT day or simple acknowledgments
      }
      if (response.tomorrowCheckIn) {
        // These are more for the future, but we can offer immediate follow ups
        newReplies.push("Tell me more about the science");
        newReplies.push("I can do this today");
        newReplies.push("This seems too hard");
      }
      setQuickReplies(newReplies);
      setError(null);

    } catch (error) {
      console.error(error);
      setError("I'm having trouble responding right now. Please try again in a moment.");
    } finally {
      setIsLoading(false);
      setCheckInContext(undefined); // Clear context after use so it doesn't persist forever
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto bg-white/80 backdrop-blur-md shadow-2xl rounded-none md:rounded-2xl overflow-hidden border border-white/50">
      {/* Header */}
      <div className="bg-white/90 p-4 border-b border-gray-100 flex justify-between items-center backdrop-blur-sm z-10">
        <div>
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Sparkles size={18} className="text-pink-500" />
            {initialPillar ? `${initialPillar.toUpperCase()} Consultation` : "Intake Assessment"}
          </h2>
          <p className="text-xs text-gray-500">Bonita Baddies Intelligence v2.0</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={onExit}
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors font-medium"
            >
                Exit
            </button>
            {messages.length > 3 && (
            <button 
                onClick={() => onComplete(messages)}
                className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-full hover:bg-gray-700 transition-colors font-medium"
            >
                Generate Protocol
            </button>
            )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide bg-gradient-to-b from-gray-50/50 to-pink-50/30">
        {error && (
          <div className="mx-4 mb-2 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="mt-1 text-[10px] font-semibold underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        <CheckInForm onSave={setCheckInContext} />

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === Sender.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] md:max-w-[85%] rounded-2xl p-4 shadow-sm ${
                msg.sender === Sender.USER
                  ? 'bg-gray-900 text-white rounded-br-none'
                  : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'
              }`}
            >
                {/* Disclaimer Block */}
                {msg.structuredData?.includeDisclaimer && (
                   <div className="bg-pink-50 border border-pink-100 rounded-lg p-3 text-xs text-pink-800 flex items-start gap-2 mb-3">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <p className="font-semibold">I provide education, not medical advice. Consult a professional for health concerns.</p>
                   </div>
                )}

                {/* Legacy Markdown Support or Structured Text */}
                <div className={`text-sm md:text-base leading-relaxed ${msg.sender === Sender.USER ? 'text-white' : 'text-gray-700'}`}>
                   {msg.structuredData ? (
                     <p>{msg.structuredData.messageText}</p>
                   ) : (
                     <ReactMarkdown components={{
                       strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                       p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                     }}>
                        {msg.text}
                     </ReactMarkdown>
                   )}
                </div>

                {/* Structured Protocol Card */}
                {msg.structuredData?.todayProtocol && (
                  <ProtocolCard data={msg.structuredData} />
                )}

                {/* Clarifying Questions as embedded context */}
                {msg.structuredData?.clarifyingQuestions && msg.structuredData.clarifyingQuestions.length > 0 && (
                   <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-bold text-pink-600 mb-1">I need to know:</p>
                      <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
                        {msg.structuredData.clarifyingQuestions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                   </div>
                )}

              <span className={`text-[10px] mt-2 block opacity-60 ${msg.sender === Sender.USER ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
              <Loader2 className="animate-spin text-pink-500" size={16} />
              <span className="text-xs text-gray-400">Consulting knowledge base...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {!isLoading && quickReplies.length > 0 && (
        <div className="px-4 pb-2 bg-white/50 overflow-x-auto flex gap-2 scrollbar-hide">
            {quickReplies.map((reply, idx) => (
                <button
                    key={idx}
                    onClick={() => handleSend(reply)}
                    className="whitespace-nowrap bg-white border border-pink-200 text-pink-700 text-xs px-4 py-2 rounded-full hover:bg-pink-50 transition-colors shadow-sm"
                >
                    {reply}
                </button>
            ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={checkInContext ? "Adding check-in context..." : "Type your response..."}
            className="flex-1 bg-gray-50 border-gray-200 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all text-sm"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="bg-gray-900 text-white p-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;