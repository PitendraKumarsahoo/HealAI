import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Square, Globe, Sparkles, MessageSquare, ChevronDown, Mic, MicOff, AlertCircle } from 'lucide-react';

// --- Types & Constants ---

type Language = 'en' | 'hi' | 'or';

interface TranslationMap {
  [key: string]: {
    hi: string;
    or: string;
  };
}

const TRANSLATIONS: TranslationMap = {
  "Hello! I am your AI Health Assistant. How can I help you today?": {
    hi: "नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
    or: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର AI ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ। ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?"
  },
  "Your wellness score is 85%. You are in great health!": {
    hi: "आपका वेलनेस स्कोर 85% है। आप बहुत अच्छे स्वास्थ्य में हैं!",
    or: "ଆପଣଙ୍କର ସୁସ୍ଥତା ସ୍କୋର ୮୫% ଅଟେ। ଆପଣ ବହୁତ ଭଲ ସ୍ୱାସ୍ଥ୍ୟରେ ଅଛନ୍ତି!"
  },
  "Please drink more water and stay active for better results.": {
    hi: "बेहतर परिणामों के लिए कृपया अधिक पानी पिएं और सक्रिय रहें।",
    or: "ଉନ୍ନତ ଫଳାଫଳ ପାଇଁ ଦୟାକରି ଅଧିକ ପାଣି ପିଅନ୍ତୁ ଏବଂ ସକ୍ରିୟ ରୁହନ୍ତୁ।"
  },
  "Analysis complete. Your diabetes risk is currently Low.": {
    hi: "विश्लेषण पूरा हुआ। आपका मधुमेह जोखिम वर्तमान में कम है।",
    or: "ବିଶ୍ଳେଷଣ ସମାପ୍ତ। ଆପଣଙ୍କର ମଧୁମେହ ବିପଦ ବର୍ତ୍ତମାନ କମ୍ ଅଟେ।"
  }
};

const LANG_CONFIG = {
  en: { code: 'en-US', label: 'English' },
  hi: { code: 'hi-IN', label: 'Hindi' },
  or: { code: 'hi-IN', label: 'Odia (Hindi Voice Fallback)' } // Web Speech API often lacks Odia, fallback to Hindi
};

// --- Main Component ---

interface AIVoiceAssistantProps {
  initialText?: string;
}

