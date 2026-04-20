/**
 * The Provider Stewardship Hub (Admin Moderation)
 * 
 * relative path: /src/pages/ManageProviders.jsx
 * 
 * This component is the "Gatekeeper" of the UniBook platform. It provides 
 * administrators with the tools to manage the lifecycle of a service provider.
 * 
 * Technical Rationale:
 * - Dual-Tab Architecture: Separates the day-to-day management of active partners 
 *   from the high-friction moderation of new applications.
 * - Enrolment Logic: Includes document verification and automated email 
 *   orchestration (via the backend) for approval/rejection.
 * - Dynamic Branding: Maps provider categories to specific visual tokens 
 *   (gradients, icons) for a professional, glanceable UI.
 */

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useAdminTheme } from '../context/AdminThemeContext';
import { getProviders, updateProvider, toggleProviderStatus } from '../services/providerService';
import api from '../services/api';
import { 
  Building2, Search, Filter, CheckCircle, AlertCircle, MapPin, SearchX, Coffee, Trophy, Stethoscope, Scissors, Check, X, FileText, UserCheck, UserX
} from 'lucide-react';
import AdminTopHeader from '../components/AdminTopHeader';

const CATEGORIES = ['Restaurants', 'Futsal', 'Hospitals', 'Salon / Spa'];
const BACKEND_URL = 'http://localhost:4001';

/**
 * getCategoryIcon
 * Semantic mapping of business types to visual markers.
 */
const getCategoryIcon = (cat) => {
  switch (cat) {
    case 'Restaurants': return Coffee;
    case 'Futsal': return Trophy;
    case 'Hospitals': return Stethoscope;
    case 'Salon / Spa': return Scissors;
    default: return Building2;
  }
};

/**
 * Visual Token System (CAT)
 * Provides industry-specific color palettes. This ensures that the Admin 
 * sidebar and tables feel "Live" and tailored to each specific sector.
 */
const CAT = {
  'Restaurants': { gradient: 'bg-emerald-500',   bg: 'bg-emerald-500',   badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', badgeLight: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  'Futsal':      { gradient: 'bg-teal-500',      bg: 'bg-teal-500',      badge: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',     badgeLight: 'bg-teal-50 text-teal-600 border border-teal-100' },
  'Hospitals':   { gradient: 'bg-emerald-600',   bg: 'bg-emerald-600',  badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', badgeLight: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  'Salon / Spa': { gradient: 'bg-teal-600',      bg: 'bg-teal-600',   badge: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',   badgeLight: 'bg-teal-50 text-teal-600 border border-teal-100' },
};



