import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { Image, Platform, StyleSheet, View } from "react-native";

type HomeHeaderProps = {
  title?: string;
};

export default function HomeHeader({ title = "Accueil" }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <Image
          source={require("@/assets/images/logo.png")}
          resizeMode="contain"
          style={styles.logo}
        />
        <ThemedText type="title" style={styles.title}>
          {title}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.select({ ios: 12, android: 8, default: 8 }),
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 140,
    height: 52,
    marginLeft: -16,
    marginTop: -8,
    marginBottom: -8,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
  },
});
