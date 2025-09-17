import { LocationService, UserLocation } from "@/services/LocationService";
import {
  PermissionResult,
  PermissionService,
} from "@/services/PermissionService";
import { useEffect, useState } from "react";

export interface UseLocationReturn {
  location: UserLocation | null;
  isLoading: boolean;
  hasPermission: boolean;
  refreshLocation: () => Promise<void>;
  requestAllPermissions: () => Promise<PermissionResult>;
  permissionResult: PermissionResult | null;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [permissionResult, setPermissionResult] =
    useState<PermissionResult | null>(null);

  const loadLocation = async (forceRefresh: boolean = false) => {
    try {
      setIsLoading(true);
      console.log("🔄 Chargement de la localisation...");

      // Toujours forcer le refresh GPS pour avoir la vraie position
      const userLocation = await LocationService.forceGPSLocation();

      // Vérifier si c'est la position par défaut
      const isDefaultLocation =
        userLocation.latitude === 48.8566 && userLocation.longitude === 2.3522;

      if (isDefaultLocation) {
        console.log(
          "⚠️ Position par défaut détectée, tentative de récupération GPS..."
        );
        // Essayer de récupérer la vraie position GPS fraîche
        const gpsLocation = await LocationService.getFreshLocation();
        if (
          gpsLocation &&
          !(
            gpsLocation.latitude === 48.8566 && gpsLocation.longitude === 2.3522
          )
        ) {
          console.log("✅ Vraie position GPS récupérée:", gpsLocation);
          setLocation(gpsLocation);
        } else {
          console.log(
            "⚠️ GPS non disponible, utilisation de la position par défaut"
          );
          setLocation(userLocation);
        }
      } else {
        console.log("✅ Vraie position GPS utilisée:", userLocation);
        setLocation(userLocation);
      }

      setHasPermission(true);
    } catch (error) {
      console.error("❌ Erreur lors du chargement de la localisation:", error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLocation = async () => {
    await loadLocation(true);
  };

  const requestAllPermissions = async (): Promise<PermissionResult> => {
    try {
      setIsLoading(true);
      console.log("🔐 Demande de toutes les permissions...");

      const result = await PermissionService.requestAllPermissions();
      setPermissionResult(result);

      // Si la permission GPS est accordée, charger la localisation
      if (result.location) {
        await loadLocation(true);
      }

      return result;
    } catch (error) {
      console.error("❌ Erreur lors de la demande des permissions:", error);
      return {
        location: false,
        notifications: false,
        expoToken: null,
      };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Vérifier les permissions existantes au démarrage
    const checkPermissions = async () => {
      try {
        const result = await PermissionService.checkAllPermissions();
        setPermissionResult(result);

        // Si la permission GPS est accordée, charger la localisation
        if (result.location) {
          await loadLocation();
        }
      } catch (error) {
        console.error(
          "❌ Erreur lors de la vérification des permissions:",
          error
        );
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, []);

  return {
    location,
    isLoading,
    hasPermission,
    refreshLocation,
    requestAllPermissions,
    permissionResult,
  };
};
