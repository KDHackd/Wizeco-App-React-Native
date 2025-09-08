import { GOOGLE_CONFIG } from "@/config/google";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

// Configure WebBrowser pour compléter la session d'authentification
WebBrowser.maybeCompleteAuthSession();

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CONFIG.androidClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    webClientId: GOOGLE_CONFIG.webClientId,
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      // Ici vous pouvez traiter le token d'authentification
      console.log("Google Auth Success:", authentication);
    } else if (response?.type === "error") {
      console.error("Google Auth Error:", response.error);
    }
  }, [response]);

  const signInWithGoogle = async (): Promise<GoogleUser | null> => {
    try {
      if (!request) {
        throw new Error("Google Auth request not ready");
      }

      const result = await promptAsync();

      if (result.type === "success" && result.authentication) {
        // Récupérer les informations utilisateur depuis Google
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${result.authentication.accessToken}`
        );

        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          return {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            given_name: userInfo.given_name,
            family_name: userInfo.family_name,
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      return null;
    }
  };

  return {
    signInWithGoogle,
    isReady: !!request,
  };
}
