import { Product } from '../types';

/**
 * Automatically retrieves relevant related products based on 5-level priority:
 * 1. Same category
 * 2. Similar tags or keywords
 * 3. Similar fit or fabric
 * 4. Similar price range (+/- 40%)
 * Excludes the current product and caps at maxCount (default 8).
 */
export function getRelatedProducts(
  currentProduct: Product,
  allProducts: Product[],
  maxCount: number = 8
): Product[] {
  if (!currentProduct || !allProducts || allProducts.length === 0) {
    return [];
  }

  // Filter out current product and inactive products
  const pool = allProducts.filter(
    (p) => p.id !== currentProduct.id && p.status !== 'inactive'
  );

  if (pool.length === 0) return [];

  const currentPrice = currentProduct.selling_price;
  const currentTags = currentProduct.tags || [];
  const currentKeywords = currentProduct.name.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  // Score each candidate product
  const scored = pool.map((product) => {
    let score = 0;

    // 1. Same category (highest weight)
    if (product.category_id === currentProduct.category_id) {
      score += 50;
    }

    // 2. Matching tags
    if (product.tags && currentTags.length > 0) {
      const commonTags = product.tags.filter((t) =>
        currentTags.some((ct) => ct.toLowerCase() === t.toLowerCase())
      );
      score += commonTags.length * 15;
    }

    // 3. Similar name keywords (e.g. "T-Shirt", "Chino", "Polo", "Denim", "Shirt")
    const prodNameLower = product.name.toLowerCase();
    currentKeywords.forEach((kw) => {
      if (prodNameLower.includes(kw)) {
        score += 10;
      }
    });

    // 4. Same fit or fabric if available
    if (product.fit && currentProduct.fit && product.fit.toLowerCase() === currentProduct.fit.toLowerCase()) {
      score += 5;
    }

    // 5. Similar price range (+/- 35%)
    if (currentPrice > 0) {
      const priceDiffRatio = Math.abs(product.selling_price - currentPrice) / currentPrice;
      if (priceDiffRatio <= 0.35) {
        score += 8;
      }
    }

    return { product, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Return the top scored products (only those with non-zero relevance or general active products)
  const result = scored
    .slice(0, maxCount)
    .map((item) => item.product);

  return result;
}

const RECENTLY_VIEWED_KEY = 'shadsodai_recently_viewed';

/**
 * Record a viewed product in localStorage browsing history
 */
export function recordRecentlyViewed(productId: string): void {
  if (!productId) return;
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    const updated = [productId, ...existing.filter((id) => id !== productId)].slice(0, 12);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch {
    // Graceful silent fail if storage blocked
  }
}

/**
 * Get products from user browsing history excluding current product
 */
export function getRecentlyViewedProducts(
  currentProductId: string,
  allProducts: Product[],
  maxCount: number = 6
): Product[] {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    const ids: string[] = JSON.parse(raw);
    const historyIds = ids.filter((id) => id !== currentProductId);

    const productMap = new Map<string, Product>();
    allProducts.forEach((p) => productMap.set(p.id, p));

    const result: Product[] = [];
    for (const id of historyIds) {
      const p = productMap.get(id);
      if (p && p.status !== 'inactive') {
        result.push(p);
        if (result.length >= maxCount) break;
      }
    }
    return result;
  } catch {
    return [];
  }
}
