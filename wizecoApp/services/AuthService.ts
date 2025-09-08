import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleUser } from "./GoogleAuthService";

const AUTH_STORAGE_KEY = "@wizeco_auth_user";

export interface AuthState {
  isConnected: boolean;
  user: GoogleUser | null;
}

export class AuthService {
  // Sauvegarder l'utilisateur connecté
  static async saveUser(user: GoogleUser): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'utilisateur:", error);
    }
  }

  // Récupérer l'utilisateur sauvegardé
  static async getUser(): Promise<GoogleUser | null> {
    try {
      const userData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (userData) {
        return JSON.parse(userData) as GoogleUser;
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return null;
    }
  }

  // Supprimer l'utilisateur (déconnexion)
  static async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
    }
  }

  // Vérifier si l'utilisateur est connecté
  static async isUserConnected(): Promise<boolean> {
    const user = await this.getUser();
    return user !== null;
  }

  // Obtenir l'état d'authentification complet
  static async getAuthState(): Promise<AuthState> {
    const user = await this.getUser();
    return {
      isConnected: user !== null,
      user,
    };
  }
}
