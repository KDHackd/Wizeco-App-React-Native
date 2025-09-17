import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const LOCATION_STORAGE_KEY = "@wizeco_user_location";

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export class LocationService {
  private static lastLocationRequest: number = 0;
  private static cachedLocation: UserLocation | null = null;
  private static readonly LOCATION_CACHE_DURATION = 30000; // 30 secondes de cache
  private static readonly REQUEST_COOLDOWN = 30000; // 30 secondes entre les requêtes

  /**
   * Sauvegarder la position de l'utilisateur
   */
  static async saveUserLocation(location: UserLocation): Promise<void> {
    try {
      await AsyncStorage.setItem(
        LOCATION_STORAGE_KEY,
        JSON.stringify(location)
      );
      console.log("💾 Position sauvegardée:", location);
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde de la position:", error);
    }
  }

  /**
   * Récupérer la position sauvegardée
   */
  static async getSavedUserLocation(): Promise<UserLocation | null> {
    try {
      const savedLocation = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      if (savedLocation) {
        const location = JSON.parse(savedLocation);
        console.log("📂 Position récupérée du stockage:", location);
        return location;
      }
      return null;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de la position:", error);
      return null;
    }
  }

  /**
   * Supprimer la position sauvegardée
   */
  static async clearSavedLocation(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
      console.log("🗑️ Position supprimée du stockage");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de la position:", error);
    }
  }

  /**
   * Récupérer une nouvelle position GPS fraîche (force une nouvelle récupération)
   * Utilisé partout dans l'app quand on a besoin d'une position à jour
   */
  static async getFreshLocation(): Promise<UserLocation | null> {
    try {
      console.log("🔄 Récupération d'une nouvelle position GPS fraîche...");

      // Vérifier les permissions d'abord
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("❌ Permission GPS non accordée pour récupération fraîche");
        return null;
      }

      // Récupérer une nouvelle position GPS
      const newLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      const userLocation: UserLocation = {
        latitude: newLocation.coords.latitude,
        longitude: newLocation.coords.longitude,
      };

      // Mettre à jour le cache
      this.cachedLocation = userLocation;
      this.lastLocationRequest = Date.now();

      // Sauvegarder la nouvelle position
      await this.saveUserLocation(userLocation);

      console.log("✅ Nouvelle position GPS fraîche récupérée:", userLocation);
      return userLocation;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération d'une position fraîche:",
        error
      );

      // Fallback vers la position sauvegardée
      const savedLocation = await this.getSavedUserLocation();
      if (savedLocation) {
        console.log("📍 Utilisation de la position sauvegardée en fallback");
        return savedLocation;
      }

      return null;
    }
  }

  /**
   * Récupérer la position GPS de l'utilisateur (sans demander les permissions)
   * Utilisé par la tâche background pour éviter les demandes répétées
   */
  static async getCurrentLocationWithoutPermission(): Promise<UserLocation | null> {
    try {
      // Utiliser la fonction centralisée pour récupérer une position fraîche
      console.log("📍 Récupération d'une position fraîche (background)");
      const freshLocation = await this.getFreshLocation();

      if (freshLocation) {
        console.log(
          "📍 Position fraîche récupérée (background):",
          freshLocation
        );
        return freshLocation;
      }

      // Si pas de position disponible, utiliser la position par défaut
      console.log(
        "📍 Aucune position disponible, utilisation de Paris par défaut (background)"
      );
      const defaultCoords: UserLocation = {
        latitude: 48.8566,
        longitude: 2.3522,
      };
      return defaultCoords;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération de la position (background):",
        error
      );
      const defaultCoords: UserLocation = {
        latitude: 48.8566,
        longitude: 2.3522,
      };
      return defaultCoords;
    }
  }

  /**
   * Récupérer la position GPS de l'utilisateur
   */
  static async getCurrentLocation(): Promise<UserLocation | null> {
    try {
      const stackTrace = new Error().stack?.split("\n")[2]?.trim() || "";
      console.log("🔍 DEBUG: getCurrentLocation() appelé depuis:", stackTrace);

      // Utiliser directement la fonction centralisée pour récupérer une position fraîche
      console.log("🔄 Récupération d'une position fraîche...");
      const freshLocation = await this.getFreshLocation();

      if (freshLocation) {
        console.log("✅ Position fraîche récupérée:", freshLocation);
        return freshLocation;
      }

      // Fallback vers la position par défaut
      console.log("📍 Utilisation de Paris par défaut");
      return {
        latitude: 48.8566,
        longitude: 2.3522,
      };
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération de la localisation:",
        error
      );
      // Mettre à jour le timestamp même en cas d'erreur
      this.lastLocationRequest = Date.now();
      return (
        this.cachedLocation || {
          latitude: 48.8566,
          longitude: 2.3522,
        }
      );
    }
  }

  /**
   * Récupérer la position (sauvegardée ou GPS)
   */
  static async getUserLocation(
    forceRefresh: boolean = false
  ): Promise<UserLocation> {
    try {
      // Si pas de refresh forcé, vérifier d'abord le stockage
      if (!forceRefresh) {
        const savedLocation = await this.getSavedUserLocation();
        if (savedLocation) {
          console.log(
            "✅ Position trouvée dans le stockage, utilisation de la position sauvegardée"
          );
          return savedLocation;
        }
      }

      console.log(
        "📍 Aucune position sauvegardée - récupération d'une position fraîche..."
      );

      // Utiliser la fonction centralisée pour récupérer une position fraîche
      const freshLocation = await this.getFreshLocation();

      if (freshLocation) {
        console.log("✅ Position fraîche récupérée:", freshLocation);
        return freshLocation;
      }

      // Fallback: Paris par défaut (sans sauvegarde pour forcer la demande GPS)
      console.log("📍 Utilisation de Paris par défaut (temporaire)");
      const defaultCoords: UserLocation = {
        latitude: 48.8566,
        longitude: 2.3522,
      };
      // Ne pas sauvegarder pour forcer la demande GPS au prochain démarrage
      return defaultCoords;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération de la localisation:",
        error
      );
      const defaultCoords: UserLocation = {
        latitude: 48.8566,
        longitude: 2.3522,
      };
      return defaultCoords;
    }
  }

  /**
   * Forcer une nouvelle récupération de position
   */
  static async refreshLocation(): Promise<UserLocation> {
    console.log("🔄 Réinitialisation de la position...");
    await this.clearSavedLocation();

    // Utiliser directement la fonction centralisée pour récupérer une position fraîche
    const freshLocation = await this.getFreshLocation();

    if (freshLocation) {
      console.log(
        "✅ Position fraîche récupérée après refresh:",
        freshLocation
      );
      return freshLocation;
    }

    // Fallback vers Paris par défaut
    console.log("📍 Utilisation de Paris par défaut après refresh");
    return {
      latitude: 48.8566,
      longitude: 2.3522,
    };
  }

  /**
   * Forcer la récupération GPS et supprimer la position sauvegardée
   */
  static async forceGPSLocation(): Promise<UserLocation> {
    try {
      console.log("🔄 Forçage de la récupération GPS...");

      // Supprimer la position sauvegardée
      await this.clearSavedLocation();

      // Utiliser la fonction centralisée pour récupérer une position fraîche
      const freshLocation = await this.getFreshLocation();

      if (freshLocation) {
        console.log(
          "✅ Position GPS fraîche récupérée et sauvegardée:",
          freshLocation
        );
        return freshLocation;
      }

      // Fallback si GPS échoue
      console.log("❌ GPS non disponible, utilisation de Paris par défaut");
      const defaultCoords: UserLocation = {
        latitude: 48.8566,
        longitude: 2.3522,
      };
      return defaultCoords;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération GPS forcée:", error);
      const defaultCoords: UserLocation = {
        latitude: 48.8566,
        longitude: 2.3522,
      };
      return defaultCoords;
    }
  }
}
