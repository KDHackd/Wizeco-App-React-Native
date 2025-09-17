import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { AppState } from "react-native";
import "react-native-reanimated";
// Importer la tâche en arrière-plan
import * as Notifications from "expo-notifications";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../components/backgroundLocationTask";

import AppStartup from "@/components/AppStartup";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { PermissionProvider } from "@/contexts/PermissionContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import LocationNotificationService from "@/services/LocationNotificationService";
import { PermissionResult } from "@/services/PermissionService";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [permissionsReady, setPermissionsReady] = useState(false);
  const [permissionResult, setPermissionResult] =
    useState<PermissionResult | null>(null);

  const handlePermissionsReady = (result: PermissionResult) => {
    console.log("🎯 Permissions prêtes au démarrage:", result);
    setPermissionResult(result);
    setPermissionsReady(true);
  };

  // Configurer les notifications au démarrage de l'app
  useEffect(() => {
    // Configurer le comportement des notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    console.log("🔔 Configuration des notifications initialisée");
  }, []);

  // Gérer le cycle de vie de l'app pour le service de géolocalisation
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      // Logs réduits pour éviter le spam
      if (nextAppState === "active") {
        // App repasse en premier plan - forcer une mise à jour
        LocationNotificationService.forceUpdate();
      }
      // Pas de logs pour les changements d'état pour éviter le spam
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // Afficher l'écran de démarrage avec permissions
  if (!permissionsReady) {
    return <AppStartup onPermissionsReady={handlePermissionsReady} />;
  }

  return (
    <PermissionProvider initialResult={permissionResult}>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <SafeAreaProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
              <Toast />
            </SafeAreaProvider>
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </PermissionProvider>
  );
}
