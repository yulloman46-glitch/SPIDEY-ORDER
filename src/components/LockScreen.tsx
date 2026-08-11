import React, { useState } from "react";
import { Lock, Key, ShieldCheck, ArrowRight, Eye, EyeOff, AlertCircle, Sparkles } from "lucide-react";

interface LockScreenProps {
  onUnlock: () => void;
}

const DEFAULT_PASSWORD = (import.meta as any).env?.VITE_APP_PASSWORD || "spidey123";
const UNLOCK_STORAGE_KEY = "spidey_erp_unlocked";

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DEFAULT_PASSWORD) {
      localStorage.setItem(UNLOCK_STORAGE_KEY, "true");
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleQuickUnlockDefault = () => {
    setPassword(DEFAULT_PASSWORD);
    localStorage.setItem(UNLOCK_STORAGE_KEY, "true");
    setError(false);
    onUnlock();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div
        className={`w-full max-w-md bg-[#111116] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300 ${
          shake ? "animate-bounce border-red-600/80 shadow-red-950/50" : "hover:border-slate-700"
        }`}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-xl shadow-red-950/60 border border-red-500/30 mb-4 relative">
            <Lock className="w-8 h-8 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#111116] flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            SPIDEY <span className="text-red-500">ERP</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Single-User Restricted Production Access
          </p>
        </div>

        {/* Lock Form */}
        <form onSubmit={handleUnlock} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-red-500" />
              <span>Enter Access Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter password..."
                autoFocus
                className={`w-full bg-[#181820] border ${
                  error ? "border-red-500 focus:ring-red-500" : "border-slate-800 focus:border-red-500 focus:ring-red-500/20"
                } rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all font-mono pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Incorrect access password. Default is <code className="font-mono bg-rose-900/60 px-1 py-0.5 rounded text-white">spidey123</code></span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Unlock Control Center</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Quick Default Unlock Box */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col items-center text-center">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Default Master Password: <strong className="text-slate-200 font-mono">spidey123</strong></span>
          </div>

          <button
            type="button"
            onClick={handleQuickUnlockDefault}
            className="text-xs text-red-400 hover:text-red-300 underline underline-offset-4 font-semibold transition-colors cursor-pointer"
          >
            Click here to unlock automatically with default password
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local ERP Gatekeeper Activated</span>
        </div>
      </div>
    </div>
  );
};
