import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function AuthScreen() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers le profil après un court délai
    const timer = setTimeout(() => {
      router.replace("/(tabs)/profil");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authentification en cours...</Text>
      <Text style={styles.subtitle}>Redirection vers votre profil</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#CCCCCC",
  },
});
