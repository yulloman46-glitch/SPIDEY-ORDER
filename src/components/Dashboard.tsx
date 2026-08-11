import React from "react";
import { ERPOrder, Product } from "../types";
import { ShoppingCart, TrendingUp, AlertTriangle, ArrowRight, Package, Trophy, CheckCircle, Clock, Printer } from "lucide-react";

interface DashboardProps {
  orders: ERPOrder[];
  products: Product[];
  onNavigateOrders: () => void;
  onNavigateNewOrder: () => void;
  onNavigateDTF: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  orders,
  products,
  onNavigateOrders,
  onNavigateNewOrder,
  onNavigateDTF,
}) => {
  // Calculations for top metrics
  const todayStr = "2026-08-10";
  const todayOrders = orders.filter((o) => o.date === todayStr);
  const todayOrdersCount = todayOrders.length;
  const totalOrdersCount = orders.length + 1235; // Simulated historical total

  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const lifetimeRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0) + 1475000;

  const totalInventoryUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);

  const avgOrderValue = Math.round(
    orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 2450
  );

  // Top Selling Teams Breakdown
  const teamSalesMap: Record<string, number> = {
    "Real Madrid": 342,
    "Argentina": 289,
    "FC Barcelona": 245,
    "Manchester United": 182,
    "AC Milan": 136,
    "Brazil": 120,
    "PSG": 98,
  };

  orders.forEach((ord) => {
    ord.items.forEach((item) => {
      if (item.jerseyName.includes("Real Madrid")) teamSalesMap["Real Madrid"] += item.quantity;
      if (item.jerseyName.includes("Argentina")) teamSalesMap["Argentina"] += item.quantity;
      if (item.jerseyName.includes("Barcelona")) teamSalesMap["FC Barcelona"] += item.quantity;
      if (item.jerseyName.includes("Manchester")) teamSalesMap["Manchester United"] += item.quantity;
      if (item.jerseyName.includes("AC Milan")) teamSalesMap["AC Milan"] += item.quantity;
      if (item.jerseyName.includes("Brazil")) teamSalesMap["Brazil"] += item.quantity;
    });
  });

  const topTeams = Object.entries(teamSalesMap)
    .map(([team, count]) => ({ team, count }))
    .sort((a, b) => b.count - a.count);

  const maxCount = topTeams[0]?.count || 1;

  return (
    <div className="space-y-6 pb-12">
      {/* Control Center Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#16161E] p-6 rounded-2xl border border-slate-800 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span> Control Center Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Production & Orders Control Center</h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time jersey production, order tracking & 39" DTF print sheet dispatch.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onNavigateNewOrder}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-lg shadow-red-900/30 flex items-center gap-2"
          >
            + Place New Order
          </button>
          <button
            onClick={onNavigateDTF}
            className="px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 font-bold text-xs transition-all border border-emerald-500/40 shadow-lg flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-emerald-400" /> DTF Engine 39"
          </button>
        </div>
      </div>

      {/* Top Metric Cards - Bento Grid Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today's Orders */}
        <div className="bg-[#16161E] border border-slate-800 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 blur-[40px]"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Today's Orders</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <div className="text-2xl font-black text-white tracking-tight">
              {todayOrdersCount}{" "}
              <span className="text-xs font-normal text-green-400 ml-1">+12%</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-slate-500">Total All-Time:</span>
              <span className="font-bold text-slate-200">{totalOrdersCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Today's Revenue */}
        <div className="bg-[#16161E] border border-slate-800 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Today's Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              ৳{todayRevenue.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Lifetime: <span className="font-bold text-slate-200">৳{lifetimeRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Total Inventory */}
        <div className="bg-[#16161E] border border-slate-800 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Inventory</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {totalInventoryUnits.toLocaleString()}
              {lowStockProducts.length > 0 && (
                <span className="text-[10px] bg-red-900/40 text-red-300 border border-red-800/40 px-2 py-0.5 rounded font-bold uppercase">
                  {lowStockProducts.length} Low Stock
                </span>
              )}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Live WooCommerce synced catalog
            </div>
          </div>
        </div>

        {/* Metric 4: Avg Order Value */}
        <div className="bg-[#16161E] border border-slate-800 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Avg Order Value</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs">
              ৳
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              ৳{avgOrderValue.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Average per printed customer jersey
            </div>
          </div>
        </div>
      </div>

      {/* Central Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Bento: Recent Orders (8 Cols) */}
        <div className="lg:col-span-8 bg-[#16161E] border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                Recent Orders Management
              </h2>
            </div>
            <button
              onClick={onNavigateOrders}
              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              View Orders <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-2 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-500 uppercase tracking-tighter bg-slate-900/40">
                <tr>
                  <th className="px-4 py-2.5">Order ID</th>
                  <th className="px-4 py-2.5">Customer Details</th>
                  <th className="px-4 py-2.5">Print Config Items</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-medium">
                      No active orders today. Add new orders or parse chat messages in AI Parser.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/30 cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-red-400 text-xs">
                        {ord.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{ord.customerName}</div>
                        <div className="text-[10px] text-slate-500">{ord.phone} • {ord.addressBox2}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1">
                          {ord.items.map((it, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-800 font-mono"
                            >
                              {it.jerseyName.split(" ")[0]}-{it.size} ({it.customName || "PLAIN"} #{it.customNumber || "0"})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-bold uppercase">
                          Confirmed
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-white font-mono">
                        ৳{ord.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Bento: Top Selling Teams Graph (4 Cols) */}
        <div className="lg:col-span-4 bg-[#16161E] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-800 mb-4 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Top Selling Teams
              </h2>
              <span className="text-[10px] text-slate-500 font-mono uppercase">By Volume</span>
            </div>

            <div className="space-y-3.5">
              {topTeams.map(({ team, count }, idx) => {
                const percent = Math.round((count / maxCount) * 100);
                return (
                  <div key={team} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="w-4 text-slate-500 font-mono text-[10px]">#{idx + 1}</span>
                        {team}
                      </span>
                      <span className="font-black text-white font-mono text-[11px]">
                        {count} <span className="font-normal text-slate-500">pcs</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          idx === 0
                            ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                            : idx === 1
                            ? "bg-blue-500"
                            : idx === 2
                            ? "bg-amber-400"
                            : "bg-slate-600"
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
