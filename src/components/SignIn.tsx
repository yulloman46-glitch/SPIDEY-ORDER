import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Loader2, Info } from "lucide-react";

interface SignInProps {
  initialEmail?: string;
  infoNotice?: string | null;
  onSuccess?: () => void;
  onNavigateSignUp?: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ initialEmail = "", infoNotice = null, onSuccess, onNavigateSignUp }) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(infoNotice);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  useEffect(() => {
    if (infoNotice) {
      setNotice(infoNotice);
    }
  }, [infoNotice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      // For Sign In: Use supabase.auth.signInWithPassword({ email, password })
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Failed to sign in. Please check your credentials.");
      } else if (data?.session || data?.user) {
        // Only redirect to Home page ("/") when a real session exists after login
        window.history.pushState({}, "", "/");
        window.dispatchEvent(new Event("popstate"));
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-[#111116] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glowing Top Bar Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-rose-600" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20 mb-3 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Sign In to Spidey ERP</h1>
          <p className="text-xs text-slate-400 mt-1">Access your jersey production dashboard & orders</p>
        </div>

        {/* Informational Banner (e.g. "Check your email and confirm your account before logging in.") */}
        {notice && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-950/60 border border-amber-700/70 text-amber-200 text-xs flex items-start gap-2.5 shadow-inner leading-relaxed font-semibold">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{notice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@spideyerp.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#181820] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#181820] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2 shadow-inner">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-tight font-medium">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-red-950/60 disabled:text-slate-500 text-white font-bold text-sm transition-all shadow-lg shadow-red-900/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
          <span>Don't have an operator account? </span>
          <button
            type="button"
            onClick={() => {
              if (onNavigateSignUp) {
                onNavigateSignUp();
              } else {
                window.history.pushState({}, "", "/signup");
                window.dispatchEvent(new Event("popstate"));
              }
            }}
            className="text-red-400 hover:text-red-300 font-bold underline underline-offset-2 transition-colors ml-1"
          >
            Sign Up
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secured with Supabase Authentication</span>
        </div>
      </div>
    </div>
  );
};
