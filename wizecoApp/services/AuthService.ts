import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "./ApiService";
import { GoogleAuthService, GoogleUser } from "./GoogleAuthService";

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
      // 1. Déconnexion du backend
      try {
        await ApiService.logout();
        console.log("✅ Déconnexion backend réussie");
      } catch (backendError) {
        console.error(
          "⚠️ Erreur lors de la déconnexion backend:",
          backendError
        );
        // Continue même si le backend échoue
      }

      // 2. Supprimer les données locales
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);

      // 3. Déconnexion Google
      await GoogleAuthService.signOut();

      console.log("✅ Utilisateur supprimé");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
    }
  }

  // Vérifier si l'utilisateur est connecté
  static async isUserConnected(): Promise<boolean> {
    const authState = await this.getAuthState();
    return authState.isConnected;
  }

  // Obtenir l'état d'authentification complet
  static async getAuthState(): Promise<AuthState> {
    const user = await this.getUser();

    // Vérifier que l'utilisateur a bien un token JWT
    if (user) {
      try {
        const token = await ApiService.getToken();
        if (!token) {
          console.log(
            "🔐 Utilisateur trouvé mais sans token JWT - déconnexion automatique"
          );
          // Supprimer l'utilisateur local s'il n'a pas de token JWT
          await this.removeUser();
          return {
            isConnected: false,
            user: null,
          };
        }
        console.log("🔐 Utilisateur connecté avec token JWT valide");
      } catch (error) {
        console.log(
          "🔐 Erreur lors de la vérification du token - déconnexion automatique"
        );
        // Supprimer l'utilisateur local en cas d'erreur
        await this.removeUser();
        return {
          isConnected: false,
          user: null,
        };
      }
    }

    return {
      isConnected: user !== null,
      user,
    };
  }

  // Méthode pour la connexion Google avec intégration backend
  static async signInWithGoogle(): Promise<GoogleUser | null> {
    try {
      console.log("🔐 Début de la connexion Google...");

      // 1. Connexion Google
      const user = await GoogleAuthService.signInWithGoogle();
      if (!user) {
        console.log("❌ Connexion Google échouée");
        return null;
      }

      console.log("✅ Connexion Google réussie:", user.email);

      // 2. Vérifier si on a un accessToken
      if (!user.accessToken) {
        console.log("⚠️ Aucun accessToken Google disponible");
        // On peut quand même sauvegarder l'utilisateur localement
        await this.saveUser(user);
        return user;
      }

      // 3. Test de connectivité backend puis connexion
      try {
        console.log("🌐 Test de connectivité avec le backend...");
        const isBackendAccessible = await ApiService.testBackendConnection();

        if (isBackendAccessible) {
          console.log("✅ Backend accessible, tentative de connexion...");
          console.log(
            "🔑 AccessToken Google:",
            user.accessToken ? "✅ Présent" : "❌ Absent"
          );

          const loginResult = await ApiService.login({
            email: user.email,
            tokenAccess: user.accessToken,
            accountType: "GOOGLE",
          });
          console.log("✅ Connexion backend réussie:", loginResult);

          // Vérifier que le token est bien stocké
          const storedToken = await ApiService.getToken();
          if (!storedToken) {
            throw new Error("Token JWT non stocké après la connexion backend");
          }
          console.log(
            "🔍 Token stocké après connexion:",
            storedToken ? "✅ Présent" : "❌ Absent"
          );
        } else {
          console.log(
            "⚠️ Backend inaccessible, continuation en mode local uniquement"
          );
        }
      } catch (backendError) {
        console.error("❌ Erreur lors de la connexion backend:", backendError);
        // Même si le backend échoue, on peut continuer avec l'auth locale
        console.log(
          "⚠️ Continuation avec l'authentification locale uniquement"
        );
      }

      // 4. Sauvegarder l'utilisateur
      await this.saveUser(user);
      return user;
    } catch (error) {
      console.error("❌ Erreur lors de la connexion Google:", error);
      return null;
    }
  }
}
