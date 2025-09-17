import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../contexts/CartContext";

interface StoreSelectorProps {
  onStoreChange?: (selectedStores: string[]) => void;
}

export default function StoreSelector({ onStoreChange }: StoreSelectorProps) {
  const { shoppingStores, selectedStores, toggleStoreSelection } = useCart();

  const handleToggleStore = (storeName: string) => {
    toggleStoreSelection(storeName);
    if (onStoreChange) {
      const newSelection = selectedStores.includes(storeName)
        ? selectedStores.filter((name) => name !== storeName)
        : [...selectedStores, storeName];
      onStoreChange(newSelection);
    }
  };

  if (shoppingStores.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {shoppingStores.map((store) => {
          const isSelected = selectedStores.includes(store.storeName);
          const productCount = store.products.length;

          return (
            <TouchableOpacity
              key={store.storeName}
              style={[styles.storeCard, isSelected && styles.selectedStoreCard]}
              onPress={() => handleToggleStore(store.storeName)}
            >
              <View style={styles.storeHeader}>
                <Text
                  style={[
                    styles.storeName,
                    isSelected && styles.selectedStoreName,
                  ]}
                >
                  {store.storeName}
                </Text>
                <View
                  style={[styles.checkbox, isSelected && styles.checkedBox]}
                >
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>

              <Text style={styles.productCount}>
                {productCount} produit{productCount > 1 ? "s" : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingRight: 16,
  },
  storeCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    minWidth: 120,
    borderWidth: 2,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  selectedStoreCard: {
    borderColor: "#007bff",
    backgroundColor: "#f8f9ff",
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  storeName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2c3e50",
    flex: 1,
  },
  selectedStoreName: {
    color: "#007bff",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#dee2e6",
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  checkmark: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  productCount: {
    fontSize: 11,
    color: "#6c757d",
    textAlign: "center",
  },
});
