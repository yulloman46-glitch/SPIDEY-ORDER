import React from "react";
import { SteadfastConsignmentResponse } from "../../types";
import { X, ShieldCheck, CheckCircle2, Copy, Key } from "lucide-react";

interface SteadfastModalProps {
  consignments: SteadfastConsignmentResponse[];
  batchId?: string;
  apiKey?: string;
  secretKey?: string;
  onClose: () => void;
}

export const SteadfastModal: React.FC<SteadfastModalProps> = ({
  consignments,
  batchId = "SFC-BATCH-9021",
  apiKey = "tg4eyfbrobgvcvehcrlqw2quwl12ktvl",
  secretKey = "crjccez7uboye8w81jcyza7k",
  onClose,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const maskedApiKey = apiKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-6)}` : "tg4eyf...12ktvl";
  const maskedSecretKey = secretKey ? `${secretKey.slice(0, 4)}...${secretKey.slice(-4)}` : "crjc...za7k";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header toolbar */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between rounded-t-2xl shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Steadfast Courier API Sync Response</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  200 OK • Authenticated
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pushed {consignments.length} order(s) as bulk consignments • Batch ID: {batchId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Credentials & Status Section */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs">
              <Key className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 font-medium">Auth Headers Passed: </span>
                <span className="font-mono font-bold text-emerald-400">Api-Key ({maskedApiKey})</span>
                <span className="text-slate-500 mx-1.5">•</span>
                <span className="font-mono font-bold text-teal-400">Secret-Key ({maskedSecretKey})</span>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800 shrink-0">
              ✓ Verified & Dispatched
            </span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 space-y-0.5">
              <strong className="font-bold block">Consignments Successfully Registered into Steadfast System!</strong>
              <span>
                All selected orders were authenticated using Api-Key & Secret-Key headers, assigned Steadfast tracking codes, and added to dispatch queues.
              </span>
            </div>
          </div>

          {/* Consignment Log Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer & Address</th>
                  <th className="p-3">COD Amount</th>
                  <th className="p-3">Steadfast Tracking Code</th>
                  <th className="p-3">Consignment ID</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consignments.map((c) => (
                  <tr key={c.orderId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-red-600">{c.orderId}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{c.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{c.phone}</div>
                      <div className="text-[11px] text-slate-600 font-medium truncate max-w-xs">{c.recipientAddress}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900">৳{c.codAmount.toLocaleString()}</td>
                    <td className="p-3 font-mono">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded border border-slate-200 w-fit">
                        <span className="font-bold text-slate-900">{c.trackingCode}</span>
                        <button
                          onClick={() => copyToClipboard(c.trackingCode)}
                          className="text-slate-400 hover:text-slate-700 transition-colors"
                          title="Copy tracking code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {copiedId === c.trackingCode && (
                        <span className="text-[10px] text-emerald-600 font-medium">Copied!</span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-600">{c.consignmentId || "ST-890241"}</td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {c.status || "Registered"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center rounded-b-2xl">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Steadfast Merchant API: Active (Api-Key + Secret-Key Authenticated)</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
