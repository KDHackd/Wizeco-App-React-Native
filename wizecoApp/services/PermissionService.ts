import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface PermissionResult {
  location: boolean;
  notifications: boolean;
  expoToken: string | null;
}

export class PermissionService {
  /**
   * Demande les permissions dans l'ordre (GPS puis Notifications)
   */
  static async requestAllPermissions(): Promise<PermissionResult> {
    console.log("🔐 Début de la demande des permissions...");

    const result: PermissionResult = {
      location: false,
      notifications: false,
      expoToken: null,
    };

    try {
      // 1. Demander la permission de localisation
      console.log("📍 1/2 - Demande de permission GPS...");
      result.location = await this.requestLocationPermission();

      if (result.location) {
        console.log("✅ Permission GPS accordée");

        // 2. Demander la permission de notification
        console.log("🔔 2/2 - Demande de permission de notification...");
        result.notifications = await this.requestNotificationPermission();

        if (result.notifications) {
          console.log("✅ Permission de notification accordée");

          // 3. Générer le token Expo Push
          console.log("🔑 Génération du token Expo Push...");
          result.expoToken = await this.generateExpoToken();

          if (result.expoToken) {
            console.log("✅ Token Expo Push généré:", result.expoToken);
          }
        }
      }

      console.log("🎯 Résultat des permissions:", result);
      return result;
    } catch (error) {
      console.error("❌ Erreur lors de la demande des permissions:", error);
      return result;
    }
  }

  /**
   * Demande la permission de localisation
   */
  private static async requestLocationPermission(): Promise<boolean> {
    try {
      // Vérifier si les services de localisation sont disponibles
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        console.log("❌ Services de localisation désactivés");
        return false;
      }

      // D'abord demander la permission de premier plan
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      console.log(
        "📍 Statut de la permission GPS (premier plan):",
        foregroundStatus
      );

      if (foregroundStatus !== "granted") {
        console.log("❌ Permission GPS (premier plan) refusée");
        return false;
      }

      // Puis demander la permission d'arrière-plan
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      console.log(
        "📍 Statut de la permission GPS (arrière-plan):",
        backgroundStatus
      );

      if (backgroundStatus !== "granted") {
        console.log("❌ Permission GPS (arrière-plan) refusée");
        return false;
      }

      console.log("✅ Toutes les permissions GPS accordées");
      return true;
    } catch (error) {
      console.error("❌ Erreur lors de la demande de permission GPS:", error);
      return false;
    }
  }

  /**
   * Demande la permission de notification (selon la documentation officielle)
   */
  private static async requestNotificationPermission(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.log(
          "❌ Doit utiliser un appareil physique pour les notifications"
        );
        return false;
      }

      // Vérifier le statut existant
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Demander la permission si nécessaire
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      console.log("🔔 Statut de la permission de notification:", finalStatus);
      return finalStatus === "granted";
    } catch (error) {
      console.error(
        "❌ Erreur lors de la demande de permission de notification:",
        error
      );
      return false;
    }
  }

  /**
   * Génère le token Expo Push (selon la documentation officielle)
   */
  private static async generateExpoToken(): Promise<string | null> {
    try {
      // Configuration du canal Android (selon la doc officielle)
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      // Obtenir le projectId (selon la doc officielle)
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        console.error("❌ Project ID not found");
        return null;
      }

      console.log("🔍 Project ID:", projectId);

      // Générer le token FCM Direct (selon la doc officielle)
      const pushTokenString = (await Notifications.getDevicePushTokenAsync())
        .data;

      console.log("✅ Token FCM généré:", pushTokenString);

      // Vérifier le format (FCM token)
      if (
        !pushTokenString ||
        (typeof pushTokenString === "string" && pushTokenString.length < 10)
      ) {
        console.error("❌ Format de token FCM invalide:", pushTokenString);
        return null;
      }

      return pushTokenString;
    } catch (error) {
      console.error("❌ Erreur lors de la génération du token FCM:", error);

      // En mode développement, retourner un token de test FCM
      if (__DEV__) {
        console.log("🔧 Mode développement - Token FCM de test généré");
        return "FCM-DEV-MODE-TOKEN-FOR-TESTING-123456789";
      }

      return null;
    }
  }

  /**
   * Vérifie si toutes les permissions sont accordées
   */
  static async checkAllPermissions(): Promise<PermissionResult> {
    const result: PermissionResult = {
      location: false,
      notifications: false,
      expoToken: null,
    };

    try {
      // Vérifier la permission GPS (premier plan ET arrière-plan)
      const foregroundStatus = await Location.getForegroundPermissionsAsync();
      const backgroundStatus = await Location.getBackgroundPermissionsAsync();

      result.location =
        foregroundStatus.status === "granted" &&
        backgroundStatus.status === "granted";

      console.log("📍 Permission GPS (premier plan):", foregroundStatus.status);
      console.log("📍 Permission GPS (arrière-plan):", backgroundStatus.status);

      // Vérifier la permission de notification
      const notificationStatus = await Notifications.getPermissionsAsync();
      result.notifications = notificationStatus.status === "granted";

      console.log("🔍 Vérification des permissions:", result);
      return result;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la vérification des permissions:",
        error
      );
      return result;
    }
  }
}
