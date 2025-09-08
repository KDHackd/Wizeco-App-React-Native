import HomeHeader from "@/components/HomeHeader";
import { AuthService } from "@/services/AuthService";
import { GoogleUser, useGoogleAuth } from "@/services/GoogleAuthService";
import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfilScreen() {
  // État de connexion
  const [isConnected, setIsConnected] = useState(false);
  const [userData, setUserData] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Service Google Auth
  const { signInWithGoogle, isReady } = useGoogleAuth();

  // Charger l'état d'authentification au démarrage
  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const authState = await AuthService.getAuthState();
      setIsConnected(authState.isConnected);
      setUserData(authState.user);
    } catch (error) {
      console.error(
        "Erreur lors du chargement de l'état d'authentification:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (!isReady) {
        Alert.alert("Erreur", "Google Auth n'est pas encore prêt");
        return;
      }

      const user = await signInWithGoogle();
      if (user) {
        // Sauvegarder l'utilisateur
        await AuthService.saveUser(user);

        // Mettre à jour l'état local
        setUserData(user);
        setIsConnected(true);

        Alert.alert("Succès", `Bienvenue ${user.name} !`);
      } else {
        Alert.alert("Erreur", "Échec de la connexion Google");
      }
    } catch (error) {
      console.error("Erreur Google Login:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la connexion");
    }
  };

  const handleAppleLogin = () => {
    // TODO: Implémenter la connexion Apple
    console.log("Connexion Apple");
    Alert.alert("Info", "Connexion Apple non implémentée pour le moment");
  };

  const handleLogout = async () => {
    try {
      // Supprimer l'utilisateur du stockage
      await AuthService.removeUser();

      // Mettre à jour l'état local
      setUserData(null);
      setIsConnected(false);

      Alert.alert("Déconnexion", "Vous avez été déconnecté avec succès");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la déconnexion");
    }
  };

  // Données utilisateur par défaut pour l'affichage
  const displayUserData = userData
    ? {
        name: userData.name,
        initial: userData.given_name?.[0] || userData.name[0] || "U",
        avatarColor: "#FFD700", // Jaune
      }
    : {
        name: "Utilisateur",
        initial: "U",
        avatarColor: "#FFD700",
      };

  // Afficher un indicateur de chargement pendant le chargement initial
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <HomeHeader title="Profil" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
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
                ]}
                onPress={handleGoogleLogin}
              >
                <Text style={styles.googleButtonText}>
                  Se connecter avec Google
                </Text>
              </Pressable>

              {/* Bouton Apple */}
              <Pressable
                style={({ pressed }) => [
                  styles.appleButton,
                  pressed && styles.appleButtonPressed,
                ]}
                onPress={handleAppleLogin}
              >
                <Text style={styles.appleButtonText}>
                  Se connecter avec Apple
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          // État connecté
          <>
            {/* Avatar */}
            {userData?.picture ? (
              <Image
                source={{ uri: userData.picture }}
                style={styles.avatarImage}
                resizeMode="cover"
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

            {/* Nom d'utilisateur */}
            <Text style={styles.userName}>{displayUserData.name}</Text>

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
  // Styles pour l'indicateur de chargement
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666666",
  },
});
