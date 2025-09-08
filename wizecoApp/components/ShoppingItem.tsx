import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export type ShoppingItemType = {
  id: string;
  name: string;
  image: any;
  price: number;
  quantity: number;
};

type ShoppingItemProps = {
  item: ShoppingItemType;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
};

export default function ShoppingItem({
  item,
  onQuantityChange,
  onRemove,
}: ShoppingItemProps) {
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    onQuantityChange(item.id, item.quantity + 1);
  };

  const formatPrice = (price: number) => {
    const euros = Math.floor(price);
    const cents = Math.round((price - euros) * 100);
    return { euros, cents };
  };

  const { euros, cents } = formatPrice(item.price);

  return (
    <View style={styles.container}>
      {/* Image du produit */}
      <Image source={item.image} style={styles.productImage} />

      {/* Informations du produit */}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>

        {/* Ligne avec quantités et prix */}
        <View style={styles.bottomRow}>
          {/* Contrôle de quantité */}
          <View style={styles.quantityContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.quantityButton,
                pressed && styles.quantityButtonPressed,
              ]}
              onPress={handleDecrease}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </Pressable>

            <View style={styles.quantityBox}>
              <Text style={styles.quantityText}>{item.quantity}</Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.quantityButton,
                pressed && styles.quantityButtonPressed,
              ]}
              onPress={handleIncrease}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </Pressable>
          </View>

          {/* Prix */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
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
        </View>
      </View>

      {/* Bouton supprimer */}
      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.deleteButtonPressed,
        ]}
        onPress={() => onRemove(item.id)}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonPressed: {
    backgroundColor: "#E5E7EB",
    transform: [{ scale: 0.95 }],
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  quantityBox: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 40,
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  priceContainer: {
    // Pas de margin car maintenant dans bottomRow
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 8,
  },
  deleteButtonPressed: {
    backgroundColor: "#E5E7EB",
    transform: [{ scale: 0.95 }],
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
});
