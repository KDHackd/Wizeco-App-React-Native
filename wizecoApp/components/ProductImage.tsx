import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface ProductImageProps {
  image: any | undefined;
  size?: number;
}

export default function ProductImage({ image, size = 70 }: ProductImageProps) {
  // Gestion sécurisée des images
  const renderImage = () => {
    // Cas 1: String URL
    if (typeof image === "string" && image.length > 0) {
      return (
        <Image
          source={{ uri: image }}
          style={[styles.image, { width: size, height: size }]}
          resizeMode="contain"
        />
      );
    }

    // Cas 2: Objet { uri: string }
    if (
      typeof image === "object" &&
      image !== null &&
      "uri" in image &&
      typeof image.uri === "string"
    ) {
      return (
        <Image
          source={image}
          style={[styles.image, { width: size, height: size }]}
          resizeMode="contain"
        />
      );
    }

    // Cas 3: Fallback - pas d'image
    return (
      <View
        style={[
          styles.image,
          styles.placeholder,
          { width: size, height: size },
        ]}
      >
        <Text style={styles.placeholderText}>📦</Text>
      </View>
    );
  };

  return renderImage();
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 12,
    marginRight: 16,
  },
  placeholder: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
  },
});
