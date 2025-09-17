import AnimatedCategoryTabs, {
  Category,
} from "@/components/AnimatedCategoryTabs";
import {
  CataloguesContent,
  HalteGachiContent,
  PromoFlashContent,
} from "@/components/CategoryContent";
import HomeHeader from "@/components/HomeHeader";
import { useApiData } from "@/hooks/useApiData";
import { useLocation } from "@/hooks/useLocation";
import {
  convertApiCatalogToCatalogItem,
  convertApiHalteToHalteItem,
  convertApiPromoToPromoFlashItem,
} from "@/utils/dataConverters";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { AppState, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Les catégories seront définies dans le composant pour avoir accès aux données

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState<string>("catalogues");
  const router = useRouter();

  const handleNavigateToProfile = () => {
    router.push("/(tabs)/profil");
  };

  // Hooks personnalisés
  const {
    location,
    isLoading: locationLoading,
    refreshLocation,
  } = useLocation();
  const {
    catalogs,
    promoFlash,
    halteGachi,
    loadingCatalogs,
    loadingPromoFlash,
    loadingHalteGachi,
    loadCatalogs,
    loadPromoFlash,
    loadHalteGachi,
  } = useApiData();

  // Charger les données au montage du composant
  useEffect(() => {
    // Charger les catalogues (pas besoin de localisation)
    loadCatalogs();
  }, []);

  // Debug: Tracer les changements d'activeCategory
  useEffect(() => {
    console.log("🔍 DEBUG: activeCategory a changé vers:", activeCategory);
  }, [activeCategory]);

  // Recharger les promos et haltes quand la localisation est disponible
  useEffect(() => {
    if (location && !locationLoading) {
      // Vérifier que ce n'est pas la position par défaut (Paris)
      const isDefaultLocation =
        location.latitude === 48.8566 && location.longitude === 2.3522;

      if (!isDefaultLocation) {
        console.log(
          "📍 Vraie localisation GPS disponible, rechargement des promos et haltes..."
        );
        loadPromoFlash(location);
        loadHalteGachi(location);
      } else {
        console.log(
          "📍 Position par défaut détectée, attente de la vraie position GPS..."
        );
      }
    }
  }, [location, locationLoading]);

  // Recharger les données quand on change d'onglet SEULEMENT
  useEffect(() => {
    console.log("🔄 Changement d'onglet vers:", activeCategory);
    console.log("📍 Localisation disponible:", !!location);
    console.log("⏳ Localisation en cours de chargement:", locationLoading);

    if (activeCategory === "catalogues") {
      console.log("📚 Chargement des catalogues...");
      loadCatalogs();
    } else if (activeCategory === "promo") {
      console.log("🔥 Tentative de chargement des promos...");
      // Toujours charger les promos, même avec la position par défaut
      if (location && !locationLoading) {
        console.log("✅ Localisation OK, chargement des promos...");
        // Forcer l'utilisation de la vraie position GPS
        console.log("📍 Position utilisée pour les promos:", location);
        loadPromoFlash(location);
      } else {
        console.log("⚠️ Localisation non disponible pour les promos");
      }
    } else if (activeCategory === "halte") {
      console.log("♻️ Tentative de chargement des haltes...");
      // Toujours charger les haltes, même avec la position par défaut
      if (location && !locationLoading) {
        console.log("✅ Localisation OK, chargement des haltes...");
        // Forcer l'utilisation de la vraie position GPS
        console.log("📍 Position utilisée pour les haltes:", location);
        loadHalteGachi(location);
      } else {
        console.log("⚠️ Localisation non disponible pour les haltes");
      }
    }
  }, [activeCategory]); // SEULEMENT activeCategory, pas location ni locationLoading

  // Recharger les données quand l'app devient active (depuis une notification)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active") {
        console.log("📱 App devenue active - rechargement des données...");

        // Recharger les catalogues
        loadCatalogs();

        // Recharger les promos et haltes si la localisation est disponible
        if (location && !locationLoading) {
          const isDefaultLocation =
            location.latitude === 48.8566 && location.longitude === 2.3522;

          if (!isDefaultLocation) {
            console.log(
              "📍 Rechargement depuis notification - promos et haltes"
            );
            loadPromoFlash(location);
            loadHalteGachi(location);
          }
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [location, locationLoading, loadCatalogs, loadPromoFlash, loadHalteGachi]);

  // Préparer les données pour chaque catégorie (sans données mock)
  const cataloguesData = catalogs.map(convertApiCatalogToCatalogItem);
  const promoFlashData = promoFlash.map(convertApiPromoToPromoFlashItem);
  const halteGachiData = halteGachi.map(convertApiHalteToHalteItem);

  // Définir les catégories avec les données
  const categories: Category[] = [
    {
      id: "catalogues",
      label: "Catalogues",
      component: CataloguesContent,
      data: cataloguesData,
      loading: loadingCatalogs,
    },
    {
      id: "promo",
      label: "Promo Flash",
      component: PromoFlashContent,
      data: promoFlashData,
      loading: loadingPromoFlash,
    },
    {
      id: "halte",
      label: "Halte au gachi",
      component: HalteGachiContent,
      data: halteGachiData,
      loading: loadingHalteGachi,
    },
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: "transparent" }]}
      edges={["top", "left", "right"]}
    >
      <HomeHeader />
      <AnimatedCategoryTabs
        categories={categories}
        initialId={activeCategory}
        onNavigateToProfile={handleNavigateToProfile}
        onChange={(categoryId) => {
          setActiveCategory(categoryId);
          // Recharger les données selon la catégorie sélectionnée
          if (categoryId === "catalogues") {
            loadCatalogs();
          } else if (categoryId === "promo" && location) {
            // Vérifier que ce n'est pas la position par défaut
            const isDefaultLocation =
              location.latitude === 48.8566 && location.longitude === 2.3522;
            if (!isDefaultLocation) {
              loadPromoFlash(location);
            }
          } else if (categoryId === "halte" && location) {
            // Vérifier que ce n'est pas la position par défaut
            const isDefaultLocation =
              location.latitude === 48.8566 && location.longitude === 2.3522;
            if (!isDefaultLocation) {
              loadHalteGachi(location);
            }
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7F9",
  },
  listContent: {
    paddingBottom: 24,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
