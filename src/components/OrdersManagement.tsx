import React, { useState } from "react";
import { ERPOrder, SteadfastConsignmentResponse } from "../types";
import { Search, Printer, Truck, PackageCheck, Trash2, CheckSquare, Square, X, Shirt, Eye, AlertCircle, RotateCcw } from "lucide-react";
import { InvoicesModal } from "./modals/InvoicesModal";
import { PackagingSlipsModal } from "./modals/PackagingSlipsModal";
import { SteadfastModal } from "./modals/SteadfastModal";

interface OrdersManagementProps {
  orders: ERPOrder[];
  setOrders: React.Dispatch<React.SetStateAction<ERPOrder[]>>;
  onResetOrders?: () => void;
}

export const OrdersManagement: React.FC<OrdersManagementProps> = ({ orders, setOrders, onResetOrders }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Modal controls
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);
  const [showPackagingModal, setShowPackagingModal] = useState(false);
  const [showSteadfastModal, setShowSteadfastModal] = useState(false);
  const [steadfastResponse, setSteadfastResponse] = useState<SteadfastConsignmentResponse[]>([]);
  const [steadfastBatchId, setSteadfastBatchId] = useState<string>("SFC-BATCH-9021");
  const [steadfastAuth, setSteadfastAuth] = useState<{ apiKey: string; secretKey: string }>({
    apiKey: "tg4eyfbrobgvcvehcrlqw2quwl12ktvl",
    secretKey: "crjccez7uboye8w81jcyza7k",
  });
  const [isSyncingSteadfast, setIsSyncingSteadfast] = useState(false);

  // Single Order Detail Modal View
  const [viewingOrder, setViewingOrder] = useState<ERPOrder | null>(null);

  // Search filtering
  const filteredOrders = orders.filter((ord) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      ord.id.toLowerCase().includes(query) ||
      ord.customerName.toLowerCase().includes(query) ||
      ord.phone.includes(query) ||
      ord.addressBox1.toLowerCase().includes(query) ||
      ord.addressBox2.toLowerCase().includes(query)
    );
  });

  // Select / Unselect handlers
  const handleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter((item) => item !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  const handleClearSelection = () => {
    setSelectedOrderIds([]);
  };

  const handleRemoveSelected = () => {
    if (selectedOrderIds.length === 0) return;
    const count = selectedOrderIds.length;
    if (window.confirm(`Are you sure you want to permanently delete ${count} selected order(s)?`)) {
      setOrders((prev) => prev.filter((o) => !selectedOrderIds.includes(o.id)));
      setSelectedOrderIds([]);
    }
  };

  const handleClearAllOrders = () => {
    if (orders.length === 0) return;
    if (window.confirm(`Are you sure you want to permanently clear ALL ${orders.length} daily orders? This will empty the orders panel.`)) {
      setOrders([]);
      setSelectedOrderIds([]);
      setViewingOrder(null);
    }
  };

  const handleRemoveSingle = (orderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete order ${orderId}?`)) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId));
      if (viewingOrder?.id === orderId) {
        setViewingOrder(null);
      }
    }
  };

  // Push selected to Steadfast API
  const handleSteadfastPush = async () => {
    const selectedOrders = orders.filter((o) => selectedOrderIds.includes(o.id));
    if (selectedOrders.length === 0) return;

    setIsSyncingSteadfast(true);
    try {
      const apiKey = "tg4eyfbrobgvcvehcrlqw2quwl12ktvl";
      const secretKey = "crjccez7uboye8w81jcyza7k";

      const res = await fetch("/api/steadfast-consign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": apiKey,
          "Secret-Key": secretKey,
        },
        body: JSON.stringify({ orders: selectedOrders }),
      });
      const data = await res.json();
      if (data.success && data.consignments) {
        setSteadfastResponse(data.consignments);
        if (data.batchId) setSteadfastBatchId(data.batchId);
        if (data.auth) {
          setSteadfastAuth({
            apiKey: data.auth.apiKey || apiKey,
            secretKey: data.auth.secretKey || secretKey,
          });
        }
        // Update local orders with tracking codes and status
        setOrders((prev) =>
          prev.map((o) => {
            const matched = data.consignments.find((c: any) => c.orderId === o.id);
            if (matched) {
              return {
                ...o,
                steadfastTracking: matched.trackingCode,
                steadfastStatus: matched.status || "Registered",
                status: "Shipped", // Move status to Shipped upon Steadfast registration
              };
            }
            return o;
          })
        );
        setShowSteadfastModal(true);
      }
    } catch (err) {
      console.error("Steadfast push error", err);
      alert("Failed to connect to Steadfast API");
    } finally {
      setIsSyncingSteadfast(false);
    }
  };

  const selectedOrdersList = orders.filter((o) => selectedOrderIds.includes(o.id));

  return (
    <div className="space-y-6 pb-12">
      {/* Search Header & Bulk Action Tools */}
      <div className="bg-[#16161E] p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Top Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order # (e.g. SJ-8042), Name, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all placeholder:text-slate-500 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400">
            <span>Showing {filteredOrders.length} of {orders.length} Orders</span>
            {orders.length > 0 && (
              <button
                onClick={handleClearAllOrders}
                className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                title="Clear all daily orders to reset the panel"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                Clear All Daily Orders
              </button>
            )}
          </div>
        </div>

        {/* Bulk Action Controls Bar */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 text-xs font-bold text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700"
            >
              {selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length ? (
                <CheckSquare className="w-4 h-4 text-red-500" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>Select All ({filteredOrders.length})</span>
            </button>

            {selectedOrderIds.length > 0 && (
              <span className="text-xs font-bold text-red-400 bg-red-950/60 px-2.5 py-1 rounded-full border border-red-800/40">
                {selectedOrderIds.length} Selected
              </span>
            )}
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Clear button */}
            <button
              onClick={handleClearSelection}
              disabled={selectedOrderIds.length === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>

            {/* Invoices (x) */}
            <button
              onClick={() => setShowInvoicesModal(true)}
              disabled={selectedOrderIds.length === 0}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-red-400" />
              Invoices ({selectedOrderIds.length})
            </button>

            {/* Steadfast (x) */}
            <button
              onClick={handleSteadfastPush}
              disabled={selectedOrderIds.length === 0 || isSyncingSteadfast}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" />
              {isSyncingSteadfast ? "Pushing..." : `Steadfast (${selectedOrderIds.length})`}
            </button>

            {/* Packaging (x) */}
            <button
              onClick={() => setShowPackagingModal(true)}
              disabled={selectedOrderIds.length === 0}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              Packaging ({selectedOrderIds.length})
            </button>

            {/* Remove (x) */}
            <button
              onClick={handleRemoveSelected}
              disabled={selectedOrderIds.length === 0}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 disabled:opacity-40 text-xs font-bold transition-colors flex items-center gap-1 border border-rose-800/40"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove ({selectedOrderIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#16161E] rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-300 text-xs uppercase font-bold tracking-wider border-b border-slate-800">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-700 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                </th>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Customer (Name & Phone)</th>
                <th className="p-3.5">Items & Custom Printing</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Total (৳)</th>
                <th className="p-3.5 text-right">Due / COD</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold text-slate-400">No orders matching search criteria.</p>
                    {orders.length === 0 && onResetOrders && (
                      <button
                        onClick={onResetOrders}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                        Restore Sample Orders
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isSelected = selectedOrderIds.includes(ord.id);
                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isSelected ? "bg-red-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(ord.id)}
                          className="rounded border-slate-700 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                      </td>

                      {/* Order ID */}
                      <td className="p-3.5 font-mono font-extrabold text-red-400 text-sm">
                        {ord.id}
                        {ord.aiConfidence && (
                          <span className="block text-[10px] text-purple-400 font-semibold font-sans">
                            AI {ord.aiConfidence}% match
                          </span>
                        )}
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm">{ord.customerName}</div>
                        <div className="font-mono text-slate-400 font-medium">{ord.phone}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {ord.addressBox1}, <span className="font-semibold text-slate-400">{ord.addressBox2}</span>
                        </div>
                      </td>

                      {/* Items & Custom Printing */}
                      <td className="p-3.5 space-y-1.5">
                        {ord.items.map((item, iIdx) => (
                          <div key={iIdx} className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.jerseyName}
                                className="w-8 h-8 object-cover rounded border border-slate-700 shrink-0 bg-slate-950"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center text-red-500">
                                <Shirt className="w-4 h-4" />
                              </div>
                            )}
                            <div className="truncate max-w-xs text-xs space-y-0.5">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="font-bold text-slate-200 truncate">{item.jerseyName}</span>
                                {item.productCode && (
                                  <span className="px-1 py-0.2 rounded bg-purple-950 text-purple-300 font-mono text-[9px] border border-purple-800/80 font-bold shrink-0">
                                    [{item.productCode}]
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-white bg-slate-800 px-1 rounded text-[10px]">
                                  {item.size}
                                </span>
                                {(item.customName || item.customNumber) && (
                                  <span className="text-[11px] font-extrabold text-red-400">
                                    {item.customName || "NO NAME"} #{item.customNumber || "0"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                          {ord.status}
                        </span>
                        {ord.steadfastTracking && (
                          <span className="block text-[10px] text-emerald-400 font-mono font-bold mt-1">
                            {ord.steadfastTracking}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-3.5 text-slate-400 font-medium whitespace-nowrap">{ord.date}</td>

                      {/* Total Amount */}
                      <td className="p-3.5 text-right font-mono font-black text-white text-sm">
                        ৳{ord.totalAmount.toLocaleString()}
                      </td>

                      {/* Due / COD */}
                      <td className="p-3.5 text-right font-mono">
                        <div className="font-bold text-emerald-400">COD: ৳{ord.codAmount.toLocaleString()}</div>
                        {ord.dueAmount > 0 ? (
                          <div className="text-[11px] font-bold text-amber-400">Due: ৳{ord.dueAmount.toLocaleString()}</div>
                        ) : (
                          <div className="text-[10px] text-slate-500 font-sans">Paid / Clear</div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingOrder(ord)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleRemoveSingle(ord.id, e)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/70 text-rose-300 hover:text-rose-100 transition-colors border border-rose-800/50"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Viewing Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 relative">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Order Details</span>
                <h3 className="text-xl font-black text-slate-900 font-mono">{viewingOrder.id}</h3>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
                <div>
                  <span className="text-slate-400 font-bold block">CUSTOMER NAME</span>
                  <span className="text-slate-900 font-extrabold text-sm">{viewingOrder.customerName}</span>
                  <span className="text-slate-600 font-mono block mt-0.5">{viewingOrder.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">SPLIT ADDRESS</span>
                  <span className="text-slate-800 font-medium block">{viewingOrder.addressBox1}</span>
                  <span className="text-slate-900 font-bold block underline">{viewingOrder.addressBox2}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider block mb-2">Order Items</span>
                <div className="space-y-2">
                  {viewingOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3 bg-slate-100/80 rounded-xl border flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{it.jerseyName}</div>
                        <div className="text-red-600 font-mono font-bold mt-0.5">
                          Print: {it.customName || "NONE"} #{it.customNumber || "0"}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold font-mono">
                          {it.size}
                        </span>
                        <div className="font-mono font-bold text-slate-800 mt-1">
                          {it.quantity} x ৳{it.unitPrice}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {viewingOrder.note && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <strong>Delivery Note:</strong> {viewingOrder.note}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t font-mono text-sm">
                <div>
                  <span className="text-slate-500 text-xs font-sans block">Total Amount</span>
                  <span className="font-black text-slate-900">৳{viewingOrder.totalAmount}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-600 text-xs font-sans block font-bold">COD Collection</span>
                  <span className="font-black text-emerald-700">৳{viewingOrder.codAmount}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleRemoveSingle(viewingOrder.id)}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Order
              </button>
              <button
                onClick={() => setViewingOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modals */}
      {showInvoicesModal && (
        <InvoicesModal orders={selectedOrdersList} onClose={() => setShowInvoicesModal(false)} />
      )}

      {showPackagingModal && (
        <PackagingSlipsModal orders={selectedOrdersList} onClose={() => setShowPackagingModal(false)} />
      )}

      {showSteadfastModal && (
        <SteadfastModal
          consignments={steadfastResponse}
          batchId={steadfastBatchId}
          apiKey={steadfastAuth.apiKey}
          secretKey={steadfastAuth.secretKey}
          onClose={() => setShowSteadfastModal(false)}
        />
      )}
    </div>
  );
};
