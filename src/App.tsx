import React, { useState, useEffect } from "react";
import { ERPOrder, Product } from "./types";
import { initialOrders, initialProducts } from "./data/mockData";
import { Navigation, NavTab } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { OrdersManagement } from "./components/OrdersManagement";
import { SingleOrderForm } from "./components/SingleOrderForm";
import { AIChatParser } from "./components/AIChatParser";
import { ProductCatalog } from "./components/ProductCatalog";
import { DTFNestingEngine } from "./components/DTFNestingEngine";

const LOCAL_STORAGE_ORDERS_KEY = "spidey_jersey_erp_orders_v1";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  
  // Initialize orders state from LocalStorage if present, else fallback to initialOrders
  const [orders, setOrders] = useState<ERPOrder[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      console.error("Error reading orders from localStorage:", err);
    }
    return initialOrders;
  });

  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Synchronize orders state to LocalStorage on every state update (including deletions/additions)
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch (err) {
      console.error("Error persisting orders to localStorage:", err);
    }
  }, [orders]);

  // Restore sample orders helper
  const handleResetOrders = () => {
    if (window.confirm("Are you sure you want to restore default sample orders?")) {
      setOrders(initialOrders);
    }
  };

  // Add single order
  const handleAddSingleOrder = (newOrder: ERPOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  // Add bulk AI parsed orders
  const handleAddBulkOrders = (newOrders: ERPOrder[]) => {
    setOrders((prev) => [...newOrders, ...prev]);
  };

  // Count low stock products
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-slate-200 font-sans antialiased selection:bg-red-600 selection:text-white">
      {/* Header Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        orderCount={orders.length}
        lowStockCount={lowStockCount}
      />

      {/* Main Bento Grid View Container */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && (
          <Dashboard
            orders={orders}
            products={products}
            onNavigateOrders={() => setActiveTab("orders")}
            onNavigateNewOrder={() => setActiveTab("new-order")}
            onNavigateDTF={() => setActiveTab("dtf-nesting")}
          />
        )}

        {activeTab === "orders" && (
          <OrdersManagement orders={orders} setOrders={setOrders} onResetOrders={handleResetOrders} />
        )}

        {activeTab === "new-order" && (
          <SingleOrderForm
            products={products}
            onAddOrder={handleAddSingleOrder}
            onNavigateOrders={() => setActiveTab("orders")}
          />
        )}

        {activeTab === "ai-chat" && (
          <AIChatParser
            products={products}
            onAddParsedOrders={handleAddBulkOrders}
            onNavigateOrders={() => setActiveTab("orders")}
          />
        )}

        {activeTab === "products" && (
          <ProductCatalog products={products} setProducts={setProducts} />
        )}

        {activeTab === "dtf-nesting" && (
          <DTFNestingEngine orders={orders} />
        )}
      </main>
    </div>
  );
}
