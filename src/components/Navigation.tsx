import React from "react";
import { LayoutDashboard, ShoppingBag, PlusCircle, Sparkles, Shirt, Printer, ShieldCheck, LogIn, UserPlus, LogOut, User } from "lucide-react";

export type NavTab = "dashboard" | "orders" | "new-order" | "ai-chat" | "products" | "dtf-nesting" | "signin" | "signup";

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  orderCount: number;
  lowStockCount: number;
  userEmail?: string | null;
  onSignOut?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  orderCount,
  lowStockCount,
  userEmail,
  onSignOut,
}) => {
  return (
    <header className="bg-[#111116] border-b border-slate-800 text-slate-200 sticky top-0 z-40 shadow-xl">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] border border-red-500/50">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white">
                  SPIDEY <span className="text-red-500">ERP</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/40 uppercase tracking-widest">
                  v2.4 Bento
                </span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Jersey Production & Fulfillment</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#16161E] p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "dashboard"
                  ? "bg-slate-800/90 text-white border border-slate-700/60 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-red-400" />
              <span>Control Center</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                activeTab === "orders"
                  ? "bg-slate-800/90 text-white border border-slate-700/60 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              <span>Orders</span>
              {orderCount > 0 && (
                <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.2 rounded border border-red-500/30">
                  {orderCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("new-order")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "new-order"
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Place Order</span>
            </button>

            <button
              onClick={() => setActiveTab("ai-chat")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "ai-chat"
                  ? "bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md border border-purple-500/30"
                  : "text-purple-300 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>AI Chat Parser</span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                activeTab === "products"
                  ? "bg-slate-800/90 text-white border border-slate-700/60 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <Shirt className="w-4 h-4 text-amber-400" />
              <span>Catalog</span>
              {lowStockCount > 0 && (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                  {lowStockCount} Alert
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("dtf-nesting")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "dtf-nesting"
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-md"
                  : "text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/20"
              }`}
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>DTF Engine 39"</span>
            </button>
          </nav>

          {/* Right Status & Auth Buttons */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs bg-[#16161E] px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
              <span className="text-slate-400 font-medium">Steadfast API:</span>
              <span className="text-green-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Online
              </span>
            </div>

            {userEmail ? (
              <div className="flex items-center gap-2 bg-[#16161E] px-3 py-1.5 rounded-xl border border-slate-800">
                <User className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="text-xs font-bold text-slate-200 truncate max-w-[140px]">
                  {userEmail}
                </span>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors ml-1"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    setActiveTab("signin");
                    window.history.pushState({}, "", "/signin");
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "signin"
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-[#16161E] text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("signup");
                    window.history.pushState({}, "", "/signup");
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "signup"
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-800/50"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Nav Tabs Scrollable */}
        <div className="lg:hidden flex items-center space-x-2 overflow-x-auto py-2 border-t border-slate-800 text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === "dashboard" ? "bg-red-600 text-white font-bold" : "text-slate-300 bg-slate-900"
            }`}
          >
            Control Center
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === "orders" ? "bg-red-600 text-white font-bold" : "text-slate-300 bg-slate-900"
            }`}
          >
            Orders ({orderCount})
          </button>
          <button
            onClick={() => setActiveTab("new-order")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === "new-order" ? "bg-red-600 text-white font-bold" : "text-slate-300 bg-slate-900"
            }`}
          >
            + Place Order
          </button>
          <button
            onClick={() => setActiveTab("ai-chat")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === "ai-chat" ? "bg-purple-600 text-white font-bold" : "text-slate-300 bg-slate-900"
            }`}
          >
            AI Chat Parser
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === "products" ? "bg-red-600 text-white font-bold" : "text-slate-300 bg-slate-900"
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => setActiveTab("dtf-nesting")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === "dtf-nesting" ? "bg-emerald-600 text-white font-bold" : "text-emerald-300 bg-slate-900"
            }`}
          >
            DTF Engine 39"
          </button>

          {!userEmail && (
            <>
              <button
                onClick={() => {
                  setActiveTab("signin");
                  window.history.pushState({}, "", "/signin");
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                  activeTab === "signin" ? "bg-red-600 text-white font-bold" : "text-slate-300 bg-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setActiveTab("signup");
                  window.history.pushState({}, "", "/signup");
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                  activeTab === "signup" ? "bg-red-600 text-white font-bold" : "text-slate-300 bg-slate-900"
                }`}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

