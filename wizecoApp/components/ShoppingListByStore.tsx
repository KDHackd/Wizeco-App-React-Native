import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCart } from "../contexts/CartContext";
import ShoppingListItem from "./ShoppingListItem";

interface ShoppingListByStoreProps {
  selectedStores: string[];
}

export default function ShoppingListByStore({
  selectedStores,
}: ShoppingListByStoreProps) {
  const {
    shoppingItems,
    shoppingStores,
    totalGlobal,
    totalSaved,
    updateShoppingItemQuantity,
    removeShoppingItem,
  } = useCart();

  // Filtrer les magasins sélectionnés
  const filteredStores = shoppingStores.filter((store) =>
    selectedStores.includes(store.storeName)
  );

  // Calculer les totaux pour les magasins sélectionnés
  const selectedTotal = filteredStores.reduce(
    (sum, store) => sum + store.subtotal,
    0
  );
  const selectedSavings = filteredStores.reduce(
    (sum, store) => sum + store.subtotalSaved,
    0
  );

  if (filteredStores.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>🛒 Aucun magasin sélectionné</Text>
        <Text style={styles.emptySubtext}>
          Sélectionnez un ou plusieurs magasins pour voir vos produits
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Totaux pour les magasins sélectionnés */}
      <View style={styles.totalsContainer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total sélectionné:</Text>
          <Text style={styles.totalValue}>{selectedTotal.toFixed(2)}€</Text>
        </View>
        {selectedSavings > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.savingsLabel}>Économies:</Text>
            <Text style={styles.savingsValue}>
              -{selectedSavings.toFixed(2)}€
            </Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.finalLabel}>À payer:</Text>
          <Text style={styles.finalValue}>
            {(selectedTotal - selectedSavings).toFixed(2)}€
          </Text>
        </View>
      </View>

      {/* Liste par magasin */}
      {filteredStores.map((store) => (
        <View key={store.storeName} style={styles.storeSection}>
          <View style={styles.storeHeader}>
            <Text style={styles.storeName}>🏪 {store.storeName}</Text>
            <View style={styles.storeTotals}>
              <Text style={styles.storeSubtotal}>
                {store.subtotal.toFixed(2)}€
              </Text>
              {store.subtotalSaved > 0 && (
                <Text style={styles.storeSavings}>
                  (-{store.subtotalSaved.toFixed(2)}€)
                </Text>
              )}
            </View>
          </View>

          <View style={styles.productsContainer}>
            {store.products.map((product) => {
              // Trouver l'item correspondant dans shoppingItems
              // D'abord par backendId, puis par id local
              const convertedItem = shoppingItems.find(
                (item) =>
                  item.backendId === product.id || item.id === product.id
              );

              if (!convertedItem) {
                console.warn(
                  "⚠️ Item non trouvé dans shoppingItems:",
                  product.id,
                  "Items disponibles:",
                  shoppingItems.map((i) => ({
                    id: i.id,
                    backendId: i.backendId,
                    name: i.name,
                  }))
                );
                return null;
              }

              return (
                <ShoppingListItem
                  key={product.id}
                  item={convertedItem}
                  onQuantityChange={updateShoppingItemQuantity}
                  onRemove={removeShoppingItem}
                />
              );
            })}
          </View>
        </View>
      ))}

      {/* Totaux globaux (tous magasins) */}
      {selectedStores.length < shoppingStores.length && (
        <View style={styles.globalTotalsContainer}>
          <Text style={styles.globalTitle}>
            📊 Totaux globaux (tous magasins)
          </Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total global:</Text>
            <Text style={styles.totalValue}>{totalGlobal.toFixed(2)}€</Text>
          </View>
          {totalSaved > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.savingsLabel}>Économies totales:</Text>
              <Text style={styles.savingsValue}>-{totalSaved.toFixed(2)}€</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#adb5bd",
    textAlign: "center",
  },
  totalsContainer: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: "#2c3e50",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  savingsLabel: {
    fontSize: 16,
    color: "#6c757d",
  },
  savingsValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc3545",
  },
  finalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  finalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#28a745",
  },
  storeSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  storeHeader: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    flex: 1,
  },
  storeTotals: {
    alignItems: "flex-end",
  },
  storeSubtotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#28a745",
  },
  storeSavings: {
    fontSize: 14,
    color: "#dc3545",
    fontWeight: "500",
  },
  productsContainer: {
    gap: 8,
  },
  globalTotalsContainer: {
    backgroundColor: "#e9ecef",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  globalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 12,
    textAlign: "center",
  },
});
