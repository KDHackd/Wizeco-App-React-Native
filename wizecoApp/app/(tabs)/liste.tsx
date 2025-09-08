import AddProductModal from "@/components/AddProductModal";
import HomeHeader from "@/components/HomeHeader";
import ShoppingItem, { ShoppingItemType } from "@/components/ShoppingItem";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Données de test
const MOCK_SHOPPING_ITEMS: ShoppingItemType[] = [
  {
    id: "1",
    name: "Carolin",
    image: require("@/assets/images/coursesEmpty.png"), // Utilisation temporaire de l'image existante
    price: 10.0,
    quantity: 1,
  },
  {
    id: "2",
    name: "Yves Saint Laurent",
    image: require("@/assets/images/coursesEmpty.png"), // Utilisation temporaire de l'image existante
    price: 10.0,
    quantity: 1,
  },
  {
    id: "3",
    name: "Carolin",
    image: require("@/assets/images/coursesEmpty.png"), // Utilisation temporaire de l'image existante
    price: 10.0,
    quantity: 1,
  },
];

export default function ListeScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [shoppingItems, setShoppingItems] =
    useState<ShoppingItemType[]>(MOCK_SHOPPING_ITEMS);

  const handleAddProduct = (productName: string, quantity: string) => {
    const newItem: ShoppingItemType = {
      id: Date.now().toString(),
      name: productName,
      image: require("@/assets/images/coursesEmpty.png"), // Image par défaut
      price: 10.0, // Prix par défaut
      quantity: parseInt(quantity) || 1,
    };
    setShoppingItems([...shoppingItems, newItem]);
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setShoppingItems(
      shoppingItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setShoppingItems(shoppingItems.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    return shoppingItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateSavings = () => {
    // Simulation d'économies (20% du total)
    return calculateTotal() * 0.2;
  };
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <HomeHeader title="Liste des courses" />

      {/* Filtre */}
      <View style={styles.filterContainer}>
        <Pressable style={styles.filterButton}>
          <Text style={styles.filterText}>Tout</Text>
        </Pressable>
      </View>

      {/* Contenu principal */}
      {shoppingItems.length === 0 ? (
        // État vide
        <View style={styles.content}>
          <Image
            source={require("@/assets/images/coursesEmpty.png")}
            resizeMode="contain"
            style={styles.emptyImage}
          />
          <Text style={styles.emptyTitle}>Aucune course ajouter..</Text>

          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={styles.addButtonText}>Ajouter une course</Text>
          </Pressable>
        </View>
      ) : (
        // Liste des produits
        <View style={styles.listContainer}>
          <FlatList
            data={shoppingItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ShoppingItem
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Bouton ajouter */}
          <View style={styles.addButtonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.addButtonPressed,
              ]}
              onPress={() => setIsModalVisible(true)}
            >
              <Text style={styles.addButtonText}>Ajouter une course</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Résumé en bas */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Global</Text>
          <Text style={styles.summaryTotal}>
            {calculateTotal().toFixed(2).replace(".", ",")}€
          </Text>
        </View>
        <Text style={styles.summarySavings}>
          Économies totales: {calculateSavings().toFixed(2).replace(".", ",")}€
        </Text>
      </View>

      {/* Modal */}
      <AddProductModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAdd={handleAddProduct}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: "center",
  },
  filterButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyImage: {
    width: 250,
    height: 200,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 32,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#E53935",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  summaryContainer: {
    backgroundColor: "#F7F7F8",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 35,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E53935",
  },
  summarySavings: {
    fontSize: 14,
    fontWeight: "500",
    color: "#10B981",
    textAlign: "right",
  },
  addButtonPressed: {
    backgroundColor: "#C62828",
    transform: [{ scale: 0.98 }],
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
});
