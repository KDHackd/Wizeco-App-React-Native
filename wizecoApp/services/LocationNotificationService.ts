import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import * as TaskManager from "expo-task-manager";
import { AppState, AppStateStatus } from "react-native";
import { LOCATION_TASK_NAME_EXPORT } from "../components/backgroundLocationTask";
import ApiService from "./ApiService";
import { AuthService } from "./AuthService";
import { LocationService, UserLocation } from "./LocationService";
import { PermissionService } from "./PermissionService";

export interface LocationNotificationConfig {
  updateInterval: number; // Intervalle en millisecondes (défaut: 5 minutes)
  distanceThreshold: number; // Distance minimale en mètres pour déclencher une mise à jour (défaut: 50m)
  radius: number; // Rayon de recherche pour les notifications (défaut: 100m)
  enabled: boolean; // Activer/désactiver le service
}

// Utiliser le nom de tâche depuis le fichier externe
const LOCATION_TASK_NAME = LOCATION_TASK_NAME_EXPORT;

// La tâche est maintenant définie dans backgroundLocationTask.ts

export class LocationNotificationService {
  private static instance: LocationNotificationService;
  private config: LocationNotificationConfig;
  private updateInterval: ReturnType<typeof setInterval> | null = null;
  private locationSubscription: Location.LocationSubscription | null = null;
  private lastKnownLocation: UserLocation | null = null;
  private isRunning: boolean = false;
  private currentAppState: AppStateStatus = AppState.currentState;
  private appStateSubscription: any = null;
  private lastRequestTime: number = 0;
  private requestCount: number = 0;
  private readonly REQUEST_COOLDOWN = 30000; // 30 secondes entre les requêtes
  private readonly MAX_REQUESTS_PER_MINUTE = 2; // Maximum 2 requêtes par minute (30s * 2 = 60s)

  private constructor() {
    this.config = {
      updateInterval: 30 * 1000, // 30 secondes
      distanceThreshold: 50, // 50 mètres
      radius: 100, // 100 mètres
      enabled: true,
    };

    // Configurer la gestion des notifications
    this.setupNotificationHandlers();
  }

  public static getInstance(): LocationNotificationService {
    if (!LocationNotificationService.instance) {
      LocationNotificationService.instance = new LocationNotificationService();
    }
    return LocationNotificationService.instance;
  }

  /**
   * Configurer le service
   */
  public configure(config: Partial<LocationNotificationConfig>): void {
    this.config = { ...this.config, ...config };
    console.log("🔧 Service configuré");
  }

