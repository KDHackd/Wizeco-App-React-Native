import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import ApiService from "@/services/ApiService";
import LikeService from "@/services/LikeService";
import { ShareService } from "@/services/ShareService";
import { ShoppingItemCategory, SocialStats } from "@/types/ShoppingListTypes";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import LoginRequiredModal from "./LoginRequiredModal";

export type HalteItem = {
  id: number;
  title: string;
  subtitle: string;
  validity: string;
  likes: number;
  comments: number;
  image: any;
  priceCurrent?: number;
  priceOld?: number;
  currency?: string;
  consumeBefore?: string;
  distanceKm?: number;
  halteUrl?: string; // URL de la halte au gâchis à partager
  shortenUrl?: string; // URL raccourcie
  isLiked?: boolean; // État du like pour l'utilisateur
};

type HalteCardProps = {
  item: HalteItem;
  onPress?: (id: number) => void;
  onNavigateToProfile?: () => void;
};

function splitPrice(value: number): { intPart: string; fracPart: string } {
  const [intPart, fracPart] = value.toFixed(2).split(".");
  return { intPart, fracPart };
}

export default function HalteCard({
  item,
  onPress,
  onNavigateToProfile,
}: HalteCardProps) {
  const { addShoppingItem, isAdding } = useCart();
  const { isConnected, user } = useAuth();
  const [isLiked, setIsLiked] = useState(item.isLiked || false);
  const [likesCount, setLikesCount] = useState(item.likes);
  const [socialStats, setSocialStats] = useState<SocialStats>({
    LIKE: 0,
    SAVE: 0,
    SHARE: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginAction, setLoginAction] = useState<string>("");

  // Récupérer les stats sociales et l'état du like au chargement
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingStats(true);

        // Charger les stats sociales seulement si l'utilisateur est connecté
        if (isConnected) {
          try {
            const stats = await ApiService.getSocialActions(
              item.id,
              "HALTE_GACHIS"
            );
            setSocialStats(stats);
            console.log("📊 Stats sociales chargées (halte):", stats);
          } catch (error) {
            // En cas d'erreur (objet non trouvé), utiliser des valeurs par défaut
            setSocialStats({ LIKE: 0, SAVE: 0, SHARE: 0 });
            console.log("📊 Stats par défaut (erreur API ou objet non trouvé)");
          }
        } else {
          // Valeurs par défaut si non connecté
          setSocialStats({ LIKE: 0, SAVE: 0, SHARE: 0 });
          console.log("📊 Stats par défaut (utilisateur non connecté)");
        }

        // Vérifier si l'item est liké localement (avec ID utilisateur si connecté)
        const isItemLiked = await LikeService.isLiked(
          item.id,
          "HALTE_GACHIS",
          isConnected ? user?.id : undefined
        );
        setIsLiked(isItemLiked);
        console.log("❤️ État du like chargé (halte):", isItemLiked);
      } catch (error) {
        console.error(
          "❌ Erreur lors du chargement des données (halte):",
          error
        );
        // En cas d'erreur, utiliser des valeurs par défaut
        setSocialStats({ LIKE: 0, SAVE: 0, SHARE: 0 });
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadData();
  }, [item.id, isConnected, user?.id]);

  // Incrémenter les vues automatiquement au chargement (seulement si connecté ET avec token JWT)
  useEffect(() => {
    const incrementViews = async () => {
      if (!isConnected) {
        console.log("👁️ Vue non incrémentée (utilisateur non connecté)");
        return;
      }

      // Vérifier que l'utilisateur a bien un token JWT
      try {
        const token = await ApiService.getToken();
        if (!token) {
          console.log(
            "👁️ Vue non incrémentée (utilisateur connecté mais sans token JWT)"
          );
          return;
        }
      } catch (error) {
        console.log(
          "👁️ Vue non incrémentée (erreur lors de la vérification du token)"
        );
        return;
      }

      try {
        await ApiService.incrementView(item.id, "HALTE_GACHIS");
        console.log("👁️ Vue incrémentée automatiquement (halte)");
      } catch (error) {
        // Erreur silencieuse - l'objet n'existe peut-être pas dans la base de données
        console.log("👁️ Vue non incrémentée (objet non trouvé en base)");
      }
    };

    incrementViews();
  }, [item.id, isConnected]);

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
    setLoginAction("");
  };

  const handleLogin = () => {
    setShowLoginModal(false);
    setLoginAction("");
    onNavigateToProfile?.();
  };
  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image source={item.image} style={styles.cover} resizeMode="contain" />
        {typeof item.priceCurrent === "number" && (
          <View style={styles.priceBadge}>
            {(() => {
              const { intPart, fracPart } = splitPrice(item.priceCurrent!);
              return (
                <View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceInt}>{intPart}</Text>
                    <View style={styles.supContainerEuro}>
                      <Text style={styles.priceCurrency}>
                        {item.currency ?? "€"}
                      </Text>
                    </View>
                    <View style={styles.supContainerFrac}>
                      <Text style={styles.priceFrac}>{fracPart}</Text>
                    </View>
                  </View>
                  {typeof item.priceOld === "number" && (
                    <View style={styles.oldPriceWrapper}>
                      {(() => {
                        const { intPart: oldInt, fracPart: oldFrac } =
                          splitPrice(item.priceOld!);
                        return (
                          <View style={{ position: "relative" }}>
                            <View style={styles.priceOldRow}>
                              <Text style={styles.priceOldInt}>{oldInt}</Text>
                              <View style={styles.supContainerOldEuro}>
                                <Text style={styles.priceOldCurrency}>
                                  {item.currency ?? "€"}
                                </Text>
                              </View>
                              <View style={styles.supContainerOldFrac}>
                                <Text style={styles.priceOldFrac}>
                                  {oldFrac}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.redStrike} />
                          </View>
                        );
                      })()}
                    </View>
                  )}
                </View>
              );
            })()}
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {item.subtitle}
        </Text>
        <Text style={styles.validity}>{item.validity}</Text>
        {item.consumeBefore && (
          <View style={styles.consumeButton}>
            <Ionicons name="time-outline" size={16} color="#FFFFFF" />
            <Text style={styles.consumeText}>
              Consommer avant le {item.consumeBefore}
            </Text>
          </View>
        )}
        <View style={styles.footerRow}>
          <View style={styles.statsRow}>
            {typeof item.distanceKm === "number" && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 8,
                }}
              >
                <Ionicons name="location-outline" size={18} color="#E53935" />
                <Text style={styles.stat}>
                  {String(item.distanceKm).replace(".", ",")} km
                </Text>
              </View>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.statButton,
                pressed && styles.statButtonPressed,
              ]}
              onPress={async () => {
                if (!isConnected) {
                  setLoginAction("liker");
                  setShowLoginModal(true);
                  return;
                }

                try {
                  // Toggle le like localement (avec ID utilisateur si connecté)
                  const newIsLiked = await LikeService.toggleLike(
                    item.id,
                    "HALTE_GACHIS",
                    isConnected ? user?.id : undefined
                  );
                  setIsLiked(newIsLiked);

                  // Appeler l'API selon l'état du like
                  try {
                    if (newIsLiked) {
                      // Like → Incrémenter
                      await ApiService.incrementSocialAction(
                        item.id,
                        "HALTE_GACHIS",
                        "LIKE"
                      );
                      console.log("✅ Like incrémenté en backend (halte)");
                    } else {
                      // Unlike → Décrémenter
                      await ApiService.decrementSocialAction(
                        item.id,
                        "HALTE_GACHIS",
                        "LIKE"
                      );
                      console.log("✅ Unlike décrémenté en backend (halte)");
                    }
                  } catch (error) {
                    // Erreur silencieuse - l'objet n'existe peut-être pas dans la base de données
                    console.log(
                      "⚠️ Action like/unlike non synchronisée (objet non trouvé en base)"
                    );
                  }

                  // Recharger les stats pour avoir les vraies valeurs
                  try {
                    const updatedStats = await ApiService.getSocialActions(
                      item.id,
                      "HALTE_GACHIS"
                    );
                    setSocialStats(updatedStats);
                  } catch (error) {
                    // En cas d'erreur, garder les stats actuelles
                    console.log(
                      "⚠️ Stats non rechargées (objet non trouvé en base)"
                    );
                  }

                  console.log(
                    "✅ Like togglé avec succès (halte):",
                    newIsLiked
                  );
                } catch (error) {
                  console.error("❌ Erreur lors du like (halte):", error);
                  // Revert on error
                  setIsLiked(!isLiked);
                }
              }}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={22}
                color={isLiked ? "#E53935" : "#E53935"}
              />
              <Text style={styles.stat}>
                {isLoadingStats ? "..." : socialStats.LIKE}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.statButton,
                pressed && styles.statButtonPressed,
              ]}
              onPress={async () => {
                if (item.halteUrl) {
                  // Incrémenter le compteur de partage seulement si l'utilisateur est connecté
                  // if (isConnected) {
                  //   await SocialActionsService.shareObject(
                  //     item.id.toString(),
                  //     SocialActionObjectType.HALTE_GACHIS
                  //   );
                  // } else {
                  //   console.log(
                  //     "👁️ Partage non incrémenté (utilisateur non connecté)"
                  //   );
                  // }

                  // Partager la halte au gâchis
                  await ShareService.shareHalteGachi(
                    item.halteUrl,
                    item.title,
                    item.subtitle
                  );
                }
              }}
            >
              <Ionicons name="share-social-outline" size={22} color="#E53935" />
              <Text style={styles.stat}> Partager</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              if (!isConnected) {
                setLoginAction("ajouter au panier");
                setShowLoginModal(true);
                return;
              }

              // Ajouter la halte au gâchis à la liste des courses
              addShoppingItem({
                id: `halte-${item.id}-${Date.now()}`,
                name: item.title,
                image: item.image,
                quantity: 1,
                category: ShoppingItemCategory.HALTE_GACHIS,
                originalId: item.id.toString(),
                price: item.priceCurrent || 0,
                originalPrice: item.priceOld,
                discountPrice: item.priceCurrent || 0,
                consumeBefore: item.consumeBefore,
              });
              onPress?.(item.id);
            }}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            disabled={isAdding}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="#E53935" />
            ) : (
              <Ionicons name="cart-outline" size={18} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </View>

      {/* Modal de connexion requise */}
      <LoginRequiredModal
        visible={showLoginModal}
        onClose={handleLoginModalClose}
        onLogin={handleLogin}
        action={loginAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  imageWrapper: {
    position: "relative",
  },
  cover: {
    width: "100%",
    aspectRatio: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignSelf: "flex-start",
  },
  content: {
    padding: 16,
    gap: 6,
  },
  priceBadge: {
    position: "absolute",
    left: 14,
    bottom: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 88,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: "stretch",
  },
  priceInt: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 24,
    lineHeight: 26,
  },
  priceCurrency: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 12,
    lineHeight: 14,
    marginHorizontal: 2,
  },
  priceFrac: {
    color: "#111827",
    fontWeight: "800",
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
  priceOldRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  priceOldInt: {
    color: "#9CA3AF",
    fontWeight: "800",
    fontSize: 14,
    lineHeight: 16,
  },
  priceOldCurrency: {
    color: "#9CA3AF",
    fontWeight: "800",
    fontSize: 10,
    lineHeight: 12,
    marginHorizontal: 3,
  },
  priceOldFrac: {
    color: "#9CA3AF",
    fontWeight: "800",
    fontSize: 10,
    lineHeight: 12,
  },
  supContainerOldEuro: {
    marginTop: -0,
  },
  supContainerOldFrac: {
    marginTop: -0,
  },
  priceOld: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 16,
    textAlign: "right",
  },
  oldPriceWrapper: {
    marginTop: -5,
    alignSelf: "stretch",
    alignItems: "flex-end",
    width: "100%",
  },
  redStrike: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#E53935",
    transform: [{ rotate: "-7deg" }],
    top: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  validity: {
    fontSize: 12,
    color: "#E53935",
    fontWeight: "600",
  },
  consumeButton: {
    backgroundColor: "#E53935",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
    gap: 6,
  },
  consumeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  footerRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  stat: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  cta: {
    backgroundColor: "#E53935",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaPressed: {
    backgroundColor: "#C62828",
    transform: [{ scale: 0.95 }],
  },
  statButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 6,
  },
  statButtonPressed: {
    backgroundColor: "#F3F4F6",
    transform: [{ scale: 0.95 }],
  },
});
