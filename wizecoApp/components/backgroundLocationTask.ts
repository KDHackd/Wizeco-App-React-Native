import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { AppState } from "react-native";
import ApiService from "../services/ApiService";
import { AuthService } from "../services/AuthService";
import { LocationService } from "../services/LocationService";

const LOCATION_TASK_NAME = "BACKGROUND_LOCATION_TASK";

/**
 * Récupérer le token FCM
 */
async function getFCMToken(): Promise<string | null> {
  try {
    const tokenData = await Notifications.getDevicePushTokenAsync();
    return tokenData.data;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du token FCM:", error);
    return null;
  }
}

// Vérifier que la tâche n'est pas déjà définie
if (TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
  console.log("ℹ️ Tâche background déjà définie");
} else {
  console.log("🔧 Définition de la tâche background...");
}

// Définir la tâche qui s'exécute toutes les 30 secondes en arrière-plan
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("❌ Erreur background location:", error);
    return;
  }

  if (data) {
    // Vérifier que l'app est en arrière-plan
    const currentAppState = AppState.currentState;
    if (currentAppState !== "background") {
      console.log(
        `⏸️ App au premier plan (${currentAppState}) - tâche ignorée`
      );
      return;
    }

    console.log("✅ Tâche exécutée en arrière-plan (30s)");

    try {
      // Vérifier que l'utilisateur est connecté
      const authState = await AuthService.getAuthState();
      if (!authState.isConnected) {
        console.log("🔐 Utilisateur non connecté - tâche ignorée");
        return;
      }

      // Récupérer la position actuelle (sans demander les permissions)
      const currentLocation =
        await LocationService.getCurrentLocationWithoutPermission();
      if (!currentLocation) {
        console.log("❌ Impossible de récupérer la position en arrière-plan");
        return;
      }

      console.log("📍 Position en arrière-plan:", currentLocation);

      // Récupérer le token FCM pour les notifications
      const fcmToken = await getFCMToken();
      if (!fcmToken) {
        console.log("❌ Token FCM non disponible");
        return;
      }

      // Envoyer la position au serveur pour notifications
      const response = await ApiService.sendLocationForNotifications(
        currentLocation.latitude,
        currentLocation.longitude,
        fcmToken,
        100 // radius par défaut
      );

      console.log("📡 Position envoyée au serveur en arrière-plan:", response);
    } catch (err) {
      console.error("❌ Erreur tâche arrière-plan:", err);
    }
  }
});

console.log("✅ Tâche background définie avec succès:", LOCATION_TASK_NAME);

export const LOCATION_TASK_NAME_EXPORT = LOCATION_TASK_NAME;
