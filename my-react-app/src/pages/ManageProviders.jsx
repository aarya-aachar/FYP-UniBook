import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { useAdminTheme } from '../context/AdminThemeContext';
import { getProviders, createProvider, updateProvider, deleteProvider } from '../services/providerService';

const CATEGORIES = ['Restaurants', 'Futsal', 'Hospitals', 'Salon / Spa'];
const BACKEND_URL = 'http://localhost:4001';

const CAT = {
  'Restaurants': { gradient: 'from-orange-400 to-red-500',   bg: 'bg-orange-500',   badge: 'bg-orange-100 text-orange-700 border border-orange-200', icon: '🍽️' },
  'Futsal':      { gradient: 'from-blue-400 to-indigo-600',  bg: 'bg-blue-500',     badge: 'bg-blue-100 text-blue-700 border border-blue-200',     icon: '⚽' },
  'Hospitals':   { gradient: 'from-emerald-400 to-teal-600', bg: 'bg-emerald-500',  badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', icon: '🏥' },
  'Salon / Spa': { gradient: 'from-purple-400 to-pink-600',  bg: 'bg-purple-500',   badge: 'bg-purple-100 text-purple-700 border border-purple-200',   icon: '💆' },
};

const EMPTY_FORM = { name: '', address: '', description: '', category: 'Restaurants', base_price: 0, opening_time: '09:00', closing_time: '18:00' };

const ManageProviders = () => {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toasts, setToasts] = useState([]);
  const fileInputRef = useRef();

  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const fetchProviders = useCallback(async () => {
    try { setLoading(true); setProviders(await getProviders()); }
    catch { toast('Failed to load providers', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { 
    document.title = "Service Providers | Admin UniBook";
    fetchProviders(); 
  }, [fetchProviders]);

  const displayed = (providers || []).filter(p => {
    const mc = filter === 'All' || p.category === filter;
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.address || '').toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  const openAdd = () => {
    setForm(EMPTY_FORM); setImageFile(null); setEditingId(null);
    setModalMode('add'); setModalOpen(true);
  };

  const openEdit = (p) => {
    setForm({ 
      name: p.name || '', address: p.address || '', description: p.description || '', 
      category: p.category || 'Restaurants', existingImage: p.image || '',
      base_price: p.base_price || 0, opening_time: (p.opening_time || '09:00:00').substring(0, 5),
      closing_time: (p.closing_time || '18:00:00').substring(0, 5),
    });
    setImageFile(null); setEditingId(p.id); setModalMode('edit'); setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.address.trim()) { toast('Required fields are missing', 'error'); return; }
    try {
      setSubmitting(true);
      if (modalMode === 'edit') {
        await updateProvider(editingId, form, imageFile);
        toast(`"${form.name}" updated successfully`);
      } else {
        await createProvider(form, imageFile);
        toast(`"${form.name}" added to platform`);
      }
      setModalOpen(false); fetchProviders();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/50" : "text-slate-500";
  const cardBase = isDark ? "bg-white/5 backdrop-blur-sm border border-white/10" : "bg-white border border-slate-200 shadow-xl shadow-slate-200/20";

  return (
    <div className="flex min-h-screen transition-colors duration-500 font-inter" 
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <Sidebar />

      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 pl-4 pr-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-black pointer-events-auto
            ${t.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-red-500'}`}
            style={{ animation: 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <span className="text-xl">{t.type === 'success' ? '✅' : '❌'}</span>
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex-1 px-10 py-12 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div>
            <h1 className={`text-6xl font-black tracking-tighter mb-4 transition-colors font-outfit ${textPrimary}`}>Service Providers</h1>
            <p className={`text-lg font-bold tracking-tight transition-colors ${textSecondary}`}>{providers.length} total providers registered</p>
          </div>
          <button onClick={openAdd} className={`px-10 py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-widest text-white bg-gradient-to-r from-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all`}>
            ➕ Create New Service
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {CATEGORIES.map(cat => {
            const cfg = CAT[cat];
            const active = filter === cat;
            return (
              <button key={cat} onClick={() => setFilter(active ? 'All' : cat)} className={`p-8 rounded-[3rem] text-left transition-all duration-300 border
                  ${active ? `bg-gradient-to-br ${cfg.gradient} border-transparent shadow-2xl -translate-y-2 text-white` : `${cardBase} hover:shadow-2xl`}`}>
                <div className="text-5xl mb-4">{cfg.icon}</div>
                <div className={`text-4xl font-black font-outfit tracking-tighter`}>{providers.filter(p => p.category === cat).length}</div>
                <div className={`text-xs font-black uppercase tracking-widest mt-2 opacity-50`}>{cat}</div>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <input type="text" placeholder="Search by name or location..." value={search} onChange={e => setSearch(e.target.value)}
            className={`flex-1 px-8 py-5 border rounded-3xl font-black text-lg outline-none transition-all
              ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/10 focus:border-blue-400 focus:bg-white/10' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-300 focus:border-blue-600 shadow-sm'}`} />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className={`px-10 py-5 border rounded-3xl font-black text-xs uppercase tracking-widest outline-none transition-all cursor-pointer
              ${isDark ? 'bg-white/5 border-white/10 text-white/50 focus:border-blue-400' : 'bg-white border-slate-200 text-slate-700 focus:border-blue-600 shadow-sm'}`}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className={`h-80 rounded-[2.5rem] animate-pulse border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`} />)}
          </div>
        ) : displayed.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayed.map(p => {
              const cfg = CAT[p.category] || CAT['Restaurants'];
              return (
                <div key={p.id} className={`group relative rounded-[3rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 border ${cardBase}`} style={{ animation: 'fadeIn 0.4s ease forwards' }}>
                  <div className={`h-40 relative bg-gradient-to-br ${cfg.gradient}`}>
                    {p.image && <img src={p.image.startsWith('/uploads') ? `${BACKEND_URL}${p.image}` : p.image} alt={p.name} className="w-full h-full object-cover opacity-80" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className="absolute bottom-4 left-6 text-4xl">{cfg.icon}</span>
                    <span className={`absolute top-4 right-6 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${cfg.badge}`}>{p.category}</span>
                  </div>
                  <div className="p-8">
                    <h3 className={`font-black text-2xl truncate tracking-tight transition-colors font-outfit ${textPrimary}`}>{p.name}</h3>
                    <p className={`text-sm mt-2 flex items-center gap-2 font-bold tracking-tight ${textSecondary}`}><span>📍</span> {p.address}</p>
                    <div className={`mt-8 flex items-center justify-between p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-widest opacity-40">Base Rate</span>
                        <span className={`font-black text-lg ${textPrimary}`}>Rs. {p.base_price}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black uppercase tracking-widest opacity-40">Hours</span>
                        <span className={`font-bold text-sm ${textSecondary}`}>{p.opening_time.substring(0,5)} - {p.closing_time.substring(0,5)}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-8">
                      <button onClick={() => openEdit(p)} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${isDark ? 'bg-white/10 border-white/10 text-white hover:bg-white hover:text-slate-900' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white shadow-sm shadow-blue-200/20'}`}>Edit</button>
                      <button onClick={() => {setToDelete(p); setConfirmOpen(true);}} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white shadow-sm shadow-red-200/20'}`}>Delete</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className={`text-center py-40 rounded-[3rem] border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white'}`}>
             <div className="text-8xl mb-6 opacity-10 font-outfit">🏢</div>
             <h3 className={`text-3xl font-black ${textPrimary}`}>No providers found</h3>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setModalOpen(false)}>
          <div className={`w-full max-w-lg rounded-[3rem] p-10 border transition-all duration-500 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`} onClick={e => e.stopPropagation()}>
            <h2 className={`text-4xl font-black font-outfit mb-2 ${textPrimary}`}>{modalMode === 'edit' ? 'Update Service' : 'New Service'}</h2>
            <p className={`text-lg font-bold mb-8 ${textSecondary}`}>Enter the details for this provider</p>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-3 opacity-40">Service Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={`w-full px-6 py-4 rounded-2xl border font-bold text-sm outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-3 opacity-40">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={`w-full px-6 py-4 rounded-2xl border font-bold text-sm outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-3 opacity-40">Base Rate (Rs.)</label>
                  <input type="number" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} className={`w-full px-6 py-4 rounded-2xl border font-bold text-sm outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-3 opacity-40">Full Address</label>
                <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className={`w-full px-6 py-4 rounded-2xl border font-bold text-sm outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setModalOpen(false)} className={`flex-1 py-5 rounded-3xl font-black text-xs uppercase tracking-widest ${isDark ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-400'}`}>Cancel</button>
                <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-5 rounded-3xl font-black text-xs uppercase tracking-widest bg-blue-600 text-white shadow-xl shadow-blue-500/20">{submitting ? 'Saving...' : 'Confirm'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className={`w-full max-w-sm rounded-[3rem] p-10 text-center border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white'}`}>
             <span className="text-6xl mb-6 block">🗑️</span>
             <h2 className={`text-3xl font-black font-outfit mb-2 ${textPrimary}`}>Delete Entry?</h2>
             <p className={`text-lg font-bold mb-10 ${textSecondary}`}>Are you sure you want to remove <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>"{toDelete?.name}"</span>?</p>
             <div className="flex gap-4">
                <button onClick={() => setConfirmOpen(false)} className={`flex-1 py-5 rounded-3xl font-black text-xs uppercase tracking-widest ${isDark ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-400'}`}>No, Keep</button>
                <button onClick={async () => {
                   setDeleting(true); try { await deleteProvider(toDelete.id); toast('Deleted'); setConfirmOpen(false); fetchProviders(); } finally { setDeleting(false); }
                }} className="flex-1 py-5 rounded-3xl font-black text-xs uppercase tracking-widest bg-red-600 text-white shadow-xl shadow-red-500/20">Yes, Delete</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProviders;
