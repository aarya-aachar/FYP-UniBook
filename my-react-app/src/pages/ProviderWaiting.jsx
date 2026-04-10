import { useNavigate } from 'react-router-dom';
import { Clock, Mail, CheckCircle, ArrowRight } from 'lucide-react';

const ProviderWaiting = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40 font-inter flex flex-col">
      <header className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="UniBook" className="w-8 h-8 object-contain" />
          <h1 className="text-xl font-extrabold tracking-tighter text-slate-950">UniBook<span className="text-emerald-600">.</span></h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg text-center">

          <style>{`
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .float { animation: float 3s ease-in-out infinite; }
            .fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
          `}</style>

          {/* Icon */}
          <div className="w-28 h-28 rounded-[2.5rem] bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-100 float">
            <Clock className="w-14 h-14 text-amber-500" />
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/60 p-10 fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-6">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Under Review
            </div>

            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight mb-4">
              Application Submitted!
            </h1>

            <p className="text-slate-500 text-base font-medium leading-relaxed mb-8">
              Your Service Provider account is currently <strong className="text-slate-700">under review</strong> by our admin team. 
              We'll verify your documents and notify you via email once a decision has been made.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: CheckCircle, text: 'Application successfully submitted', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { icon: Clock,        text: 'Admin review in progress (24–48 hrs)', color: 'text-amber-600', bg: 'bg-amber-50' },
                { icon: Mail,         text: 'Email notification will be sent upon decision', color: 'text-blue-600', bg: 'bg-blue-50' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border ${item.bg} border-slate-100`}>
                    <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <span className="text-sm text-slate-700 font-semibold text-left">{item.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 rounded-xl bg-slate-950 text-white font-bold text-sm hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-950/10 cursor-pointer">
                Go to Login <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all cursor-pointer">
                Back to Home
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium mt-6">
            Questions? Contact us at <span className="text-emerald-600 font-bold">support@unibook.io</span>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ProviderWaiting;
