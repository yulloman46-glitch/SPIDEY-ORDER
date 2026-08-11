import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebaseClient";
import { saveUserProfileToFirebase } from "../services/firebaseService";
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Loader2, Info, RefreshCw, CheckCircle2 } from "lucide-react";

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
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
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
    setResendStatus(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      // 1) Firebase Sign In
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2) Sync user profile to Firestore
      await saveUserProfileToFirebase(user);

      // Redirect to Home dashboard
      window.history.pushState({}, "", "/");
      window.dispatchEvent(new Event("popstate"));
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      let friendlyError = err?.message || "Failed to sign in. Please check your credentials.";
      if (err?.code === "auth/user-not-found" || err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential") {
        friendlyError = "Invalid email or password. Please verify your credentials.";
      } else if (err?.code === "auth/invalid-email") {
        friendlyError = "Please enter a valid email address.";
      } else if (err?.code === "auth/too-many-requests") {
        friendlyError = "Too many failed login attempts. Please try again later or reset your password.";
      }
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || !password) {
      setError("Please enter your email and password first.");
      return;
    }
    setResending(true);
    setResendStatus(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
        setResendStatus("Verification email resent successfully! Please check your inbox.");
      }
    } catch (err: any) {
      setResendStatus("Unable to resend email right now. " + (err?.message || ""));
    } finally {
      setResending(false);
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

        {/* Informational Banner */}
        {notice && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-950/60 border border-amber-700/70 text-amber-200 text-xs flex items-start justify-between gap-2 shadow-inner leading-relaxed font-semibold">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{notice}</span>
            </div>
          </div>
        )}

        {resendStatus && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resendStatus}</span>
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
            </div>
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

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resending}
            className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
            <span>Resend Email Verification</span>
          </button>
        </div>

        <div className="mt-5 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
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
          <span>Secured with Firebase Authentication</span>
        </div>
      </div>
    </div>
  );
};
