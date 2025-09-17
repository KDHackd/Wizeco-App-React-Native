import { GOOGLE_CONFIG } from "@/config/google";
import {
  GoogleSignin,
  SignInResponse,
} from "@react-native-google-signin/google-signin";

export interface GoogleUser {
  idToken: string | null;
  serverAuthCode: string | null;
  email?: string;
  name?: string | null;
  picture?: string | null;
  given_name?: string | null;
  family_name?: string | null;
}

export class NativeGoogleAuthService {
  private static isInitialized = false;

  /**
   * Initialise Google Sign-In
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_CONFIG.webClientId,
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });
      this.isInitialized = true;
      console.log("✅ Google Sign-In initialisé");
    } catch (error) {
      console.error("❌ Erreur init Google Sign-In:", error);
      throw error;
    }
  }

  /**
   * Connexion Google
   */
  static async signIn(): Promise<GoogleUser | null> {
    try {
      await this.initialize();
      await GoogleSignin.hasPlayServices();

      const response: SignInResponse = await GoogleSignin.signIn();
      console.log("🚀 response:", response);

      // La réponse contient déjà toutes les infos utiles
      return {
        idToken: response.data?.idToken ?? null,
        serverAuthCode: response.data?.serverAuthCode ?? null,
        email: response.data?.user?.email,
        name: response.data?.user?.name,
        picture: response.data?.user?.photo,
        given_name: response.data?.user?.givenName,
        family_name: response.data?.user?.familyName,
      };
    } catch (error) {
      console.error("❌ Erreur connexion Google:", error);
      return null;
    }
  }

  /**
   * Déconnexion
   */
  static async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
      console.log("✅ Déconnexion Google réussie");
    } catch (error) {
      console.error("❌ Erreur déconnexion Google:", error);
    }
  }

  /**
   * Vérifie si connecté
   */
  static async isSignedIn(): Promise<boolean> {
    try {
      await this.initialize();
      const currentUser = await GoogleSignin.getCurrentUser();
      return currentUser !== null;
    } catch (error) {
      console.error("❌ Erreur check isSignedIn:", error);
      return false;
    }
  }

  /**
   * Récupère l’utilisateur actuel
   */
  static async getCurrentUser(): Promise<GoogleUser | null> {
    try {
      await this.initialize();
      const currentUser = await GoogleSignin.getCurrentUser();

      if (currentUser) {
        return {
          idToken: currentUser.idToken ?? null,
          serverAuthCode: currentUser.serverAuthCode ?? null,
          email: currentUser.user?.email,
          name: currentUser.user?.name,
          picture: currentUser.user?.photo,
          given_name: currentUser.user?.givenName,
          family_name: currentUser.user?.familyName,
        };
      }

      return null;
    } catch (error) {
      console.error("❌ Erreur récupération utilisateur:", error);
      return null;
    }
  }
}
