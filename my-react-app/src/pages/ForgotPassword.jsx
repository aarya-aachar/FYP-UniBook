/**
 * The Infrastructure Security Hub (Account Recovery)
 * 
 * relative path: /src/pages/ForgotPassword.jsx
 * 
 * This component orchestrates the secure, multi-stage "Forgot Password" 
 * workflow. It ensures that account access can be restored through verified 
 * out-of-band communication channels.
 * 
 * Technical Design:
 * - Multi-Phase State Machine: Manages a linear progression through four 
 *   critical states: Identity Identification (Email), Out-of-Band 
 *   Verification (OTP), Credential Resynchronization (Reset), and Success.
 * - OTP Input Orchestration: Implements a managed array of refs to handle 
 *   auto-focus and backspace deletion logic for a professional 6-digit 
 *   verification experience.
 * - Secure UI Guardrails: Includes real-time validation for password matching 
 *   and email formatting to prevent aborted server transactions.
 * - Glassmorphic Aesthetic: Uses high-contrast emerald tokens and 
 *   motion-blurred backdrops for a high-trust security feel.
 */

import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset' | 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email address.');
    setError('');
    try {
      setLoading(true);
      await api.post('/auth/reset-password/send', { email });
      setStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return setError('Please enter the 6-digit code.');
    setError('');
    try {
      setLoading(true);
      await api.post('/auth/reset-password/verify', { email, otp: code });
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    setError('');
    try {
      setLoading(true);
      await api.post('/auth/reset-password/confirm', { email, newPassword });
      setStep('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const cardBase = "bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10";
  const inputCls = "w-full pl-12 pr-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm";
  const labelCls = "text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 mb-2 block";

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg bg-emerald-600/10 blur-[150px] -z-0" />
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <h1 className="text-xl font-black text-white tracking-tighter">UniBook<span className="text-emerald-500">.</span></h1>
          </div>
        </div>

        <div className={cardBase}>
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white mb-2">Forgot Password?</h2>
                <p className="text-slate-400 text-sm font-medium mb-8">Enter your registered email to receive a reset code.</p>
                <label className={labelCls}>Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors"><Mail className="w-4 h-4" /></div>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" className={inputCls} />
                </div>
              </div>
              {error && <p className="text-red-400 text-xs font-bold text-center">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-emerald-600 font-bold text-sm text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                {loading ? 'Sending...' : 'Send Reset Code'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="text-center">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-2xl font-extrabold text-white mb-2">Verify it's you</h2>
                <p className="text-slate-400 text-sm font-medium">Reset code sent to <span className="text-emerald-400">{email}</span></p>
              </div>
              <div className="flex justify-center gap-3">
                {otp.map((digit, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el} type="text" maxLength={1} value={digit} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => e.key === 'Backspace' && !otp[i] && i > 0 && otpRefs.current[i-1].focus()} className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 text-white outline-none transition-all" />
                ))}
              </div>
              {error && <p className="text-red-400 text-xs font-bold text-center">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-emerald-600 font-bold text-sm text-white hover:bg-emerald-500 transition-all">
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button type="button" onClick={() => setStep('email')} className="w-full text-slate-500 text-[10px] uppercase font-black tracking-widest hover:text-white transition-colors">← Back to email</button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white mb-2">Create New Password</h2>
                <p className="text-slate-400 text-sm font-medium mb-8">Choose a strong, professional password for your account.</p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors"><Lock className="w-4 h-4" /></div>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Confirm New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors"><Lock className="w-4 h-4" /></div>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>
              {error && <p className="text-red-400 text-xs font-bold text-center">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-emerald-600 font-bold text-sm text-white hover:bg-emerald-500 transition-all">
                {loading ? 'Resetting...' : 'Update Password'}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Password Updated</h2>
              <p className="text-slate-400 text-sm font-medium">Your account security is restored. Transitioning to login...</p>
              <div className="mt-8 flex justify-center gap-1.5">
                {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
              </div>
            </div>
          )}

          {/* Helper Link */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <button 
              onClick={() => navigate('/login')}
              className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-emerald-400 transition-all cursor-pointer inline-flex items-center gap-2 outline-none border-none bg-transparent"
            >
              ← Return to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
