
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, Sparkles, Volume2, Square } from 'lucide-react';
import { getChatResponse, getChatRuntimeStatus, ChatRuntimeStatus } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatbotProps {
  onOpenHealthForm: () => void;
  lastPredictionResult: string | null;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  action?: boolean; // If true, shows a button to open modal
}

const Chatbot: React.FC<ChatbotProps> = ({ onOpenHealthForm, lastPredictionResult }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "🌱 **Namaste!** I am your **Health Awareness Assistant**.\n\nI can help you understand symptoms and give health tips.\n\nType *'check my health'* to start diagnosis.",
      sender: 'bot',
      timestamp: new Date(),
      action: true
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [runtimeStatus, setRuntimeStatus] = useState<ChatRuntimeStatus>(getChatRuntimeStatus());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle new prediction result coming from props
  useEffect(() => {
    if (lastPredictionResult) {
      addMessage(lastPredictionResult, 'bot');
    }
  }, [lastPredictionResult]);

  useEffect(() => {
    const refreshStatus = () => setRuntimeStatus(getChatRuntimeStatus());
    refreshStatus();
    window.addEventListener('online', refreshStatus);
    window.addEventListener('offline', refreshStatus);
    return () => {
      window.removeEventListener('online', refreshStatus);
      window.removeEventListener('offline', refreshStatus);
    };
  }, []);

  const addMessage = (text: string, sender: 'user' | 'bot', action = false) => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      text,
      sender,
      timestamp: new Date(),
      action
    }]);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const text = inputText;
    addMessage(text, 'user');
    setInputText('');
    setIsTyping(true);

    // Check specific triggers first
    const lowerText = text.toLowerCase();
    
    // Support "i want this type of interface" or "standard fast thinking maps search" cleanup
    if (lowerText.includes('standard') || lowerText.includes('thinking') || lowerText.includes('maps') || lowerText.includes('search')) {
        setTimeout(() => {
            setIsTyping(false);
            addMessage("🌱 **Namaste!** I have cleaned up the interface as requested.\n\nThe unwanted text and icons have been removed. How else can I help you properly?", 'bot');
        }, 1000);
        return;
    }

    if (lowerText.includes('check my health') || (lowerText.includes('diagnosis') && lowerText.includes('health')) || lowerText.includes('check health')) {
        setTimeout(() => {
             setIsTyping(false);
             addMessage("Certainly! I can help you with a quick health diagnosis.\n\nOpening the assessment form for you...", 'bot');
             setTimeout(() => onOpenHealthForm(), 1000);
        }, 1000);
        return;
    }

    try {
        const response = await getChatResponse(text);
        setIsTyping(false);
        setRuntimeStatus(getChatRuntimeStatus());
        addMessage(response, 'bot');
    } catch (error) {
        setIsTyping(false);
        setRuntimeStatus(getChatRuntimeStatus());
        addMessage("🌱 **Namaste.**\n\nI'm sorry, I'm having trouble connecting right now. Please check your internet connection or try again later.", 'bot');
    }
  };

  const speak = (text: string, messageId: string) => {
    window.speechSynthesis.cancel();
    setSpeakingMessageId(messageId);
    setCurrentWordIndex(-1);
    setIsSpeaking(true);

    // Strip markdown characters for speech
    const cleanText = text.replace(/[*#_]/g, '');
    
    // Pre-calculate ranges for sync
    const words = cleanText.split(/(\s+)/);
    let currentPos = 0;
    const wordRanges = words.map(word => {
      const start = currentPos;
      const end = currentPos + word.length;
      currentPos = end;
      return { start, end };
    });

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        const wordIdx = wordRanges.findIndex(w => charIndex >= w.start && charIndex < w.end);
        if (wordIdx !== -1) {
          setCurrentWordIndex(wordIdx);
        }
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      setCurrentWordIndex(-1);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      setCurrentWordIndex(-1);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
    setCurrentWordIndex(-1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed right-6 bottom-6 z-40 flex flex-col items-end gap-4 font-sans">
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 md:w-96 h-[600px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-emerald-600 p-4 flex justify-between items-center text-white shadow-md z-10">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Health Assistant</h3>
                  <p className="text-xs text-emerald-100 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/> Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-emerald-700 p-1 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {runtimeStatus.mode !== 'live' && (
              <div className={`px-3 py-2 text-xs font-medium border-b ${
                runtimeStatus.isOnline
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {runtimeStatus.message}
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50">
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[90%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-600 rounded-tl-none'
                    }`}
                  >
                    {/* Markdown Rendering or Highlighting */}
                    <div className={`prose prose-sm dark:prose-invert max-w-none ${msg.sender === 'user' ? 'text-white prose-headings:text-white prose-strong:text-white' : ''}`}>
                        {msg.sender === 'bot' && speakingMessageId === msg.id ? (
                          <div className="text-slate-800 dark:text-slate-200">
                            {msg.text.replace(/[*#_]/g, '').split(/(\s+)/).map((word, i) => (
                              <span 
                                key={i} 
                                className={`inline-block px-0.5 rounded transition-all duration-150 ${
                                  i === currentWordIndex 
                                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 underline decoration-2 underline-offset-2 decoration-emerald-500' 
                                    : ''
                                }`}
                              >
                                {word}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                  h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 mt-1 border-b pb-1" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 mt-3 text-emerald-700 dark:text-emerald-400" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1 mt-2" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                  ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                  li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
                                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                  strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                  table: ({node, ...props}) => <div className="overflow-x-auto my-2"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-600 text-xs" {...props} /></div>,
                                  th: ({node, ...props}) => <th className="px-2 py-1 bg-slate-100 dark:bg-slate-800 font-semibold text-left" {...props} />,
                                  td: ({node, ...props}) => <td className="px-2 py-1 border-t border-slate-100 dark:border-slate-700" {...props} />,
                              }}
                          >
                              {msg.text}
                          </ReactMarkdown>
                        )}
                    </div>
                    
                    {/* Bot Actions */}
                    {msg.sender === 'bot' && (
                        <div className="flex items-center gap-2 mt-2 border-t border-slate-100 dark:border-slate-600/50 pt-2">
                            {isSpeaking && speakingMessageId === msg.id ? (
                                <button 
                                    onClick={stopSpeaking} 
                                    className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-full flex items-center gap-1 text-xs font-medium"
                                    title="Stop Speaking"
                                >
                                    <Square size={14} fill="currentColor" /> Stop
                                </button>
                            ) : (
                                <button 
                                    onClick={() => speak(msg.text, msg.id)} 
                                    className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                                    title="Read Aloud"
                                >
                                    <Volume2 size={14} />
                                </button>
                            )}
                        </div>
                    )}

                    {msg.action && (
                      <button 
                        onClick={onOpenHealthForm}
                        className="mt-3 text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-1 font-medium"
                      >
                        <Sparkles className="w-3 h-3" /> Start Diagnosis
                      </button>
                    )}
                    <p className="text-[10px] opacity-50 mt-1 text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-600 flex gap-1">
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                      </div>
                  </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type 'check my health'..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <button 
                onClick={handleSend}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button (Visible when chat is closed) */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg shadow-emerald-600/30 transition-all hover:scale-110"
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
};

export default Chatbot;
