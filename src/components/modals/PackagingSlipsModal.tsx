import React from "react";
import { ERPOrder } from "../../types";
import { X, Printer, PackageCheck, MapPin, Phone, Shirt } from "lucide-react";

interface PackagingSlipsModalProps {
  orders: ERPOrder[];
  onClose: () => void;
}

export const PackagingSlipsModal: React.FC<PackagingSlipsModalProps> = ({ orders, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header toolbar */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between rounded-t-2xl shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Batch Packaging Slips ({orders.length} Orders)</h2>
              <p className="text-xs text-slate-400">Printed labels for warehouse packing, heat press & dispatch</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-md"
            >
              <Printer className="w-4 h-4" /> Print Packaging Slips
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Slips Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:p-0">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="border-2 border-slate-800 rounded-2xl p-5 bg-white flex flex-col justify-between shadow-sm relative print:break-inside-avoid"
            >
              {/* Slip Header */}
              <div>
                <div className="flex justify-between items-center border-b-2 border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-900 tracking-tight">SPIDEY PACKAGING</span>
                  </div>
                  <div className="font-mono font-black text-lg text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {ord.id}
                  </div>
                </div>

                {/* Recipient Box */}
                <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-1 mb-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-400" /> SHIP TO / RECIPIENT
                  </div>
                  <div className="font-black text-base tracking-wide text-white">{ord.customerName}</div>
                  <div className="text-xs text-slate-200 flex items-center gap-1 font-mono font-bold">
                    <Phone className="w-3 h-3 text-slate-400" /> {ord.phone}
                  </div>
                  <div className="text-xs text-slate-300 font-medium pt-1 border-t border-slate-700/80">
                    {ord.addressBox1}, <strong className="text-white underline">{ord.addressBox2}</strong>
                  </div>
                </div>

                {/* Items to Pack */}
                <div className="space-y-2 mb-4">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between border-b pb-1">
                    <span>Jersey Items to Pack</span>
                    <span>Size / Print</span>
                  </div>
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="font-extrabold text-slate-900 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Shirt className="w-3.5 h-3.5 text-red-600" />
                          {item.quantity}x {item.jerseyName}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold">
                          {item.size}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-700 font-mono">
                        <span>
                          Custom Text:{" "}
                          <strong className="text-red-600 bg-red-50 px-1 rounded">
                            {item.customName || "NO NAME"} #{item.customNumber || "0"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom COD & QC Check */}
              <div className="pt-3 border-t-2 border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">COD Amount:</span>
                  <span className="font-mono font-black text-emerald-700 text-base">৳{ord.codAmount.toLocaleString()} BDT</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Quality Control</span>
                  <span className="inline-block border border-slate-800 text-slate-700 font-bold px-2 py-1 rounded text-[10px]">
                    [ ] Packaged & Checked
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
