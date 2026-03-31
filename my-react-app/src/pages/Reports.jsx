import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getFullReports, getExportData } from "../services/adminService";

const Reports = () => {
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

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      <Sidebar />

      <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full">
        {/* Header - Unified with Manage Users Style */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-extrabold text-white tracking-tight">
              Manage Reports
            </h1>
            <p className="text-white/40 mt-1 text-base">
              Generate and download comprehensive system documentation.
            </p>
          </div>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-56 bg-white/5 rounded-[2.5rem] border border-white/10" />)}
           </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <ReportCard 
                  title="Users Report" 
                  desc="Comprehensive registry of all registered accounts, including standard users, providers, and administrators with registration timelines." 
                  icon="👥"
                  onCSV={() => exportCSV('users')}
                  onPDF={() => exportPDF('users')}
                />
               <ReportCard 
                  title="Bookings Report" 
                  desc="Complete history of reservations, including real-time status updates, revenue tracking, and customer-provider associations." 
                  icon="📅"
                  onCSV={() => exportCSV('bookings')}
                  onPDF={() => exportPDF('bookings')}
                />
               <ReportCard 
                  title="Providers Report" 
                  desc="Detailed partner records across all service categories, featuring addresses, pricing structures, and operational hours." 
                  icon="🏢"
                  onCSV={() => exportCSV('providers')}
                  onPDF={() => exportPDF('providers')}
                />
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
               <p className="text-white/30 text-base font-medium italic">
                 Documentation is generated in high-fidelity CSV and PDF formats for professional use.
               </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Render Container for PDF Download (Opacity 0) */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
        <div id="report-to-print" style={{ padding: '40px', width: '1100px', fontFamily: 'Arial, sans-serif', color: '#000000' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000000', paddingBottom: '20px', marginBottom: '30px' }}>
             <div>
               <h1 style={{ fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', margin: 0, color: '#000000' }}>UniBook Official Report</h1>
               <p style={{ fontSize: '12px', color: '#333', fontWeight: '800', marginTop: '5px' }}>ADMINISTRATIVE DATA INSIGHTS</p>
             </div>
             <div style={{ textAlign: 'right' }}>
               <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#000000' }}>CATEGORY: {printType.toUpperCase()}</p>
               <p style={{ fontSize: '10px', color: '#000000' }}>{new Date().toLocaleString()}</p>
             </div>
           </div>

           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', color: '#000000' }}>
             <thead>
               <tr style={{ background: '#f0f0f0' }}>
                 {printData.length > 0 && Object.keys(printData[0]).map(h => (
                   <th key={h} style={{ border: '1px solid #000000', padding: '10px', textAlign: 'left', textTransform: 'uppercase', fontWeight: 'bold' }}>{h.replace(/_/g, ' ')}</th>
                 ))}
               </tr>
             </thead>
             <tbody>
               {printData.map((row, i) => (
                 <tr key={i}>
                   {Object.values(row).map((val, idx) => (
                     <td key={idx} style={{ border: '1px solid #000000', padding: '8px' }}>{String(val || '')}</td>
                   ))}
                 </tr>
               ))}
             </tbody>
           </table>
           <div style={{ marginTop: '50px', borderTop: '1px solid #000000', paddingTop: '10px', fontSize: '8px', color: '#000000', textAlign: 'center', fontWeight: 'bold' }}>
             UNIBOOK INTERNAL DOCUMENT - CONFIDENTIAL
           </div>
        </div>
      </div>
    </div>
  );
};

const ReportCard = ({ title, desc, icon, onCSV, onPDF }) => (
  <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/10 transition-all duration-500 shadow-xl overflow-hidden relative border-b-4 border-b-transparent hover:border-b-indigo-500">
    <div className="absolute -top-6 -right-6 text-9xl opacity-5 group-hover:opacity-10 transition-all pointer-events-none">{icon}</div>
    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-4xl mb-6 shadow-inner ring-1 ring-white/10">{icon}</div>
    <h3 className="text-2xl font-black text-white mb-2 leading-none tracking-tight">{title}</h3>
    <p className="text-white/30 text-base font-medium mb-8 leading-relaxed line-clamp-3">{desc}</p>
    <div className="flex gap-4">
       <button onClick={onCSV} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all">
         💾 CSV
       </button>
       <button onClick={onPDF} className="flex-1 py-4 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all">
         📄 PDF
       </button>
    </div>
  </div>
);

export default Reports;
