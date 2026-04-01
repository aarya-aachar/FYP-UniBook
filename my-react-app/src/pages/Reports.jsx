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
    document.title = "Admin | Reports - UniBook";
    
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
      if (!data || data.length === 0) return alert("No data available to export.");

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
      a.download = `unibook_${type}_report_${Date.now()}.csv`;
      a.click();
    } catch (error) {
      alert("Export failed: " + (error.message || "Database connection error"));
    }
  };

  const exportPDF = async (type) => {
    if (!libReady || !window.html2pdf) {
      return alert("PDF Engine is still initializing. Please wait a moment.");
    }

    try {
      const data = await getExportData(type);
      if (!data || data.length === 0) return alert("No data available to generate PDF.");
      
      setPrintData(data);
      setPrintType(type);
      setPrinting(true);

      setTimeout(() => {
        const element = document.getElementById('report-to-print');
        const opt = {
          margin:       0.5,
          filename:     `unibook_${type}_report_${Date.now()}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
        };

        window.html2pdf().set(opt).from(element).save().then(() => {
          setPrinting(false);
        });
      }, 300);
    } catch (error) {
      alert("PDF preparation failed: " + (error.message || "Connectivity error"));
    }
  };

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/50" : "text-slate-600";
  const cardBase = isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/50';

  return (
    <div className="flex min-h-screen transition-colors duration-500 font-inter" 
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <Sidebar />

      <div className="flex-1 px-10 py-12 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div>
            <h1 className={`text-5xl font-black tracking-tighter mb-4 transition-colors font-outfit ${textPrimary}`}>System Reports</h1>
            <p className={`text-lg font-semibold tracking-tight transition-colors ${textSecondary}`}>Download reports for users, bookings, and providers</p>
          </div>
          <div className={`px-6 py-4 rounded-[2rem] border transition-all shadow-xl font-black text-xs uppercase tracking-widest
            ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-white border-slate-100 text-slate-400'}`}>
            Available: CSV + PDF
          </div>
        </div>

        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
                {[1,2,3].map(i => <div key={i} className={`h-64 rounded-[3rem] border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`} />)}
             </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <ReportCard 
                  isDark={isDark}
                  title="User Directory" 
                  desc="A complete list of registered users, their roles, and account status." 
                  icon="👥"
                  onCSV={() => exportCSV('users')}
                  onPDF={() => exportPDF('users')}
                />
               <ReportCard 
                  isDark={isDark}
                  title="Booking Data" 
                  desc="History of all service reservations, including customer and provider info." 
                  icon="📅"
                  onCSV={() => exportCSV('bookings')}
                  onPDF={() => exportPDF('bookings')}
                />
               <ReportCard 
                  isDark={isDark}
                  title="Provider List" 
                  desc="Partner registry featuring all service locations and pricing details." 
                  icon="🏢"
                  onCSV={() => exportCSV('providers')}
                  onPDF={() => exportPDF('providers')}
                />
            </div>

            <div className={`backdrop-blur-xl border rounded-[3rem] p-10 text-center transition-all duration-500
              ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/50'}`}>
               <p className={`text-lg font-semibold italic tracking-tight ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                 Reports are available in CSV and PDF formats for quick system auditing.
               </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Render Container for PDF Download (Opacity 0) */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
        <div id="report-to-print" style={{ padding: '60px', width: '1300px', fontFamily: 'Inter, sans-serif', color: '#000000' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #000000', paddingBottom: '30px', marginBottom: '40px' }}>
             <div>
               <h1 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', margin: 0, color: '#000000', letterSpacing: '-0.05em' }}>UniBook System Report</h1>
               <p style={{ fontSize: '14px', color: '#333', fontWeight: '700', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Administrative Data Protocol</p>
             </div>
             <div style={{ textAlign: 'right' }}>
               <p style={{ fontSize: '12px', fontWeight: '900', color: '#000000', textTransform: 'uppercase' }}>CATEGORY: {printType.toUpperCase()}</p>
               <p style={{ fontSize: '12px', color: '#000000', fontWeight: '600' }}>{new Date().toLocaleString()}</p>
             </div>
           </div>

           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', color: '#000000' }}>
             <thead>
               <tr style={{ background: '#f8fafc' }}>
                 {printData.length > 0 && Object.keys(printData[0]).map(h => (
                   <th key={h} style={{ border: '1px solid #e2e8f0', padding: '15px', textAlign: 'left', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.05em' }}>{h.replace(/_/g, ' ')}</th>
                 ))}
               </tr>
             </thead>
             <tbody>
               {printData.map((row, i) => (
                 <tr key={i}>
                   {Object.values(row).map((val, idx) => (
                     <td key={idx} style={{ border: '1px solid #e2e8f0', padding: '12px', fontWeight: '500' }}>{String(val || '')}</td>
                   ))}
                 </tr>
               ))}
             </tbody>
           </table>
           <div style={{ marginTop: '80px', borderTop: '2px solid #000000', paddingTop: '20px', fontSize: '10px', color: '#000000', textAlign: 'center', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
             UNIBOOK INTERNAL DOCUMENT - CONFIDENTIAL SYSTEM NODE
           </div>
        </div>
      </div>
    </div>
  );
};

const ReportCard = ({ title, desc, icon, onCSV, onPDF, isDark }) => {
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/50" : "text-slate-600";
  
  return (
    <div className={`group backdrop-blur-xl border rounded-[3rem] p-10 transition-all duration-500 overflow-hidden relative border-b-8
      ${isDark 
        ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-b-blue-500 shadow-2xl' 
        : 'bg-white border-slate-100 hover:border-b-blue-600 shadow-xl shadow-slate-200/50'}`}>
      
      <div className={`absolute -top-10 -right-10 text-[14rem] opacity-5 group-hover:opacity-10 transition-all duration-700 pointer-events-none transform rotate-12`}>{icon}</div>
      <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl mb-10 shadow-inner transition-all duration-500
        ${isDark ? 'bg-white/5 ring-1 ring-white/10 group-hover:bg-blue-500/10' : 'bg-slate-50 ring-1 ring-slate-100 group-hover:bg-blue-50'}`}>{icon}</div>
      
      <h3 className={`text-4xl font-black mb-4 leading-none tracking-tighter transition-colors font-outfit ${textPrimary}`}>{title}</h3>
      <p className={`text-base font-semibold mb-12 leading-relaxed line-clamp-3 transition-colors ${textSecondary}`}>{desc}</p>
      
      <div className="flex gap-4">
         <button onClick={onCSV} className={`flex-1 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-95 border
           ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:shadow-lg'}`}>
           💾 CSV
         </button>
         <button onClick={onPDF} className="flex-1 py-5 rounded-[1.5rem] bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/30 hover:opacity-90 active:scale-95 transition-all">
           📄 PDF
         </button>
      </div>
    </div>
  );
};

export default Reports;
