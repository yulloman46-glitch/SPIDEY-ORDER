import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import {
  signInAnonymously,
  onAuthStateChanged,
  sendEmailVerification,
  User,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage, handleFirestoreError, OperationType } from "../firebaseClient";
import { Product, ERPOrder } from "../types";

// User Profile interface
export interface UserProfile {
  uid: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  role: string;
}

// Save or update User Profile data in Firestore (users/{uid})
export async function saveUserProfileToFirebase(
  user: User,
  additionalData: Partial<UserProfile> = {}
): Promise<UserProfile> {
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, "users", user.uid);
    const existingSnap = await getDoc(userDocRef);
    const existingData = existingSnap.exists() ? existingSnap.data() : {};

    const profileData: UserProfile = {
      uid: user.uid,
      email: user.email || "",
      createdAt: existingData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: user.emailVerified || false,
      role: existingData.role || "operator",
      ...additionalData,
    };

    await setDoc(userDocRef, profileData, { merge: true });
    return profileData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// Fetch User Profile from Firestore
export async function getUserProfileFromFirebase(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, "users", uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// Send Firebase Email Verification
export async function sendUserEmailVerification(user: User): Promise<void> {
  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error("Firebase Email Verification Error:", error);
    throw error;
  }
}

// Firebase Storage integration for uploading product images
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const storageRef = ref(storage, `products/${productId}/${Date.now()}_${safeFileName}`);
  
  // Upload file
  const snapshot = await uploadBytes(storageRef, file);
  
  // Get public download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}

// Ensure auth session for Firestore security rules
export function initFirebaseAuth(onAuthReady?: (user: User) => void) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      onAuthReady?.(user);
    } else {
      try {
        const cred = await signInAnonymously(auth);
        if (cred.user) {
          onAuthReady?.(cred.user);
        }
      } catch (err) {
        console.warn("Firebase anonymous auth notice:", err);
      }
    }
  });
}

// Sync single product to Firestore
export async function saveProductToFirebase(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    const cleanId = String(product.id).replace(/[^a-zA-Z0-9_\-]/g, "_");
    await setDoc(doc(db, "products", cleanId), {
      id: product.id,
      productCode: product.productCode || "",
      teamName: product.teamName || "",
      jerseyName: product.jerseyName || "",
      category: product.category || "Club",
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      lowStockThreshold: Number(product.lowStockThreshold) || 10,
      imageUrl: product.imageUrl || "",
      sizesAvailable: product.sizesAvailable || ["S", "M", "L", "XL", "XXL"],
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete product from Firestore
export async function deleteProductFromFirebase(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    const cleanId = String(productId).replace(/[^a-zA-Z0-9_\-]/g, "_");
    await deleteDoc(doc(db, "products", cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subscribe to real-time products stream
export function subscribeFirebaseProducts(onProductsUpdate: (products: Product[]) => void) {
  const path = "products";
  return onSnapshot(
    collection(db, "products"),
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.jerseyName) {
          items.push({
            id: data.id || docSnap.id,
            productCode: data.productCode || "",
            teamName: data.teamName || "",
            jerseyName: data.jerseyName || "",
            category: data.category || "Club",
            price: Number(data.price) || 0,
            stock: Number(data.stock) || 0,
            lowStockThreshold: Number(data.lowStockThreshold) || 10,
            imageUrl: data.imageUrl || "",
            sizesAvailable: Array.isArray(data.sizesAvailable) ? data.sizesAvailable : ["S", "M", "L", "XL", "XXL"],
          });
        }
      });
      if (items.length > 0) {
        onProductsUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Sync single order to Firestore
export async function saveOrderToFirebase(order: ERPOrder): Promise<void> {
  const cleanId = String(order.id).replace(/[^a-zA-Z0-9_\-]/g, "_");
  const path = `orders/${cleanId}`;
  try {
    await setDoc(doc(db, "orders", cleanId), {
      ...order,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Subscribe to real-time orders stream
export function subscribeFirebaseOrders(onOrdersUpdate: (orders: ERPOrder[]) => void) {
  const path = "orders";
  return onSnapshot(
    collection(db, "orders"),
    (snapshot) => {
      const items: ERPOrder[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.customerName || data.id) {
          items.push({
            id: data.id || docSnap.id,
            customerName: data.customerName || "Customer",
            phone: data.phone || "",
            addressBox1: data.addressBox1 || "",
            addressBox2: data.addressBox2 || "",
            items: data.items || [],
            status: data.status || "Confirmed",
            date: data.date || new Date().toISOString().split("T")[0],
            time: data.time || "",
            totalAmount: Number(data.totalAmount) || 0,
            codAmount: Number(data.codAmount) || 0,
            dueAmount: Number(data.dueAmount) || 0,
            note: data.note || "",
            steadfastTracking: data.steadfastTracking || "",
            steadfastStatus: data.steadfastStatus || "",
            aiConfidence: data.aiConfidence,
          });
        }
      });
      if (items.length > 0) {
        onOrdersUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Batch save multiple products
export async function syncAllProductsToFirebase(products: Product[]): Promise<void> {
  for (const p of products) {
    await saveProductToFirebase(p);
  }
}

// Batch save multiple orders
export async function syncAllOrdersToFirebase(orders: ERPOrder[]): Promise<void> {
  for (const o of orders) {
    await saveOrderToFirebase(o);
  }
}
