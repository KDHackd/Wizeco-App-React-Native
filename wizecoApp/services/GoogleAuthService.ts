// GoogleAuthService.ts - Version Original Google Sign In (gratuite)
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Alert } from "react-native";

// Configuration Google Sign-In selon la documentation
GoogleSignin.configure({
  webClientId:
    "647553138923-nv59klfd73mkpnc89ct58ru8n7qir1g6.apps.googleusercontent.com",
  iosClientId:
    "647553138923-treeu2mmrlfcn9s717r3visdvdu1crmb.apps.googleusercontent.com",
  offlineAccess: true, // Activer l'accès hors ligne pour récupérer l'accessToken
  hostedDomain: "", // Pas de restriction de domaine
  forceCodeForRefreshToken: true, // Forcer le code pour le refresh token
  accountName: "", // Pas de compte spécifique
  profileImageSize: 120, // Taille de l'image de profil
});

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  accessToken?: string; // Token d'accès pour l'API backend
}

export class GoogleAuthService {
  static async signInWithGoogle(): Promise<GoogleUser | null> {
    try {
      console.log("🔐 Connexion Google avec @react-native-google-signin");

      // Vérifier que Google Play Services est disponible (Android)
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Effectuer la connexion
      const response = await GoogleSignin.signIn();
      console.log("✅ Sign-In Response:", response);

      if (isSuccessResponse(response)) {
        const user = response.data.user;
        const tokens = response.data;
        console.log("✅ User Info:", user);
        console.log("✅ Tokens:", tokens);
        console.log("✅ Access Token:", (tokens as any).accessToken);

        // Essayer de récupérer les tokens séparément si accessToken n'est pas disponible
        let accessToken = (tokens as any).accessToken;
        if (!accessToken) {
          try {
            const tokensResult = await GoogleSignin.getTokens();
            accessToken = tokensResult.accessToken;
            console.log("✅ Access Token récupéré séparément:", accessToken);
          } catch (tokenError) {
            console.log(
              "⚠️ Impossible de récupérer les tokens séparément:",
              tokenError
            );
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          picture: user.photo || undefined,
          given_name: user.givenName || undefined,
          family_name: user.familyName || undefined,
          accessToken: accessToken || undefined,
        };
      } else {
        console.log("ℹ️ Sign in was cancelled by user");
        return null;
      }
    } catch (error: any) {
      console.error("❌ Sign-In Error:", error);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log("ℹ️ User cancelled the login");
            Alert.alert("Annulé", "L'utilisateur a annulé la connexion.");
            break;
          case statusCodes.IN_PROGRESS:
            console.log("ℹ️ Sign in is already in progress");
            Alert.alert("En cours", "La connexion est déjà en cours.");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log("❌ Play Services not available or outdated");
            Alert.alert(
              "Erreur",
              "Services Google Play non disponibles ou obsolètes."
            );
            break;
          default:
            console.log("❌ An unknown error occurred");
            Alert.alert(
              "Erreur",
              `Une erreur inconnue est survenue: ${error.message}`
            );
        }
      } else {
        console.log("❌ Something went wrong");
        Alert.alert(
          "Erreur",
          "Une erreur inattendue est survenue. Veuillez réessayer."
        );
      }

      return null;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
      console.log("🔓 Déconnexion réussie");
    } catch (error) {
      console.error("❌ Logout Error:", error);
    }
  }

  static async getCurrentUser(): Promise<GoogleUser | null> {
    try {
      const response = await GoogleSignin.signInSilently();

      if (response.type === "success" && response.data) {
        console.log("✅ Current User:", response);
        const user = response.data.user;
        const tokens = response.data;
        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          picture: user.photo || undefined,
          given_name: user.givenName || undefined,
          family_name: user.familyName || undefined,
          accessToken: (tokens as any).accessToken || undefined,
        };
      } else if (response.type === "noSavedCredentialFound") {
        console.log("ℹ️ No saved credentials found");
        return null;
      } else {
        console.log(
          "ℹ️ User has not signed in yet, or they have revoked access"
        );
        return null;
      }
    } catch (error) {
      console.error("❌ Failed to fetch current user:", error);
      return null;
    }
  }
}
