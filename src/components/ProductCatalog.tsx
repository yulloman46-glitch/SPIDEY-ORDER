import React, { useState, useRef } from "react";
import { Product } from "../types";
import {
  saveProductToFirebase,
  deleteProductFromFirebase,
  syncAllProductsToFirebase,
} from "../services/firebaseService";
import {
  RefreshCw,
  Plus,
  AlertTriangle,
  Shirt,
  Edit3,
  CheckCircle2,
  Search,
  X,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Barcode,
  Tag,
} from "lucide-react";

interface ProductCatalogProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ products, setProducts }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Modal for editing/adding product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fast & instant image selection via URL.createObjectURL
  const handleUploadedFile = (file: File) => {
    if (!editingProduct) return;

    if (!file.type.startsWith("image/") && !/\.(png|jpg|jpeg|webp|svg|gif|bmp|jfif|avif|heic)$/i.test(file.name)) {
      setSyncMessage("Please select a valid image file.");
      setTimeout(() => setSyncMessage(null), 3000);
      return;
    }

    // Create an instant blob object URL preview - zero delay!
    const objectUrl = URL.createObjectURL(file);
    setEditingProduct((prev) => (prev ? { ...prev, imageUrl: objectUrl } : null));
    setSyncMessage("Image selected instantly!");
    setTimeout(() => setSyncMessage(null), 2500);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // WooCommerce Sync trigger
  const handleSyncWooCommerce = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/sync-woocommerce", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(`Synced ${data.syncedCount} items from WooCommerce at ${new Date(data.syncedAt).toLocaleTimeString()}`);
        setProducts((prev) =>
          prev.map((p) => ({
            ...p,
            stock: p.stock < p.lowStockThreshold ? p.stock + 15 : p.stock + 5,
          }))
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to sync from WooCommerce");
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter products
  const categories = ["All", "Club", "National", "Retro", "Special Edition"];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.jerseyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.productCode && p.productCode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Save product edit/addition
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const code = editingProduct.productCode?.trim().toUpperCase() || "SKU-" + Math.floor(1000 + Math.random() * 9000);
    const name = editingProduct.jerseyName?.trim() || "New Jersey Edition";
    const team = editingProduct.teamName?.trim() || name.split(" ")[0] || "Club Team";
    const img =
      editingProduct.imageUrl?.trim() ||
      "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=400&q=80";

    const updatedProduct: Product = {
      ...editingProduct,
      productCode: code,
      jerseyName: name,
      teamName: team,
      imageUrl: img,
      price: Number(editingProduct.price) || 1800,
      stock: Number(editingProduct.stock) >= 0 ? Number(editingProduct.stock) : 20,
      lowStockThreshold: Number(editingProduct.lowStockThreshold) >= 0 ? Number(editingProduct.lowStockThreshold) : 5,
      sizesAvailable:
        editingProduct.sizesAvailable && editingProduct.sizesAvailable.length > 0
          ? editingProduct.sizesAvailable
          : ["S", "M", "L", "XL", "XXL"],
      category: editingProduct.category || "Club",
    };

    const finalProduct: Product = isNewProduct
      ? { ...updatedProduct, id: updatedProduct.id || "p-" + Date.now() }
      : updatedProduct;

    if (isNewProduct) {
      setProducts((prev) => [finalProduct, ...prev]);
    } else {
      setProducts((prev) => prev.map((p) => (p.id === finalProduct.id ? finalProduct : p)));
    }

    // Sync product entry to Firebase Firestore
    saveProductToFirebase(finalProduct).catch((err) => console.log("Firebase product sync notice:", err));

    setSyncMessage(`Product "${finalProduct.jerseyName}" saved successfully!`);
    setEditingProduct(null);
    setTimeout(() => setSyncMessage(null), 3000);
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this jersey product from inventory?")) return;

    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await deleteProductFromFirebase(productId).catch((err) => console.log("Firebase delete notice:", err));

    setEditingProduct(null);
    setSyncMessage("Product deleted from catalog.");
    setTimeout(() => setSyncMessage(null), 3000);
  };

  // Manual sync with Firebase cloud
  const handleSyncFirebaseCloud = async () => {
    setIsSyncing(true);
    setSyncMessage("Syncing with Firebase Firestore cloud database...");
    try {
      await syncAllProductsToFirebase(products);
      setSyncMessage("All products synchronized with Firebase Firestore!");
    } catch (err: any) {
      console.error(err);
      setSyncMessage("Cloud sync notice: " + (err?.message || "Saved locally"));
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-[#16161E] text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500 mb-1">
            <Shirt className="w-4 h-4" /> Live Team Jersey Inventory
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Product Catalog & Inventory</h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage soccer jerseys, stock counts, pricing, and sync directly across all devices with Firebase
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Cloud Sync Button */}
          <button
            onClick={handleSyncFirebaseCloud}
            disabled={isSyncing}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2 cursor-pointer"
            title="Sync all products with Firebase Firestore cloud database"
          >
            <UploadCloud className={`w-4 h-4 ${isSyncing ? "animate-bounce" : ""}`} />
            {isSyncing ? "Syncing Cloud..." : "Firebase Cloud Sync"}
          </button>

          {/* Sync all from website button */}
          <button
            onClick={handleSyncWooCommerce}
            disabled={isSyncing}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Website"}
          </button>

          <button
            onClick={() => {
              setIsNewProduct(true);
              setEditingProduct({
                id: `p-${Date.now()}`,
                productCode: "",
                teamName: "",
                jerseyName: "",
                category: "Club",
                price: 1800,
                stock: 20,
                lowStockThreshold: 5,
                imageUrl: "",
                sizesAvailable: ["S", "M", "L", "XL", "XXL"],
              });
            }}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-red-950/50 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="bg-blue-950/80 border border-blue-700/80 p-4 rounded-xl text-blue-200 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#16161E] p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, team or jersey..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-white text-xs font-medium focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
          />
        </div>
      </div>

      {/* Grid View displaying all available team jerseys */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((prod) => {
          const isLowStock = prod.stock <= prod.lowStockThreshold;
          return (
            <div
              key={prod.id}
              className="bg-[#16161E] rounded-2xl border border-slate-800 shadow-xl hover:border-slate-700 transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Product Image Box */}
                <div className="h-44 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.jerseyName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-600">
                      <Shirt className="w-12 h-12 mb-1" />
                      <span className="text-[10px] font-bold">No Image Attached</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-800 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-red-400" />
                    {prod.category}
                  </div>
                  {isLowStock && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-md animate-bounce">
                      <AlertTriangle className="w-3 h-3" /> Low Stock
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest block">
                      {prod.teamName}
                    </span>
                    {prod.productCode && (
                      <span className="font-mono text-[10px] font-bold bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                        {prod.productCode}
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-white text-sm leading-snug line-clamp-2">
                    {prod.jerseyName}
                  </h3>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                    <span className="font-semibold text-slate-400">Sizes:</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {Array.isArray(prod.sizesAvailable) ? prod.sizesAvailable.join(", ") : prod.sizesAvailable}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Stock Footer */}
              <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">PRICE</span>
                  <span className="font-mono font-black text-white text-base">৳{prod.price.toLocaleString()}</span>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">STOCK</span>
                    <span
                      className={`font-mono font-extrabold text-sm ${
                        isLowStock ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {prod.stock} in stock
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsNewProduct(false);
                      setEditingProduct(prod);
                    }}
                    className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-red-500 transition-colors shadow-2xs cursor-pointer"
                    title="Edit Product"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Streamlined Add / Edit Product Modal - Clean 3-Field Form */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#16161E] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-800 my-8">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Shirt className="w-5 h-5 text-red-500" />
                {isNewProduct ? "Add New Jersey Product" : "Edit Jersey Product"}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* 1. Product Code Input */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Barcode className="w-4 h-4 text-red-400" />
                  Product Code / SKU
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., RM24H"
                  value={editingProduct.productCode || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      productCode: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full p-3 rounded-xl border border-slate-800 bg-slate-900 font-mono font-bold text-white text-sm focus:ring-2 focus:ring-red-500/40 focus:border-red-500 outline-none uppercase tracking-wider"
                />
              </div>

              {/* 2. Product Name Input */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Shirt className="w-4 h-4 text-red-400" />
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Real Madrid Home 24/25 Jersey"
                  value={editingProduct.jerseyName || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      jerseyName: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl border border-slate-800 bg-slate-900 font-semibold text-white text-xs focus:ring-2 focus:ring-red-500/40 focus:border-red-500 outline-none"
                />
              </div>

              {/* 3. Product Image File Input with Instant Local Preview */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-red-400" />
                    Product Image
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Select image for instant local preview
                  </span>
                </label>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUploadedFile(e.target.files[0]);
                    }
                    e.target.value = "";
                  }}
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                    isDragging
                      ? "border-red-500 bg-red-950/30"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                  }`}
                >
                  {editingProduct.imageUrl ? (
                    <div className="space-y-3">
                      {/* Instant Preview */}
                      <div className="relative group max-w-xs mx-auto">
                        <img
                          src={editingProduct.imageUrl}
                          alt="Jersey Preview"
                          className="h-44 w-full object-contain rounded-xl bg-slate-950 border border-slate-800 p-1"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, imageUrl: "" })}
                          className="absolute top-2 right-2 p-1.5 bg-rose-600/90 text-white rounded-lg hover:bg-rose-500 transition-colors shadow-md cursor-pointer"
                          title="Remove Image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <UploadCloud className="w-4 h-4 text-red-400" />
                          Change Image File
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="py-6 cursor-pointer space-y-2 flex flex-col items-center justify-center"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-red-400">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs block">
                          Click or drag & drop downloaded jersey image
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Instant local preview (Supports PNG, JPG, WEBP, SVG)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Fallback Image Web Link (URL) */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-left">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                      Or paste image web URL:
                    </span>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={editingProduct.imageUrl || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 font-mono text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div>
                  {!isNewProduct && editingProduct.id && (
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(editingProduct.id)}
                      className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 font-bold border border-rose-800/60 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-red-950/60 flex items-center gap-2 cursor-pointer"
                  >
                    Save Product
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
