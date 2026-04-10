import { useState, useEffect, useRef } from 'react';
import { Search, Send, User, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AdminTopHeader from '../components/AdminTopHeader';
import { useAdminTheme } from '../context/AdminThemeContext';
import { getConversations, getChatHistory, sendMessage } from '../services/chatService';

const AdminChats = ({ roleFilter = 'user' }) => {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';
  const isProvider = roleFilter === 'provider';
  
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const data = await getConversations(roleFilter);
      setConversations(data);
    } catch (err) {
      console.error('Fetch Conversations Error:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchChat = async (userId, showLoading = false) => {
    try {
      if (showLoading) setLoadingChat(true);
      const history = await getChatHistory(userId);
      setMessages(history);
      // After fetching chat, refresh list to clear unread markers
      fetchConversations();
    } catch (err) {
      console.error('Fetch Chat Error:', err);
    } finally {
      if (showLoading) setLoadingChat(false);
      // Dispatch event to clear badges instantly
      window.dispatchEvent(new CustomEvent('chat-read'));
    }
  };

  useEffect(() => {
    fetchConversations();
    // Reset active user if filter changes
    setActiveUser(null);
    setMessages([]);
    // Poll for new messages/conversations every 5 seconds
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [roleFilter]);

  useEffect(() => {
    if (activeUser) {
      fetchChat(activeUser.id, true);
      // Start specific chat polling
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => {
        fetchChat(activeUser.id, false);
      }, 3000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser) return;

    try {
      const lastMsg = newMessage;
      setNewMessage('');
      
      // Optimistic update
      const tempMsg = {
        id: Date.now(),
        sender_id: 'admin',
        message: lastMsg,
        is_admin_sender: 1,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempMsg]);

      await sendMessage(activeUser.id, lastMsg);
      fetchChat(activeUser.id, false);
    } catch (err) {
      console.error('Send Error:', err);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const bgCard = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm";
  const bgApp = isDark ? "bg-[#0f172a]" : "bg-slate-50";

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`flex min-h-screen ${bgApp}`}>
      <Sidebar />
      <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full overflow-hidden flex flex-col">
        <AdminTopHeader 
          title={isProvider ? "Provider Communications" : "Client Inquiries"} 
          subtitle={isProvider 
            ? "Manage support and technical coordination with your registered service providers." 
            : "Manage secure communications and direct inquiries with your registered clients."}
        />
        
        <div className="flex-1 flex overflow-hidden gap-6 min-h-[calc(100vh-250px)]">
          
          {/* User List Sidebar */}
          <div className={`w-80 flex flex-col rounded-3xl border overflow-hidden ${bgCard}`}>
             <div className="p-5 border-b">
                <h2 className={`text-lg font-black mb-4 tracking-tight ${textPrimary}`}>
                  {isProvider ? "Active Providers" : "Recent Inquiries"}
                </h2>
                <div className="relative">
                   <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                   <input 
                     type="text" 
                     placeholder={isProvider ? "Search providers..." : "Search clients..."}
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all
                       ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-100 focus:border-emerald-600'}`}
                   />
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loadingList ? (
                   <div className="p-10 flex justify-center text-emerald-500"><div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div></div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-10 text-center opacity-30">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No active chats</p>
                  </div>
                ) : (
                  filteredConversations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveUser(c)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group
                        ${activeUser?.id === c.id 
                          ? (isDark ? 'bg-slate-800' : 'bg-slate-50') 
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'}`}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 overflow-hidden">
                           {c.profile_photo ? (
                             <img src={`http://localhost:4001${c.profile_photo}`} alt="user" className="w-full h-full object-cover" />
                           ) : <User className="w-5 h-5" />}
                        </div>
                        {c.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[8px] font-black text-white flex items-center justify-center border-2 border-white dark:border-slate-900 transition-all group-hover:scale-110">
                            {c.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                           <h4 className={`text-xs font-bold truncate ${textPrimary}`}>{c.name}</h4>
                           <span className="text-[8px] font-bold uppercase tracking-tighter opacity-40">{c.last_message_time ? formatTime(c.last_message_time) : ''}</span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 truncate">{c.last_message || 'No messages'}</p>
                      </div>
                    </button>
                  ))
                )}
             </div>
          </div>

          {/* Active Chat Area */}
          <div className={`flex-1 flex flex-col rounded-3xl border overflow-hidden ${bgCard}`}>
             {activeUser ? (
               <>
                 <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 overflow-hidden">
                          {activeUser.profile_photo ? (
                            <img src={`http://localhost:4001${activeUser.profile_photo}`} alt="active" className="w-full h-full object-cover" />
                          ) : <User className="w-5 h-5" />}
                       </div>
                       <div>
                          <h4 className={`text-sm font-black tracking-tight ${textPrimary}`}>{activeUser.name}</h4>
                          <p className={`text-[10px] font-bold ${textSecondary}`}>{activeUser.email}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                       <CheckCircle2 className="w-3 h-3" />
                       Verified Client
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loadingChat ? (
                      <div className="flex justify-center h-full items-center"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.is_admin_sender;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1`}>
                             <div className={`max-w-[75%] px-5 py-3 rounded-2xl text-xs font-bold shadow-md transition-all
                               ${isMe 
                                  ? 'bg-emerald-600 text-white rounded-tr-none border border-emerald-500' 
                                  : (isDark 
                                      ? 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700' 
                                      : 'bg-white text-slate-900 rounded-tl-none border border-slate-200 shadow-slate-200/50')}`}>
                               <div className="leading-relaxed">{msg.message}</div>
                               <div className={`text-[8px] mt-1.5 font-black uppercase tracking-widest ${isMe ? 'text-emerald-200' : 'text-slate-500'}`}>
                                  {formatTime(msg.created_at)}
                               </div>
                             </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                 </div>

                 <div className="p-4 border-t">
                    <form onSubmit={handleSend} className="relative flex items-center">
                       <input 
                         type="text" 
                         value={newMessage}
                         onChange={(e) => setNewMessage(e.target.value)}
                         placeholder={`Reply to ${activeUser.name}...`}
                         className={`w-full pl-6 pr-14 py-4 rounded-2xl border font-semibold text-xs outline-none transition-all
                           ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-100 focus:border-emerald-600'}`}
                       />
                       <button 
                         type="submit"
                         disabled={!newMessage.trim()}
                         className={`absolute right-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'}`}
                       >
                          <Send className="w-4 h-4" />
                       </button>
                    </form>
                 </div>
               </>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center p-10">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700">
                    <MessageCircle className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className={`text-xl font-black mb-2 ${textPrimary}`}>Select a Conversation</h3>
                  <p className="text-sm font-medium max-w-xs mx-auto">Select a user from the list on the left to start communicating.</p>
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminChats;
