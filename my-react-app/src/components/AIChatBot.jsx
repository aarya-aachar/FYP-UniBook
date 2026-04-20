/**
 * The Self-Service AI Companion (Chatbot)
 * 
 * relative path: /src/components/AIChatBot.jsx
 * 
 * This component provides an "Instant Help" experience for users. 
 * It uses a lightweight NLP (Natural Language Processing) approach 
 * based on keyword detection to answer common questions about 
 * bookings, payments, and platform usage.
 * 
 * Design Features:
 * - Intent-Based NLP: Matches user queries to pre-defined responses.
 * - Typing Simulations: Delay timers to make the bot feel "Human".
 * - Glassmorphism UI: High-end aesthetic with blurs and emerald accents.
 */

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Bot, Command, Clock } from 'lucide-react';
import { CHATBOT_INTENTS, DEFAULT_RESPONSE } from '../utils/chatbotIntents';

const AIChatBot = ({ isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello! I'm your UniBook AI Assistant. Ask me anything about bookings or payments!" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  /**
   * --- AUTO-SCROLL LOGIC ---
   * Whenever a new message is added, we automatically scroll to the 
   * bottom so the user always sees the latest reply.
   */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  /**
   * handleIntentDetection (The "Brain")
   * 
   * This function breaks down the user's sentence into "Tokens" (words).
   * It then scans our intent dictionary to find which category has the 
   * most matching keywords.
   */
  const handleIntentDetection = (query) => {
    const tokens = query.toLowerCase().split(/\W+/);
    
    let matchedIntent = null;
    let maxMatches = 0;

    CHATBOT_INTENTS.forEach(intent => {
      // Intersection count: how many bot-keywords did the user mention?
      const matchCount = intent.keywords.filter(keyword => tokens.includes(keyword)).length;
      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        matchedIntent = intent;
      }
    });

    // Return the specific answer or a generic "I don't know" response
    return matchedIntent ? matchedIntent.response : DEFAULT_RESPONSE;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message to the UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    /**
     * --- BOT TYPING DELAY ---
     * We show a "Typing..." state for 800ms before replying. 
     * This makes the interaction feel more natural and less robotic.
     */
    setIsTyping(true);
    setTimeout(() => {
      const botResponse = handleIntentDetection(userMessage);
      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
      setIsTyping(false);
    }, 800);
  };

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const bgCard = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-2xl";
  const userMsgBg = isDark ? "bg-emerald-600 text-white" : "bg-emerald-600 text-white";
  const botMsgBg = isDark ? "bg-slate-800 text-slate-100" : "bg-slate-100 text-slate-800";

  return (
    <div className="fixed bottom-6 right-6 z-[999] font-inter">
      {/* 
          --- FLOATING ACTION BUTTON ---
          Features a pulsing notification ring to catch the user's eye.
      */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all animate-in zoom-in duration-300 group"
        >
          <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-2 -right-2 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* --- CHAT WINDOW --- */}
      {isOpen && (
        <div className={`w-[380px] h-[550px] rounded-3xl border flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 slide-in-from-right-4 duration-500 ${bgCard}`}>
          
          {/* Brand Header */}
          <div className="bg-emerald-600 p-5 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Command className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">AI Chat Assistant</h3>
                <div className="flex items-center gap-1.5 opacity-80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Intent-Based NLP</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conversation Feed */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className="flex items-center gap-2 mb-1 opacity-40">
                  {msg.role === 'bot' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  <span className="text-[10px] font-black uppercase tracking-widest">{msg.role === 'bot' ? 'Assistant' : 'You'}</span>
                </div>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] font-semibold leading-relaxed shadow-sm
                  ${msg.role === 'user' ? `${userMsgBg} rounded-tr-none` : `${botMsgBg} rounded-tl-none`}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Animated Typing Indicator */}
            {isTyping && (
              <div className="flex flex-col items-start animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-1 opacity-40">
                  <Bot className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Assistant is typing...</span>
                </div>
                <div className={`${botMsgBg} px-4 py-3 rounded-2xl rounded-tl-none flex gap-1`}>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Smart Input Bar */}
          <div className={`p-4 border-t ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about booking or payments..."
                className={`w-full pl-5 pr-12 py-3.5 rounded-2xl border text-xs font-bold outline-none transition-all
                  ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-600 focus:shadow-lg focus:shadow-emerald-500/10'}`}
              />
              <button 
                type="submit" 
                disabled={!input.trim()}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all
                  ${input.trim() ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-slate-300 text-slate-500 opacity-50'}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-center text-[8px] font-black uppercase tracking-[0.3em] opacity-30 mt-3 text-emerald-600">
              Guided by Intelligence • Powered by UniBook
            </p>
          </div>

        </div>
      )}
    </div>
  );
};

export default AIChatBot;
