import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { UserPlus, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

interface SignUpProps {
  onSuccess?: () => void;
  onNavigateSignIn?: (email?: string, message?: string) => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSuccess, onNavigateSignIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // 1) For Sign Up: Use supabase.auth.signUp({ email, password })
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Failed to sign up. Please try again.");
      } else {
        if (data?.session) {
          // If a real session exists immediately (e.g. email confirmation disabled in Supabase)
          setSuccessMsg("Account created successfully!");
          setTimeout(() => {
            window.history.pushState({}, "", "/");
            window.dispatchEvent(new Event("popstate"));
            if (onSuccess) {
              onSuccess();
            }
          }, 600);
        } else {
          // If data.session is null:
          // Do NOT auto-login, do NOT redirect to dashboard.
          // Show message: "Check your email and confirm your account before logging in."
          // Redirect the user to the Sign In page with the pre-filled email.
          const confirmMsg = "Check your email and confirm your account before logging in.";
          setSuccessMsg(confirmMsg);
          
          setTimeout(() => {
            if (onNavigateSignIn) {
              onNavigateSignIn(email, confirmMsg);
            } else {
              window.history.pushState({}, "", "/signin");
              window.dispatchEvent(new Event("popstate"));
            }
          }, 1000);
        }
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-[#111116] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glowing Top Bar Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-indigo-600" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20 mb-3 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Create Operator Account</h1>
          <p className="text-xs text-slate-400 mt-1">Register for Spidey ERP production & inventory management</p>
        </div>

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
                placeholder="At least 6 characters"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#181820] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#181820] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
              />
            </div>
          </div>

          {/* 4) Add simple error handling: If Supabase returns an error, show a small error message under the form */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2 shadow-inner">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-tight font-medium">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2 shadow-inner">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-tight font-semibold">{successMsg}</span>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
          <span>Already have an account? </span>
          <button
            type="button"
            onClick={() => {
              if (onNavigateSignIn) {
                onNavigateSignIn();
              } else {
                window.history.pushState({}, "", "/signin");
                window.dispatchEvent(new Event("popstate"));
              }
            }}
            className="text-red-400 hover:text-red-300 font-bold underline underline-offset-2 transition-colors ml-1"
          >
            Sign In
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
