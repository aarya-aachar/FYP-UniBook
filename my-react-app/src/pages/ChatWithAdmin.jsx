import { useState, useEffect, useRef } from 'react';
import { Send, User, ShieldCheck, Clock } from 'lucide-react';
import UserNavbar from '../components/UserNavbar';
import { useUserTheme } from '../context/UserThemeContext';
import { getChatHistory, sendMessage } from '../services/chatService';
import { getProfile } from '../services/authService';

const ChatWithAdmin = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
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
      // For users chatting with system, we find the admin in the route, 
      // but to get history we need the admin's ID or a special "admin" alias.
      // My backend history route currently expects their specific ID.
      // Actually, my route handler for user chats finds the admin ID.
      // Let's ensure the user can get history without knowing the admin ID initially.
      // FIX: I'll use a special endpoint or just fetch based on self.
      const history = await getChatHistory('admin'); // 'admin' is a special alias I'll handle in backend
      setMessages(history);
    } catch (err) {
      console.error('Chat History Error:', err);
    } finally {
      if (showLoading) setLoading(false);
      // Dispatch event to clear badges instantly
      window.dispatchEvent(new CustomEvent('chat-read'));
    }
  };

  useEffect(() => {
    fetchHistory(true);
    
    // Polling every 4 seconds
    pollingRef.current = setInterval(() => {
      fetchHistory(false);
    }, 4000);

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
      // Optimistic update
      const tempMsg = {
        id: Date.now(),
        sender_id: currentUser.id,
        message: newMessage,
        is_admin_sender: 0,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempMsg]);
      const lastMsg = newMessage;
      setNewMessage('');

      await sendMessage(null, lastMsg); // Backend handles finding admin
      fetchHistory(false);
    } catch (err) {
      console.error('Send Error:', err);
    } finally {
      setSending(false);
    }
  };

  // Format time
  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const bgCard = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-xl shadow-slate-200/50";
  const bgApp = isDark ? "bg-[#0f172a]" : "bg-slate-50";

  return (
    <div className={`flex flex-col min-h-screen transition-all duration-500 font-inter user-panel-bg ${isDark ? 'dark' : 'light'}`}>
      <UserNavbar />
      
      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-12 relative transition-all duration-500 pt-28">
        
        {/* Page Title with Glass Effect */}
        <div className="max-w-7xl mx-auto w-full mb-10 slide-up">
           <div className="glass-header">
              <h1 className={`text-4xl font-bold mb-2 tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Direct Support</h1>
              <p className={`text-base font-medium transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-2xl`}>Message our administration team for assistance.</p>
           </div>
        </div>

        <div className="max-w-4xl mx-auto w-full h-[calc(100vh-350px)] flex flex-col mb-10">
          
          {/* Chat Header */}
          <div className={`p-6 rounded-t-3xl border-b flex items-center justify-between glass-card`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-xl font-black tracking-tight ${textPrimary}`}>UniBook Support</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${textSecondary}`}>Active Support Team</span>
              </div>
            </div>
          </div>
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
            <Clock className="w-3 h-3" />
            Typical Reply: 5 mins
          </div>
        </div>

        {/* Messages Portal */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide glass-card border-x border-b-0 rounded-none`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50">
               <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
               <p className="text-xs font-bold uppercase tracking-widest">Initialising Secure Encryption...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-xs mx-auto">
               <div className={`w-16 h-16 rounded-3xl mb-6 flex items-center justify-center mx-auto bg-slate-100 text-slate-400`}>
                  <Send className="w-8 h-8 opacity-20 -rotate-45" />
               </div>
               <h3 className={`text-base font-black mb-2 ${textPrimary}`}>No Messages Yet</h3>
               <p className={`text-xs font-medium leading-relaxed ${textSecondary}`}>
                 Have a question about a booking or a provider? Send a message and our team will get back to you shortly.
               </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = !msg.is_admin_sender;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                   <div className={`max-w-[85%] md:max-w-[70%] px-5 py-3 rounded-2xl text-sm font-medium shadow-sm transition-all
                     ${isMe 
                       ? 'bg-emerald-600 text-white rounded-tr-none' 
                       : (isDark ? 'bg-slate-800 text-slate-200 rounded-tl-none' : 'bg-slate-100 text-slate-800 rounded-tl-none')}`}>
                      {msg.message}
                   </div>
                   <span className={`text-[9px] font-bold uppercase tracking-widest mt-2 px-1 ${textSecondary}`}>
                      {isMe ? 'You' : 'Admin'} • {formatTime(msg.created_at)}
                   </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`p-4 rounded-b-3xl border-t glass-card`}>
          <form onSubmit={handleSend} className="relative flex items-center gap-3">
             <input 
               type="text" 
               value={newMessage}
               onChange={(e) => setNewMessage(e.target.value)}
               placeholder="Write your message..."
               className={`flex-1 pl-6 pr-14 py-4 rounded-2xl border font-semibold text-sm outline-none transition-all
                 ${isDark 
                   ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' 
                   : 'bg-slate-50 border-slate-200 text-slate-950 focus:border-emerald-600 focus:shadow-lg focus:shadow-emerald-500/10'}`}
             />
             <button 
               type="submit"
               disabled={!newMessage.trim() || sending}
               className={`absolute right-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all
                 ${newMessage.trim() && !sending 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/40 hover:scale-105 active:scale-95' 
                    : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-600 cursor-not-allowed'}`}
             >
                <Send className="w-4 h-4" />
             </button>
          </form>
          <div className="mt-2 text-center">
             <p className={`text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Encrypted communication via unibook security
             </p>
          </div>
        </div>

        </div>
      </main>
    </div>
  );
};

export default ChatWithAdmin;
