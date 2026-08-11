import React, { useState } from "react";
import { ERPOrder, JerseyOrderItem, Product } from "../types";
import { Plus, Trash2, CheckCircle2, Shirt, MapPin, User, Phone, DollarSign, FileText } from "lucide-react";

interface SingleOrderFormProps {
  products: Product[];
  onAddOrder: (newOrder: ERPOrder) => void;
  onNavigateOrders: () => void;
}

export const SingleOrderForm: React.FC<SingleOrderFormProps> = ({
  products,
  onAddOrder,
  onNavigateOrders,
}) => {
  // State for multiple jersey items in this order
  const [items, setItems] = useState<JerseyOrderItem[]>([
    {
      id: "item-" + Date.now() + "-1",
      productId: products[0]?.id || "p1",
      productCode: products[0]?.productCode || "RM24H",
      imageUrl: products[0]?.imageUrl,
      jerseyName: products[0]?.jerseyName || "Real Madrid Home 24/25 Player Edition",
      size: "L",
      customName: "BELLINGHAM",
      customNumber: "5",
      quantity: 1,
      unitPrice: products[0]?.price || 2200,
    },
  ]);

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  // Split Address Fields Box 1 & Box 2
  const [addressBox1, setAddressBox1] = useState(""); // Street Address / Area
  const [addressBox2, setAddressBox2] = useState("Dhaka"); // District / City

  // Optional Note, COD, Due
  const [note, setNote] = useState("");
  const [advancePaid, setAdvancePaid] = useState<number | "">(0);

  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");

  // Calculate totals
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const adv = typeof advancePaid === "number" ? advancePaid : 0;
  const dueAmount = adv; // Due remaining / advance paid tracking
  const codAmount = Math.max(0, totalAmount - adv);

  // Size Options
  const sizeOptions: Array<"S" | "M" | "L" | "XL" | "XXL" | "3XL"> = ["S", "M", "L", "XL", "XXL", "3XL"];

  // Add Item
  const handleAddMoreJersey = () => {
    const defaultProd = products[0] || { jerseyName: "Argentina 3-Star", price: 2400 };
    setItems([
      ...items,
      {
        id: "item-" + Date.now() + "-" + (items.length + 1),
        productId: defaultProd.id,
        productCode: defaultProd.productCode,
        imageUrl: defaultProd.imageUrl,
        jerseyName: defaultProd.jerseyName,
        size: "M",
        customName: "",
        customNumber: "",
        quantity: 1,
        unitPrice: defaultProd.price,
      },
    ]);
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((it) => it.id !== id));
  };

  // Update Item fields
  const updateItem = (id: string, field: keyof JerseyOrderItem, value: any) => {
    setItems(
      items.map((it) => {
        if (it.id === id) {
          if (field === "productId") {
            const matched = products.find((p) => p.id === value);
            if (matched) {
              return {
                ...it,
                productId: matched.id,
                productCode: matched.productCode,
                imageUrl: matched.imageUrl,
                jerseyName: matched.jerseyName,
                unitPrice: matched.price,
              };
            }
          }
          return { ...it, [field]: value };
        }
        return it;
      })
    );
  };

  // Confirm Submit Order
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !addressBox1.trim()) {
      alert("Please fill in Customer Name, Phone Number, and Street Address (Box 1)");
      return;
    }

    const newId = "SJ-" + Math.floor(8000 + Math.random() * 2000);
    const newOrd: ERPOrder = {
      id: newId,
      customerName: customerName.trim(),
      phone: phone.trim(),
      addressBox1: addressBox1.trim(),
      addressBox2: addressBox2.trim() || "Dhaka",
      items,
      status: "Confirmed",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      totalAmount,
      codAmount,
      dueAmount,
      note: note.trim(),
    };

    onAddOrder(newOrd);
    setCreatedOrderId(newId);
    setOrderSubmitted(true);
  };

  const handleReset = () => {
    setCustomerName("");
    setPhone("");
    setAddressBox1("");
    setAddressBox2("Dhaka");
    setNote("");
    setAdvancePaid(0);
    setItems([
      {
        id: "item-" + Date.now(),
        productId: products[0]?.id || "p1",
        jerseyName: products[0]?.jerseyName || "Real Madrid Home 24/25 Player Edition",
        size: "L",
        customName: "SPIDEY",
        customNumber: "07",
        quantity: 1,
        unitPrice: products[0]?.price || 2200,
      },
    ]);
    setOrderSubmitted(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-[#16161E] text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500 mb-1">
            <Shirt className="w-4 h-4" /> Single Order Entry Form
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Place New Order</h1>
          <p className="text-slate-400 text-xs mt-1">
            Create custom soccer jersey orders with personalized back name & number printing
          </p>
        </div>
        <button
          onClick={onNavigateOrders}
          className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
        >
          View Existing Orders
        </button>
      </div>

      {orderSubmitted ? (
        <div className="bg-[#16161E] border-2 border-emerald-500/50 p-8 rounded-2xl text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white">Order Confirmed Successfully!</h2>
          <p className="text-slate-300 text-sm max-w-md mx-auto">
            Order ID <strong className="text-red-400 font-mono text-base">{createdOrderId}</strong> has been created and registered into Spidey Jersey ERP.
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors border border-slate-700"
            >
              + Place Another Order
            </button>
            <button
              onClick={onNavigateOrders}
              className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-500 transition-colors shadow-md"
            >
              Go to Orders Management
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Jersey Item Selector */}
          <div className="bg-[#16161E] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Shirt className="w-5 h-5 text-red-500" />
                Jersey Items Selection
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                {items.length} Jersey{items.length > 1 ? "s" : ""} added
              </span>
            </div>

            <div className="space-y-6">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
                      Jersey #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-950/40 transition-colors"
                        title="Remove Jersey"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown product selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Select Team Jersey Product
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(item.id, "productId", e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white font-semibold text-xs focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.jerseyName} — ৳{p.price} (Stock: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Size selector buttons */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Jersey Size Selector (S to 3XL)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => updateItem(item.id, "size", sz)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            item.size === sz
                              ? "bg-red-600 text-white border-red-500 shadow-md"
                              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Name & Number input boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Custom Back Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MESSI, SPIDEY"
                        value={item.customName}
                        onChange={(e) => updateItem(item.id, "customName", e.target.value.toUpperCase())}
                        className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white font-mono font-bold text-xs uppercase focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Custom Back Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 10, 07"
                        value={item.customNumber}
                        onChange={(e) => updateItem(item.id, "customNumber", e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white font-mono font-bold text-xs focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-300">Quantity:</span>
                      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, "quantity", Math.max(1, item.quantity - 1))}
                          className="px-2.5 py-1 text-slate-300 hover:bg-slate-800 font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 font-extrabold text-white font-mono">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, "quantity", item.quantity + 1)}
                          className="px-2.5 py-1 text-slate-300 hover:bg-slate-800 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 text-[11px] block">Item Subtotal</span>
                      <span className="font-mono font-black text-white text-sm">
                        ৳{(item.quantity * item.unitPrice).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Jersey Dynamic Button */}
            <button
              type="button"
              onClick={handleAddMoreJersey}
              className="w-full py-3 rounded-xl border-2 border-dashed border-red-500/40 hover:border-red-500 text-red-400 hover:text-red-300 font-bold text-xs flex items-center justify-center gap-2 bg-red-950/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Add More Jersey to this Order
            </button>
          </div>

          {/* Section 2: Customer Details & Split Address */}
          <div className="bg-[#16161E] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-5 h-5 text-red-500" />
              Customer Information & Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Customer Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Hasan"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 font-semibold text-xs text-white focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="01712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 font-mono font-bold text-xs text-white focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Split Address Fields: Box 1 & Box 2 */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <MapPin className="w-4 h-4 text-red-500" />
                Split Address Fields (Area vs District)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Box 1: Street Address / Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Box 1: Street Address / Area Details *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. House 24, Road 7, Block D, Banani"
                    value={addressBox1}
                    onChange={(e) => setAddressBox1(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-medium text-white focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                  />
                </div>

                {/* Box 2: District / City */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Box 2: District / City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhaka, Chittagong, Sylhet, Cumilla, Rajshahi"
                    value={addressBox2}
                    onChange={(e) => setAddressBox2(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-white focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Financials, Note, COD & Dedicated Due Field */}
          <div className="bg-[#16161E] p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Financials, Advance & Notes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Optional Note */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" /> Note (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Evening delivery preferred"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-medium text-white focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                />
              </div>

              {/* Advance Paid / Due tracking */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Advance Paid Amount (৳)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 font-mono font-bold text-xs text-amber-400 focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                />
              </div>

              {/* Dedicated Due & COD Amount Calculator */}
              <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Bill:</span>
                  <span className="font-mono font-bold">৳{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-amber-400 font-bold">Advance / Due:</span>
                  <span className="font-mono font-bold text-amber-400">৳{dueAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black pt-1 border-t border-slate-800 text-emerald-400">
                  <span>COD Collection:</span>
                  <span className="font-mono">৳{codAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Final Confirm Order Action Button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-red-900/40 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> Confirm Order Submission (৳{totalAmount.toLocaleString()})
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
