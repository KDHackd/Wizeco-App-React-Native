import { useCart } from "@/contexts/CartContext";
import { ShoppingItem } from "@/types/ShoppingListTypes";
import React from "react";
import { StyleSheet, View } from "react-native";
import DeleteButton from "./DeleteButton";
import PriceDisplay from "./PriceDisplay";
import ProductImage from "./ProductImage";
import ProductInfo from "./ProductInfo";
import QuantityControls from "./QuantityControls";

type ShoppingListItemProps = {
  item: ShoppingItem;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
};

export default function ShoppingListItemRefactored({
  item,
  onQuantityChange,
  onRemove,
}: ShoppingListItemProps) {
  const { isRemoving } = useCart();

  const handleDecrease = () => {
    const quantity = item.quantity || 0;
    const id = item.id || "";
    if (quantity > 1) {
      onQuantityChange(id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    const quantity = item.quantity || 0;
    const id = item.id || "";
    onQuantityChange(id, quantity + 1);
  };

  const handleRemove = () => {
    const id = item.id || "";
    onRemove(id);
  };

  return (
    <View style={styles.container}>
      {/* Image du produit */}
      <ProductImage image={item.image} />

      {/* Informations du produit */}
      <View style={styles.productInfo}>
        <ProductInfo item={item} />

        {/* Ligne avec quantités et prix */}
        <View style={styles.bottomRow}>
          {/* Contrôle de quantité */}
          <QuantityControls
            quantity={item.quantity}
            onDecrease={handleDecrease}
            onIncrease={handleIncrease}
          />

          {/* Prix */}
          <PriceDisplay item={item} />
        </View>
      </View>

      {/* Bouton supprimer */}
      <DeleteButton onPress={handleRemove} isRemoving={isRemoving} />
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
  productInfo: {
    flex: 1,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
