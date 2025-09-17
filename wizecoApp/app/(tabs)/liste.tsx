import AddProductModal from "@/components/AddProductModal";
import AnimatedListTabs from "@/components/AnimatedListTabs";
import HomeHeader from "@/components/HomeHeader";
import LoginRequiredModal from "@/components/LoginRequiredModal";
import ShoppingListByStore from "@/components/ShoppingListByStore";
import ShoppingListItem from "@/components/ShoppingListItem";
import StoreSelector from "@/components/StoreSelector";
import SuccessModal from "@/components/SuccessModal";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import ApiService from "@/services/ApiService";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ListeScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "stores">("stores"); // Nouveau mode d'affichage
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedProductName, setAddedProductName] = useState("");
  const { isConnected } = useAuth();

  // Réinitialiser le modal de succès quand l'utilisateur se déconnecte
  useEffect(() => {
    if (!isConnected) {
      setShowSuccessModal(false);
      setAddedProductName("");
    }
  }, [isConnected]);
  const router = useRouter();
  const {
    shoppingItems,
    shoppingStores,
    selectedStores,
    totalGlobal,
    totalSaved,
    removeShoppingItem,
    updateShoppingItemQuantity,
    getTotalPrice,
    getTotalSavings,
    loadShoppingList,
  } = useCart();

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
  };

  const handleLogin = () => {
    setShowLoginModal(false);
    router.push("/(tabs)/profil");
  };

  const handleAddProductPress = () => {
    if (!isConnected) {
      setShowLoginModal(true);
      return;
    }
    setIsModalVisible(true);
  };

  const handleAddProduct = async (productName: string, quantity: string) => {
    try {
      console.log("➕ Ajout manuel de produit:", productName, quantity);

      // Convertir la quantité en nombre
      const quantityNumber = parseInt(quantity, 10);
      if (isNaN(quantityNumber) || quantityNumber < 1) {
        Alert.alert("Erreur", "La quantité doit être un nombre supérieur à 0");
        return;
      }

      // L'API récupérera automatiquement l'ID utilisateur depuis le token JWT
      const userId = ""; // Laisser vide pour que l'API utilise le token

      // Appeler l'API pour ajouter le produit personnalisé
      await ApiService.addCustomProductToShoppingList(userId, {
        title: productName,
        quantity: quantityNumber,
        isChecked: false,
      });

      // Afficher le modal de succès personnalisé
      setAddedProductName(productName);
      setShowSuccessModal(true);

      // Recharger la liste de courses pour afficher le nouveau produit
      await loadShoppingList();
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du produit:", error);
      Alert.alert(
        "Erreur",
        "Impossible d'ajouter le produit à la liste de courses"
      );
    }
  };
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: "transparent" }]}
      edges={["top", "left", "right"]}
    >
      <HomeHeader title="Liste des courses" />

      {/* Tabs animés pour le mode d'affichage */}
      {isConnected && shoppingItems.length > 0 && (
        <AnimatedListTabs
          tabs={[
            { id: "stores", label: "🏪 Par magasin" },
            { id: "list", label: "📋 Liste simple" },
          ]}
          activeTab={viewMode}
          onTabChange={(tabId) => setViewMode(tabId as "list" | "stores")}
        />
      )}

      {/* Contenu principal */}
      {!isConnected ? (
        // État non connecté
        <View style={styles.content}>
          <Image
            source={require("@/assets/images/coursesEmpty.png")}
            resizeMode="contain"
            style={styles.emptyImage}
          />
          <Text style={styles.emptyTitle}>
            Connectez-vous pour gérer vos courses
          </Text>
          <Text style={styles.emptySubtitle}>
            Créez votre liste de courses personnalisée et suivez vos économies
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={handleAddProductPress}
          >
            <Text style={styles.addButtonText}>Se connecter</Text>
          </Pressable>
        </View>
      ) : shoppingItems.length === 0 ? (
        // État vide mais connecté
        <View style={styles.content}>
          <Image
            source={require("@/assets/images/coursesEmpty.png")}
            resizeMode="contain"
            style={styles.emptyImage}
          />
          <Text style={styles.emptyTitle}>Aucune course ajoutée..</Text>

          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={handleAddProductPress}
          >
            <Text style={styles.addButtonText}>Ajouter une course</Text>
          </Pressable>
        </View>
      ) : (
        // Contenu selon le mode d'affichage
        <>
          {viewMode === "stores" ? (
            // Vue par magasin
            <>
              <StoreSelector />
              <ShoppingListByStore selectedStores={selectedStores} />
            </>
          ) : (
            // Vue liste simple
            <View style={styles.listContainer}>
              <FlatList
                data={shoppingItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <ShoppingListItem
                    item={item}
                    onQuantityChange={updateShoppingItemQuantity}
                    onRemove={removeShoppingItem}
                  />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {/* Bouton ajouter */}
          <View style={styles.addButtonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.addButtonPressed,
              ]}
              onPress={handleAddProductPress}
            >
              <Text style={styles.addButtonText}>Ajouter une course</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* Résumé en bas */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            {viewMode === "stores" ? "Total Global" : "Total Global"}
          </Text>
          <Text style={styles.summaryTotal}>
            {viewMode === "stores"
              ? totalGlobal.toFixed(2).replace(".", ",") + "€"
              : getTotalPrice().toFixed(2).replace(".", ",") + "€"}
          </Text>
        </View>
        <Text style={styles.summarySavings}>
          Économies totales:{" "}
          {viewMode === "stores"
            ? totalSaved.toFixed(2).replace(".", ",") + "€"
            : getTotalSavings().toFixed(2).replace(".", ",") + "€"}
        </Text>
      </View>

      {/* Modal */}
      <AddProductModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAdd={handleAddProduct}
      />

      {/* Modal de connexion requise */}
      <LoginRequiredModal
        visible={showLoginModal}
        onClose={handleLoginModalClose}
        onLogin={handleLogin}
        action="accéder à la liste de courses"
      />

      {/* Modal de succès personnalisé */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        productName={addedProductName}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 20,
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
