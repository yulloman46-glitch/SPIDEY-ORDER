import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebaseClient";
import { ERPOrder, Product } from "./types";
import { initialOrders, initialProducts } from "./data/mockData";
import { Navigation, NavTab } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { OrdersManagement } from "./components/OrdersManagement";
import { SingleOrderForm } from "./components/SingleOrderForm";
import { AIChatParser } from "./components/AIChatParser";
import { ProductCatalog } from "./components/ProductCatalog";
import { DTFNestingEngine } from "./components/DTFNestingEngine";
import { SignIn } from "./components/SignIn";
import { SignUp } from "./components/SignUp";
import {
  initFirebaseAuth,
  subscribeFirebaseProducts,
  subscribeFirebaseOrders,
  saveOrderToFirebase,
  saveProductToFirebase,
} from "./services/firebaseService";

const LOCAL_STORAGE_ORDERS_KEY = "spidey_jersey_erp_orders_v1";
const LOCAL_STORAGE_PRODUCTS_KEY = "spidey_jersey_erp_products_v1";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    const path = window.location.pathname;
    if (path === "/signin" || path === "/login") return "signin";
    if (path === "/signup") return "signup";
    return "dashboard";
  });

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [prefilledEmail, setPrefilledEmail] = useState<string>("");
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Sync tab with browser URL history
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/signin" || path === "/login") {
        setActiveTab("signin");
      } else if (path === "/signup") {
        setActiveTab("signup");
      } else if (path === "/") {
        setActiveTab("dashboard");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && !currentUser.isAnonymous) {
        setUserEmail(currentUser.email);
        setSession(currentUser);
      } else {
        setUserEmail(null);
        setSession(null);
      }
      setSessionChecked(true);
    });

    return () => unsubscribe();
  }, []);

  // Protect private pages with Firebase Auth session: if no session, redirect to /signin
  useEffect(() => {
    if (!sessionChecked) return;

    const isPublicTab = activeTab === "signin" || activeTab === "signup";
    if (!session && !isPublicTab) {
      setActiveTab("signin");
      window.history.pushState({}, "", "/signin");
    }
  }, [session, sessionChecked, activeTab]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out notice:", e);
    }
    setSession(null);
    setUserEmail(null);
    setAuthNotice(null);
    window.history.pushState({}, "", "/signin");
    setActiveTab("signin");
  };

  const handleAuthSuccess = () => {
    setAuthNotice(null);
    window.history.pushState({}, "", "/");
    setActiveTab("dashboard");
  };

  const handleNavigateToSignIn = (email?: string, message?: string) => {
    if (email) setPrefilledEmail(email);
    if (message) setAuthNotice(message);
    setActiveTab("signin");
    window.history.pushState({}, "", "/signin");
  };

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

  // Initialize products state from LocalStorage if present, else fallback to initialProducts
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error("Error reading products from localStorage:", err);
    }
    return initialProducts;
  });

  // Synchronize orders state to LocalStorage on every state update (including deletions/additions)
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch (err) {
      console.error("Error persisting orders to localStorage:", err);
    }
  }, [orders]);

  // Synchronize products state to LocalStorage on every update so refresh never wipes added products/images
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    } catch (err) {
      console.error("Error persisting products to localStorage:", err);
    }
  }, [products]);

  // Firebase Firestore real-time initialization and subscription
  useEffect(() => {
    initFirebaseAuth(() => {
      // Auth ready, subscribe to real-time products stream
      const unsubProducts = subscribeFirebaseProducts((fbProducts) => {
        setProducts((prev) => {
          const merged = [...prev];
          fbProducts.forEach((fp) => {
            const idx = merged.findIndex((p) => p.id === fp.id || (p.productCode && p.productCode === fp.productCode));
            if (idx >= 0) {
              merged[idx] = fp;
            } else {
              merged.push(fp);
            }
          });
          return merged;
        });
      });

      // Subscribe to real-time orders stream
      const unsubOrders = subscribeFirebaseOrders((fbOrders) => {
        setOrders((prev) => {
          const merged = [...prev];
          fbOrders.forEach((fo) => {
            const idx = merged.findIndex((o) => o.id === fo.id);
            if (idx >= 0) {
              merged[idx] = fo;
            } else {
              merged.push(fo);
            }
          });
          return merged;
        });
      });

      return () => {
        unsubProducts();
        unsubOrders();
      };
    });
  }, []);

  // Restore sample orders helper
  const handleResetOrders = () => {
    if (window.confirm("Are you sure you want to restore default sample orders?")) {
      setOrders(initialOrders);
    }
  };

  // Add single order
  const handleAddSingleOrder = (newOrder: ERPOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    saveOrderToFirebase(newOrder).catch((e) => console.log("Firebase order save notice:", e));
  };

  // Add bulk AI parsed orders
  const handleAddBulkOrders = (newOrders: ERPOrder[]) => {
    setOrders((prev) => [...newOrders, ...prev]);
    newOrders.forEach((order) => {
      saveOrderToFirebase(order).catch((e) => console.log("Firebase order save notice:", e));
    });
  };

  // Count low stock products
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-slate-200 font-sans antialiased selection:bg-red-600 selection:text-white">
      {/* Header Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === "signin") window.history.pushState({}, "", "/signin");
          else if (tab === "signup") window.history.pushState({}, "", "/signup");
          else if (tab === "dashboard") window.history.pushState({}, "", "/");
        }}
        orderCount={orders.length}
        lowStockCount={lowStockCount}
        userEmail={userEmail}
        onSignOut={handleSignOut}
      />

      {/* Main Bento Grid View Container */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "signin" && (
          <SignIn
            initialEmail={prefilledEmail}
            infoNotice={authNotice}
            onSuccess={handleAuthSuccess}
            onNavigateSignUp={() => {
              setAuthNotice(null);
              setActiveTab("signup");
              window.history.pushState({}, "", "/signup");
            }}
          />
        )}

        {activeTab === "signup" && (
          <SignUp
            onSuccess={handleAuthSuccess}
            onNavigateSignIn={handleNavigateToSignIn}
          />
        )}

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

