import { getApiUrl, getPartnerApiUrl } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Clés API
const PUBLIC_API_KEY = "fa9a0d";
const PARTNER_API_KEY = "2984a55b-5fe3-4de8-8e06-2370a1bc2541"; // Clé partenaire officielle

export interface LoginRequest {
  email: string;
  tokenAccess: string;
  accountType: "GOOGLE" | "APPLE" | "FACEBOOK" | "EMAIL";
}

export interface LoginResponse {
  token: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Types pour les données de l'API
export interface Catalog {
  id: number;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  catalogueUrl?: string;
  shortenUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface PromoFlash {
  id: number;
  title: string;
  description?: string;
  url?: string;
  price?: number;
  discount_price?: number;
  start_date?: string;
  end_date?: string;
  distance?: string;
  shortenUrl?: string;
}

export interface HalteGachi {
  id: number;
  title: string;
  description?: string;
  url?: string;
  price?: number;
  discount_price?: number;
  start_date?: string;
  end_date?: string;
  distance?: string;
  shortenUrl?: string;
  dlc?: string; // Date Limite de Consommation
  latitude?: number;
  longitude?: number;
}

// Types pour la liste de courses
export interface ShoppingListItem {
  id: string;
  pos: string;
  image: string;
  title: string;
  quantity: number;
  price: number | null;
  promoPrice: number | null;
  isChecked: boolean;
}

// Nouvelle interface pour les magasins
export interface ShoppingListStore {
  storeName: string;
  products: ShoppingListItem[];
  subtotal: number;
  subtotalSaved: number;
}

// Interface pour la réponse complète du backend
export interface ShoppingListResponse {
  stores: ShoppingListStore[];
  totalGlobal: number;
  totalSaved: number;
}

export interface AddToShoppingListRequest {
  id: number;
  quantity: number;
}

export interface AddCustomProductRequest {
  title: string;
  quantity: number;
  isChecked?: boolean;
}

class ApiService {
  /**
   * Test de connectivité avec le backend
   */
  async testBackendConnection(): Promise<boolean> {
    try {
      console.log("🔍 Test de connectivité avec le backend...");
      console.log("📡 URL de test:", getPartnerApiUrl("/account/login"));

      const response = await fetch(getPartnerApiUrl("/account/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PARTNER_API_KEY}`,
        },
        body: JSON.stringify({
          email: "test@example.com",
          tokenAccess: "test_token",
          accountType: "GOOGLE",
        }),
      });

      console.log("📊 Status de test:", response.status);

      // Même si c'est une erreur 401/400, cela signifie que le backend répond
      return response.status !== 0 && response.status < 500;
    } catch (error) {
      console.log("❌ Backend inaccessible:", error);
      return false;
    }
  }

