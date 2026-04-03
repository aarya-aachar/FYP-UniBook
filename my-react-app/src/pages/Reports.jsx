import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAdminTheme } from "../context/AdminThemeContext";
import { getFullReports, getExportData } from "../services/adminService";
import { Users, CalendarDays, Building2, DownloadCloud, Printer, FileText } from "lucide-react";

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6" style={{ animation: 'fadeIn 0.4s ease-out' }}>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight mb-1 transition-colors ${textPrimary}`}>Data Exports</h1>
            <p className={`text-sm font-medium transition-colors ${textSecondary}`}>Manage system archives and digital records.</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all shadow-sm font-bold text-xs uppercase tracking-wider
            ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
            <FileText className="w-4 h-4" />
            PDF Engine Ready
          </div>
        </div>

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

            <div className={`backdrop-blur-xl border rounded-[3rem] p-10 text-center transition-all duration-500
              ${cardBase}`}>
               <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                 <DownloadCloud className="w-8 h-8"/>
               </div>
               <p className={`text-xl font-bold tracking-tight mb-2 ${textPrimary}`}>Archival Services Active</p>
               <p className={`text-sm font-medium ${textSecondary}`}>
                 Export system records smoothly as CSV or PDF documents for auditing purposes. You can open CSV with Excel.
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

const ReportCard = ({ title, desc, Icon, onCSV, onPDF, isDark }) => {
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/50" : "text-slate-500";
  const cardBase = isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-200 shadow-xl shadow-slate-200/20';

  return (
    <div className={`group relative rounded-3xl p-8 transition-all duration-300 overflow-hidden border-b-[6px] ${cardBase}
      ${isDark ? 'hover:border-b-blue-500' : 'hover:border-b-blue-600'}`}>
      
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-all duration-300
        ${isDark ? 'bg-slate-800 text-blue-400 group-hover:bg-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 group-hover:bg-blue-100'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className={`text-xl font-black mb-2 leading-tight tracking-tight ${textPrimary}`}>{title}</h3>
      <p className={`text-sm font-medium mb-8 flex-1 transition-colors ${textSecondary}`}>{desc}</p>
      <div className="flex gap-3">
         <button onClick={onCSV} className={`flex flex-1 items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 border cursor-pointer
           ${isDark ? 'bg-slate-800 border-slate-700 text-white/80 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
           <DownloadCloud className="w-4 h-4"/>
           CSV
         </button>
         <button onClick={onPDF} className="flex flex-1 items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all cursor-pointer">
           <Printer className="w-4 h-4"/>
           PDF
         </button>
      </div>
    </div>
  );
};

export default Reports;
