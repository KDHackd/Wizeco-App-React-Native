import ApiService, {
  Catalog,
  HalteGachi,
  PromoFlash,
} from "@/services/ApiService";
import { UserLocation } from "@/services/LocationService";
import { useState } from "react";

export interface UseApiDataReturn {
  // États des données
  catalogs: Catalog[];
  promoFlash: PromoFlash[];
  halteGachi: HalteGachi[];

  // États de chargement
  loadingCatalogs: boolean;
  loadingPromoFlash: boolean;
  loadingHalteGachi: boolean;

  // Fonctions de chargement
  loadCatalogs: () => Promise<void>;
  loadPromoFlash: (location: UserLocation) => Promise<void>;
  loadHalteGachi: (location: UserLocation) => Promise<void>;
}

export const useApiData = (): UseApiDataReturn => {
  // États des données
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [promoFlash, setPromoFlash] = useState<PromoFlash[]>([]);
  const [halteGachi, setHalteGachi] = useState<HalteGachi[]>([]);

  // États de chargement
  const [loadingCatalogs, setLoadingCatalogs] = useState<boolean>(false);
  const [loadingPromoFlash, setLoadingPromoFlash] = useState<boolean>(false);
  const [loadingHalteGachi, setLoadingHalteGachi] = useState<boolean>(false);

  // Fonction pour charger les catalogues
  const loadCatalogs = async () => {
    setLoadingCatalogs(true);
    try {
      console.log("🔄 Chargement des catalogues...");
      const catalogsData = await ApiService.getCatalogs(1, 10);
      console.log("📦 Catalogues récupérés:", catalogsData);
      console.log("📊 Nombre de catalogues:", catalogsData.length);
      setCatalogs(catalogsData);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des catalogues:", error);
    } finally {
      setLoadingCatalogs(false);
    }
  };

  // Fonction pour charger les promos flash
  const loadPromoFlash = async (location: UserLocation) => {
    setLoadingPromoFlash(true);
    try {
      console.log("🔄 Chargement des promos flash...");
      console.log("📍 Coordonnées utilisées:", location);

      const promosData = await ApiService.getPromoFlash(
        location.latitude,
        location.longitude,
        1,
        10
      );
      console.log("⚡ Promos flash récupérées:", promosData);
      console.log("📊 Nombre de promos flash:", promosData.length);
      setPromoFlash(promosData);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des promos flash:", error);
    } finally {
      setLoadingPromoFlash(false);
    }
  };

  // Fonction pour charger les haltes gachi
  const loadHalteGachi = async (location: UserLocation) => {
    setLoadingHalteGachi(true);
    try {
      console.log("🔄 Chargement des haltes gachi...");
      console.log("📍 Coordonnées utilisées:", location);

      const haltesData = await ApiService.getHalteGachi(
        location.latitude,
        location.longitude,
        1,
        10
      );
      console.log("🛑 Haltes gachi récupérées:", haltesData);
      console.log("📊 Nombre de haltes gachi:", haltesData.length);
      setHalteGachi(haltesData);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des haltes gachi:", error);
    } finally {
      setLoadingHalteGachi(false);
    }
  };

  return {
    catalogs,
    promoFlash,
    halteGachi,
    loadingCatalogs,
    loadingPromoFlash,
    loadingHalteGachi,
    loadCatalogs,
    loadPromoFlash,
    loadHalteGachi,
  };
};
