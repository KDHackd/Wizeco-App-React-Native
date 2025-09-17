import {
  ShoppingItem,
  getDisplayPrice,
  getOriginalPrice,
  isCatalogItem,
} from "@/types/ShoppingListTypes";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface PriceDisplayProps {
  item: ShoppingItem;
}

export default function PriceDisplay({ item }: PriceDisplayProps) {
  // Vérification de sécurité pour les catalogues
  if (isCatalogItem(item)) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPriceText}>Gratuit</Text>
      </View>
    );
  }

  // Récupération sécurisée des prix
  const displayPrice = getDisplayPrice(item);
  const originalPrice = getOriginalPrice(item);

  // Conversion sécurisée en nombres
  const safeDisplayPrice = Number(displayPrice) || 0;
  const safeOriginalPrice = Number(originalPrice) || 0;

  // Formatage sécurisé des prix
  const euros = Math.floor(safeDisplayPrice);
  const cents = Math.round((safeDisplayPrice - euros) * 100);

  // Vérification si on doit afficher le prix original
  const showOriginalPrice =
    safeOriginalPrice > safeDisplayPrice && safeOriginalPrice > 0;

  return (
    <View style={styles.container}>
      <View style={styles.priceRow}>
        {showOriginalPrice && (
          <Text style={styles.originalPrice}>
            {safeOriginalPrice.toFixed(2).replace(".", ",")}€
          </Text>
        )}
        <Text style={styles.priceInt}>{euros}</Text>
        <View style={styles.supContainerEuro}>
          <Text style={styles.priceCurrency}>€</Text>
        </View>
        <View style={styles.supContainerFrac}>
          <Text style={styles.priceFrac}>
            {cents.toString().padStart(2, "0")}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
  },
  noPriceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  originalPrice: {
    fontSize: 12,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    marginRight: 4,
  },
  priceInt: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 18,
    lineHeight: 20,
  },
  priceCurrency: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 14,
    marginHorizontal: 2,
  },
  priceFrac: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 14,
    marginLeft: 1,
  },
  supContainerEuro: {
    marginTop: -0,
  },
  supContainerFrac: {
    marginTop: -0,
  },
});
