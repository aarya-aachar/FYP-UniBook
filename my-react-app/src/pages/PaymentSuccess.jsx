/**
 * The Celebration Interface (Payment Success)
 * 
 * relative path: /src/pages/PaymentSuccess.jsx
 * 
 * This component serves as the high-fidelity confirmation screen for 
 * clients after a successful financial transaction. It marks the final 
 * "Closing Note" of the booking funnel.
 * 
 * Technical Design:
 * - Motion-Orchestrated UI: Employs custom CSS keyframes (@keyframes celebrate, 
 *   @keyframes drawCheck) to create a premium, affirmative user experience.
 * - Non-Blocking Navigation: Provides immediate egress points to the 
 *   appointment ledger, ensuring the user can verify their new reservation 
 *   without friction.
 * - Adaptive Visuals: Utilizes the UserThemeContext to maintain visual 
 *   continuity, whether in high-contrast light mode or immersive dark mode.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import { useUserTheme } from '../context/UserThemeContext';
import { CheckCircle, ArrowRight } from 'lucide-react';

const PaymentSuccess = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Payment Successful | UniBook";
  }, []);

  return (
    <div className={`flex flex-col min-h-screen transition-all duration-500 font-inter user-panel-bg ${isDark ? 'dark' : 'light'}`}>
      
      <UserNavbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        <style>{`
          @keyframes celebrate {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes drawCheck {
            0% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 0; }
          }
          .celebrate-animation { animation: celebrate 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .check-path { stroke-dasharray: 100; stroke-dashoffset: 100; animation: drawCheck 0.8s ease-out 0.4s forwards; }
        `}</style>

        <div className="max-w-[500px] w-full celebrate-animation z-10 text-center">
          
          <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl relative transition-all
            ${isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-emerald-500/10'}`}>

            <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
               <path className="check-path" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className={`glass-card p-10 rounded-[2rem] border transition-all duration-500 relative overflow-hidden
            ${isDark ? 'bg-slate-950/95 !border-slate-800' : 'bg-white/95 !border-white'}`}>
            
            <h1 className={`text-4xl font-black tracking-tight mb-4 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Payment Successful!
            </h1>
            
            <p className={`text-lg font-medium mb-10 leading-relaxed transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Your booking has been confirmed. We're getting your appointment details ready.
            </p>

            <div className={`flex flex-col items-center gap-6 pt-8 border-t transition-colors ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <button 
                onClick={() => navigate('/my-appointments')}
                className={`flex items-center gap-2 group text-sm font-black uppercase tracking-[0.2em] transition-all
                  ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}>
                click here to view your bookings <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