  /**
   * Démarrer le service de géolocalisation en arrière-plan
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log("⚠️ Service de géolocalisation déjà en cours d'exécution");
      return;
    }

    if (!this.config.enabled) {
      console.log(
        "🚫 Service de géolocalisation désactivé dans la configuration"
      );
      return;
    }

    try {
      console.log(
        "🚀 Démarrage du service de géolocalisation en arrière-plan..."
      );

      // Vérifier les permissions
      const permissions = await PermissionService.checkAllPermissions();
      if (!permissions.location || !permissions.notifications) {
        console.log(
          "❌ Permissions manquantes pour le service de géolocalisation"
        );
        return;
      }

      // Récupérer la localisation actuelle et l'envoyer au serveur
      console.log("📍 Récupération de la localisation initiale...");
      const currentLocation = await LocationService.getFreshLocation();
      this.lastKnownLocation = currentLocation;
      console.log("📍 Localisation initiale récupérée:", currentLocation);

      // Envoyer immédiatement la position au serveur pour notifications push
      if (currentLocation) {
        console.log(
          "📤 Envoi de la position au serveur pour notifications push..."
        );
        await this.sendLocationUpdateInBackground(currentLocation);
      }

      console.log(
        "⏳ Service prêt - notifications toutes les 30s en arrière-plan uniquement"
      );

      // Démarrer la tâche en arrière-plan immédiatement (mais elle ne s'exécutera que quand l'app sera en arrière-plan)
      await this.startBackgroundTask();

      // Configurer l'écoute des changements d'état de l'app
      this.setupAppStateListener();

      this.isRunning = true;
      console.log("✅ Service démarré");
    } catch (error) {
      console.error("❌ Erreur lors du démarrage du service:", error);
    }
  }

  /**
   * Arrêter le service
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log("⚠️ Service de géolocalisation déjà arrêté");
      return;
    }

    console.log("🛑 Arrêt du service de géolocalisation...");

    // Arrêter la tâche en arrière-plan
    await this.stopBackgroundTask();

    // Nettoyer l'écoute des changements d'état
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
      console.log("👂 Écoute des changements d'état supprimée");
    }

    this.isRunning = false;
    console.log("✅ Service de géolocalisation arrêté");
  }

  /**
   * Démarrer le tracking en arrière-plan
   */
  private async startBackgroundLocationTracking(): Promise<void> {
    try {
      console.log("🚀 Démarrage du tracking en arrière-plan...");

      // Vérifier si la tâche est déjà en cours
      const isTaskDefined = TaskManager.isTaskDefined(LOCATION_TASK_NAME);
      console.log("🔍 Tâche définie:", isTaskDefined);
      if (!isTaskDefined) {
        console.log("❌ Tâche en arrière-plan non définie");
        return;
      }

      // Vérifier si la tâche est déjà en cours d'exécution
      const isTaskRunning = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      console.log("🔍 Tâche en cours:", isTaskRunning);
      if (isTaskRunning) {
        console.log("⚠️ Tracking en arrière-plan déjà en cours");
        return;
      }

      // Vérifier les permissions avant de démarrer
      const foregroundStatus = await Location.getForegroundPermissionsAsync();
      const backgroundStatus = await Location.getBackgroundPermissionsAsync();
      console.log("🔍 Permissions - Premier plan:", foregroundStatus.status);
      console.log("🔍 Permissions - Arrière-plan:", backgroundStatus.status);

      if (
        foregroundStatus.status !== "granted" ||
        backgroundStatus.status !== "granted"
      ) {
        console.log(
          "❌ Permissions insuffisantes pour le tracking en arrière-plan"
        );
        return;
      }

      // Démarrer le tracking en arrière-plan avec foreground service
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: this.config.updateInterval, // 30 secondes
        distanceInterval: this.config.distanceThreshold, // 50 mètres
        foregroundService: {
          notificationTitle: "🎯 Wizeco - Notifications actives",
          notificationBody:
            "Recevez des notifications de promotions à proximité",
          notificationColor: "#4CAF50",
          killServiceOnDestroy: false, // Empêcher Android de tuer le service
        },
        // Configuration pour forcer le démarrage en arrière-plan
        deferredUpdatesInterval: 0, // Pas de délai
        showsBackgroundLocationIndicator: true, // Afficher l'indicateur
      });

