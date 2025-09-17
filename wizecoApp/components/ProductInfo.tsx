import {
  ShoppingItem,
  isCatalogItem,
  isCustomItem,
  isHalteGachiItem,
  isPromoFlashItem,
} from "@/types/ShoppingListTypes";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProductInfoProps {
  item: ShoppingItem;
}

export default function ProductInfo({ item }: ProductInfoProps) {
  const getCategoryLabel = (): string => {
    if (isCatalogItem(item)) return "Catalogue";
    if (isPromoFlashItem(item)) return "Promo Flash";
    if (isHalteGachiItem(item)) return "Halte au gâchis";
    if (isCustomItem(item)) return "Personnalisé";
    return "";
  };

  const getCategoryColor = (): string => {
    if (isCatalogItem(item)) return "#3B82F6"; // Bleu
    if (isPromoFlashItem(item)) return "#EF4444"; // Rouge
    if (isHalteGachiItem(item)) return "#10B981"; // Vert
    if (isCustomItem(item)) return "#8B5CF6"; // Violet
    return "#6B7280"; // Gris par défaut
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.productName}>{String(item.name || "")}</Text>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor() },
          ]}
        >
          <Text style={styles.categoryText}>{String(getCategoryLabel())}</Text>
        </View>
      </View>

      {/* Date limite pour les haltes au gâchis */}
      {isHalteGachiItem(item) && item.consumeBefore && (
        <Text style={styles.consumeBefore}>
          À consommer avant: {String(item.consumeBefore)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  consumeBefore: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
    marginBottom: 8,
  },
});
