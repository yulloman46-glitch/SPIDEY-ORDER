import React from "react";
import { ERPOrder } from "../../types";
import { X, Printer, Shirt, Phone, MapPin, CreditCard } from "lucide-react";

interface InvoicesModalProps {
  orders: ERPOrder[];
  onClose: () => void;
}

export const InvoicesModal: React.FC<InvoicesModalProps> = ({ orders, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header toolbar */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between rounded-t-2xl shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Mass Print Invoices ({orders.length} Orders)</h2>
              <p className="text-xs text-slate-400">Ready for thermal or A4 customer invoice printing</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-md"
            >
              <Printer className="w-4 h-4" /> Print All Invoices
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Body */}
        <div className="p-6 overflow-y-auto space-y-12 print:p-0 print:space-y-8">
          {orders.map((ord, idx) => (
            <div
              key={ord.id}
              className="border-2 border-slate-300 rounded-2xl p-6 sm:p-8 bg-white relative print:break-after-page print:border-slate-800"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-red-600 text-white flex items-center justify-center font-black">
                      S
                    </div>
                    <span className="font-black text-2xl tracking-tighter text-slate-900">SPIDEY JERSEY ERP</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Premium Custom Soccer Jerseys & Custom Name/Number Printing
                  </p>
                  <p className="text-xs text-slate-500">Dhaka, Bangladesh | Phone: 01700-000000</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-red-600 font-mono">{ord.id}</div>
                  <div className="text-xs text-slate-500 font-medium">Date: {ord.date}</div>
                  <div className="mt-2 inline-block px-3 py-1 rounded bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                    INVOICE
                  </div>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-2 gap-6 my-6 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    Customer Information
                  </h4>
                  <div className="font-extrabold text-slate-900 text-base">{ord.customerName}</div>
                  <div className="text-slate-700 font-semibold font-mono flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" /> {ord.phone}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> Delivery Address
                  </h4>
                  <div className="text-slate-800 font-medium">{ord.addressBox1}</div>
                  <div className="text-slate-900 font-bold">{ord.addressBox2}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden my-6">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Jersey Product Description</th>
                      <th className="p-3">Size</th>
                      <th className="p-3">Custom Printing (Name & #)</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price (৳)</th>
                      <th className="p-3 text-right">Subtotal (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {ord.items.map((item, itemIdx) => (
                      <tr key={item.id} className="text-slate-800">
                        <td className="p-3 font-mono text-slate-400">{itemIdx + 1}</td>
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <Shirt className="w-4 h-4 text-red-600 shrink-0" />
                          {item.jerseyName}
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800">{item.size}</span>
                        </td>
                        <td className="p-3">
                          {item.customName || item.customNumber ? (
                            <span className="font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              {item.customName || "NO NAME"} #{item.customNumber || "0"}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Blank Jersey</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-bold">{item.quantity}</td>
                        <td className="p-3 text-right font-mono">৳{item.unitPrice.toLocaleString()}</td>
                        <td className="p-3 text-right font-extrabold font-mono text-slate-900">
                          ৳{(item.quantity * item.unitPrice).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Financial Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-slate-200">
                <div className="text-xs text-slate-500 max-w-xs space-y-1">
                  {ord.note && (
                    <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900 font-medium">
                      <strong>Special Note:</strong> {ord.note}
                    </div>
                  )}
                  <div className="pt-2 text-[11px] text-slate-400">
                    Thank you for choosing Spidey Jersey! Keep this invoice for exchange or delivery verification.
                  </div>
                </div>

                <div className="w-full sm:w-64 space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Amount:</span>
                    <span className="font-mono font-bold text-slate-900">৳{ord.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Due / Advance:</span>
                    <span className="font-mono font-bold text-amber-600">৳{ord.dueAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-300 font-extrabold text-base text-slate-900">
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4 text-emerald-600" /> COD Collect:
                    </span>
                    <span className="font-mono text-emerald-600">৳{ord.codAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
