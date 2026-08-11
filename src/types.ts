export type OrderStatus = "Confirmed" | "In Packaging" | "Shipped" | "Delivered" | "Cancelled";

export interface JerseyOrderItem {
  id: string;
  productId?: string;
  productCode?: string;
  imageUrl?: string;
  jerseyName: string;
  size: "S" | "M" | "L" | "XL" | "XXL" | "3XL";
  customName: string;
  customNumber: string;
  quantity: number;
  unitPrice: number;
}

export interface ERPOrder {
  id: string; // e.g. #SJ-8042
  customerName: string;
  phone: string;
  addressBox1: string; // Street Address / Area
  addressBox2: string; // District / City
  items: JerseyOrderItem[];
  status: OrderStatus;
  date: string; // YYYY-MM-DD
  time?: string;
  totalAmount: number; // ৳
  codAmount: number;   // ৳
  dueAmount: number;   // ৳
  note?: string;
  steadfastTracking?: string;
  steadfastStatus?: string;
  aiConfidence?: number; // % if parsed by AI
}

export interface Product {
  id: string;
  productCode?: string;
  teamName: string;
  jerseyName: string;
  category: "Club" | "National" | "Retro" | "Special Edition";
  price: number; // ৳
  stock: number;
  lowStockThreshold: number;
  imageUrl: string;
  sizesAvailable: Array<"S" | "M" | "L" | "XL" | "XXL" | "3XL">;
}

export interface FontPreset {
  id: string;
  name: string;
  year: string;
  fontFamily: string;
  sampleText: string;
  letterSpacing: number; // in px
  textTransform: "uppercase" | "lowercase" | "capitalize";
  hasOuterStroke: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  numberStyle: "Solid" | "Pattern" | "Outline";
}

export interface DTFNestedItem {
  id: string;
  orderId: string;
  customerName: string;
  jerseyName: string;
  size: string;
  type: "Name" | "Number" | "FullSet" | "SponsorLogo";
  text: string;
  numberText?: string;
  x: number; // inches on 39" roll
  y: number; // inches
  width: number; // inches
  height: number; // inches
  fontSize: number; // pt
  fontFamily: string;
  presetName: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  rotation: number; // 0, 90
  curved: boolean;
  curveRadius: number;
}

export interface SteadfastConsignmentResponse {
  orderId: string;
  customerName: string;
  phone: string;
  recipientAddress: string;
  codAmount: number;
  trackingCode: string;
  consignmentId: string;
  status: string;
  createdAt: string;
}
