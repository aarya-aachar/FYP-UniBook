import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAdminTheme } from "../context/AdminThemeContext";
import { getFullReports, getExportData } from "../services/adminService";

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
    
    // 1. Dynamic Script Loader for html2pdf
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

    // 2. Fetch Initial Analytics check
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

  const exportCSV = async (type) => {
    try {
      const data = await getExportData(type);
      if (!data || data.length === 0) return alert("System data index is empty.");

      let csv = "";
      const headers = Object.keys(data[0]);
      csv += headers.join(",") + "\n";
      
      data.forEach(row => {
        csv += headers.map(h => `"${row[h] || ''}"`).join(",") + "\n";
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
  const textSecondary = isDark ? "text-white/50" : "text-slate-600";
  const cardBase = isDark ? 'bg-white/5 border border-white/10 shadow-2xl' : 'bg-white border border-slate-100 shadow-2xl shadow-slate-200/20';

  return (
    <div className="flex min-h-screen transition-colors duration-500 font-inter" 
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <Sidebar />

      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="flex-1 px-10 py-12 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div>
            <h1 className={`text-4xl font-black tracking-tight mb-2 transition-colors ${textPrimary}`}>Data Exports</h1>
            <p className={`text-lg font-medium transition-colors ${textSecondary}`}>Manage system archives and digital records</p>
          </div>
          <div className={`px-10 py-5 rounded-[2.5rem] border transition-all shadow-2xl font-black text-xs uppercase tracking-widest
            ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-white border-slate-100 text-slate-400 shadow-slate-200/10'}`}>
            Protocol: 0.10.x PDF Engine
          </div>
        </div>

        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[1,2,3].map(i => <div key={i} className={`h-80 rounded-[4rem] animate-pulse border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`} />)}
             </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <ReportCard 
                  isDark={isDark}
                  title="Member Register" 
                  desc="Full directory of system accounts, assigned roles, and current access status." 
                  icon="👥"
                  onCSV={() => exportCSV('users')}
                  onPDF={() => exportPDF('users')}
                />
               <ReportCard 
                  isDark={isDark}
                  title="Booking History" 
                  desc="Detailed log of all reservations, transactional indices, and slot confirmations." 
                  icon="📅"
                  onCSV={() => exportCSV('bookings')}
                  onPDF={() => exportPDF('bookings')}
                />
               <ReportCard 
                  isDark={isDark}
                  title="Partner Registry" 
                  desc="A complete list of service provides, location mapping, and service rates." 
                  icon="🏢"
                  onCSV={() => exportCSV('providers')}
                  onPDF={() => exportPDF('providers')}
                />
            </div>

            <div className={`backdrop-blur-xl border rounded-[4rem] p-12 text-center transition-all duration-500
              ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/10'}`}>
               <p className={`text-xl font-bold tracking-tight mb-2 ${textPrimary}`}>Archival Services Active</p>
               <p className={`text-lg font-bold italic tracking-tight ${isDark ? 'text-white/20' : 'text-slate-400'}`}>
                 Export system records for auditing and digital archival purposes.
               </p>
            </div>
          </div>
        )}
      </div>

      {printType && (
        <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
          <div id="report-to-print" style={{ padding: '80px', width: '1300px', fontFamily: 'Inter, sans-serif', color: '#000000' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '4px solid #000000', paddingBottom: '40px', marginBottom: '50px' }}>
               <div>
                 <h1 style={{ fontSize: '40px', fontWeight: '900', textTransform: 'uppercase', margin: 0, color: '#000000', letterSpacing: '-0.05em' }}>UniBook System Record</h1>
                 <p style={{ fontSize: '14px', color: '#333', fontWeight: '900', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Official Archive Protocol</p>
               </div>
               <div style={{ textAlign: 'right' }}>
                 <p style={{ fontSize: '13px', fontWeight: '900', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ARCHIVE: {printType.toUpperCase()}</p>
                 <p style={{ fontSize: '13px', color: '#000000', fontWeight: '700' }}>EXPORTED: {new Date().toLocaleString()}</p>
               </div>
             </div>
             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', color: '#000000' }}>
               <thead>
                 <tr style={{ background: '#f1f5f9' }}>
                   {printData.length > 0 && Object.keys(printData[0]).map(h => (
                     <th key={h} style={{ border: '2px solid #e2e8f0', padding: '18px', textAlign: 'left', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }}>{h.replace(/_/g, ' ')}</th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {printData.map((row, i) => (
                   <tr key={i}>
                     {Object.values(row).map((val, idx) => (
                       <td key={idx} style={{ border: '2px solid #e2e8f0', padding: '15px', fontWeight: '700' }}>{String(val || '')}</td>
                     ))}
                   </tr>
                 ))}
               </tbody>
             </table>
             <div style={{ marginTop: '100px', borderTop: '4px solid #000000', paddingTop: '30px', fontSize: '11px', color: '#000000', textAlign: 'center', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5em' }}>
               UNIBOOK DIGITAL ARCHIVE - CONFIDENTIAL RECORD
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ReportCard = ({ title, desc, icon, onCSV, onPDF, isDark }) => {
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/50" : "text-slate-500";
  const cardBase = isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-100 shadow-2xl shadow-slate-200/20';

  return (
    <div className={`group relative rounded-[4rem] p-12 transition-all duration-500 overflow-hidden border-b-[12px] ${cardBase}
      ${isDark ? 'hover:border-b-blue-500' : 'hover:border-b-blue-600'}`}>
      <div className="absolute -top-10 -right-10 text-[16rem] opacity-5 group-hover:opacity-10 transition-all duration-700 pointer-events-none transform rotate-12">{icon}</div>
      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl mb-8 shadow-2xl transition-all duration-500
        ${isDark ? 'bg-white/5 shadow-black/40 ring-1 ring-white/10 group-hover:bg-blue-600/20' : 'bg-slate-50 shadow-slate-200/20 ring-1 ring-slate-100 group-hover:bg-blue-50'}`}>{icon}</div>
      <h3 className={`text-2xl font-black mb-3 leading-tight tracking-tight ${textPrimary}`}>{title}</h3>
      <p className={`text-sm font-bold mb-10 leading-relaxed transition-colors ${textSecondary}`}>{desc}</p>
      <div className="flex gap-4">
         <button onClick={onCSV} className={`flex-1 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all active:scale-95 border
           ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}>
           💾 Export CSV
         </button>
         <button onClick={onPDF} className="flex-1 py-6 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-indigo-800 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all">
           📄 Print PDF
         </button>
      </div>
    </div>
  );
};

export default Reports;