      console.log("✅ Tracking en arrière-plan démarré");
    } catch (error) {
      console.error("❌ Erreur démarrage tracking arrière-plan:", error);
    }
  }

  /**
   * Démarrer le tracking par changement de position
   */
  private startPositionTracking(): void {
    // Vérifier que le service est toujours actif avant de démarrer
    if (!this.isRunning) {
      console.log("⚠️ Service arrêté - tracking par position non démarré");
      return;
    }

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 30000, // 30 secondes
        distanceInterval: this.config.distanceThreshold,
      },
      async (location) => {
        // Vérifier que le service est toujours actif
        if (!this.isRunning) {
          console.log("⚠️ Service arrêté - arrêt du tracking par position");
          return;
        }

        try {
          const newLocation: UserLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          // Vérifier si la distance est significative
          if (this.shouldUpdateLocation(newLocation)) {
            await this.sendLocationUpdate(newLocation);
          }
        } catch (error) {
          console.error("❌ Erreur tracking position:", error);
          // Ne pas arrêter le service - continuer en arrière-plan
          console.log(
            "🔄 Service continue en arrière-plan malgré l'erreur de position"
          );
        }
      }
    ).then((subscription) => {
      this.locationSubscription = subscription;
    });
  }

  /**
   * Vérifier si la localisation doit être mise à jour
   */
  private shouldUpdateLocation(newLocation: UserLocation): boolean {
    if (!this.lastKnownLocation) {
      return true;
    }

    // Calculer la distance entre les deux points
    const distance = this.calculateDistance(
      this.lastKnownLocation,
      newLocation
    );

    // Logs réduits

    return distance >= this.config.distanceThreshold;
  }

  /**
   * Calculer la distance entre deux points (formule de Haversine)
   */
  private calculateDistance(
    point1: UserLocation,
    point2: UserLocation
  ): number {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Envoyer la localisation au serveur et mettre à jour le stockage local
   */
  private async sendLocationUpdate(location: UserLocation): Promise<void> {
    try {
      // Circuit breaker - empêcher les requêtes en boucle
      const now = Date.now();
      if (
        now - this.lastRequestTime < this.REQUEST_COOLDOWN &&
        this.lastRequestTime > 0
      ) {
        console.log("⏳ Cooldown actif - requête ignorée");
        return;
      }

      // Reset du compteur toutes les minutes
      if (now - this.lastRequestTime > 60000) {
        this.requestCount = 0;
      }

      // Vérifier le nombre maximum de requêtes
      if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
        console.log("🚫 Limite de requêtes atteinte - circuit breaker activé");
        return;
      }

      this.lastRequestTime = now;
      this.requestCount++;

      // Logs réduits pour éviter le spam
      console.log("📤 Envoi localisation...");

      // 0. Vérifier que l'utilisateur est connecté ET a un token JWT
      const authState = await AuthService.getAuthState();
      if (!authState.isConnected) {
        console.log(
          "🔐 Utilisateur non connecté - sauvegarde locale uniquement"
        );
        // Sauvegarder localement mais ne pas envoyer au serveur
        await LocationService.saveUserLocation(location);
        console.log(
          "✅ Localisation sauvegardée localement (utilisateur non connecté)"
        );
        return;
      }

      // Vérifier que l'utilisateur a bien un token JWT
      try {
        const token = await ApiService.getToken();
        if (!token) {
          console.log(
            "🔐 Utilisateur connecté mais sans token JWT - sauvegarde locale uniquement"
          );
          await LocationService.saveUserLocation(location);
          console.log(
            "✅ Localisation sauvegardée localement (pas de token JWT)"
          );
          return;
        }
      } catch (error) {
        console.log(
          "🔐 Erreur lors de la vérification du token - sauvegarde locale uniquement"
        );
        await LocationService.saveUserLocation(location);
        console.log("✅ Localisation sauvegardée localement (erreur token)");
        return;
      }

      console.log(
        "✅ Utilisateur connecté avec token JWT - envoi au serveur autorisé"
      );

      // 1. Mettre à jour le stockage local
      await LocationService.saveUserLocation(location);

      // 2. Récupérer le token FCM
      const fcmToken = await this.getFCMToken();
      if (!fcmToken) {
        console.log("⚠️ Token FCM non disponible");
        return;
      }

      // 3. Envoyer au serveur pour les notifications (avec gestion d'erreur)
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 20000)
        );

        const sendPromise = ApiService.sendLocationForNotifications(
          location.latitude,
          location.longitude,
          fcmToken,
          this.config.radius,
          AppState.currentState === "active"
        );

        await Promise.race([sendPromise, timeoutPromise]);
        console.log("✅ Localisation envoyée");
      } catch (serverError) {
        console.error(
          "❌ Erreur serveur (timeout ou erreur réseau):",
          serverError instanceof Error
            ? serverError.message
            : String(serverError)
        );
        console.log("🔄 Arrêt temporaire des envois pour éviter le spam");
        // Ne pas arrêter le service - juste ignorer les envois temporairement
        // Le service continuera de tourner en arrière-plan pour les notifications
        return;
      }

      // 4. Mettre à jour la dernière position connue
      this.lastKnownLocation = location;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la mise à jour de la localisation:",
        error
      );
    }
  }

  /**
   * Récupérer le token FCM
   */
  private async getFCMToken(): Promise<string | null> {
    try {
      const tokenData = await Notifications.getDevicePushTokenAsync();
      return tokenData.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du token FCM:", error);
      return null;
    }
  }

  /**
   * Forcer une mise à jour immédiate
   */
  public async forceUpdate(): Promise<void> {
    try {
      const currentLocation = await LocationService.getFreshLocation();
      if (currentLocation) {
        await this.sendLocationUpdate(currentLocation);
      }
    } catch (error) {
      console.error("❌ Erreur mise à jour forcée:", error);
    }
  }

  /**
   * Envoyer la localisation en arrière-plan (sans circuit breaker)
   */
  public async sendLocationUpdateInBackground(
    location: UserLocation
  ): Promise<void> {
    try {
      console.log("📤 Envoi localisation en arrière-plan...");

      // 0. Vérifier que l'utilisateur est connecté ET a un token JWT
      const authState = await AuthService.getAuthState();
      if (!authState.isConnected) {
        console.log(
          "🔐 Utilisateur non connecté - sauvegarde locale uniquement"
        );
        await LocationService.saveUserLocation(location);
        return;
      }

      // Vérifier que l'utilisateur a bien un token JWT
      try {
        const token = await ApiService.getToken();
        if (!token) {
          console.log(
            "🔐 Utilisateur connecté mais sans token JWT - sauvegarde locale uniquement"
          );
          await LocationService.saveUserLocation(location);
          return;
        }
      } catch (error) {
        console.log(
          "🔐 Erreur lors de la vérification du token - sauvegarde locale uniquement"
        );
        await LocationService.saveUserLocation(location);
        return;
      }

      // 1. Mettre à jour le stockage local
      await LocationService.saveUserLocation(location);

      // 2. Récupérer le token FCM
      const fcmToken = await this.getFCMToken();
      if (!fcmToken) {
        console.log("❌ Token FCM non disponible");
        return;
      }

      // 3. Envoyer au serveur
      const response = await ApiService.sendLocationForNotifications(
        location.latitude,
        location.longitude,
        fcmToken,
        this.config.radius,
        AppState.currentState === "active"
      );

      console.log(
        "✅ Localisation envoyée en arrière-plan avec succès:",
        response
      );
    } catch (error) {
      console.error("❌ Erreur envoi localisation arrière-plan:", error);
    }
  }

  /**
   * Obtenir le statut du service
   */
  public getStatus(): {
    isRunning: boolean;
    lastKnownLocation: UserLocation | null;
    config: LocationNotificationConfig;
  } {
    return {
      isRunning: this.isRunning,
      lastKnownLocation: this.lastKnownLocation,
      config: this.config,
    };
  }

  /**
   * Tester le service en arrière-plan
   */
  public async testBackgroundService(): Promise<void> {
    try {
      console.log("🧪 Test du service en arrière-plan...");

      // Vérifier les permissions
      const foregroundStatus = await Location.getForegroundPermissionsAsync();
      const backgroundStatus = await Location.getBackgroundPermissionsAsync();
      console.log(
        "🔍 Test - Permissions premier plan:",
        foregroundStatus.status
      );
      console.log(
        "🔍 Test - Permissions arrière-plan:",
        backgroundStatus.status
      );

      // Vérifier si la tâche est définie
      const isTaskDefined = TaskManager.isTaskDefined(LOCATION_TASK_NAME);
      console.log("🔍 Test - Tâche définie:", isTaskDefined);

      // Vérifier si la tâche est en cours
      const isTaskRunning = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      console.log("🔍 Test - Tâche en cours:", isTaskRunning);

      // Tester l'envoi d'une localisation
      const testLocation: UserLocation = {
        latitude: 6.4586827,
        longitude: 2.3402409,
      };

      console.log("🧪 Test d'envoi de localisation...");
      await this.sendLocationUpdateInBackground(testLocation);

      console.log("✅ Test du service terminé");
    } catch (error) {
      console.error("❌ Erreur lors du test:", error);
    }
  }

  /**
   * Demander à l'utilisateur de désactiver l'optimisation de la batterie
   */
  public async requestBatteryOptimizationDisable(): Promise<void> {
    try {
      console.log(
        "🔋 Demande de désactivation de l'optimisation de la batterie..."
      );

      // Cette fonctionnalité nécessite une configuration native Android
      // Pour l'instant, on affiche juste un message informatif
      console.log("📱 Pour recevoir des notifications en arrière-plan :");
      console.log(
        "1. Allez dans Paramètres > Batterie > Optimisation de la batterie"
      );
      console.log("2. Trouvez 'Wizeco' dans la liste");
      console.log("3. Sélectionnez 'Ne pas optimiser'");
      console.log("4. Confirmez votre choix");
    } catch (error) {
      console.error("❌ Erreur lors de la demande d'optimisation:", error);
    }
  }

  /**
   * Envoyer la position au serveur pour notifications push (approche alternative)
   */
  public async sendLocationForPushNotifications(): Promise<void> {
    try {
      console.log("📤 Envoi de la position pour notifications push...");

      const currentLocation = await LocationService.getFreshLocation();
      if (!currentLocation) {
        console.log("❌ Impossible de récupérer la position");
        return;
      }

      // Vérifier que l'utilisateur est connecté
      const authState = await AuthService.getAuthState();
      if (!authState.isConnected) {
        console.log("🔐 Utilisateur non connecté - envoi impossible");
        return;
      }

      // Envoyer au serveur
      await this.sendLocationUpdateInBackground(currentLocation);
      console.log("✅ Position envoyée au serveur pour notifications push");
    } catch (error) {
      console.error("❌ Erreur envoi position pour push:", error);
    }
  }

  /**
   * Configurer la gestion des notifications
   */
  private setupNotificationHandlers(): void {
    // Gérer les clics sur les notifications
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("🔔 Notification cliquée:", response);

      // Désactiver complètement le service
      this.stop();
      console.log(
        "🛑 Service complètement désactivé après clic sur notification"
      );

      // Rediriger vers l'onglet Home (page d'accueil)
      try {
        router.push("/(tabs)" as any);
        console.log("✅ Redirection vers l'onglet Home (page d'accueil)");
      } catch (error) {
        console.error("❌ Erreur redirection:", error);
      }
    });

    // Gérer les notifications reçues en arrière-plan
    Notifications.addNotificationReceivedListener((notification) => {
      console.log("🔔 Notification reçue:", notification);
    });

    console.log("🔔 Gestionnaires de notifications configurés");
  }

  /**
   * Configurer l'écoute des changements d'état de l'application
   */
  private setupAppStateListener(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }

    this.appStateSubscription = AppState.addEventListener(
      "change",
      this.handleAppStateChange.bind(this)
    );
    console.log("👂 Écoute des changements d'état de l'app configurée");
  }

  /**
   * Gérer les changements d'état de l'application
   */
  private async handleAppStateChange(
    nextAppState: AppStateStatus
  ): Promise<void> {
    console.log(
      `📱 Changement d'état: ${this.currentAppState} → ${nextAppState}`
    );

    if (
      this.currentAppState.match(/active/) &&
      nextAppState.match(/background/)
    ) {
      console.log(
        "📤 App en arrière-plan → vérification de la tâche background"
      );
      // Vérifier que le service est toujours en cours d'exécution
      if (this.isRunning) {
        // Vérifier si la tâche est déjà enregistrée
        const isRegistered = await TaskManager.isTaskRegisteredAsync(
          LOCATION_TASK_NAME
        );
        if (isRegistered) {
          console.log("✅ Tâche background déjà active");
        } else {
          console.log(
            "⚠️ Tâche background non enregistrée, redémarrage reporté"
          );
        }
      } else {
        console.log("⚠️ Service arrêté, redémarrage complet nécessaire");
        // Redémarrer le service complet si nécessaire
        await this.start();
      }
    }

    if (
      this.currentAppState.match(/background/) &&
      nextAppState.match(/active/)
    ) {
      console.log("📥 App au premier plan → arrêt de la tâche background");
      await this.stopBackgroundTask();
      // Le service reste actif (isRunning = true), on redémarrera la tâche quand l'app repassera en arrière-plan
      console.log(`🔄 Service toujours actif: ${this.isRunning}`);
    }

    this.currentAppState = nextAppState;
  }

  /**
   * Démarrer la tâche en arrière-plan (30s)
   */
  private async startBackgroundTask(): Promise<void> {
    try {
      console.log(`📱 État actuel de l'app: ${AppState.currentState}`);

      // Vérifier si la tâche est déjà enregistrée
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        LOCATION_TASK_NAME
      );

      if (isRegistered) {
        console.log("✅ Tâche background déjà enregistrée");
        return;
      }

      // Ne pas essayer de démarrer la tâche si l'app est en arrière-plan
      if (AppState.currentState !== "active") {
        console.log("⚠️ App en arrière-plan, démarrage de la tâche reporté");
        return;
      }

      console.log("🚀 Démarrage de la tâche background...");
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 30000, // ⏱ toutes les 30s
        distanceInterval: 0, // peu importe la distance
        showsBackgroundLocationIndicator: true, // iOS
        foregroundService: {
          notificationTitle: "🎯 Wizeco - Notifications actives",
          notificationBody: "Exécution toutes les 30 secondes en arrière-plan",
          notificationColor: "#4CAF50",
          killServiceOnDestroy: false,
        },
      });
      console.log("✅ Tâche background 30s démarrée");
    } catch (error) {
      console.error("❌ Erreur démarrage tâche background:", error);

      // Si l'erreur est liée au foreground service, réessayer plus tard
      if (
        error instanceof Error &&
        error.message.includes("foreground service")
      ) {
        console.log("🔄 Réessai du démarrage de la tâche dans 2 secondes...");
        setTimeout(async () => {
          // Ne réessayer que si l'app est au premier plan
          if (AppState.currentState === "active") {
            await this.startBackgroundTask();
          } else {
            console.log("⚠️ App en arrière-plan, réessai reporté");
          }
        }, 2000);
      }
      // Si la tâche n'est pas trouvée, c'est normal, on continue
      else if (
        error instanceof Error &&
        error.message.includes("TaskNotFoundException")
      ) {
        console.log("ℹ️ Tâche background non trouvée, redémarrage nécessaire");
        // Essayer de redémarrer la tâche
        setTimeout(async () => {
          // Ne réessayer que si l'app est au premier plan
          if (AppState.currentState === "active") {
            await this.startBackgroundTask();
          } else {
            console.log("⚠️ App en arrière-plan, redémarrage reporté");
          }
        }, 1000);
      }
    }
  }

  /**
   * Arrêter la tâche en arrière-plan
   */
  private async stopBackgroundTask(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        LOCATION_TASK_NAME
      );
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        console.log("🛑 Tâche background arrêtée");
      } else {
        console.log("ℹ️ Tâche background déjà arrêtée ou non enregistrée");
      }
    } catch (error) {
      // Si la tâche n'est pas trouvée, c'est normal, on continue
      if (
        error instanceof Error &&
        error.message.includes("TaskNotFoundException")
      ) {
        console.log("ℹ️ Tâche background déjà supprimée");
      } else {
        console.error("❌ Erreur arrêt tâche background:", error);
      }
    }
  }

  /**
   * Forcer le redémarrage du service en arrière-plan
   */
  public async forceRestartBackgroundService(): Promise<void> {
    try {
      console.log("🔄 Forçage du redémarrage du service en arrière-plan...");

      // Arrêter le service s'il est en cours
      if (this.isRunning) {
        await this.stop();
        console.log("⏹️ Service arrêté");
      }

      // Attendre un peu
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redémarrer le service
      await this.start();
      console.log("✅ Service redémarré avec succès");
    } catch (error) {
      console.error("❌ Erreur redémarrage service:", error);
    }
  }
}

// Export de l'instance singleton
export default LocationNotificationService.getInstance();
