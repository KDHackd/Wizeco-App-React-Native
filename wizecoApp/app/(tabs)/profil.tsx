import ErrorModal from "@/components/ErrorModal";
import HomeHeader from "@/components/HomeHeader";
import LogoutConfirmationModal from "@/components/LogoutConfirmationModal";
import SuccessModal from "@/components/SuccessModal";
import { useAuth } from "@/contexts/AuthContext";
import { AuthService } from "@/services/AuthService";
import LocationNotificationService from "@/services/LocationNotificationService";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfilScreen() {
  const { isConnected, user: userData, isLoading, login, logout } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset l'erreur d'image quand les données utilisateur changent
  useEffect(() => {
    if (userData?.picture) {
      setImageError(false);
    }
  }, [userData?.picture]);

  const handleGoogleLogin = async () => {
    try {
      setIsConnecting(true);

      // Utiliser le Google Sign-In
      const user = await AuthService.signInWithGoogle();
      if (user) {
        console.log("🎉 Profil - Connexion réussie, données utilisateur:", {
          name: user.name,
          given_name: user.given_name,
          family_name: user.family_name,
          email: user.email,
          picture: user.picture,
        });

        // Mettre à jour l'état global via le contexte
        await login(user);

        // Afficher le modal de succès
        setSuccessMessage(
          `Bienvenue ${user.given_name || user.name || "Utilisateur"} !`
        );
        setShowSuccessModal(true);
      } else {
        setErrorMessage("Échec de la connexion Google");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Erreur Google Login:", error);
      setErrorMessage("Une erreur est survenue lors de la connexion");
      setShowErrorModal(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAppleLogin = () => {
    // TODO: Implémenter la connexion Apple
    console.log("Connexion Apple");
    setErrorMessage("Connexion Apple non implémentée pour le moment");
    setShowErrorModal(true);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    try {
      setShowLogoutModal(false);
      // Déconnexion via le contexte
      await logout();

      // Afficher le modal de succès
      setSuccessMessage("Vous avez été déconnecté avec succès");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setErrorMessage("Une erreur est survenue lors de la déconnexion");
      setShowErrorModal(true);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  const handleTestBackgroundService = async () => {
    try {
      console.log("🧪 Test du service en arrière-plan...");
      await LocationNotificationService.testBackgroundService();
    } catch (error) {
      console.error("❌ Erreur test service:", error);
    }
  };

  const handleBatteryOptimization = async () => {
    try {
      console.log(
        "🔋 Demande de désactivation de l'optimisation de la batterie..."
      );
      await LocationNotificationService.requestBatteryOptimizationDisable();
    } catch (error) {
      console.error("❌ Erreur optimisation batterie:", error);
    }
  };

  const handleSendLocation = async () => {
    try {
      console.log("📤 Envoi manuel de la position...");
      await LocationNotificationService.sendLocationForPushNotifications();
    } catch (error) {
      console.error("❌ Erreur envoi position:", error);
    }
  };

  const handleForceRestart = async () => {
    try {
      console.log("🔄 Forçage du redémarrage du service...");
      await LocationNotificationService.forceRestartBackgroundService();
    } catch (error) {
      console.error("❌ Erreur redémarrage service:", error);
    }
  };

  // Données utilisateur par défaut pour l'affichage
  const displayUserData = userData
    ? {
        name: userData.name || "Utilisateur",
        initial: userData.given_name?.[0] || userData.name?.[0] || "U",
        avatarColor: "#FFD700", // Jaune
      }
    : {
        name: "Utilisateur",
        initial: "U",
        avatarColor: "#FFD700",
      };

  // Debug des données utilisateur
  console.log("🔍 Debug affichage - userData:", userData);

  // Afficher un indicateur de chargement pendant le chargement initial
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: "transparent" }]}
        edges={["top", "left", "right"]}
      >
        <HomeHeader title="Profil" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: "transparent" }]}
      edges={["top", "left", "right"]}
    >
      <HomeHeader title="Profil" />

      {/* Contenu principal */}
      <View style={styles.content}>
        {!isConnected ? (
          // État non connecté
          <>
            {/* Illustration */}
            <Image
              source={require("@/assets/images/profilImgNoConnect.png")}
              resizeMode="contain"
              style={styles.illustration}
            />

            {/* Boutons de connexion */}
            <View style={styles.loginButtons}>
              {/* Bouton Google */}
              <Pressable
                style={({ pressed }) => [
                  styles.googleButton,
                  pressed && styles.googleButtonPressed,
                  isConnecting && styles.buttonDisabled,
                ]}
                onPress={handleGoogleLogin}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.googleButtonText}>
                      Connexion en cours...
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.googleButtonText}>
                    Se connecter avec Google
                  </Text>
                )}
              </Pressable>

              {/* Bouton Apple */}
              {/* <Pressable
                style={({ pressed }) => [
                  styles.appleButton,
                  pressed && styles.appleButtonPressed,
                ]}
                onPress={handleAppleLogin}
              >
                <Text style={styles.appleButtonText}>
                  Se connecter avec Apple
                </Text>
              </Pressable> */}
            </View>
          </>
        ) : (
          // État connecté
          <>
            {/* Avatar */}
            {userData?.picture && !imageError ? (
              <Image
                source={{ uri: userData.picture }}
                style={styles.avatarImage}
                resizeMode="contain"
                onLoad={() => {
                  console.log("✅ Image de profil chargée:", userData.picture);
                  setImageError(false);
                }}
                onError={(error) => {
                  console.log("❌ Erreur chargement image:", error);
                  console.log("🔄 URL de l'image:", userData.picture);
                  setImageError(true);
                }}
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: displayUserData.avatarColor },
                ]}
              >
                <Text style={styles.avatarText}>{displayUserData.initial}</Text>
              </View>
            )}

            {/* Informations utilisateur */}
            <View style={styles.userInfo}>
              {userData?.given_name && userData?.family_name ? (
                <Text style={styles.userFullName}>
                  {userData.given_name} {userData.family_name}
                </Text>
              ) : userData?.name ? (
                <Text style={styles.userFullName}>{userData.name}</Text>
              ) : (
                <Text style={styles.userFullName}>Utilisateur</Text>
              )}
              {userData?.email && (
                <Text style={styles.userEmail}>{userData.email}</Text>
              )}
            </View>

            {/* Bouton de test du service (temporaire) - COMMENTÉ */}
            {/* <Pressable
              style={({ pressed }) => [
                styles.testButton,
                pressed && styles.testButtonPressed,
              ]}
              onPress={handleTestBackgroundService}
            >
              <Text style={styles.testButtonText}>🧪 Tester Service</Text>
            </Pressable> */}

            {/* Bouton d'optimisation de la batterie */}
            {/* <Pressable
              style={({ pressed }) => [
                styles.batteryButton,
                pressed && styles.batteryButtonPressed,
              ]}
              onPress={handleBatteryOptimization}
            >
              <Text style={styles.batteryButtonText}>
                🔋 Optimisation Batterie
              </Text>
            </Pressable> */}

            {/* Bouton d'envoi manuel de position */}
            {/* <Pressable
              style={({ pressed }) => [
                styles.locationButton,
                pressed && styles.locationButtonPressed,
              ]}
              onPress={handleSendLocation}
            >
              <Text style={styles.locationButtonText}>📤 Envoyer Position</Text>
            </Pressable> */}

            {/* Bouton de redémarrage forcé - COMMENTÉ */}
            {/* <Pressable
              style={({ pressed }) => [
                styles.restartButton,
                pressed && styles.restartButtonPressed,
              ]}
              onPress={handleForceRestart}
            >
              <Text style={styles.restartButtonText}>
                🔄 Redémarrer Service
              </Text>
            </Pressable> */}

            {/* Bouton de déconnexion */}
            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
              ]}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Se déconnecter</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Modal de confirmation de déconnexion */}
      <LogoutConfirmationModal
        visible={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />

      {/* Modal de succès */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="Succès"
        message={successMessage}
        icon="checkmark-circle"
        autoCloseDelay={3000}
      />

      {/* Modal d'erreur */}
      <ErrorModal
        visible={showErrorModal}
        onClose={handleCloseErrorModal}
        title="Erreur"
        message={errorMessage}
        icon="alert-circle"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  illustration: {
    width: 250,
    height: 200,
    marginBottom: 40,
  },
  loginButtons: {
    width: "100%",
    maxWidth: 300,
    gap: 16,
  },
  googleButton: {
    backgroundColor: "#E53935",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  googleButtonPressed: {
    backgroundColor: "#C62828",
    transform: [{ scale: 0.98 }],
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  appleButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E53935",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  appleButtonPressed: {
    backgroundColor: "#F8F9FA",
    transform: [{ scale: 0.98 }],
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E53935",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  // Styles pour l'état connecté
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 32,
    textAlign: "center",
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 32,
  },
  userFullName: {
    fontSize: 28,
    fontWeight: "700",
    color: "black",
    textAlign: "center",
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: "500",
    color: "black",
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#E53935",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logoutButtonPressed: {
    backgroundColor: "#C62828",
    transform: [{ scale: 0.98 }],
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  testButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  testButtonPressed: {
    backgroundColor: "#45A049",
    transform: [{ scale: 0.98 }],
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  batteryButton: {
    backgroundColor: "#FF9800",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  batteryButtonPressed: {
    backgroundColor: "#F57C00",
    transform: [{ scale: 0.98 }],
  },
  batteryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  locationButton: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  locationButtonPressed: {
    backgroundColor: "#1976D2",
    transform: [{ scale: 0.98 }],
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  restartButton: {
    backgroundColor: "#9C27B0",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  restartButtonPressed: {
    backgroundColor: "#7B1FA2",
    transform: [{ scale: 0.98 }],
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Styles pour l'indicateur de chargement
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666666",
  },
});
