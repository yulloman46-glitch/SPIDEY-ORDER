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
import { SignIn } from "./components/SignIn";
import { SignUp } from "./components/SignUp";
import { supabase } from "./supabaseClient";

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

  // Check active session using supabase.auth.getSession() and listen to changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUserEmail(session?.user?.email || null);
      setSessionChecked(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUserEmail(newSession?.user?.email || null);
      setSessionChecked(true);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Protect private pages with supabase.auth.getSession(): if no session, redirect to /signin
  useEffect(() => {
    if (!sessionChecked) return;

    const isPublicTab = activeTab === "signin" || activeTab === "signup";
    if (!session && !isPublicTab) {
      setActiveTab("signin");
      window.history.pushState({}, "", "/signin");
    }
  }, [session, sessionChecked, activeTab]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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

  // Fetch products from Supabase table ('SPIDEY', 'spidey', 'products') for cross-device/multi-browser sync
  useEffect(() => {
    async function syncProductsFromSupabase() {
      try {
        let dbData: any[] | null = null;

        // 1) Try 'SPIDEY'
        const res1 = await supabase.from("SPIDEY").select("*");
        if (!res1.error && res1.data && res1.data.length > 0) {
          dbData = res1.data;
        } else {
          // 2) Try 'spidey'
          const res2 = await supabase.from("spidey").select("*");
          if (!res2.error && res2.data && res2.data.length > 0) {
            dbData = res2.data;
          } else {
            // 3) Try 'products'
            const res3 = await supabase.from("products").select("*");
            if (!res3.error && res3.data && res3.data.length > 0) {
              dbData = res3.data;
            }
          }
        }

        if (dbData && dbData.length > 0) {
          const productRows = dbData.filter((row: any) => row && (row.jerseyName || row.productCode || row.jersey_name || row.product_code || row.name || row.title || row.team || row.id));
          if (productRows.length > 0) {
            const fetchedProducts: Product[] = productRows.map((item: any, idx: number) => {
              const rawSizes = item.sizesAvailable || item.sizes_available || item.sizes;
              let parsedSizes = ["S", "M", "L", "XL", "XXL"];
              if (Array.isArray(rawSizes)) {
                parsedSizes = rawSizes;
              } else if (typeof rawSizes === "string" && rawSizes.trim()) {
                parsedSizes = rawSizes.split(",").map((s: string) => s.trim());
              }

              return {
                id: item.id ? String(item.id) : `p-cloud-${idx}-${Date.now()}`,
                productCode: item.productCode || item.product_code || item.code || `SKU-${1000 + idx}`,
                teamName: item.teamName || item.team_name || item.team || "Team",
                jerseyName: item.jerseyName || item.jersey_name || item.name || item.title || "Jersey",
                category: item.category || "Club",
                price: Number(item.price) || 0,
                stock: Number(item.stock) || 0,
                lowStockThreshold: Number(item.lowStockThreshold || item.low_stock_threshold) || 10,
                imageUrl: item.imageUrl || item.image_url || item.image || item.photo_url || "",
                sizesAvailable: parsedSizes as any,
              };
            });

            setProducts((prev) => {
              const merged = [...prev];
              fetchedProducts.forEach((fp) => {
                const matchIndex = merged.findIndex(
                  (p) => p.id === fp.id || (p.productCode && p.productCode === fp.productCode)
                );
                if (matchIndex >= 0) {
                  merged[matchIndex] = fp;
                } else {
                  merged.push(fp);
                }
              });
              try {
                localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(merged));
              } catch (e) {
                console.error("LocalStorage save error:", e);
              }
              return merged;
            });
          }
        }
      } catch (err) {
        console.log("Supabase product sync notice:", err);
      }
    }

    syncProductsFromSupabase();
  }, [session]);

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

