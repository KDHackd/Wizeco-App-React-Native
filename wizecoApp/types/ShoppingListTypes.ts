export enum ShoppingItemCategory {
  CATALOG = "CATALOG",
  PROMO_FLASH = "PROMO_FLASH",
  HALTE_GACHIS = "HALTE_GACHIS",
  CUSTOM = "CUSTOM",
}

// Types pour les actions sociales
export interface SocialStats {
  LIKE: number;
  SAVE: number;
  SHARE: number;
}

export type SocialActionType = "LIKE" | "SAVE" | "SHARE";

export interface BaseShoppingItem {
  id: string;
  name: string;
  image: any | undefined;
  quantity: number;
  category: ShoppingItemCategory;
  originalId: string; // ID de l'item original (catalogue, promo, etc.)
  backendId?: string; // ID généré par le backend (Redis)
}

export interface CatalogShoppingItem extends BaseShoppingItem {
  category: ShoppingItemCategory.CATALOG;
  // Pas de prix pour les catalogues
}

export interface PromoFlashShoppingItem extends BaseShoppingItem {
  category: ShoppingItemCategory.PROMO_FLASH;
  price: number;
  originalPrice?: number; // Prix original avant réduction
  discountPrice: number; // Prix avec réduction
}

export interface HalteGachiShoppingItem extends BaseShoppingItem {
  category: ShoppingItemCategory.HALTE_GACHIS;
  price: number;
  originalPrice?: number; // Prix original avant réduction
  discountPrice: number; // Prix avec réduction
  consumeBefore?: string; // Date limite de consommation
}

export interface CustomShoppingItem extends BaseShoppingItem {
  category: ShoppingItemCategory.CUSTOM;
  price: number;
  originalPrice?: number;
  discountPrice: number;
}

export type ShoppingItem =
  | CatalogShoppingItem
  | PromoFlashShoppingItem
  | HalteGachiShoppingItem
  | CustomShoppingItem;

// Type guard functions
export const isCatalogItem = (
  item: ShoppingItem
): item is CatalogShoppingItem => {
  return item.category === ShoppingItemCategory.CATALOG;
};

export const isPromoFlashItem = (
  item: ShoppingItem
): item is PromoFlashShoppingItem => {
  return item.category === ShoppingItemCategory.PROMO_FLASH;
};

export const isHalteGachiItem = (
  item: ShoppingItem
): item is HalteGachiShoppingItem => {
  return item.category === ShoppingItemCategory.HALTE_GACHIS;
};

export const isCustomItem = (
  item: ShoppingItem
): item is CustomShoppingItem => {
  return item.category === ShoppingItemCategory.CUSTOM;
};

// Helper function to get the display price
export const getDisplayPrice = (item: ShoppingItem): number => {
  if (isCatalogItem(item)) {
    return 0; // Pas de prix pour les catalogues
  }
  if (isPromoFlashItem(item) || isHalteGachiItem(item) || isCustomItem(item)) {
    return item.discountPrice;
  }
  return 0;
};

// Helper function to get the original price
export const getOriginalPrice = (item: ShoppingItem): number | undefined => {
  if (isPromoFlashItem(item) || isHalteGachiItem(item) || isCustomItem(item)) {
    return item.originalPrice;
  }
  return undefined;
};
