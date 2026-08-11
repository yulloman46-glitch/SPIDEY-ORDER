import { Product, JerseyOrderItem } from "../types";

/**
 * Searches the catalog products for a matching product by code, jersey name, or team name.
 */
export function findProductInCatalog(
  searchQuery: string,
  products: Product[]
): Product | undefined {
  if (!searchQuery) return undefined;
  const cleanQuery = searchQuery.trim().toUpperCase();

  // 1. Extract bracket code if present e.g. "[SJ-NEDNP]" -> "SJ-NEDNP"
  const bracketMatch = cleanQuery.match(/\[([A-Z0-9_-]+)\]/);
  const codeCandidate = bracketMatch ? bracketMatch[1] : cleanQuery;

  // 2. Exact productCode match
  let matched = products.find(
    (p) => p.productCode && p.productCode.toUpperCase() === codeCandidate
  );
  if (matched) return matched;

  // 3. Product code contained in text match
  matched = products.find(
    (p) => p.productCode && cleanQuery.includes(p.productCode.toUpperCase())
  );
  if (matched) return matched;

  // 4. Jersey Name substring match
  const lowerQuery = searchQuery.toLowerCase();
  matched = products.find(
    (p) =>
      p.jerseyName.toLowerCase().includes(lowerQuery) ||
      lowerQuery.includes(p.jerseyName.toLowerCase())
  );
  if (matched) return matched;

  // 5. Team name match
  matched = products.find(
    (p) =>
      p.teamName.toLowerCase().includes(lowerQuery) ||
      lowerQuery.includes(p.teamName.toLowerCase())
  );

  return matched;
}

/**
 * Enhances a raw or AI-parsed item with product details (productCode, imageUrl, jerseyName, price)
 * pulled from the matching Catalog product inventory.
 */
export function enhanceItemWithCatalog(
  item: Partial<JerseyOrderItem> & { jerseyName: string; productCode?: string },
  products: Product[]
): JerseyOrderItem {
  // Extract bracketed code if present in jerseyName or productCode
  let codeFromText = item.productCode || "";
  if (!codeFromText && item.jerseyName) {
    const bracket = item.jerseyName.match(/\[([A-Za-z0-9_-]+)\]/);
    if (bracket) {
      codeFromText = bracket[1];
    }
  }

  const queryToMatch = codeFromText || item.jerseyName;
  const matched = findProductInCatalog(queryToMatch, products);

  let displayJerseyName = item.jerseyName || matched?.jerseyName || "Custom Soccer Jersey";
  if (matched) {
    displayJerseyName = matched.jerseyName;
  } else {
    // Clean trailing or embedded bracket codes from name for clean presentation
    displayJerseyName = displayJerseyName.replace(/\[[A-Za-z0-9_-]+\]/g, "").trim() || displayJerseyName;
  }

  const finalCode = (codeFromText || matched?.productCode || "").toUpperCase();

  const fallbackImage =
    matched?.imageUrl ||
    item.imageUrl ||
    "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=400&q=80";

  return {
    id: item.id || `item-${Math.random().toString(36).substring(2, 9)}`,
    productId: matched?.id || item.productId || "p1",
    productCode: finalCode,
    imageUrl: fallbackImage,
    jerseyName: displayJerseyName,
    size: (item.size || "L") as any,
    customName: (item.customName || "").toUpperCase(),
    customNumber: (item.customNumber || "").toString(),
    quantity: Number(item.quantity) || 1,
    unitPrice: Number(item.unitPrice) || matched?.price || 2200,
  };
}
