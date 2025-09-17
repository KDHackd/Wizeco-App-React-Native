import ApiService from "@/services/ApiService";
import { AuthService, AuthState } from "@/services/AuthService";
import LocationNotificationService from "@/services/LocationNotificationService";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isConnected: boolean;
  user: any;
  isLoading: boolean;
  refreshAuthState: () => Promise<void>;
  login: (user: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isConnected: false,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadAuthState = async () => {
    try {
      const state = await AuthService.getAuthState();
      setAuthState(state);
    } catch (error) {
      console.error(
        "Erreur lors du chargement de l'état d'authentification:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuthState = async () => {
    await loadAuthState();
  };

  const login = async (user: any) => {
    await AuthService.saveUser(user);
    setAuthState({
      isConnected: true,
      user,
    });

    // Le service sera démarré automatiquement par le useEffect
    console.log(
      "✅ Utilisateur connecté - service sera démarré automatiquement"
    );
  };

  const logout = async () => {
    await AuthService.removeUser();
    // Ne pas nettoyer les likes - ils doivent persister pour la reconnexion
    setAuthState({
      isConnected: false,
      user: null,
    });

    // Désactiver le service de géolocalisation après déconnexion
    console.log(
      "🛑 Désactivation du service de géolocalisation après déconnexion..."
    );
    try {
      LocationNotificationService.stop();
      console.log("✅ Service de géolocalisation désactivé après déconnexion");
    } catch (error) {
      console.error(
        "❌ Erreur lors de la désactivation du service de géolocalisation:",
        error
      );
    }
  };

  useEffect(() => {
    loadAuthState();
  }, []);

  // Gérer l'activation/désactivation du service de géolocalisation selon l'état de connexion
  useEffect(() => {
    const handleAuthStateChange = async () => {
      if (authState.isConnected) {
        // Vérifier que l'utilisateur a bien un token JWT avant d'activer le service
        try {
          const token = await ApiService.getToken();
          if (!token) {
            console.log(
              "🔐 Utilisateur connecté mais sans token JWT - service non activé"
            );
            return;
          }

          console.log("🔐 Token JWT présent - activation du service autorisée");
        } catch (error) {
          console.log(
            "🔐 Erreur lors de la vérification du token - service non activé"
          );
          return;
        }

        // Utilisateur connecté avec token - activer le service seulement s'il n'est pas déjà en cours
        console.log(
          "🔄 Utilisateur connecté avec token - activation du service de géolocalisation..."
        );
        try {
          const status = LocationNotificationService.getStatus();
          if (!status.isRunning) {
            LocationNotificationService.configure({
              updateInterval: 30 * 1000, // 30 secondes
              distanceThreshold: 50, // 50 mètres
              radius: 100, // 100 mètres
              enabled: true, // Activer le service
            });
            await LocationNotificationService.start();
            console.log("✅ Service de géolocalisation activé automatiquement");
          } else {
            console.log(
              "✅ Service de géolocalisation déjà en cours d'exécution"
            );
          }
        } catch (error) {
          console.error(
            "❌ Erreur lors de l'activation automatique du service:",
            error
          );
        }
      } else {
        // Utilisateur déconnecté - désactiver le service
        console.log(
          "🔄 Utilisateur déconnecté détecté - désactivation du service de géolocalisation..."
        );
        try {
          await LocationNotificationService.stop();
          console.log(
            "✅ Service de géolocalisation désactivé automatiquement"
          );
        } catch (error) {
          console.error(
            "❌ Erreur lors de la désactivation automatique du service:",
            error
          );
        }
      }
    };

    // Ne pas exécuter au premier rendu (isLoading = true)
    if (!isLoading) {
      handleAuthStateChange();
    }
  }, [authState.isConnected, isLoading]);

  const value: AuthContextType = {
    isConnected: authState.isConnected,
    user: authState.user,
    isLoading,
    refreshAuthState,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
