import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { getProviders, createProvider, updateProvider, deleteProvider } from '../services/providerService';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ['Restaurants', 'Futsal', 'Hospitals', 'Salon / Spa'];
const BACKEND_URL = 'http://localhost:4000';

const CAT = {
  'Restaurants': { gradient: 'from-orange-400 to-red-500',   bg: 'bg-orange-500',   badge: 'bg-orange-100 text-orange-700 border border-orange-200', icon: '🍽️' },
  'Futsal':      { gradient: 'from-blue-400 to-indigo-600',  bg: 'bg-blue-500',     badge: 'bg-blue-100 text-blue-700 border border-blue-200',     icon: '⚽' },
  'Hospitals':   { gradient: 'from-emerald-400 to-teal-600', bg: 'bg-emerald-500',  badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', icon: '🏥' },
  'Salon / Spa': { gradient: 'from-purple-400 to-pink-600',  bg: 'bg-purple-500',   badge: 'bg-purple-100 text-purple-700 border border-purple-200',   icon: '💆' },
};

const EMPTY_FORM = { 
  name: '', 
  address: '', 
  description: '', 
  category: 'Restaurants',
  base_price: 0,
  opening_time: '09:00',
  closing_time: '18:00'
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
    {toasts.map(t => (
      <div key={t.id} className={`flex items-center gap-3 pl-4 pr-5 py-4 rounded-2xl shadow-2xl text-white text-base font-semibold pointer-events-auto
        ${t.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}
        style={{ animation: 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <span className="text-xl">{t.type === 'success' ? '✅' : '❌'}</span>
        {t.message}
      </div>
    ))}
  </div>
);

// ─── Image Picker ─────────────────────────────────────────────────────────────
const ImagePicker = ({ preview, onFileChange }) => {
  const ref = useRef();
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-200 mb-2">Provider Photo</label>
      <div
        onClick={() => ref.current.click()}
        className={`relative w-full h-40 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden
          flex flex-col items-center justify-center transition-all group
          ${preview ? 'border-transparent' : 'border-white/20 hover:border-white/40 bg-white/5'}`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
              <span className="text-white font-semibold text-sm">📷 Change Photo</span>
            </div>
          </>
        ) : (
          <>
            <span className="text-4xl mb-2">📷</span>
            <p className="text-white/60 text-sm">Click to upload photo</p>
            <p className="text-white/30 text-xs mt-1">JPG, PNG, WEBP · Max 5MB</p>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
    </div>
  );
};

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDialog = ({ open, providerName, onCancel, onConfirm, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={onCancel}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}
        style={{ animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🗑️</span>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">Delete Provider?</h2>
        <p className="text-center text-gray-400 text-base mb-6">
          <span className="font-semibold text-gray-700">"{providerName}"</span> and all its bookings will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-semibold text-base text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all
              ${loading ? 'bg-gray-300' : 'bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90'}`}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Provider Modal (Add / Edit) ──────────────────────────────────────────────
const ProviderModal = ({ open, mode, form, setForm, imageFile, setImageFile, onClose, onSubmit, loading }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (form.existingImage) setPreview(form.existingImage.startsWith('/uploads') ? `${BACKEND_URL}${form.existingImage}` : form.existingImage);
    else setPreview(null);
  }, [form.existingImage, open]);

  useEffect(() => {
    if (!open) { setPreview(null); }
  }, [open]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  if (!open) return null;
  const isEdit = mode === 'edit';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-md mx-4 max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', animation: 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
        onClick={e => e.stopPropagation()}>
        <div className="p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-extrabold text-white">{isEdit ? '✏️ Edit Provider' : '➕ New Provider'}</h2>
              <p className="text-white/50 text-base mt-1">{isEdit ? 'Update the details below' : 'Fill in details to add a service provider'}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 text-white/60 hover:bg-white/20 flex items-center justify-center text-lg font-bold transition-all">✕</button>
          </div>

          {/* Photo */}
          <ImagePicker preview={preview} onFileChange={handleFile} />

          {/* Name */}
          <div className="mt-5">
            <label className="block text-base font-semibold text-gray-200 mb-1.5">Provider Name <span className="text-red-400">*</span></label>
            <input type="text" placeholder="e.g. KMC Hospital" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all" />
          </div>

          {/* Category */}
          <div className="mt-4">
            <label className="block text-base font-semibold text-gray-200 mb-2">Category <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => setForm(f => ({ ...f, category: cat }))}
                  className={`py-2.5 px-3 rounded-xl border text-base font-medium transition-all flex items-center gap-2
                    ${form.category === cat ? 'border-blue-400 bg-blue-500/20 text-blue-300' : 'border-white/10 text-white/50 hover:border-white/20 hover:bg-white/5'}`}>
                  <span>{CAT[cat]?.icon}</span>{cat}
                </button>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="mt-4">
            <label className="block text-base font-semibold text-gray-200 mb-1.5">Address <span className="text-red-400">*</span></label>
            <input type="text" placeholder="e.g. Kathmandu, Nepal" value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all" />
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="block text-base font-semibold text-gray-200 mb-1.5">Description</label>
            <textarea rows={2} placeholder="Brief description..." value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all resize-none" />
          </div>

          {/* New Fields: Price and Time Availability */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-1.5">Booking Price (Rs.)</label>
              <input type="number" step="0.01" min="0" value={form.base_price}
                onChange={e => setForm(f => ({ ...f, base_price: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white focus:border-blue-400 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2"><label className="block text-sm font-semibold text-gray-200 mb-1.5">Availability Hours</label></div>
              <input type="time" value={form.opening_time}
                onChange={e => setForm(f => ({ ...f, opening_time: e.target.value }))}
                className="px-2 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-xs focus:border-blue-400" />
              <input type="time" value={form.closing_time}
                onChange={e => setForm(f => ({ ...f, closing_time: e.target.value }))}
                className="px-2 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-xs focus:border-blue-400" />
            </div>
          </div>

          {/* Submit */}
          <button onClick={onSubmit} disabled={loading}
            className={`w-full mt-6 py-4 rounded-xl font-bold text-white text-base transition-all duration-300
              ${loading ? 'bg-white/10 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 hover:-translate-y-0.5 shadow-lg shadow-blue-900/40'}`}>
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Provider'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Provider Card ────────────────────────────────────────────────────────────
const ProviderCard = ({ provider, onEdit, onDelete }) => {
  const cfg = CAT[provider.category] || CAT['Restaurants'];
  const imgSrc = provider.image
    ? (provider.image.startsWith('/uploads') ? `${BACKEND_URL}${provider.image}` : provider.image)
    : null;

  return (
    <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 shadow-lg">
      {/* Image or Gradient Header */}
      <div className={`h-32 relative overflow-hidden bg-gradient-to-br ${cfg.gradient}`}>
        {imgSrc && <img src={imgSrc} alt={provider.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute bottom-3 left-4 text-3xl">{cfg.icon}</span>
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
          {provider.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-white text-lg truncate">{provider.name}</h3>
        <p className="text-white/40 text-base mt-0.5 flex items-center gap-1 truncate">
          <span>📍</span> {provider.address || 'No address'}
        </p>
        {provider.description && (
          <p className="text-white/30 text-sm mt-2 line-clamp-2">{provider.description}</p>
        )}
        
        {/* Price & Time Badge */}
        <div className="mt-4 flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 border border-white/10">
           <div className="flex flex-col">
             <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Price</span>
             <span className="text-white font-black text-sm">Rs. {provider.base_price || '0.00'}</span>
           </div>
           <div className="flex flex-col items-end text-right">
             <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Hours</span>
             <span className="text-white/80 font-bold text-xs">
               {(provider.opening_time || '09:00:00').substring(0,5)} - {(provider.closing_time || '18:00:00').substring(0,5)}
             </span>
           </div>
        </div>
        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button onClick={() => onEdit(provider)}
            className="flex-1 py-2 rounded-xl bg-blue-500/15 text-blue-400 font-semibold text-base hover:bg-blue-500/25 transition-all border border-blue-500/20">
            ✏️ Edit
          </button>
          <button onClick={() => onDelete(provider)}
            className="flex-1 py-2 rounded-xl bg-red-500/15 text-red-400 font-semibold text-base hover:bg-red-500/25 transition-all border border-red-500/20">
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
    <div className="h-32 bg-white/10" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-white/5 rounded w-1/2" />
      <div className="flex gap-2 mt-4">
        <div className="flex-1 h-8 bg-white/5 rounded-xl" />
        <div className="flex-1 h-8 bg-white/5 rounded-xl" />
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const ManageProviders = () => {
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
    document.title = "Admin | Manage Providers - UniBook";
    fetchProviders(); 
  }, [fetchProviders]);

  const displayed = providers.filter(p => {
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
      name: p.name || '', 
      address: p.address || '', 
      description: p.description || '', 
      category: p.category || 'Restaurants', 
      existingImage: p.image || '',
      base_price: p.base_price || 0,
      opening_time: (p.opening_time || '09:00:00').substring(0, 5),
      closing_time: (p.closing_time || '18:00:00').substring(0, 5),
    });
    setImageFile(null); setEditingId(p.id);
    setModalMode('edit'); setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.address.trim()) { toast('Name and Address are required', 'error'); return; }
    try {
      setSubmitting(true);
      const data = { 
        name: form.name, 
        category: form.category, 
        address: form.address, 
        description: form.description,
        base_price: form.base_price,
        opening_time: form.opening_time,
        closing_time: form.closing_time
      };
      if (modalMode === 'edit') {
        await updateProvider(editingId, data, imageFile);
        toast(`"${form.name}" updated!`);
      } else {
        await createProvider(data, imageFile);
        toast(`"${form.name}" added!`);
      }
      setModalOpen(false); setForm(EMPTY_FORM); setImageFile(null);
      fetchProviders();
    } catch (err) {
      toast(err.message, 'error');
    } finally { setSubmitting(false); }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await deleteProvider(toDelete.id);
      toast(`"${toDelete.name}" deleted`);
      setConfirmOpen(false); setToDelete(null);
      fetchProviders();
    } catch (err) {
      toast(err.message, 'error');
    } finally { setDeleting(false); }
  };

  return (
    <>
      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes popIn  { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      <Toast toasts={toasts} />
      <ConfirmDialog open={confirmOpen} providerName={toDelete?.name}
        onCancel={() => setConfirmOpen(false)} onConfirm={handleDeleteConfirm} loading={deleting} />
      <ProviderModal open={modalOpen} mode={modalMode} form={form} setForm={setForm}
        imageFile={imageFile} setImageFile={setImageFile}
        onClose={() => setModalOpen(false)} onSubmit={handleSubmit} loading={submitting} />

      {/* ── LAYOUT ── */}
      <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
        <Sidebar />

        <div className="flex-1 px-6 py-10 max-w-7xl mx-auto w-full">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <h1 className="text-5xl font-extrabold text-white tracking-tight">
                Service Providers
              </h1>
              <p className="text-white/40 mt-1 text-base">
                {providers.length} providers registered · {displayed.length} showing
              </p>
            </div>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-white text-sm
                bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90
                hover:shadow-xl hover:shadow-blue-900/50 hover:-translate-y-0.5 transition-all duration-300">
              ➕ Add Provider
            </button>
          </div>

          {/* Category Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {CATEGORIES.map(cat => {
              const cfg = CAT[cat];
              const count = providers.filter(p => p.category === cat).length;
              const active = filter === cat;
              return (
                <button key={cat} onClick={() => setFilter(active ? 'All' : cat)}
                  className={`p-4 rounded-2xl text-left transition-all duration-200 border
                    ${active
                      ? `bg-gradient-to-br ${cfg.gradient} border-transparent shadow-lg`
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}>
                  <div className="text-3xl mb-1">{cfg.icon}</div>
                  <div className={`text-3xl font-extrabold ${active ? 'text-white' : 'text-white/80'}`}>{count}</div>
                  <div className={`text-sm font-medium mt-0.5 ${active ? 'text-white/80' : 'text-white/40'}`}>{cat}</div>
                </button>
              );
            })}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">🔍</span>
              <input type="text" placeholder="Search by name or address…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all" />
            </div>
            <select value={filter} onChange={e => setFilter(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/70 focus:outline-none focus:border-blue-400 transition-all cursor-pointer">
              <option value="All" className="bg-slate-800">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
            </select>
            {(filter !== 'All' || search) && (
              <button onClick={() => { setFilter('All'); setSearch(''); }}
                className="px-4 py-3 rounded-xl border border-white/10 text-white/50 hover:bg-white/5 transition-all text-sm font-medium">
                ✕ Clear
              </button>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : displayed.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayed.map(p => (
                <ProviderCard key={p.id} provider={p}
                  onEdit={openEdit}
                  onDelete={(p) => { setToDelete(p); setConfirmOpen(true); }} />
              ))}
            </div>
          ) : (
            <div className="text-center py-28">
              <div className="text-7xl mb-4">🏢</div>
              <h3 className="text-xl font-bold text-white/50">No providers found</h3>
              <p className="text-white/25 mt-2 text-sm">
                {search ? `No results for "${search}"` : 'Click "Add Provider" to get started.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageProviders;
