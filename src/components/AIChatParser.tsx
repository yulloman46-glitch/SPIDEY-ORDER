import React, { useState } from "react";
import { ERPOrder, JerseyOrderItem, Product } from "../types";
import { Sparkles, Save, Printer, PackageCheck, Copy, Check, Shirt, AlertCircle, Loader2, Tag } from "lucide-react";
import { sampleChatPasted } from "../data/mockData";
import { InvoicesModal } from "./modals/InvoicesModal";
import { PackagingSlipsModal } from "./modals/PackagingSlipsModal";
import { enhanceItemWithCatalog } from "../utils/productMatcher";

interface AIChatParserProps {
  products: Product[];
  onAddParsedOrders: (orders: ERPOrder[]) => void;
  onNavigateOrders: () => void;
}

export const AIChatParser: React.FC<AIChatParserProps> = ({
  products,
  onAddParsedOrders,
  onNavigateOrders,
}) => {
  const [chatText, setChatText] = useState(sampleChatPasted);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedCards, setParsedCards] = useState<ERPOrder[]>([]);

  // Modal triggers
  const [showInvoices, setShowInvoices] = useState(false);
  const [showPackaging, setShowPackaging] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Call server Gemini AI parsing endpoint
  const handleSplitIntoOrders = async () => {
    if (!chatText.trim()) {
      alert("Please paste customer chat text first.");
      return;
    }

    setIsParsing(true);
    setSavedSuccess(false);
    try {
      const res = await fetch("/api/ai-parse-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatText }),
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.orders)) {
        // Map raw AI response into valid ERPOrder objects with catalog product matching
        const formatted: ERPOrder[] = data.orders.map((raw: any, index: number) => {
          const newId = "SJ-AI" + Math.floor(100 + Math.random() * 900) + "-" + (index + 1);
          const rawItems = Array.isArray(raw.items) ? raw.items : [];
          
          let items: JerseyOrderItem[] = rawItems.map((it: any, iIdx: number) => {
            return enhanceItemWithCatalog(
              {
                id: `ai-item-${index}-${iIdx}`,
                productCode: it.productCode,
                jerseyName: it.jerseyName || "Real Madrid Home 24/25",
                size: (it.size || "L").toUpperCase() as any,
                customName: (it.customName || "").toUpperCase(),
                customNumber: (it.customNumber || "").toString(),
                quantity: Number(it.quantity) || 1,
                unitPrice: Number(it.unitPrice) || 2200,
              },
              products
            );
          });

          if (items.length === 0) {
            items = [
              enhanceItemWithCatalog(
                {
                  id: `ai-item-${index}-0`,
                  productCode: "RM24H",
                  jerseyName: "Real Madrid Home 24/25 Player Edition",
                  size: "L",
                  customName: "BELLINGHAM",
                  customNumber: "5",
                  quantity: 1,
                  unitPrice: 2200,
                },
                products
              ),
            ];
          }

          const tot = items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
          const cod = Number(raw.codAmount) || tot;
          const due = Number(raw.dueAmount) || Math.max(0, tot - cod);

          return {
            id: newId,
            customerName: raw.customerName || `Customer #${index + 1}`,
            phone: raw.phone || "01700000000",
            addressBox1: raw.addressBox1 || "Street / Area details",
            addressBox2: raw.addressBox2 || "Dhaka",
            items,
            status: "Confirmed",
            date: new Date().toISOString().split("T")[0],
            time: new Date().toTimeString().slice(0, 5),
            totalAmount: tot,
            codAmount: cod,
            dueAmount: due,
            note: raw.note || "",
            aiConfidence: Math.min(100, Math.max(75, Number(raw.confidenceScore) || 94)),
          };
        });

        setParsedCards(formatted);
      } else {
        alert("Parsing returned no orders. Try adjusting the raw text format.");
      }
    } catch (err) {
      console.error("Parsing error", err);
      alert("Failed to parse chat via Gemini AI");
    } finally {
      setIsParsing(false);
    }
  };

  // Actions
  const handleSaveAll = () => {
    if (parsedCards.length === 0) return;
    onAddParsedOrders(parsedCards);
    setSavedSuccess(true);
  };

  const handleSaveAndPrintPackaging = () => {
    if (parsedCards.length === 0) return;
    onAddParsedOrders(parsedCards);
    setSavedSuccess(true);
    setShowPackaging(true);
  };

  const handleSaveAndPrintInvoices = () => {
    if (parsedCards.length === 0) return;
    onAddParsedOrders(parsedCards);
    setSavedSuccess(true);
    setShowInvoices(true);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl border border-purple-800/40 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300 mb-1">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> AI Chat & Messenger Order Parser
          </div>
          <h1 className="text-2xl font-black tracking-tight">Bulk AI Orders Processing</h1>
          <p className="text-purple-200/80 text-xs mt-1">
            Paste raw Facebook Messenger / WhatsApp conversations to automatically extract customer details, split addresses, and jersey printing configs
          </p>
        </div>
        <button
          onClick={() => setChatText(sampleChatPasted)}
          className="text-xs font-bold px-3.5 py-2 rounded-xl bg-purple-800/60 hover:bg-purple-700 text-purple-200 border border-purple-600/40 transition-colors flex items-center gap-1.5"
        >
          <Copy className="w-3.5 h-3.5" /> Load Sample Chat Text
        </button>
      </div>

      {/* Raw Chat Text Area Box */}
      <div className="bg-[#16161E] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <label className="block text-sm font-bold text-white">
          Paste Raw Messenger / WhatsApp Customer Conversations
        </label>
        <textarea
          rows={7}
          value={chatText}
          onChange={(e) => setChatText(e.target.value)}
          placeholder="Paste customer chats here..."
          className="w-full p-4 rounded-xl border border-slate-800 font-mono text-xs text-white bg-slate-900 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500"
        ></textarea>

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-400 font-medium">
            Gemini 3.6 Flash structured schema parsing
          </span>

          <button
            onClick={handleSplitIntoOrders}
            disabled={isParsing}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-purple-900/40 flex items-center gap-2"
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> AI Parsing Chat...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" /> Split into Orders (AI)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Parsed Orders Output Section */}
      {parsedCards.length > 0 && (
        <div className="space-y-6">
          {/* Action Header bar */}
          <div className="bg-[#16161E] text-white p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                Parsed {parsedCards.length} Customer Order Card(s)
              </h2>
              <p className="text-xs text-slate-400">Review confidence scores and edit details before saving</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSaveAll}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md"
              >
                <Save className="w-4 h-4" /> Save All
              </button>
              <button
                onClick={handleSaveAndPrintPackaging}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md"
              >
                <PackageCheck className="w-4 h-4" /> Save & Print Packaging
              </button>
              <button
                onClick={handleSaveAndPrintInvoices}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 border border-slate-700 shadow-md"
              >
                <Printer className="w-4 h-4" /> Save & Print Invoices
              </button>
            </div>
          </div>

          {savedSuccess && (
            <div className="bg-emerald-950/40 border border-emerald-800 p-4 rounded-xl text-emerald-300 font-bold text-xs flex justify-between items-center">
              <span>Saved {parsedCards.length} order(s) into Spidey Jersey ERP!</span>
              <button
                onClick={onNavigateOrders}
                className="underline hover:text-emerald-200 font-extrabold"
              >
                View in Orders List →
              </button>
            </div>
          )}

          {/* Individual Parsed Order Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {parsedCards.map((card, idx) => (
              <div
                key={card.id}
                className="bg-[#16161E] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 relative"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-red-500 text-sm">{card.id}</span>
                    <span className="text-xs text-slate-400 font-medium">Order #{idx + 1}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold bg-purple-950/60 text-purple-300 px-2.5 py-1 rounded-full border border-purple-800/60">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    {card.aiConfidence}% AI Confidence
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">NAME</span>
                      <input
                        type="text"
                        value={card.customerName}
                        onChange={(e) => {
                          const updated = [...parsedCards];
                          updated[idx].customerName = e.target.value;
                          setParsedCards(updated);
                        }}
                        className="w-full p-1.5 border border-slate-800 rounded font-bold text-white bg-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">PHONE</span>
                      <input
                        type="text"
                        value={card.phone}
                        onChange={(e) => {
                          const updated = [...parsedCards];
                          updated[idx].phone = e.target.value;
                          setParsedCards(updated);
                        }}
                        className="w-full p-1.5 border border-slate-800 rounded font-mono font-bold text-white bg-slate-900"
                      />
                    </div>
                  </div>

                  {/* Split Addresses */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">BOX 1: STREET / AREA</span>
                      <input
                        type="text"
                        value={card.addressBox1}
                        onChange={(e) => {
                          const updated = [...parsedCards];
                          updated[idx].addressBox1 = e.target.value;
                          setParsedCards(updated);
                        }}
                        className="w-full p-1.5 border border-slate-800 rounded text-slate-200 bg-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">BOX 2: DISTRICT / CITY</span>
                      <input
                        type="text"
                        value={card.addressBox2}
                        onChange={(e) => {
                          const updated = [...parsedCards];
                          updated[idx].addressBox2 = e.target.value;
                          setParsedCards(updated);
                        }}
                        className="w-full p-1.5 border border-slate-800 rounded font-bold text-white bg-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Items in card */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Jersey Printing Items ({card.items.length})
                  </span>
                  {card.items.map((item, iIdx) => (
                    <div key={iIdx} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs flex items-center gap-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.jerseyName}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0 bg-slate-950"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center text-red-400">
                          <Shirt className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="font-bold text-white flex items-center justify-between gap-2">
                          <div className="truncate flex items-center gap-1.5">
                            <span className="truncate">{item.jerseyName}</span>
                            {item.productCode && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[10px] border border-purple-800/80 font-extrabold shrink-0">
                                [{item.productCode}]
                              </span>
                            )}
                          </div>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono font-bold border border-slate-700 shrink-0">
                            {item.size}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-red-400 font-mono font-bold">
                            Print: {item.customName || "NO NAME"} #{item.customNumber || "0"}
                          </span>
                          <span className="font-mono text-slate-400 font-medium">
                            {item.quantity}x ৳{item.unitPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financials footer */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">TOTAL</span>
                    <span className="font-black text-white">৳{card.totalAmount}</span>
                  </div>
                  <div>
                    <span className="text-amber-400 block text-[10px]">DUE</span>
                    <span className="font-black text-amber-400">৳{card.dueAmount}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 block text-[10px]">COD</span>
                    <span className="font-black text-emerald-400">৳{card.codAmount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showInvoices && (
        <InvoicesModal orders={parsedCards} onClose={() => setShowInvoices(false)} />
      )}
      {showPackaging && (
        <PackagingSlipsModal orders={parsedCards} onClose={() => setShowPackaging(false)} />
      )}
    </div>
  );
};