  private async getStoredToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem("jwt_token");
      console.log("🔍 Token récupéré:", token ? "✅ Présent" : "❌ Absent");
      if (token) {
        console.log(
          "🔍 Token (premiers caractères):",
          token.substring(0, 20) + "..."
        );
      }
      return token;
    } catch (error) {
      console.error("Erreur lors de la récupération du token:", error);
      return null;
    }
  }

  /**
   * Récupérer l'ID utilisateur depuis le token JWT
   */
  private getUserIdFromToken(token: string): string | null {
    try {
      // Décoder le payload du JWT (partie du milieu)
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      console.log("🔍 Payload JWT décodé:", decoded);
      return decoded.id || null;
    } catch (error) {
      console.error("Erreur lors du décodage du token:", error);
      return null;
    }
  }

  private async storeToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem("jwt_token", token);
      console.log("💾 Token stocké avec succès");
      console.log(
        "💾 Token (premiers caractères):",
        token.substring(0, 20) + "..."
      );
    } catch (error) {
      console.error("❌ Erreur lors du stockage du token:", error);
      throw new Error("Impossible de stocker le token JWT");
    }
  }

  private async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem("jwt_token");
    } catch (error) {
      console.error("Erreur lors de la suppression du token:", error);
    }
  }

  /**
   * Se connecter avec un token d'accès (Google, Apple, etc.)
   */
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      console.log("🔐 Tentative de connexion avec l'API backend...");
      console.log("📡 URL:", getPartnerApiUrl("/account/login"));
      console.log("🔑 Clé API partenaire:", PARTNER_API_KEY);
      console.log("📦 Données envoyées:", JSON.stringify(loginData, null, 2));

      const response = await fetch(getPartnerApiUrl("/account/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PARTNER_API_KEY}`,
        },
        body: JSON.stringify(loginData),
      });

      console.log("📊 Status de la réponse:", response.status);
      console.log(
        "📊 Headers de la réponse:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log("❌ Erreur de réponse:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const data: LoginResponse = await response.json();
      console.log("📦 Réponse de connexion:", data);

      // Stocker le token JWT
      await this.storeToken(data.token);

      console.log("✅ Connexion backend réussie, token stocké");
      return data;
    } catch (error) {
      console.error("❌ Erreur lors de la connexion backend:", error);
      throw error;
    }
  }

  /**
   * Récupérer le token JWT stocké
   */
  async getToken(): Promise<string | null> {
    return await this.getStoredToken();
  }

  /**
   * Vérifier si l'utilisateur est connecté (a un token valide)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return token !== null;
  }

  /**
   * Se déconnecter (supprimer le token)
   */
  async logout(): Promise<void> {
    await this.removeToken();
    console.log("🚪 Déconnexion backend effectuée");
  }

  /**
   * Faire une requête authentifiée vers l'API partenaire
   */
  async authenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getStoredToken();

    if (!token) {
      throw new Error("Aucun token d'authentification trouvé");
    }

    const url = getPartnerApiUrl(endpoint);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PARTNER_API_KEY}`, // Clé API partenaire
      "x-api-token": token, // Token utilisateur JWT
      ...options.headers,
    };

    console.log("🔐 Requête authentifiée:");
    console.log("📡 URL:", url);
    console.log(
      "🔑 Authorization header (clé API):",
      `Bearer ${PARTNER_API_KEY.substring(0, 20)}...`
    );
    console.log("🔑 x-api-token (JWT):", `Bearer ${token.substring(0, 20)}...`);
    console.log("📦 Headers:", headers);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log("📊 Status de la réponse:", response.status);
    console.log(
      "📊 Headers de la réponse:",
      Object.fromEntries(response.headers.entries())
    );

    return response;
  }

  // ===== MÉTHODES POUR LA LISTE DE COURSES =====

  /**
   * Récupérer la liste de courses d'un utilisateur
   */
  async getShoppingList(userId?: string): Promise<ShoppingListResponse> {
    try {
      console.log("🛒 Récupération de la liste de courses...");

      // Si userId n'est pas fourni, le récupérer depuis le token JWT
      let actualUserId = userId;
      if (!actualUserId) {
        const token = await this.getStoredToken();
        if (!token) {
          throw new Error("Aucun token d'authentification trouvé");
        }
        actualUserId = this.getUserIdFromToken(token) || "";
        if (!actualUserId) {
          throw new Error(
            "Impossible de récupérer l'ID utilisateur depuis le token"
          );
        }
      }

      console.log("👤 ID utilisateur utilisé:", actualUserId);

      const response = await this.authenticatedRequest(
        `/user/shopping_list/${actualUserId}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log("❌ Erreur de réponse:", errorText);
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseText = await response.text();
      console.log("📦 Réponse brute du backend:", responseText);

      if (!responseText || responseText.trim() === "") {
        console.log("⚠️ Réponse vide du backend - liste de courses vide");
        return {
          stores: [],
          totalGlobal: 0,
          totalSaved: 0,
        };
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Erreur de parsing JSON:", parseError);
        console.log("📦 Contenu reçu:", responseText);
        throw new Error("Réponse invalide du backend");
      }

      console.log("📦 Données parsées:", data);

      // Vérifier si la réponse a la structure attendue
      if (!data || typeof data !== "object") {
        console.log("⚠️ Structure de données inattendue:", data);
        return {
          stores: [],
          totalGlobal: 0,
          totalSaved: 0,
        };
      }

      // Si la réponse a la structure { stores: [], totalGlobal: 0, totalSaved: 0 }
      if (data.stores && Array.isArray(data.stores)) {
        console.log("📦 Structure avec stores détectée");

        // Convertir la structure backend vers le format local
        const stores: ShoppingListStore[] = data.stores.map((store: any) => {
          console.log("🏪 Store:", store.storeName);
          const products: ShoppingListItem[] = [];

          if (store.products && Array.isArray(store.products)) {
            store.products.forEach((product: any) => {
              console.log("📦 Produit backend:", product);
              // Convertir vers le format ShoppingListItem
              const convertedItem: ShoppingListItem = {
                id: product.productId || product.id,
                pos: store.storeName, // Position du magasin
                image: product.imageUrl || product.image, // URL de l'image
                title: product.title, // Titre du produit
                quantity: product.quantity || 1,
                price: product.price || null,
                promoPrice: product.promoPrice || null,
                isChecked: product.isChecked || false,
              };
              console.log("📦 Produit converti:", convertedItem);
              products.push(convertedItem);
            });
          }

          return {
            storeName: store.storeName,
            products,
            subtotal: store.subtotal || 0,
            subtotalSaved: store.subtotalSaved || 0,
          };
        });

        console.log("🏪 Stores convertis:", stores);

        return {
          stores,
          totalGlobal: data.totalGlobal || 0,
          totalSaved: data.totalSaved || 0,
        };
      }

      // Si la réponse a l'ancienne structure (données Redis directes)
      if (Object.keys(data).length > 0) {
        console.log("📦 Structure Redis directe détectée");
        console.log("📦 Clés Redis:", Object.keys(data));

        // Convertir les données Redis en array d'objets
        const products: ShoppingListItem[] = Object.entries(data).map(
          ([id, dataString]) => {
            console.log("📦 ID Redis:", id);
            console.log("📦 Données brutes:", dataString);

            const itemData = JSON.parse(dataString as string);
            console.log("📦 Données parsées:", itemData);

            const convertedItem: ShoppingListItem = {
              id,
              pos: itemData.pos || "Inconnu",
              image: itemData.image || "",
              title: itemData.title || "Produit sans nom",
              quantity: itemData.quantity || 1,
              price: itemData.price ?? null,
              promoPrice: itemData.promoPrice ?? null,
              isChecked: itemData.isChecked || false,
            };
            console.log("📦 Item converti:", convertedItem);

            return convertedItem;
          }
        );

        // Grouper par magasin pour l'ancienne structure
        const storeMap = new Map<string, ShoppingListItem[]>();
        products.forEach((product) => {
          const storeName = product.pos;
          if (!storeMap.has(storeName)) {
            storeMap.set(storeName, []);
          }
          storeMap.get(storeName)!.push(product);
        });

        const stores: ShoppingListStore[] = Array.from(storeMap.entries()).map(
          ([storeName, storeProducts]) => ({
            storeName,
            products: storeProducts,
            subtotal: storeProducts.reduce(
              (sum, p) => sum + (p.price || 0) * p.quantity,
              0
            ),
            subtotalSaved: storeProducts.reduce(
              (sum, p) =>
                sum +
                ((p.price || 0) - (p.promoPrice || p.price || 0)) * p.quantity,
              0
            ),
          })
        );

        const totalGlobal = stores.reduce(
          (sum, store) => sum + store.subtotal,
          0
        );
        const totalSaved = stores.reduce(
          (sum, store) => sum + store.subtotalSaved,
          0
        );

        return {
          stores,
          totalGlobal,
          totalSaved,
        };
      }

      console.log("⚠️ Aucune donnée trouvée dans la réponse");
      return {
        stores: [],
        totalGlobal: 0,
        totalSaved: 0,
      };
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération de la liste de courses:",
        error
      );
      throw error;
    }
  }

  /**
   * Ajouter un produit à la liste de courses
   */
  async addToShoppingList(
    userId: string,
    productData: AddToShoppingListRequest
  ): Promise<string | undefined> {
    try {
      console.log("➕ Ajout d'un produit à la liste de courses...");
      console.log("📦 Produit envoyé:", productData);
      console.log("📦 ID du produit:", productData.id);
      console.log("📦 Quantité:", productData.quantity);

      // Si userId n'est pas fourni, le récupérer depuis le token JWT
      let actualUserId = userId;
      if (!actualUserId) {
        const token = await this.getStoredToken();
        if (!token) {
          throw new Error("Aucun token d'authentification trouvé");
        }
        actualUserId = this.getUserIdFromToken(token) || "";
        if (!actualUserId) {
          throw new Error(
            "Impossible de récupérer l'ID utilisateur depuis le token"
          );
        }
      }

      console.log("👤 ID utilisateur utilisé:", actualUserId);

      const response = await this.authenticatedRequest(
        `/user/shopping_list/${actualUserId}/add`,
        {
          method: "POST",
          body: JSON.stringify(productData),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Produit ajouté à la liste de courses:", result);

      return result.productId; // Retourner l'ID backend
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du produit:", error);
      throw error;
    }
  }

  /**
   * Ajouter un produit personnalisé à la liste de courses
   */
  async addCustomProductToShoppingList(
    userId: string,
    productData: AddCustomProductRequest
  ): Promise<void> {
    try {
      console.log(
        "➕ Ajout d'un produit personnalisé à la liste de courses..."
      );
      console.log("📦 Produit personnalisé:", productData);

      // Si userId n'est pas fourni, le récupérer depuis le token JWT
      let actualUserId = userId;
      if (!actualUserId) {
        const token = await this.getStoredToken();
        if (!token) {
          throw new Error("Aucun token d'authentification trouvé");
        }
        actualUserId = this.getUserIdFromToken(token) || "";
        if (!actualUserId) {
          throw new Error(
            "Impossible de récupérer l'ID utilisateur depuis le token"
          );
        }
      }

      console.log("👤 ID utilisateur utilisé:", actualUserId);

      const response = await this.authenticatedRequest(
        `/user/shopping_list/${actualUserId}/add-other`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        "✅ Produit personnalisé ajouté à la liste de courses:",
        data
      );
    } catch (error) {
      console.error(
        "❌ Erreur lors de l'ajout du produit personnalisé:",
        error
      );
      throw error;
    }
  }

  /**
   * Supprimer un produit de la liste de courses
   */
  async removeFromShoppingList(
    userId: string,
    productId: string
  ): Promise<void> {
    try {
      console.log("🗑️ Suppression d'un produit de la liste de courses...");
      console.log("📦 ID du produit:", productId);

      // Si userId n'est pas fourni, le récupérer depuis le token JWT
      let actualUserId = userId;
      if (!actualUserId) {
        const token = await this.getStoredToken();
        if (!token) {
          throw new Error("Aucun token d'authentification trouvé");
        }
        actualUserId = this.getUserIdFromToken(token) || "";
        if (!actualUserId) {
          throw new Error(
            "Impossible de récupérer l'ID utilisateur depuis le token"
          );
        }
      }

      console.log("👤 ID utilisateur utilisé:", actualUserId);

      const response = await this.authenticatedRequest(
        `/user/shopping_list/${actualUserId}/remove`,
        {
          method: "DELETE",
          body: JSON.stringify({ id: productId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      console.log("✅ Produit supprimé de la liste de courses");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du produit:", error);
      throw error;
    }
  }

  /**
   * Vider complètement la liste de courses
   */
  async clearShoppingList(userId: string): Promise<void> {
    try {
      console.log("🧹 Vidage de la liste de courses...");

      const response = await this.authenticatedRequest(
        `/user/shopping_list/${userId}/clear`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      console.log("✅ Liste de courses vidée");
    } catch (error) {
      console.error("❌ Erreur lors du vidage de la liste:", error);
      throw error;
    }
  }

  /**
   * Récupérer les catalogues (endpoint public)
   */
  async getCatalogs(
    page: number = 1,
    pageSize: number = 10
  ): Promise<Catalog[]> {
    try {
      console.log(
        `📦 Récupération des catalogues (page: ${page}, pageSize: ${pageSize})`
      );

      const response = await fetch(
        getApiUrl(`/catalogs?page=${page}&pageSize=${pageSize}`),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PUBLIC_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Catalogues récupérés:", data);
      return data || [];
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des catalogues:", error);
      // Retourner des données de test en cas d'erreur
      return this.getMockCatalogs();
    }
  }

  /**
   * Récupérer les promos flash (endpoint public)
   */
  async getPromoFlash(
    latitude: number,
    longitude: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PromoFlash[]> {
    try {
      console.log(
        `⚡ Récupération des promos flash (lat: ${latitude}, lng: ${longitude})`
      );

      const response = await fetch(
        getApiUrl(
          `/promo_flash?latitude=${latitude}&longitude=${longitude}&page=${page}&pageSize=${pageSize}`
        ),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PUBLIC_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Promos flash récupérées:", data);

      // Extraire les coordonnées des points de vente
      const formattedData = data.map((item: any) => ({
        ...item,
        latitude: item.point_of_sale?.latitude,
        longitude: item.point_of_sale?.longitude,
      }));

      return formattedData || [];
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des promos flash:",
        error
      );
      // Retourner des données de test en cas d'erreur
      return this.getMockPromoFlash();
    }
  }

  /**
   * Récupérer les haltes gachi (endpoint public)
   */
  async getHalteGachi(
    latitude: number,
    longitude: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<HalteGachi[]> {
    try {
      console.log(
        `🛑 Récupération des haltes gachi (lat: ${latitude}, lng: ${longitude})`
      );

      const response = await fetch(
        getApiUrl(
          `/halte_gachi?latitude=${latitude}&longitude=${longitude}&page=${page}&pageSize=${pageSize}`
        ),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PUBLIC_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Haltes gachi récupérées:", data);

      // Extraire les coordonnées des points de vente
      const formattedData = data.map((item: any) => ({
        ...item,
        latitude: item.point_of_sale?.latitude,
        longitude: item.point_of_sale?.longitude,
      }));

      return formattedData || [];
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des haltes gachi:",
        error
      );
      // Retourner des données de test en cas d'erreur
      return this.getMockHalteGachi();
    }
  }

  // Méthodes pour les données de test (en cas d'erreur API)
  private getMockCatalogs(): Catalog[] {
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 jours

    return [
      {
        id: 1,
        name: "Catalogue Test 1",
        description: "Description du catalogue test",
        thumbnailUrl: "https://via.placeholder.com/300x200",
        catalogueUrl: "https://example.com/catalog1",
        shortenUrl: "https://short.ly/catalog1",
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
      },
      {
        id: 2,
        name: "Catalogue Test 2",
        description: "Description du catalogue test 2",
        thumbnailUrl: "https://via.placeholder.com/300x200",
        catalogueUrl: "https://example.com/catalog2",
        shortenUrl: "https://short.ly/catalog2",
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
      },
    ];
  }

  private getMockPromoFlash(): PromoFlash[] {
    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    return [
      {
        id: 1,
        title: "Promo Flash Test 1",
        description: "Description de la promo flash",
        url: "https://via.placeholder.com/300x200",
        price: 25.99,
        discount_price: 15.99,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        distance: "2.5 km",
        shortenUrl: "https://short.ly/promo1",
      },
      {
        id: 2,
        title: "Promo Flash Test 2",
        description: "Description de la promo flash 2",
        url: "https://via.placeholder.com/300x200",
        price: 19.99,
        discount_price: 9.99,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        distance: "1.8 km",
        shortenUrl: "https://short.ly/promo2",
      },
    ];
  }

  private getMockHalteGachi(): HalteGachi[] {
    const now = new Date();
    const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 jours

    return [
      {
        id: 1,
        title: "Halte Gachi Test 1",
        description: "Description de la halte gachi",
        url: "https://via.placeholder.com/300x200",
        price: 20.0,
        discount_price: 12.0,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        distance: "3.2 km",
        shortenUrl: "https://short.ly/halte1",
        latitude: 6.458688,
        longitude: 2.3402551,
      },
      {
        id: 2,
        title: "Halte Gachi Test 2",
        description: "Description de la halte gachi 2",
        url: "https://via.placeholder.com/300x200",
        price: 15.0,
        discount_price: 8.0,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        distance: "1.5 km",
        shortenUrl: "https://short.ly/halte2",
        latitude: 6.468688,
        longitude: 2.3502551,
      },
    ];
  }

  // ===== SOCIAL ACTIONS =====

  /**
   * Récupérer les statistiques d'actions sociales d'un objet
   */
  async getSocialActions(
    objectId: number,
    objectType: string
  ): Promise<{
    LIKE: number;
    SAVE: number;
    SHARE: number;
  }> {
    try {
      console.log("📊 Récupération des stats sociales...");
      console.log("📦 Object ID:", objectId);
      console.log("📦 Object Type:", objectType);

      const url = `${getPartnerApiUrl(
        "/social_actions"
      )}?object_id=${objectId}&object_type=${objectType}`;
      console.log("📡 URL complète:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PARTNER_API_KEY}`,
        },
      });

      console.log("📊 Status de la réponse:", response.status);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("📊 Stats récupérées:", data);

      return {
        LIKE: data.LIKE || 0,
        SAVE: data.SAVE || 0,
        SHARE: data.SHARE || 0,
      };
    } catch (error) {
      // Erreur silencieuse - retourner des valeurs par défaut
      console.log("📊 Stats par défaut (objet non trouvé en base)");
      return {
        LIKE: 0,
        SAVE: 0,
        SHARE: 0,
      };
    }
  }

  /**
   * Incrémenter une action sociale (like, save, share)
   */
  async incrementSocialAction(
    objectId: number,
    objectType: string,
    actionName: "LIKE" | "SAVE" | "SHARE"
  ): Promise<void> {
    try {
      console.log("➕ Incrémentation d'une action sociale...");
      console.log("📦 Object ID:", objectId);
      console.log("📦 Object Type:", objectType);
      console.log("📦 Action:", actionName);

      const response = await this.authenticatedRequest(
        "/social_actions/increment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            object_id: objectId,
            object_type: objectType,
            action_name: actionName,
          }),
        }
      );

      console.log("➕ Status de la réponse:", response.status);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Action sociale incrémentée:", data);
    } catch (error) {
      // Erreur silencieuse - l'objet n'existe peut-être pas dans la base de données
      console.log("⚠️ Action non incrémentée (objet non trouvé en base)");
      throw error;
    }
  }

  /**
   * Décrémenter une action sociale (unlike)
   */
  async decrementSocialAction(
    objectId: number,
    objectType: string,
    actionName: "LIKE" | "SAVE" | "SHARE"
  ): Promise<void> {
    try {
      console.log("➖ Décrémentation d'une action sociale...");
      console.log("📦 Object ID:", objectId);
      console.log("📦 Object Type:", objectType);
      console.log("📦 Action:", actionName);

      const response = await this.authenticatedRequest(
        "/social_actions/decrement",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            object_id: objectId,
            object_type: objectType,
            action_name: actionName,
          }),
        }
      );

      console.log("➖ Status de la réponse:", response.status);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Action sociale décrémentée:", data);
    } catch (error) {
      // Erreur silencieuse - l'objet n'existe peut-être pas dans la base de données
      console.log("⚠️ Action non décrémentée (objet non trouvé en base)");
      throw error;
    }
  }

  /**
   * Incrémenter le compteur de vues d'un objet
   */
  async incrementView(objectId: number, objectType: string): Promise<void> {
    try {
      console.log("👁️ Incrémentation des vues...");
      console.log("📦 Object ID:", objectId);
      console.log("📦 Object Type:", objectType);

      const response = await this.authenticatedRequest(
        "/social_actions/increment_view",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            object_id: objectId,
            object_type: objectType,
          }),
        }
      );

      console.log("👁️ Status de la réponse:", response.status);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Vue incrémentée:", data);
    } catch (error) {
      // Erreur silencieuse - l'objet n'existe peut-être pas dans la base de données
      console.log("⚠️ Vue non incrémentée (objet non trouvé en base)");
      throw error;
    }
  }

  /**
   * Envoie la localisation pour recevoir des notifications géolocalisées
   */
  async sendLocationForNotifications(
    latitude: number,
    longitude: number,
    fcmToken: string,
    radius: number = 100,
    isAppActive: boolean = false
  ): Promise<any> {
    try {
      console.log("📍 Envoi de la localisation pour notifications...");
      console.log("📍 Latitude:", latitude);
      console.log("📍 Longitude:", longitude);
      console.log("📍 Rayon:", radius);
      console.log("🔑 FCM Token:", fcmToken);

      const response = await this.authenticatedRequest(
        "/user/notification/send-location",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude,
            longitude,
            fcmToken, // Utilise fcmToken pour FCM Direct
            radius,
            isAppActive, // Indique si l'app est active pour éviter les notifications
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Localisation envoyée avec succès:", data);
      return data;
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de la localisation:", error);
      throw error;
    }
  }
}

export default new ApiService();
