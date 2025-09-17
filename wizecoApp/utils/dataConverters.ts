import { CatalogItem } from "@/components/CatalogCard";
import { HalteItem } from "@/components/HalteCard";
import { PromoFlashItem } from "@/components/PromoFlashCard";
import { Catalog, HalteGachi, PromoFlash } from "@/services/ApiService";

/**
 * Formater une date au format français
 */
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Convertir un catalogue API vers le format du composant
 */
export const convertApiCatalogToCatalogItem = (
  catalog: Catalog
): CatalogItem => {
  const startDate = new Date(catalog.startDate);
  const endDate = new Date(catalog.endDate);

  return {
    id: catalog.id,
    title: catalog.name,
    subtitle: catalog.description,
    validity: `Du ${formatDate(startDate)} au ${formatDate(endDate)}`,
    likes: Math.floor(Math.random() * 50),
    comments: Math.floor(Math.random() * 20),
    image: { uri: catalog.thumbnailUrl },
    catalogUrl: catalog.catalogueUrl,
    shortenUrl: catalog.shortenUrl,
    // Pas de prix pour les catalogues
  };
};

/**
 * Convertir une promo flash API vers le format du composant
 */
export const convertApiPromoToPromoFlashItem = (
  promo: PromoFlash
): PromoFlashItem => {
  const startDate = new Date(promo.start_date);
  const endDate = new Date(promo.end_date);

  return {
    id: promo.id,
    title: promo.title,
    subtitle: promo.description,
    validity: `Du ${formatDate(startDate)} au ${formatDate(endDate)}`,
    likes: Math.floor(Math.random() * 30),
    comments: Math.floor(Math.random() * 15),
    image: { uri: promo.url },
    priceCurrent: promo.discount_price,
    priceOld: promo.price,
    currency: "€",
    distanceKm:
      parseFloat(promo.distance.replace(/[^\d.,]/g, "").replace(",", ".")) || 0,
    promoUrl: promo.url,
    shortenUrl: promo.shortenUrl,
  };
};

/**
 * Convertir une halte gachi API vers le format du composant
 */
export const convertApiHalteToHalteItem = (halte: HalteGachi): HalteItem => {
  const startDate = new Date(halte.start_date);
  const endDate = new Date(halte.end_date);

  return {
    id: halte.id,
    title: halte.title,
    subtitle: halte.description,
    validity: `Du ${formatDate(startDate)} au ${formatDate(endDate)}`,
    likes: Math.floor(Math.random() * 25),
    comments: Math.floor(Math.random() * 10),
    image: { uri: halte.url },
    priceCurrent: halte.discount_price,
    priceOld: halte.price,
    currency: "€",
    distanceKm:
      parseFloat(halte.distance.replace(/[^\d.,]/g, "").replace(",", ".")) || 0,
    consumeBefore: formatDate(endDate),
    halteUrl: halte.url,
    shortenUrl: halte.shortenUrl,
  };
};
