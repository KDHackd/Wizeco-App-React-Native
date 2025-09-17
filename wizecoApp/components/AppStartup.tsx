import {
  PermissionResult,
  PermissionService,
} from "@/services/PermissionService";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AppStartupProps {
  onPermissionsReady: (result: PermissionResult) => void;
}

export default function AppStartup({ onPermissionsReady }: AppStartupProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState("");
  const [permissionsResult, setPermissionsResult] =
    useState<PermissionResult | null>(null);
  const [showPermissionError, setShowPermissionError] = useState(false);

  useEffect(() => {
    requestPermissionsOnStartup();
  }, []);

  const requestPermissionsOnStartup = async () => {
    try {
      setIsLoading(true);

      // Étape 1: Vérifier les permissions existantes
      setCurrentStep("Vérification des permissions...");
      console.log("🚀 Démarrage de l'app - Vérification des permissions");

      const existingPermissions = await PermissionService.checkAllPermissions();

      // Si toutes les permissions sont déjà accordées, continuer
      if (
        existingPermissions.location &&
        existingPermissions.notifications &&
        existingPermissions.expoToken
      ) {
        console.log("✅ Toutes les permissions sont déjà accordées");
        console.log("✅ Service sera démarré lors de la connexion utilisateur");
        setCurrentStep("Permissions accordées !");
        setTimeout(() => {
          onPermissionsReady(existingPermissions);
        }, 1000);
        return;
      }

      // Étape 2: Demander les permissions manquantes
      setCurrentStep("Demande des permissions...");
      console.log("🔐 Demande des permissions manquantes");

      const result = await PermissionService.requestAllPermissions();

      // Étape 3: Résultat
      setPermissionsResult(result);

      if (result.location && result.notifications && result.expoToken) {
        setCurrentStep("✅ Toutes les permissions accordées !");
        console.log("🎯 Toutes les permissions accordées au démarrage");

        // Continuer après 2 secondes
        setTimeout(() => {
          onPermissionsReady(result);
        }, 2000);
      } else {
        setCurrentStep("❌ Permissions manquantes");
        console.log("❌ Permissions manquantes:", result);
        setShowPermissionError(true);
        setIsLoading(false);
        // NE PAS continuer - bloquer l'accès à l'app
      }
    } catch (error) {
      console.error(
        "❌ Erreur lors de la demande des permissions au démarrage:",
        error
      );
      setCurrentStep("❌ Erreur de permissions");
      setShowPermissionError(true);
      setIsLoading(false);
      // NE PAS continuer en cas d'erreur - bloquer l'accès à l'app
    }
  };

  const handleRetryPermissions = async () => {
    setShowPermissionError(false);
    setIsLoading(true);
    setCurrentStep("Nouvelle tentative...");

    try {
      // Forcer une nouvelle demande de permissions (ignorer le cooldown)
      console.log("🔄 Retry des permissions - demande forcée");
      const result = await PermissionService.requestAllPermissions();

      setPermissionsResult(result);

      if (result.location && result.notifications && result.expoToken) {
        setCurrentStep("✅ Toutes les permissions accordées !");
        console.log("🎯 Toutes les permissions accordées au retry");

        // Continuer après 2 secondes
        setTimeout(() => {
          onPermissionsReady(result);
        }, 2000);
      } else {
        setCurrentStep("❌ Permissions manquantes");
        console.log("❌ Permissions manquantes au retry:", result);
        setShowPermissionError(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("❌ Erreur lors du retry des permissions:", error);
      setCurrentStep("❌ Erreur de permissions");
      setShowPermissionError(true);
      setIsLoading(false);
    }
  };

  const getMissingPermissionsText = () => {
    if (!permissionsResult) return "";

    const missing = [];
    if (!permissionsResult.location) missing.push("📍 Localisation GPS");
    if (!permissionsResult.notifications) missing.push("🔔 Notifications");
    if (!permissionsResult.expoToken) missing.push("📱 Token de notification");

    return missing.join(", ");
  };

  const getPermissionExplanation = () => {
    if (!permissionsResult) return "";

    const explanations = [];
    if (!permissionsResult.location) {
      explanations.push(
        "• La localisation GPS est nécessaire pour vous proposer des promotions et offres à proximité de votre position"
      );
    }
    if (!permissionsResult.notifications) {
      explanations.push(
        "• Les notifications vous permettent de recevoir des alertes sur les offres spéciales et promotions"
      );
    }

    return explanations.join("\n");
  };

  if (showPermissionError) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Wizeco</Text>
          <Text style={styles.subtitle}>Permissions requises</Text>

          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Permissions manquantes</Text>
            <Text style={styles.errorSubtitle}>
              Les permissions suivantes sont nécessaires :
            </Text>
            <Text style={styles.missingPermissions}>
              {getMissingPermissionsText()}
            </Text>
          </View>

          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>
              Pourquoi ces permissions ?
            </Text>
            <Text style={styles.explanationText}>
              {getPermissionExplanation()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetryPermissions}
          >
            <Text style={styles.retryButtonText}>
              🔄 Réessayer les permissions
            </Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            Si le problème persiste, vous pouvez activer manuellement les
            permissions dans les paramètres de votre appareil.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Wizeco</Text>
        <Text style={styles.subtitle}>Chargement...</Text>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={styles.stepText}>{currentStep}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            📍 Localisation pour les promos à proximité
          </Text>
          <Text style={styles.infoText}>
            🔔 Notifications pour les offres spéciales
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#E53935",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 40,
  },
  loadingContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  stepText: {
    fontSize: 14,
    color: "#333333",
    marginTop: 16,
    textAlign: "center",
  },
  infoContainer: {
    alignItems: "center",
  },
  infoText: {
    fontSize: 12,
    color: "#888888",
    marginBottom: 4,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#FFF3E0",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  errorIcon: {
    fontSize: 32,
    textAlign: "center",
    marginBottom: 10,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E65100",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#BF360C",
    textAlign: "center",
    marginBottom: 10,
  },
  missingPermissions: {
    fontSize: 14,
    color: "#D84315",
    textAlign: "center",
    fontWeight: "600",
  },
  explanationContainer: {
    backgroundColor: "#F3E5F5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A148C",
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 13,
    color: "#6A1B9A",
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: "#E53935",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  helpText: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
    fontStyle: "italic",
  },
});
