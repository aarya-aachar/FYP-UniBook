/**
 * The Digital Archives Hub (Admin Reports)
 * 
 * relative path: /src/pages/Reports.jsx
 * 
 * This component handles the high-fidelity data extraction requirements of 
 * UniBook's administrative layer. It transforms backend indices into 
 * professional, management-ready electronic documents.
 * 
 * Key Pillars:
 * - Dynamic Dependency Management: Loads archival libraries only when needed.
 * - Format Versatility: Supports CSV (for data analysis) and PDF (for auditing).
 * - High-Fidelity Printing: Uses a dedicated off-screen blueprint for PDF generation 
 *   to ensure consistent branding and layout.
 */

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAdminTheme } from "../context/AdminThemeContext";
import { getFullReports, getExportData } from "../services/adminService";
import { Users, CalendarDays, Building2, DownloadCloud, Printer, FileText } from "lucide-react";
import AdminTopHeader from "../components/AdminTopHeader";

const Reports = () => {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [libReady, setLibReady] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [printData, setPrintData] = useState([]);
  const [printType, setPrintType] = useState("");

  useEffect(() => {
    document.title = "Data Exports | Admin UniBook";
    
    /**
     * Dynamic Script Loader
     * Lazily loads the html2pdf library to optimize initial bundle size.
     * The system stays lean until the user explicitly requests a PDF export.
     */
    const scriptId = "html2pdf-cdn-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.async = true;
      script.onload = () => setLibReady(true);
      document.body.appendChild(script);
    } else if (window.html2pdf) {
      setLibReady(true);
    }

    // Initial analytics warm-up
    const init = async () => {
      try {
        await getFullReports();
      } catch (err) {
        console.warn("Analytics fetch failed.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  /**
   * exportCSV (Data Science Path)
   * Converts deep relational data into flat comma-separated values.
   * Includes smart date-string normalization to ensure cross-platform consistency.
   */
  const exportCSV = async (type) => {
    try {
      const data = await getExportData(type);
      if (!data || data.length === 0) return alert("System data index is empty.");

      const headers = Object.keys(data[0]);
      let csv = headers.map(h => `"${h.replace(/_/g, ' ')}"`).join(",") + "\n";

      data.forEach(row => {
        csv += headers.map(h => {
          let val = row[h];
          // Smart Date Mapping: Normalizes ISO strings into readable local timestamps
          if ((h.toLowerCase().includes('date') || h.toLowerCase().includes('at')) && val && !isNaN(Date.parse(val))) {
            const d = new Date(val);
            val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
          }
          return `"${val || ''}"`;
        }).join(",") + "\n";
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unibook_export_${type}_${Date.now()}.csv`;
      a.click();
    } catch (error) {
      alert("Operation failed: " + (error.message || "Database index unavailable"));
    }
  };

  /**
   * exportPDF (Auditing Path)
   * Captures a high-density, off-screen visual blueprint and renders it 
   * as a portable document. Optimized for landscape orientation.
   */
  const exportPDF = async (type) => {
    if (!libReady || !window.html2pdf) {
      return alert("PDF Core is initializing. Please wait.");
    }

    try {
      const data = await getExportData(type);
      if (!data || data.length === 0) return alert("No information available to print.");
      
      setPrintData(data);
      setPrintType(type);
      setPrinting(true);

      // Rendering Delay: Ensures the React DOM has painted the template before capture
      setTimeout(() => {
        const element = document.getElementById('report-to-print');
        const opt = {
          margin:       0.5,
          filename:     `unibook_export_${type}_${Date.now()}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
        };

        window.html2pdf().set(opt).from(element).save().then(() => {
          setPrinting(false);
        });
      }, 300);
    } catch (error) {
      alert("Print failed: " + (error.message || "Connectivity error"));
    }
  };

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const cardBase = isDark ? 'bg-slate-900 border border-slate-800 shadow-sm' : 'bg-white border border-slate-200 shadow-sm';

  return (
    <div className="flex min-h-screen transition-colors duration-300 font-inter" 
         style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
      <Sidebar />

      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full overflow-hidden">
        <AdminTopHeader 
          title="Data Exports" 
          subtitle="Manage system archives and digital records." 
        />


        {loading ? (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className={`h-80 rounded-xl animate-pulse border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-100 border-slate-200'}`} />)}
             </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <ReportCard 
                  isDark={isDark}
                  title="Member Register" 
                  desc="Full directory of system accounts, assigned roles, and current access status." 
                  Icon={Users}
                  onCSV={() => exportCSV('users')}
                  onPDF={() => exportPDF('users')}
                />
               <ReportCard 
                  isDark={isDark}
                  title="Booking History" 
                  desc="Detailed log of all reservations, transactional indices, and slot confirmations." 
                  Icon={CalendarDays}
                  onCSV={() => exportCSV('bookings')}
                  onPDF={() => exportPDF('bookings')}
                />
               <ReportCard 
                  isDark={isDark}
                  title="Partner Registry" 
                  desc="A complete list of service provides, location mapping, and service rates." 
                  Icon={Building2}
                  onCSV={() => exportCSV('providers')}
                  onPDF={() => exportPDF('providers')}
                />
            </div>

            {/* Archival Status Banner */}
            <div className={`backdrop-blur-xl border rounded-[3rem] p-10 text-center transition-all duration-500
              ${cardBase}`}>
               <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600 shadow-sm'}`}>
                 <DownloadCloud className="w-8 h-8"/>
               </div>
               <p className={`text-xl font-black tracking-tight mb-2 ${textPrimary}`}>Archival Services Active</p>
               <p className={`text-sm font-medium leading-relaxed max-w-lg mx-auto ${textSecondary}`}>
                 Export system records smoothly as CSV or PDF documents for auditing purposes. Comprehensive data mapping ensured.
               </p>
            </div>
          </div>
        )}
      </div>

      {printType && (
        /* PDF Capture Blueprint: This hidden component ensures high-fidelity archival branding */
        <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
          <div id="report-to-print" style={{ padding: '30px', width: '960px', fontFamily: 'Inter, system-ui, sans-serif', color: '#0f172a', boxSizing: 'border-box' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #e2e8f0', paddingBottom: '30px', marginBottom: '40px' }}>
               <div>
                  <div style={{ display: 'flex', itemsCenter: 'center', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ width: '32px', hieght: '32px', background: '#10b981', borderRadius: '8px' }}></div>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>UniBook<span style={{ color: '#10b981' }}>.</span></h1>
                  </div>
                 <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Official Management Archive Protocol</p>
               </div>
               <div style={{ textAlign: 'right' }}>
                 <p style={{ fontSize: '11px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Archive Category: <span style={{ color: '#10b981' }}>{printType.toUpperCase()}</span></p>
                 <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Generated: {new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</p>
               </div>
             </div>

             <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                 <thead>
                   <tr style={{ background: '#f1f5f9' }}>
                     {printData.length > 0 && Object.keys(printData[0]).map(h => (
                       <th key={h} style={{ borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', padding: '10px 8px', textAlign: 'left', textTransform: 'uppercase', fontWeight: '800', color: '#475569', letterSpacing: '0.02em', whiteSpace: 'normal', wordBreak: 'break-word' }}>{h.replace(/_/g, ' ')}</th>
                     ))}
                   </tr>
                 </thead>
                 <tbody>
                   {printData.map((row, i) => (
                     <tr key={i} style={{ background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                       {Object.keys(row).map((key, idx) => {
                         let val = row[key];
                         // Internal Data Mapping: Format dates before physical render
                         if ((key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) && val && !isNaN(Date.parse(val))) {
                           const d = new Date(val);
                           val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                         }
                         return (
                           <td key={idx} style={{ borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', padding: '8px', color: '#1e293b', fontWeight: '600', fontSize: '9px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{String(val || '')}</td>
                         );
                       })}
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>

             <div style={{ marginTop: '60px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', fontSize: '9px', color: '#94a3b8', textAlign: 'center', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
               UniBook Digital Systems &bull; Secured Record &bull; Verification Required
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ReportCard = ({ title, desc, Icon, onCSV, onPDF, isDark }) => {
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/50" : "text-slate-500";
  const cardBase = isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/10';

  return (
    <div className={`group relative rounded-[2.5rem] p-8 transition-all duration-300 overflow-hidden border-b-[6px] ${cardBase}
      ${isDark ? 'hover:border-b-emerald-500' : 'hover:border-b-emerald-600'}`}>
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-10 shadow-sm transition-all duration-300
        ${isDark ? 'bg-slate-800 text-emerald-400 group-hover:bg-emerald-500' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className={`text-2xl font-black mb-3 leading-tight tracking-tight ${textPrimary}`}>{title}</h3>
      <p className={`text-sm font-medium mb-12 flex-1 transition-colors leading-relaxed ${textSecondary}`}>{desc}</p>
      <div className="flex gap-4">
         <button onClick={onCSV} className={`flex flex-1 items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border cursor-pointer
           ${isDark ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
           <DownloadCloud className="w-4 h-4"/>
           CSV
         </button>
         <button onClick={onPDF} className="flex flex-1 items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer">
           <Printer className="w-4 h-4"/>
           PDF
         </button>
      </div>
    </div>
  );
};

export default Reports;
