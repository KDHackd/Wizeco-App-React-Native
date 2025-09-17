import ApiService, { ShoppingListStore } from "@/services/ApiService";
import { ShoppingItem, ShoppingItemCategory } from "@/types/ShoppingListTypes";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Toast from "react-native-toast-message";
import { useAuth } from "./AuthContext";

type CartContextType = {
  cartCount: number;
  shoppingItems: ShoppingItem[];
  shoppingStores: ShoppingListStore[];
  totalGlobal: number;
  totalSaved: number;
  selectedStores: string[];
  isLoading: boolean;
  isAdding: boolean;
  isRemoving: boolean;
  addToCart: () => void;
  removeFromCart: () => void;
  clearCart: () => void;
  addShoppingItem: (item: ShoppingItem) => void;
  removeShoppingItem: (id: string) => void;
  updateShoppingItemQuantity: (id: string, quantity: number) => void;
  getTotalPrice: () => number;
  getTotalSavings: () => number;
  loadShoppingList: () => Promise<void>;
  toggleStoreSelection: (storeName: string) => void;
  selectAllStores: () => void;
  deselectAllStores: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const [cartCount, setCartCount] = useState(0);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [shoppingStores, setShoppingStores] = useState<ShoppingListStore[]>([]);
  const [totalGlobal, setTotalGlobal] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { user, isConnected } = useAuth();

  // Fonction utilitaire pour regrouper les magasins par catégorie
  const regroupStoresByCategory = (
    stores: ShoppingListStore[]
  ): ShoppingListStore[] => {
    const storeMap = new Map<string, ShoppingListStore>();

    stores.forEach((store) => {
      // Regrouper tous les magasins réels sous "Store"
      if (store.storeName !== "Produits personnalisés") {
        const storeKey = "Store";

        if (!storeMap.has(storeKey)) {
          storeMap.set(storeKey, {
            storeName: storeKey,
            products: [],
            subtotal: 0,
            subtotalSaved: 0,
          });
        }

        const existingStore = storeMap.get(storeKey)!;
        existingStore.products.push(...store.products);
        existingStore.subtotal += store.subtotal;
        existingStore.subtotalSaved += store.subtotalSaved;
      } else {
        // Garder les produits personnalisés séparés
        storeMap.set(store.storeName, store);
      }
    });

    return Array.from(storeMap.values());
  };

  // Fonction utilitaire pour mettre à jour shoppingStores à partir de shoppingItems
  const updateShoppingStoresFromItems = (
    items: ShoppingItem[],
    currentStores: ShoppingListStore[]
  ): ShoppingListStore[] => {
    // Commencer avec les magasins existants
    const storeMap = new Map<string, ShoppingItem[]>();

    // D'abord, ajouter tous les produits existants dans leurs magasins respectifs
    currentStores.forEach((store) => {
      storeMap.set(store.storeName, []);
    });

    // Ensuite, ajouter tous les items
    items.forEach((item) => {
      // Déterminer le magasin basé sur la catégorie et les données de l'item
      let storeName: string;

      // D'abord, essayer de trouver le magasin existant pour cet item
      const existingStore = currentStores.find((s) =>
        s.products.some((p) => p.id === item.id)
      );

      if (existingStore) {
        storeName = existingStore.storeName;
        console.log(
          `🏪 Item "${item.name}" trouvé dans le magasin existant: ${storeName}`
        );
      } else {
        // Si pas de magasin trouvé, déterminer le magasin par catégorie
        if (item.category === ShoppingItemCategory.CUSTOM) {
          storeName = "Produits personnalisés";
        } else {
          // Tous les autres produits (catalogues, promos, haltes) vont dans "Store"
          storeName = "Store";
        }
        console.log(
          `🆕 Item "${item.name}" assigné au magasin: ${storeName} (catégorie: ${item.category})`
        );
      }

      if (!storeMap.has(storeName)) {
        storeMap.set(storeName, []);
      }
      storeMap.get(storeName)!.push(item);
    });

    // Convertir en ShoppingListStore[]
    const updatedStores = Array.from(storeMap.entries()).map(
      ([storeName, storeItems]) => {
        console.log(
          `🏪 Création du magasin "${storeName}" avec ${storeItems.length} produits`
        );
        return {
          storeName,
          products: storeItems.map((item) => {
            const productId = item.backendId || item.id;
            console.log(
              `📦 Produit "${item.name}" -> ID: ${productId} (backendId: ${item.backendId}, localId: ${item.id})`
            );
            return {
              id: productId, // Utiliser l'ID backend si disponible
              pos: storeName,
              image:
                typeof item.image === "string" ? item.image : item.image?.uri,
              title: item.name,
              quantity: item.quantity,
              price:
                item.category === ShoppingItemCategory.CATALOG
                  ? null
                  : (item as any).price || 0,
              promoPrice:
                item.category === ShoppingItemCategory.CATALOG
                  ? null
                  : (item as any).discountPrice || 0,
              isChecked: false,
            };
          }),
          subtotal: storeItems.reduce((sum, item) => {
            if (item.category === ShoppingItemCategory.CATALOG) return sum;
            return sum + ((item as any).price || 0) * item.quantity;
          }, 0),
          subtotalSaved: storeItems.reduce((sum, item) => {
            if (item.category === ShoppingItemCategory.CATALOG) return sum;
            const price = (item as any).price || 0;
            const discountPrice = (item as any).discountPrice || price;
            return sum + (price - discountPrice) * item.quantity;
          }, 0),
        };
      }
    );

    // Recalculer les totaux globaux
    const newTotalGlobal = updatedStores.reduce(
      (sum, store) => sum + store.subtotal,
      0
    );
    const newTotalSaved = updatedStores.reduce(
      (sum, store) => sum + store.subtotalSaved,
      0
    );

    setShoppingStores(updatedStores);
    setTotalGlobal(newTotalGlobal);
    setTotalSaved(newTotalSaved);

    // Mettre à jour selectedStores pour inclure les nouveaux magasins
    setSelectedStores((prevSelected) => {
      const newStoreNames = updatedStores.map((store) => store.storeName);
      const combinedStores = [...new Set([...prevSelected, ...newStoreNames])];
      return combinedStores;
    });

    return updatedStores;
  };

  // Charger la liste de courses depuis le backend
  const loadShoppingList = async () => {
    if (!isConnected || !user?.id) {
      console.log("ℹ️ Utilisateur non connecté, pas de chargement de la liste");
      return;
    }

    // Vérifier que l'utilisateur a bien un token JWT
    try {
      const token = await ApiService.getToken();
      if (!token) {
        console.log(
          "ℹ️ Utilisateur connecté mais sans token JWT, pas de chargement de la liste"
        );
        return;
      }
    } catch (error) {
      console.log(
        "ℹ️ Erreur lors de la vérification du token, pas de chargement de la liste"
      );
      return;
    }

    try {
      setIsLoading(true);
      console.log("🛒 Chargement de la liste de courses depuis le backend...");

      const shoppingListResponse = await ApiService.getShoppingList();

      // Convertir les données backend vers le format local pour la compatibilité
      // Utiliser les données originales AVANT le regroupement pour conserver category et dlc
      const allProducts = shoppingListResponse.stores.flatMap((store) =>
        store.products.map((product) => {
          // Les champs category et dlc sont déjà présents dans product du backend
          // Créer un nouvel objet avec tous les champs du backend
          const productWithCategory = {
            ...product,
            // S'assurer que les champs category et dlc sont préservés
            category: (product as any).category,
            dlc: (product as any).dlc,
          };
          console.log(
            "🔍 Produit avec catégorie:",
            productWithCategory.title,
            "Category:",
            productWithCategory.category,
            "DLC:",
            productWithCategory.dlc
          );
          return productWithCategory;
        })
      );

      // Regrouper les magasins selon la nouvelle organisation
      const regroupedStores = regroupStoresByCategory(
        shoppingListResponse.stores
      );

      // Mettre à jour les stores et totaux
      setShoppingStores(regroupedStores);
      setTotalGlobal(shoppingListResponse.totalGlobal);
      setTotalSaved(shoppingListResponse.totalSaved);

      // Sélectionner tous les magasins par défaut
      const allStoreNames = regroupedStores.map((store) => store.storeName);
      setSelectedStores(allStoreNames);
      console.log(
        "🔍 DONNÉES BRUTES BACKEND:",
        JSON.stringify(allProducts, null, 2)
      );
      const convertedItems: ShoppingItem[] = allProducts.map((item) => {
        // Déterminer la catégorie selon le type de produit
        let category = ShoppingItemCategory.PROMO_FLASH; // Par défaut

        console.log("🔍 Item pour item:", item.title, "Données:", item);

        if (!item.image && (item.price === 0 || item.price === null)) {
          // Si pas d'image et prix à 0, c'est probablement un produit personnalisé
          category = ShoppingItemCategory.CUSTOM;
          console.log("✅ Item détecté comme CUSTOM (fallback):", item.title);
        } else if ((item as any).category) {
          // Utiliser la catégorie stockée dans le backend
          const storedCategory = (item as any).category;
          if (storedCategory === "HALTE_GACHIS") {
            category = ShoppingItemCategory.HALTE_GACHIS;
          } else if (storedCategory === "PROMO_FLASH") {
            category = ShoppingItemCategory.PROMO_FLASH;
          } else {
            category = ShoppingItemCategory.PROMO_FLASH; // Défaut
          }
          console.log(
            `✅ Item détecté comme ${storedCategory} (catégorie stockée):`,
            item.title
          );
        } else if ((item as any).dlc) {
          // Si le produit a une DLC (date limite de consommation), c'est une halte au gâchis
          category = ShoppingItemCategory.HALTE_GACHIS;
          console.log(
            "✅ Item détecté comme HALTE_GACHIS (DLC présente):",
            item.title
          );
        } else {
          // Par défaut, considérer comme promo flash
          category = ShoppingItemCategory.PROMO_FLASH;
          console.log(
            "✅ Item détecté comme PROMO_FLASH (défaut):",
            item.title
          );
        }

        return {
          id: item.id || "",
          name: item.title || "",
          image: item.image ? { uri: item.image } : undefined, // Gérer les images undefined
          quantity: item.quantity || 0,
          category,
          originalId: item.id || "",
          backendId: item.id || "", // L'ID backend est l'ID Redis
          price: item.price ?? 0, // Prix principal
          originalPrice: item.price ?? 0, // Prix original
          discountPrice: item.promoPrice ?? item.price ?? 0, // Prix avec réduction
          consumeBefore: (item as any).dlc, // Date limite de consommation pour les haltes
        };
      });

      setShoppingItems(convertedItems);
      setCartCount(convertedItems.length);

      console.log(
        "✅ Liste de courses chargée:",
        convertedItems.length,
        "produits"
      );
    } catch (error) {
      console.error("❌ Erreur lors du chargement de la liste:", error);
      // En cas d'erreur, on garde la liste locale
    } finally {
      setIsLoading(false);
    }
  };

  // Charger la liste au démarrage si l'utilisateur est connecté
  useEffect(() => {
    if (isConnected && user?.id) {
      loadShoppingList();
    } else {
      // Si déconnecté, vider la liste
      setShoppingItems([]);
      setShoppingStores([]);
      setTotalGlobal(0);
      setTotalSaved(0);
      setSelectedStores([]);
      setCartCount(0);
    }
  }, [isConnected, user?.id]);

  const addToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  const removeFromCart = () => {
    setCartCount((prev) => Math.max(0, prev - 1));
  };

  const clearCart = async () => {
    // Mise à jour locale immédiate
    setCartCount(0);
    setShoppingItems([]);
    setShoppingStores([]);
    setTotalGlobal(0);
    setTotalSaved(0);
    setSelectedStores([]);

    // Synchronisation avec le backend si connecté
    if (isConnected && user?.id) {
      try {
        console.log("🔄 Vidage synchronisé avec le backend...");
        await ApiService.clearShoppingList("");
        console.log("✅ Liste vidée sur le backend");
      } catch (error) {
        console.error("❌ Erreur lors du vidage:", error);
        // En cas d'erreur, on garde le vidage local
      }
    }
  };

  const addShoppingItem = async (item: ShoppingItem) => {
    console.log("🛒 Ajout d'un item au panier:", item);

    // Mise à jour locale immédiate pour l'UX
    setShoppingItems((prev) => {
      // Vérifier si l'item existe déjà
      const existingItemIndex = prev.findIndex(
        (existingItem) =>
          existingItem.originalId === item.originalId &&
          existingItem.category === item.category
      );

      let updatedItems;
      if (existingItemIndex !== -1) {
        // Si l'item existe, augmenter la quantité
        updatedItems = [...prev];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity,
        };
        console.log("📈 Quantité augmentée pour:", item.name);
      } else {
        // Si l'item n'existe pas, l'ajouter
        updatedItems = [...prev, item];
        console.log("➕ Nouvel item ajouté:", item.name);
      }

      // Mettre à jour shoppingStores en temps réel
      const updatedStores = updateShoppingStoresFromItems(
        updatedItems,
        shoppingStores
      );
      console.log(
        "🏪 Magasins mis à jour:",
        updatedStores.map((s) => s.storeName)
      );
      setShoppingStores(updatedStores);
      return updatedItems;
    });
    setCartCount((prev) => prev + 1);

    // Synchronisation avec le backend si connecté
    if (isConnected && user?.id && item.originalId) {
      try {
        setIsAdding(true);
        console.log("🔄 Synchronisation avec le backend...");
        console.log("📦 Item complet:", item);
        console.log("📦 Original ID:", item.originalId);

        // Vérifier si c'est un produit de catalogue
        if (item.category === "CATALOG") {
          console.log(
            "⚠️ Produit de catalogue - synchronisation non supportée pour l'instant"
          );
          console.log("✅ Produit ajouté localement uniquement");
          Toast.show({
            type: "success",
            text1: "Produit ajouté !",
            text2: "Le produit a été ajouté à votre liste de courses",
            position: "top",
          });
          return;
        }

        // Convertir l'ID string en number pour l'API
        const productId = parseInt(item.originalId);
        if (isNaN(productId)) {
          console.warn("⚠️ ID de produit invalide:", item.originalId);
          return;
        }

        console.log("📦 Product ID converti:", productId);
        console.log("📦 Quantité:", item.quantity);

        const backendId = await ApiService.addToShoppingList("", {
          id: productId,
          quantity: item.quantity,
        });

        // Mettre à jour l'item avec l'ID backend
        if (backendId) {
          setShoppingItems((prev) =>
            prev.map((prevItem) =>
              prevItem.id === item.id ? { ...prevItem, backendId } : prevItem
            )
          );
          console.log("🆔 ID backend assigné:", backendId);
        }

        console.log("✅ Produit synchronisé avec le backend");
        Toast.show({
          type: "success",
          text1: "Produit ajouté !",
          text2: "Le produit a été ajouté à votre liste de courses",
          position: "top",
        });
      } catch (error) {
        console.error("❌ Erreur lors de la synchronisation:", error);
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de synchroniser avec le serveur",
          position: "top",
        });
        // En cas d'erreur, on garde l'ajout local
      } finally {
        setIsAdding(false);
      }
    }
  };

  const removeShoppingItem = async (id: string) => {
    // Mise à jour locale immédiate
    setShoppingItems((prev) => {
      const updatedItems = prev.filter((item) => item.id !== id);
      // Mettre à jour shoppingStores en temps réel
      const updatedStores = updateShoppingStoresFromItems(
        updatedItems,
        shoppingStores
      );
      setShoppingStores(updatedStores);
      return updatedItems;
    });
    setCartCount((prev) => Math.max(0, prev - 1));

    // Synchronisation avec le backend si connecté
    if (isConnected && user?.id) {
      try {
        setIsRemoving(true);
        console.log("🔄 Suppression synchronisée avec le backend...");
        console.log("📦 ID du produit à supprimer:", id);

        // Vérifier si c'est un produit de catalogue (pas de synchronisation backend)
        const item = shoppingItems.find((item) => item.id === id);
        if (item && item.category === "CATALOG") {
          console.log(
            "⚠️ Produit de catalogue - suppression locale uniquement"
          );
          console.log("✅ Produit supprimé localement");
          Toast.show({
            type: "success",
            text1: "Produit supprimé !",
            text2: "Le produit a été retiré de votre liste de courses",
            position: "top",
          });
          return;
        }

        // Utiliser l'ID backend si disponible, sinon l'ID local
        const backendId = item?.backendId || id;
        console.log("📦 ID local:", id);
        console.log("📦 ID backend:", backendId);
        console.log("📦 Item trouvé:", item);

        await ApiService.removeFromShoppingList("", backendId);
        console.log("✅ Produit supprimé du backend");
        Toast.show({
          type: "success",
          text1: "Produit supprimé !",
          text2: "Le produit a été retiré de votre liste de courses",
          position: "top",
        });
      } catch (error) {
        console.error("❌ Erreur lors de la suppression:", error);
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: "Impossible de supprimer le produit du serveur",
          position: "top",
        });
        // En cas d'erreur, on garde la suppression locale
      } finally {
        setIsRemoving(false);
      }
    }
  };

  const updateShoppingItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeShoppingItem(id);
      return;
    }

    setShoppingItems((prev) => {
      const updatedItems = prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      // Mettre à jour shoppingStores en temps réel
      const updatedStores = updateShoppingStoresFromItems(
        updatedItems,
        shoppingStores
      );
      setShoppingStores(updatedStores);
      return updatedItems;
    });
  };

  const getTotalPrice = () => {
    return shoppingItems.reduce((total, item) => {
      if (item.category === ShoppingItemCategory.CATALOG) {
        return total; // Pas de prix pour les catalogues
      }
      if (
        item.category === ShoppingItemCategory.PROMO_FLASH ||
        item.category === ShoppingItemCategory.HALTE_GACHIS
      ) {
        return total + item.discountPrice * item.quantity;
      }
      return total;
    }, 0);
  };

  const getTotalSavings = () => {
    return shoppingItems.reduce((total, item) => {
      if (
        item.category === ShoppingItemCategory.PROMO_FLASH ||
        item.category === ShoppingItemCategory.HALTE_GACHIS
      ) {
        const originalPrice = item.originalPrice || item.discountPrice;
        const savings = (originalPrice - item.discountPrice) * item.quantity;
        return total + Math.max(0, savings);
      }
      return total;
    }, 0);
  };

  // Fonctions pour gérer la sélection des magasins
  const toggleStoreSelection = (storeName: string) => {
    setSelectedStores((prev) => {
      if (prev.includes(storeName)) {
        return prev.filter((name) => name !== storeName);
      } else {
        return [...prev, storeName];
      }
    });
  };

  const selectAllStores = () => {
    const allStoreNames = shoppingStores.map((store) => store.storeName);
    setSelectedStores(allStoreNames);
  };

  const deselectAllStores = () => {
    setSelectedStores([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartCount,
        shoppingItems,
        shoppingStores,
        totalGlobal,
        totalSaved,
        selectedStores,
        isLoading,
        isAdding,
        isRemoving,
        addToCart,
        removeFromCart,
        clearCart,
        addShoppingItem,
        removeShoppingItem,
        updateShoppingItemQuantity,
        getTotalPrice,
        getTotalSavings,
        loadShoppingList,
        toggleStoreSelection,
        selectAllStores,
        deselectAllStores,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