const ManageProviders = () => {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';

  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'pending'

  const [providers, setProviders] = useState([]);
  const [pendingApps, setPendingApps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');



  const [actionLoading, setActionLoading] = useState(null); // tracking ID for async approval/rejection
  const [toasts, setToasts] = useState([]);

  // Simple internal notification portal
  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  /**
   * handleToggleStatus
   * Emergency control logic. Allows an admin to instantly shut down a 
   * service provider's visibility on the marketplace.
   */
  const handleToggleStatus = async (provider) => {
    try {
      await toggleProviderStatus(provider.id, !provider.is_active);
      toast(`Provider ${!provider.is_active ? 'Activated' : 'Deactivated'} successfully`);
      fetchAll();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  /**
   * fetchAll
   * Syncs both active providers and the application queue.
   */
  const fetchAll = useCallback(async () => {
    try { 
      setLoading(true); 
      const p = await getProviders(null, true);
      const appsResp = await api.get('/admin/provider-applications');
      setProviders(p);
      setPendingApps(appsResp.data);
    }
    catch { toast('Failed to load data', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { 
    document.title = "Service Providers | Admin UniBook";
    fetchAll(); 
  }, [fetchAll]);

  /**
   * UI Filtering: Multi-Axis (Search + Category)
   */
  const displayedActive = (providers || []).filter(p => {
    const mc = filter === 'All' || p.category === filter;
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.address || '').toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  // Filtering for pending applications (only pending status)
  const displayedPending = pendingApps.filter(a => a.status === 'pending');



  /**
   * handleApprove
   * Onboards the business. This triggers a backend sequence that creates 
   * credentials and sends the official onboarding email.
   */
  const handleApprove = async (id, name) => {
    if(actionLoading) return;
    try {
      setActionLoading(id);
      await api.post(`/admin/provider-applications/${id}/approve`);
      toast(`Application for "${name}" approved. Email sent.`);
      fetchAll();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to approve', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * handleReject
   * Denies access with a specified reason, fostering transparency with applicants.
   */
  const handleReject = async (id, name) => {
    if(actionLoading) return;
    const reason = prompt(`Enter rejection reason for "${name}" (sent via email):`);
    if(reason === null) return; // UX Safety: user cancelled the prompt
    
    try {
      setActionLoading(id);
      await api.post(`/admin/provider-applications/${id}/reject`, { reason });
      toast(`Application for "${name}" rejected.`);
      fetchAll();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to reject', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const textMuted = isDark ? "text-slate-500" : "text-slate-400";
  const cardBase = isDark ? "bg-slate-900 border border-slate-800 shadow-sm" : "bg-white border border-slate-200 shadow-sm";
  const borderCol = isDark ? "border-slate-800" : "border-slate-200";
  const bgRowHover = isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50";

  return (
    <div className="flex min-h-screen transition-colors duration-300 font-inter" style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
      <Sidebar />

      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Ephemeral Toast Portal */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 pl-4 pr-5 py-3 rounded-lg shadow-lg text-white text-sm font-bold pointer-events-auto ${t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`} style={{ animation: 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            {t.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full overflow-hidden">
        <AdminTopHeader title="Service Providers" subtitle={`Manage ${providers.length} enrolled services and pending registrations.`} />

        {/* Dynamic Tab Navigation (Orchestrates current work focus) */}
        <div className="flex gap-4 mb-6 border-b border-transparent">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-all ${activeTab === 'active' ? (isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 shadow-sm border border-b-0 border-slate-200') : (isDark ? 'text-slate-500 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}>
            Active Providers ({providers.length})
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-all flex items-center gap-2 ${activeTab === 'pending' ? (isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 shadow-sm border border-b-0 border-slate-200') : (isDark ? 'text-slate-500 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}>
            Pending Requests 
            {displayedPending.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{displayedPending.length}</span>}
          </button>
        </div>

        {activeTab === 'active' ? (
          <>
            {/* Filtering Engine for Active Providers */}
            <div className={`p-4 rounded-xl rounded-tl-none border-b-0 border ${cardBase} flex flex-col md:flex-row gap-4 mb-0`} style={{ animation: 'fadeIn 0.6s ease-out' }}>
              <div className="relative flex-1">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${textMuted}`} />
                <input type="text" placeholder="Search active providers..." value={search} onChange={e => setSearch(e.target.value)} className={`w-full pl-12 pr-6 py-3 border rounded-xl transition-all font-medium text-sm outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:bg-white'}`} />
              </div>
              <div className="relative md:w-64">
                <Filter className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${textMuted} pointer-events-none`} />
                <select value={filter} onChange={e => setFilter(e.target.value)} className={`appearance-none w-full pl-11 pr-10 py-3 border rounded-xl transition-all font-bold text-xs uppercase tracking-widest outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300 focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-emerald-600'}`}>
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

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
                    // Persistent perceived performance via skeletons
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className={`border-b ${borderCol}`}>
                        <td className="px-6 py-4"><div className={`h-12 w-64 rounded-xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} /></td>
                        <td className="px-6 py-4"><div className={`h-6 w-24 rounded-full animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} /></td>
                        <td className="px-6 py-4"><div className={`h-6 w-16 rounded-full animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} /></td>
                        <td className="px-6 py-4"><div className={`h-4 w-28 rounded-full animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} /></td>
                        <td className="px-6 py-4 text-right"><div className={`h-8 w-16 rounded-lg animate-pulse ml-auto ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} /></td>
                      </tr>
                    ))
                  ) : displayedActive.length > 0 ? (
                    displayedActive.map(p => {
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
                                <div className={`w-12 h-12 rounded-xl ${cfg.bg} flex items-center justify-center shadow-sm`}><CatIcon className="w-6 h-6 text-white" /></div>
                              )}
                              <div className="min-w-0">
                                <p className={`text-sm font-bold truncate flex items-center gap-2 ${textPrimary}`}>
                                  {p.name}
                                  {!p.is_active && <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[9px] uppercase tracking-widest border border-rose-500/20">Restricted</span>}
                                </p>
                                <p className={`text-xs truncate flex items-center gap-1 ${textSecondary}`}><MapPin className="w-3 h-3" /> {p.address}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${isDark ? cfg.badge : cfg.badgeLight}`}>
                               <CatIcon className="w-3 h-3" /> {p.category}
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-black ${textPrimary}`}>Rs. {p.base_price}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textSecondary}`}>{p.opening_time.substring(0,5)} - {p.closing_time.substring(0,5)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                               <button 
                                 onClick={() => handleToggleStatus(p)}
                                 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                   p.is_active 
                                     ? (isDark ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white') 
                                     : (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white')
                                 }`}
                               >
                                 {p.is_active ? 'Deactivate' : 'Activate'}
                               </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center">
                        <SearchX className={`w-12 h-12 mx-auto mb-4 opacity-30 ${textSecondary}`} />
                        <p className={`text-lg font-bold ${textPrimary}`}>No providers found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* Enrollment Application Queue (Moderation logic) */
          <div className={`overflow-x-auto rounded-xl rounded-tl-none border shadow-lg ${cardBase}`} style={{ animation: 'fadeIn 0.7s ease-out' }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${borderCol} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <th className={`px-6 py-4 text-xs font-black uppercase tracking-wider ${textSecondary}`}>Applicant Details</th>
                  <th className={`px-6 py-4 text-xs font-black uppercase tracking-wider ${textSecondary}`}>PAN Number</th>
                  <th className={`px-6 py-4 text-xs font-black uppercase tracking-wider ${textSecondary}`}>Document</th>
                  <th className={`px-6 py-4 text-xs font-black uppercase tracking-wider text-right ${textSecondary}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className={`border-b ${borderCol}`}>
                      <td colSpan={4} className="px-6 py-6"><div className={`h-8 w-full rounded-xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} /></td>
                    </tr>
                  ))
                ) : displayedPending.length > 0 ? (
                  displayedPending.map(a => {
                    const CatIcon = getCategoryIcon(a.service_type);
                    const isLoading = actionLoading === a.id;
                    return (
                      <tr key={a.id} className={`border-b last:border-b-0 transition-colors ${borderCol} ${bgRowHover}`}>
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center`}><CatIcon className="w-5 h-5" /></div>
                            <div>
                              <p className={`text-base font-bold ${textPrimary}`}>{a.name}</p>
                              <p className={`text-xs font-medium mb-1 ${textSecondary}`}>{a.email}</p>
                              <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>{a.service_type}</span>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-black ${textPrimary}`}>{a.pan_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {/* Document Review: Essential for legal verification */}
                          {a.document_path ? (
                            <a href={`${BACKEND_URL}${a.document_path}`} target="_blank" rel="noreferrer" className={`flex items-center gap-2 text-sm font-bold w-fit px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-800 text-blue-400 hover:text-blue-300' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                              <FileText className="w-4 h-4" /> View File
                            </a>
                          ) : (
                            <span className={`text-xs ${textMuted}`}>No document</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
                             <button onClick={() => handleApprove(a.id, a.name)} disabled={isLoading} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 cursor-pointer ${isDark ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'} ${isLoading ? 'opacity-50' : ''}`}>
                                <Check className="w-4 h-4" /> Approve
                             </button>
                             <button onClick={() => handleReject(a.id, a.name)} disabled={isLoading} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 cursor-pointer ${isDark ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'} ${isLoading ? 'opacity-50' : ''}`}>
                                <X className="w-4 h-4" /> Reject
                             </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <CheckCircle className={`w-12 h-12 mx-auto mb-4 opacity-30 ${textSecondary}`} />
                      <p className={`text-lg font-bold ${textPrimary}`}>No pending requests</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>


    </div>
  );
};

export default ManageProviders;