const AIVoiceAssistant: React.FC<AIVoiceAssistantProps> = ({ 
  initialText = "Hello! I am your AI Health Assistant. How can I help you today?" 
}) => {
  const [text, setText] = useState(initialText);
  const [lang, setLang] = useState<Language>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  
  const synth = window.speechSynthesis;
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Robust word boundary tracking
  const wordsWithRanges = useMemo(() => {
    const words = text.split(/(\s+)/); // Keep whitespace
    let currentPos = 0;
    return words.map(word => {
      const start = currentPos;
      const end = currentPos + word.length;
      currentPos = end;
      return { word, start, end, isWord: /\S/.test(word) };
    });
  }, [text]);

  // --- Core Functions ---

  const translateText = (inputText: string, targetLang: Language): string => {
    if (targetLang === 'en') return inputText;
    return TRANSLATIONS[inputText]?.[targetLang] || inputText;
  };

  const generateReply = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Fever/Feeling Unwell
    if (lowerInput.includes('fever') || lowerInput.includes('fivor') || lowerInput.includes('unwell') || lowerInput.includes('sick')) {
      return `🌱 Namaste! I am HealAI Assistant, your professional health awareness companion.

Before we proceed, please note: I am an AI assistant and not a medical professional. The information provided below is for educational purposes and should not replace professional medical advice, diagnosis, or treatment.

I am sorry to hear that you are feeling unwell with a fever. Fever is usually a sign that your body is fighting off an infection or illness. Here is a guide to help you manage your symptoms and understand when to seek further help.

Symptoms Analysis: Possible Causes
Fever (often called "pyrexia") can be triggered by various factors:
Viral Infections: Such as the common cold, seasonal flu, or viral fever.
Bacterial Infections: Such as throat infections, urinary tract infections, or ear infections.
Dehydration/Exertion: Overexposure to heat or intense physical activity.
Inflammation: Response to injury or certain medical conditions.

Home Remedies & Comfort Measures
While your body recovers, focus on these steps to manage the discomfort:
Hydration is Key: Drink plenty of fluids (water, broth, coconut water, or herbal tea) to prevent dehydration caused by sweating.
Rest: Allow your body to focus its energy on healing. Avoid strenuous activity.
Cooling Down: Use a lukewarm (not cold) sponge bath or place a damp cloth on your forehead to help lower your body temperature.
Light Clothing: Wear thin, breathable cotton clothing and avoid bundling up in heavy blankets unless you are experiencing chills.
Nutritious Food: Stick to light, easy-to-digest meals like soups, khichdi, or toast.

When to See a Doctor
Please seek medical attention immediately if your fever is accompanied by any of these Red Flags:
Difficulty breathing or chest pain.
A persistent fever lasting more than 3 days.
Severe headache or a stiff neck.
A sudden skin rash.
Persistent vomiting or signs of severe dehydration.
Confusion or unusual drowsiness.

I hope you feel much better very soon! Please take care and prioritize your rest.`;
    }

    // Diabetes
    if (lowerInput.includes('diabetes') || lowerInput.includes('sugar')) {
      return `I can help you analyze your diabetes risk. 

Diabetes management involves monitoring blood glucose, healthy eating, and regular exercise. 

Common symptoms include frequent urination, excessive thirst, and unexplained weight loss. 

Please use our 'Diabetes Assessment' tool for a detailed clinical screening based on your parameters.`;
    }

    // Heart Health
    if (lowerInput.includes('heart') || lowerInput.includes('chest pain') || lowerInput.includes('bp')) {
      return `Heart health is critical. 

If you are experiencing active chest pain, please seek emergency medical help immediately. 

For routine screening, monitor your blood pressure and cholesterol. Focus on a heart-healthy diet low in sodium and saturated fats. 

You can run a 'Heart Health Assessment' in our application for a risk analysis.`;
    }

    // Kidney/Liver
    if (lowerInput.includes('kidney') || lowerInput.includes('liver') || lowerInput.includes('ckd')) {
      return `Kidney and liver health are vital for filtering toxins from your body. 

Chronic Kidney Disease (CKD) requires monitoring of specific gravity, albumin, and creatinine levels. 

Maintain hydration and avoid excessive alcohol or self-medication. Try our specialized assessment tools for these organs in the home section.`;
    }

    // Stroke
    if (lowerInput.includes('stroke') || lowerInput.includes('brain attack') || lowerInput.includes('paralysis')) {
      return `Stroke is a medical emergency. If you suspect someone is having a stroke, use the FAST test: Face drooping, Arm weakness, Speech difficulty, and Time to call 108.

Risk factors include hypertension, smoking, and high cholesterol. Early detection and lifestyle management are key to prevention.`;
    }

    // Greeting
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return "🌱 Namaste! I am HealAI Assistant, your professional health awareness companion. I can help you analyze risks for diabetes, heart, kidney, and liver diseases. How can I assist you today?";
    }

    // Doctors
    if (lowerInput.includes('doctor') || lowerInput.includes('appointment')) {
      return "You can find specialized private and government doctors across Odisha in the 'Find Doctors' section of our application.";
    }

    // Thanks
    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return "You're very welcome! Stay healthy, prioritize your rest, and take care.";
    }
    
    return "I understood your query about '" + input + "'. I am an AI assistant here to provide health awareness. How else can I help you today?";
  };

  const stopSpeech = useCallback(() => {
    synth.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
  }, [synth]);

  const speakText = useCallback(() => {
    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_CONFIG[lang].code;
    utterance.rate = 0.9; // Slightly slower for better highlighting sync

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        // Find which word index contains this character index
        const wordIdx = wordsWithRanges.findIndex(w => charIndex >= w.start && charIndex < w.end);
        if (wordIdx !== -1) {
          setCurrentWordIndex(wordIdx);
        }
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentWordIndex(-1);
    };

    utteranceRef.current = utterance;
    setIsSpeaking(true);
    synth.speak(utterance);
  }, [text, lang, isPaused, synth, stopSpeech]);

  const pauseSpeech = () => {
    synth.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  // --- Speech Recognition Functions ---

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setRecognitionError("Speech recognition not supported in this browser.");
      return;
    }

    stopSpeech();
    setRecognitionError(null);

    const recognition = new SpeechRecognition();
    recognition.lang = LANG_CONFIG[lang].code;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const aiReply = generateReply(transcript);
      const translatedReply = translateText(aiReply, lang);
      
      setText(translatedReply);
      setIsListening(false);
      
      // Auto-speak the AI reply after a short delay
      setTimeout(() => {
        // Pre-calculate ranges for the new text to ensure sync
        const replyWords = translatedReply.split(/(\s+)/);
        let currentPos = 0;
        const replyRanges = replyWords.map(word => {
          const start = currentPos;
          const end = currentPos + word.length;
          currentPos = end;
          return { start, end };
        });

        const utterance = new SpeechSynthesisUtterance(translatedReply);
        utterance.lang = LANG_CONFIG[lang].code;
        utterance.rate = 0.9;
        utterance.onboundary = (e) => {
          if (e.name === 'word') {
            const charIndex = e.charIndex;
            const wordIdx = replyRanges.findIndex(w => charIndex >= w.start && charIndex < w.end);
            if (wordIdx !== -1) {
              setCurrentWordIndex(wordIdx);
            }
          }
        };
        utterance.onend = () => {
          setIsSpeaking(false);
          setCurrentWordIndex(-1);
        };
        setIsSpeaking(true);
        synth.speak(utterance);
      }, 500);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setRecognitionError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [lang, stopSpeech, synth]);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Handle language change
  useEffect(() => {
    const defaultGreeting = "Hello! I am your AI Health Assistant. How can I help you today?";
    const translated = translateText(defaultGreeting, lang);
    setText(translated);
    stopSpeech();
  }, [lang, stopSpeech]);

  // Cleanup on unmount
  useEffect(() => {
    return () => synth.cancel();
  }, [synth]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header with Language Selector */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white leading-none">AI Voice Assistant</h3>
              <p className="text-xs text-slate-500 mt-1">Multilingual TTS Support</p>
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition-all shadow-sm"
            >
              <Globe size={16} className="text-emerald-500" />
              {LANG_CONFIG[lang].label.split(' ')[0]}
              <ChevronDown size={14} className={`transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  {(Object.keys(LANG_CONFIG) as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setShowLangMenu(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between ${lang === l ? 'text-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/20' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      {LANG_CONFIG[l].label}
                      {lang === l && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Text Box with Highlighting */}
        <div className="p-8">
          {recognitionError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle size={14} />
              {recognitionError}
            </div>
          )}
          
          <div className="relative p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 min-h-[120px]">
            <div className="flex gap-4">
              <div className="mt-1">
                <MessageSquare size={20} className="text-slate-400" />
              </div>
              <div className="flex-1 text-lg md:text-xl leading-relaxed font-medium text-slate-800 dark:text-slate-200">
                {wordsWithRanges.map((w, i) => (
                  <span
                    key={i}
                    className={`inline-block rounded-md px-0.5 transition-all duration-200 ${
                      i === currentWordIndex 
                        ? 'bg-emerald-400/30 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 underline decoration-2 underline-offset-4 decoration-emerald-500' 
                        : ''
                    }`}
                  >
                    {w.word}
                  </span>
                ))}
              </div>
            </div>

            {/* Speaking Indicator */}
            <AnimatePresence>
              {isSpeaking && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-2 right-4 flex gap-1 items-center"
                >
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mr-1">Live Audio</span>
                  <div className="flex gap-0.5 h-3 items-end">
                    {[1, 2, 3, 4].map(i => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, 12, 6, 10, 4] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                        className="w-1 bg-emerald-500 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="px-8 pb-8 flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-4 w-full">
            <button
              onClick={stopSpeech}
              className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-90"
              title="Stop"
            >
              <Square size={20} fill="currentColor" />
            </button>

            {isSpeaking ? (
              <button
                onClick={pauseSpeech}
                className="p-6 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 hover:bg-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-2 flex-1 max-w-[200px]"
              >
                <Pause size={24} fill="white" />
                <span className="font-bold pr-2">Pause</span>
              </button>
            ) : (
              <button
                onClick={speakText}
                className="p-6 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 hover:bg-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-2 flex-1 max-w-[200px]"
              >
                <Play size={24} fill="white" />
                <span className="font-bold pr-2">{isPaused ? 'Resume' : 'Speak'}</span>
              </button>
            )}

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              {isSpeaking ? <Volume2 size={20} className="text-emerald-500" /> : <VolumeX size={20} />}
            </div>
          </div>

          <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col items-center">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-8 rounded-full transition-all duration-500 flex flex-col items-center gap-3 ${
                isListening 
                  ? 'bg-red-500 text-white shadow-2xl shadow-red-500/40 animate-pulse' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-4 border-slate-100 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-500'
              }`}
            >
              {isListening ? <MicOff size={32} /> : <Mic size={32} />}
              <span className="text-xs font-black uppercase tracking-widest">
                {isListening ? 'Stop Listening' : 'Talk to AI'}
              </span>
            </button>
            
            <AnimatePresence>
              {isListening && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-sm font-medium text-red-500 flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  AI is listening... speak now
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
        AI Voice uses the browser's native <span className="font-bold">Web Speech API</span> for real-time synthesis.
      </p>
    </div>
  );
};

export default AIVoiceAssistant;
