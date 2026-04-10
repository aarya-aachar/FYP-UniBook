import { useState, useEffect, useRef } from 'react';
import { Send, User, ShieldCheck, Clock, MessageSquareQuote } from 'lucide-react';
import ProviderSidebar from '../components/ProviderSidebar';
import AdminTopHeader from '../components/AdminTopHeader';
import { useAdminTheme } from '../context/AdminThemeContext';
import { getChatHistory, sendMessage } from '../services/chatService';
import { getProfile } from '../services/authService';

const ProviderChat = () => {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';
  const currentUser = getProfile();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      // 'admin' is handled as an alias in the backend
      const history = await getChatHistory('admin');
      setMessages(history);
    } catch (err) {
      console.error('Provider Chat History Error:', err);
    } finally {
      if (showLoading) setLoading(false);
      // Dispatch event to clear badges instantly if they existed
      window.dispatchEvent(new CustomEvent('chat-read'));
    }
  };

  useEffect(() => {
    fetchHistory(true);
    
    // Polling every 8 seconds for providers (slightly faster than users)
    pollingRef.current = setInterval(() => {
      fetchHistory(false);
    }, 8000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const lastMsg = newMessage;
      setNewMessage('');
      
      // Optimistic update
      const tempMsg = {
        id: Date.now(),
        sender_id: currentUser.id,
        message: lastMsg,
        is_admin_sender: 0,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempMsg]);

      await sendMessage(null, lastMsg); // Backend routes to admin
      fetchHistory(false);
    } catch (err) {
      console.error('Provider Send Error:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const bgCard = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm";
  const bgApp = isDark ? "bg-[#020617]" : "bg-slate-50";

  return (
    <div className="flex min-h-screen font-inter transition-colors duration-300" style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
      <ProviderSidebar isDark={isDark} />
      
      <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full overflow-hidden flex flex-col h-[calc(100vh)]">
        <AdminTopHeader 
            title="Admin Support"
            subtitle="Connect directly with the UniBook administration for technical assistance or account queries."
        />

        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
           
           <div className={`flex-1 flex flex-col rounded-3xl border overflow-hidden transition-all ${bgCard}`}>
              
              {/* Chat Header Overlay */}
              <div className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? 'bg-slate-800/50' : 'bg-emerald-600'}`}>
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all
                       ${isDark ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/20 text-white border-white/20'}`}>
                        <ShieldCheck className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-white'}`}>System Administration</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-emerald-500' : 'bg-emerald-300'}`}></span>
                           <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-emerald-500' : 'text-emerald-100'}`}>Support Channel Active</p>
                        </div>
                     </div>
                  </div>
                  <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest
                    ${isDark ? 'border-slate-700 text-slate-500' : 'border-white/20 text-white/80'}`}>
                    <Clock className="w-3 h-3" />
                    Reply Time: ~5m
                  </div>
              </div>

              {/* Messages Area */}
              <div className={`flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar ${isDark ? 'bg-slate-900/30' : 'bg-slate-50/50'}`}>
                 {loading ? (
                   <div className="flex flex-col items-center justify-center h-full opacity-40">
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Initialising Secure Channel...</p>
                   </div>
                 ) : messages.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full opacity-20 text-center px-10">
                      <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center mb-6 border-2 border-dashed
                        ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white'}`}>
                        <MessageSquareQuote className={`w-10 h-10 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
                      </div>
                      <h3 className={`text-xl font-black mb-2 ${textPrimary}`}>No Conversations Yet</h3>
                      <p className="text-sm font-medium max-w-xs mx-auto leading-relaxed">Reach out to our administrators if you have any technical questions or account issues.</p>
                   </div>
                 ) : (
                   messages.map((msg) => {
                     const isMe = !msg.is_admin_sender;
                     return (
                       <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                          <div className={`max-w-[80%] md:max-w-[70%] px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all shadow-sm
                            ${isMe 
                               ? 'bg-emerald-600 text-white rounded-tr-none shadow-emerald-600/10' 
                               : (isDark 
                                   ? 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700' 
                                   : 'bg-white text-slate-900 rounded-tl-none border border-slate-100 shadow-slate-200/50')}`}>
                             <div className="leading-relaxed">{msg.message}</div>
                             <div className={`flex items-center gap-1.5 text-[9px] mt-2 font-black uppercase tracking-widest ${isMe ? 'text-emerald-200' : 'text-slate-500'}`}>
                                {isMe ? 'Provider' : 'Admin'} <span className="opacity-30">•</span> {formatTime(msg.created_at)}
                             </div>
                          </div>
                       </div>
                     );
                   })
                 )}
                 <div ref={messagesEndRef} />
              </div>

              {/* Input Section */}
              <div className={`p-5 border-t ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
                 <form onSubmit={handleSend} className="relative flex items-center gap-3">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message to administration..."
                        className={`w-full pl-6 pr-14 py-4 rounded-xl border font-bold text-xs outline-none transition-all
                          ${isDark 
                            ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' 
                            : 'bg-slate-50 border-slate-200 text-slate-950 focus:border-emerald-600 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10'}`}
                      />
                      <button 
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center transition-all 
                          ${newMessage.trim() && !sending 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95' 
                            : 'bg-slate-300 dark:bg-slate-700 text-slate-100 opacity-50'}`}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                 </form>
                 <div className="text-center mt-3">
                    <p className={`text-[8px] font-black uppercase tracking-[0.4em] opacity-30 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                       End-to-End Encrypted Secure Protocol
                    </p>
                 </div>
              </div>

           </div>

        </div>
      </div>
    </div>
  );
};

export default ProviderChat;
