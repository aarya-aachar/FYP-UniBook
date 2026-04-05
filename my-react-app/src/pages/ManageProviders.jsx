import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { useAdminTheme } from '../context/AdminThemeContext';
import { getProviders, createProvider, updateProvider, deleteProvider } from '../services/providerService';
import { 
  Building2, Search, Filter, CheckCircle, AlertCircle, Edit, Trash2, MapPin, SearchX, Coffee, Activity, Stethoscope, Sparkles 
} from 'lucide-react';
import AdminTopHeader from '../components/AdminTopHeader';

const CATEGORIES = ['Restaurants', 'Futsal', 'Hospitals', 'Salon / Spa'];
const BACKEND_URL = 'http://localhost:4001';

const getCategoryIcon = (cat) => {
  switch (cat) {
    case 'Restaurants': return Coffee;
    case 'Futsal': return Activity;
    case 'Hospitals': return Stethoscope;
    case 'Salon / Spa': return Sparkles;
    default: return Building2;
  }
};

const CAT = {
  'Restaurants': { gradient: 'bg-emerald-500',   bg: 'bg-emerald-500',   badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', badgeLight: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  'Futsal':      { gradient: 'bg-teal-500',      bg: 'bg-teal-500',      badge: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',     badgeLight: 'bg-teal-50 text-teal-600 border border-teal-100' },
  'Hospitals':   { gradient: 'bg-emerald-600',   bg: 'bg-emerald-600',  badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', badgeLight: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  'Salon / Spa': { gradient: 'bg-teal-600',      bg: 'bg-teal-600',   badge: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',   badgeLight: 'bg-teal-50 text-teal-600 border border-teal-100' },
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
    // Comprehensive required fields check
    if (!form.name.trim() || !form.address.trim() || !form.description.trim() || !form.base_price || !form.opening_time || !form.closing_time) { 
      toast('All text fields and pricing are required', 'error'); 
      return; 
    }
    
    if (!imageFile && modalMode === 'add') {
      toast('Provider image is required', 'error');
      return;
    }

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
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const textMuted = isDark ? "text-slate-500" : "text-slate-400";
  const cardBase = isDark ? "bg-slate-900 border border-slate-800 shadow-sm" : "bg-white border border-slate-200 shadow-sm";
  const borderCol = isDark ? "border-slate-800" : "border-slate-200";
  const bgRowHover = isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50";

  return (
    <div className="flex min-h-screen transition-colors duration-300 font-inter" 
         style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
      <Sidebar />

      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 pl-4 pr-5 py-3 rounded-lg shadow-lg text-white text-sm font-bold pointer-events-auto
            ${t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}
            style={{ animation: 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            {t.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full overflow-hidden">
        <AdminTopHeader 
          title="Service Providers" 
          subtitle={`Manage pricing, locations, and details for ${providers.length} enrolled services.`} 
        >
          <button 
            onClick={openAdd} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all outline-none cursor-pointer whitespace-nowrap"
          >
            <Building2 className="w-4 h-4" />
            Add Provider
          </button>
        </AdminTopHeader>

        {/* Data Table Controls */}
        <div className={`p-4 rounded-xl border-b-0 border ${cardBase} flex flex-col md:flex-row gap-4 mb-0`} style={{ animation: 'fadeIn 0.6s ease-out' }}>
          <div className="relative flex-1">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${textMuted}`}>
              <Search className="w-5 h-5" />
            </span>
            <input 
              type="text" 
              placeholder="Search providers by name or address..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-12 pr-6 py-3 border rounded-xl transition-all font-medium text-sm outline-none
                ${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:bg-white'}`} 
            />
          </div>
          <div className="relative md:w-64">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${textMuted} pointer-events-none`}>
              <Filter className="w-4 h-4" />
            </span>
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              className={`appearance-none w-full pl-11 pr-10 py-3 border rounded-xl transition-all cursor-pointer font-bold text-xs uppercase tracking-widest outline-none
                ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300 focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-emerald-600'}`}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className={`overflow-x-auto rounded-xl border border-t-0 shadow-lg ${cardBase}`} style={{ animation: 'fadeIn 0.7s ease-out' }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${borderCol} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-wider ${textSecondary}`}>Provider Details</th>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-wider ${textSecondary}`}>Category</th>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-wider ${textSecondary}`}>Pricing</th>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-wider ${textSecondary}`}>Operating Hours</th>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-wider text-right ${textSecondary}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading Skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className={`border-b ${borderCol}`}>
                    <td className="px-6 py-4"><div className={`h-12 w-64 rounded-xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} /></td>
                    <td className="px-6 py-4"><div className={`h-6 w-24 rounded-full animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} /></td>
                    <td className="px-6 py-4"><div className={`h-6 w-16 rounded-full animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} /></td>
                    <td className="px-6 py-4"><div className={`h-4 w-28 rounded-full animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} /></td>
                    <td className="px-6 py-4 text-right"><div className={`h-8 w-24 rounded-lg animate-pulse ml-auto ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} /></td>
                  </tr>
                ))
              ) : displayed.length > 0 ? (
                displayed.map(p => {
                  const cfg = CAT[p.category] || CAT['Restaurants'];
                  const CatIcon = getCategoryIcon(p.category);
                  const imageUrl = p.image ? (p.image.startsWith('/uploads') ? `${BACKEND_URL}${p.image}` : p.image) : null;
                  
                  return (
                    <tr key={p.id} className={`border-b border-t-0 last:border-b-0 transition-colors ${borderCol} ${bgRowHover}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {imageUrl ? (
                             <img src={imageUrl} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-sm" />
                          ) : (
                             <div className={`w-12 h-12 rounded-xl ${cfg.bg} flex items-center justify-center shadow-sm`}>
                                <CatIcon className="w-6 h-6 text-white" />
                             </div>
                          )}
                          <div className="min-w-0">
                            <p className={`text-sm font-bold truncate ${textPrimary}`}>{p.name}</p>
                            <p className={`text-xs truncate flex items-center gap-1 ${textSecondary}`}>
                               <MapPin className="w-3 h-3" />
                               {p.address}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${isDark ? cfg.badge : cfg.badgeLight}`}>
                           <CatIcon className="w-3 h-3" />
                           {p.category}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-black ${textPrimary}`}>
                        Rs. {p.base_price}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textSecondary}`}>
                        {p.opening_time.substring(0,5)} - {p.closing_time.substring(0,5)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => openEdit(p)}
                             className={`p-2 rounded-lg transition-colors cursor-pointer outline-none ${isDark ? 'text-emerald-400 hover:bg-emerald-500/20' : 'text-emerald-600 hover:bg-emerald-50'}`}
                             title="Edit Provider"
                           >
                              <Edit className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => {setToDelete(p); setConfirmOpen(true);}}
                             className={`p-2 rounded-lg transition-colors cursor-pointer outline-none ${isDark ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-50'}`}
                             title="Delete Provider"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                        <SearchX className="w-8 h-8" />
                      </div>
                      <p className={`text-lg font-bold ${textPrimary}`}>No providers found</p>
                      <p className={`text-sm mt-1 ${textSecondary}`}>Adjust your category filter or search term.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in" onClick={() => setModalOpen(false)}>
          <div className={`w-full max-w-lg rounded-xl p-8 border shadow-2xl animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`} onClick={e => e.stopPropagation()}>
            <h2 className={`text-2xl font-black tracking-tight mb-2 ${textPrimary}`}>{modalMode === 'edit' ? 'Update Service Details' : 'Register New Service'}</h2>
            <p className={`text-sm font-medium mb-6 ${textSecondary}`}>Enter the system details for this provider record.</p>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${textSecondary}`}>Service Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-600'}`} />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${textSecondary}`}>Provider Image</label>
                  <label className={`flex items-center justify-center w-full px-4 py-3 rounded-xl border font-semibold text-sm transition-all cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 focus-within:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 focus-within:border-emerald-600'}`}>
                    <span className="truncate">{imageFile ? imageFile.name : 'Choose File...'}</span>
                    <input type="file" ref={fileInputRef} onChange={e => setImageFile(e.target.files[0])} accept="image/*" className="hidden" />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${textSecondary}`}>Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-600'}`}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${textSecondary}`}>Base Rate (Rs.)</label>
                  <input type="number" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-600'}`} />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${textSecondary}`}>Service Description *</label>
                <textarea 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  placeholder="Describe the service offerings..."
                  className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm outline-none transition-all h-24 resize-none ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-600'}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${textSecondary}`}>Full Address *</label>
                <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-600'}`} />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setModalOpen(false)} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer ${isDark ? 'bg-slate-800 text-white/70 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
                <button onClick={handleSubmit} disabled={submitting} className={`flex-1 py-3 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer`}>{submitting ? 'Saving...' : 'Save Details'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-sm rounded-xl p-8 border shadow-2xl animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
             <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${isDark ? 'bg-red-500/20 text-red-500' : 'bg-red-100 text-red-600'}`}>
                <Trash2 className="w-6 h-6" />
             </div>
             <h2 className={`text-xl font-black mb-2 tracking-tight ${textPrimary}`}>Delete Service?</h2>
             <p className={`text-sm mb-6 font-medium ${textSecondary}`}>Are you sure you want to permanently delete <span className="font-black">"{toDelete?.name}"</span>? This action cannot be undone.</p>
             <div className="flex gap-3">
                <button onClick={() => setConfirmOpen(false)} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-colors cursor-pointer ${isDark ? 'bg-slate-800 text-white/70 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
                <button onClick={async () => {
                   setDeleting(true); try { await deleteProvider(toDelete.id); toast('Provider deleted permanently'); setConfirmOpen(false); fetchProviders(); } finally { setDeleting(false); }
                }} className="flex-1 py-3 text-sm font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer">Yes, Delete</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProviders;
