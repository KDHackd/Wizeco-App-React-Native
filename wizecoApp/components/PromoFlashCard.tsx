import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import ApiService from "@/services/ApiService";
import LikeService from "@/services/LikeService";
import { ShareService } from "@/services/ShareService";
import { ShoppingItemCategory, SocialStats } from "@/types/ShoppingListTypes";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { Ref, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Video, { VideoRef } from "react-native-video";
import LoginRequiredModal from "./LoginRequiredModal";

export type PromoFlashItem = {
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
  distanceKm: number;
  promoUrl?: string; // URL de la promo flash à partager
  shortenUrl?: string; // URL raccourcie
  isLiked?: boolean; // État du like pour l'utilisateur
  type?: string; // "image" ou "video"
  url?: string; // URL de la vidéo si type === "video"
};

type PromoFlashCardProps = {
  item: PromoFlashItem;
  onPress?: (id: number) => void;
  onNavigateToProfile?: () => void;
  isTabActive?: boolean; // Nouveau prop pour détecter si la tab est active
  isScreenFocused?: boolean; // Nouveau prop pour détecter si l'écran est focus
  isVideoVisible?: boolean; // Nouveau prop pour détecter si cette vidéo spécifique est visible
};

function splitPrice(value: number): { intPart: string; fracPart: string } {
  const [intPart, fracPart] = value.toFixed(2).split(".");
  return { intPart, fracPart };
}

// Fonction pour obtenir une thumbnail de vidéo
function getVideoThumbnail(url: string | undefined): any {
  if (!url) {
    // Image par défaut si pas d'URL
    return require("@/assets/images/icon.png");
  }

  // Vérifier si c'est une URL YouTube
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      // Thumbnail YouTube
      return { uri: `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` };
    }
  }

  // Pour les autres types de vidéos, utiliser l'image par défaut
  return require("@/assets/images/icon.png");
}

export default function PromoFlashCard({
  item,
  onPress,
  onNavigateToProfile,
  isTabActive = true, // Par défaut, la tab est active
  isScreenFocused = true, // Par défaut, l'écran est focus
  isVideoVisible = false, // Par défaut, la vidéo n'est pas visible
}: PromoFlashCardProps) {
  const { addShoppingItem, isAdding } = useCart();
  const { isConnected, user } = useAuth();
  const [isLiked, setIsLiked] = useState(item.isLiked || false);
  const [likesCount, setLikesCount] = useState(item.likes);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [socialStats, setSocialStats] = useState<SocialStats>({
    LIKE: 0,
    SAVE: 0,
    SHARE: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [loginAction, setLoginAction] = useState<string>("");
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<typeof Video>(null);

  // Auto-play quand la vidéo devient visible (comportement Instagram)
  useEffect(() => {
    if (item.type !== "video") return;

    // Démarrer la vidéo automatiquement quand :
    // 1. La vidéo est chargée
    // 2. La tab est active
    // 3. L'écran est focus
    // 4. Cette vidéo spécifique est visible
    if (videoLoaded && isTabActive && isScreenFocused && isVideoVisible) {
      console.log("🎥 Vidéo visible - démarrage auto-play");
      setIsVideoPlaying(true);
    } else {
      console.log(
        "🎥 Vidéo non visible ou conditions non remplies - pause vidéo"
      );
      setIsVideoPlaying(false);
    }
  }, [videoLoaded, item.type, isTabActive, isScreenFocused, isVideoVisible]);

  // Gérer la pause/play selon l'état de l'app ET de la tab ET de l'écran (comportement Instagram)
  useEffect(() => {
    if (item.type !== "video") return;

    const handleAppStateChange = (nextAppState: string) => {
      if (
        nextAppState === "active" &&
        isTabActive &&
        isScreenFocused &&
        isVideoVisible
      ) {
        console.log(
          "🎥 App active + Tab active + Écran focus + Vidéo visible - reprise vidéo"
        );
        setIsVideoPlaying(true);
      } else {
        console.log(
          "🎥 App inactive ou Tab inactive ou Écran non focus ou Vidéo non visible - pause vidéo"
        );
        setIsVideoPlaying(false);
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [item.type, isTabActive, isScreenFocused, isVideoVisible]);

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
              "PROMO_FLASH"
            );
            setSocialStats(stats);
            console.log("📊 Stats sociales chargées (promo):", stats);
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
          "PROMO_FLASH",
          isConnected ? user?.id : undefined
        );
        setIsLiked(isItemLiked);
        console.log("❤️ État du like chargé (promo):", isItemLiked);
      } catch (error) {
        console.error(
          "❌ Erreur lors du chargement des données (promo):",
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
        await ApiService.incrementView(item.id, "PROMO_FLASH");
        console.log("👁️ Vue incrémentée automatiquement (promo)");
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
        {(() => {
          console.log("🔍 Item type:", item.type, "URL:", item.url);
          return item.type === "video";
        })() ? (
          <View style={styles.cover}>
            <Video
              ref={videoRef as Ref<VideoRef>}
              source={{ uri: item.url || "" }}
              style={styles.cover}
              repeat={true}
              resizeMode="contain"
              controls={true}
              paused={!isVideoPlaying}
              muted={!isVideoPlaying}
              onLoad={() => {
                console.log("🎥 Vidéo chargée avec succès");
                setVideoLoaded(true);
              }}
              onError={(error) => {
                console.log("❌ Erreur vidéo:", error);
              }}
              onLoadStart={() => {
                console.log("🎥 Chargement vidéo démarré");
              }}
            />
            {!videoLoaded && (
              <View style={styles.videoLoadingOverlay}>
                <ActivityIndicator size="large" color="#E53935" />
                <Text style={styles.videoLoadingText}>Chargement vidéo...</Text>
              </View>
            )}

            {/* Badge vidéo */}
            <View
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                backgroundColor: "rgba(0,0,0,0.7)",
                padding: 5,
                borderRadius: 4,
              }}
            >
              <Text
                style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
              >
                🎥 VIDEO
              </Text>
            </View>
          </View>
        ) : (
          <Image
            source={item.image}
            style={styles.cover}
            resizeMode="contain"
          />
        )}
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
        <View style={styles.footerRow}>
          <View style={styles.statsRow}>
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
                    "PROMO_FLASH",
                    isConnected ? user?.id : undefined
                  );
                  setIsLiked(newIsLiked);

                  // Appeler l'API selon l'état du like
                  try {
                    if (newIsLiked) {
                      // Like → Incrémenter
                      await ApiService.incrementSocialAction(
                        item.id,
                        "PROMO_FLASH",
                        "LIKE"
                      );
                      console.log("✅ Like incrémenté en backend (promo)");
                    } else {
                      // Unlike → Décrémenter
                      await ApiService.decrementSocialAction(
                        item.id,
                        "PROMO_FLASH",
                        "LIKE"
                      );
                      console.log("✅ Unlike décrémenté en backend (promo)");
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
                      "PROMO_FLASH"
                    );
                    setSocialStats(updatedStats);
                  } catch (error) {
                    // En cas d'erreur, garder les stats actuelles
                    console.log(
                      "⚠️ Stats non rechargées (objet non trouvé en base)"
                    );
                  }

                  console.log(
                    "✅ Like togglé avec succès (promo):",
                    newIsLiked
                  );
                } catch (error) {
                  console.error("❌ Erreur lors du like (promo):", error);
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
                if (item.promoUrl) {
                  // Incrémenter le compteur de partage seulement si l'utilisateur est connecté
                  // if (isConnected) {
                  //   await SocialActionsService.shareObject(
                  //     item.id.toString(),
                  //     SocialActionObjectType.PROMO_FLASH
                  //   );
                  // } else {
                  //   console.log(
                  //     "👁️ Partage non incrémenté (utilisateur non connecté)"
                  //   );
                  // }

                  // Partager la promo flash
                  await ShareService.sharePromoFlash(
                    item.promoUrl,
                    item.title,
                    item.subtitle
                  );
                }
              }}
            >
              <Ionicons name="share-social-outline" size={22} color="#E53935" />
              <Text style={styles.stat}>Partager</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              if (!isConnected) {
                setLoginAction("ajouter au panier");
                setShowLoginModal(true);
                return;
              }

              // Ajouter la promo flash à la liste des courses
              addShoppingItem({
                id: `promo-${item.id}-${Date.now()}`,
                name: item.title,
                image:
                  item.type === "video"
                    ? getVideoThumbnail(item.url) // Thumbnail pour les vidéos
                    : item.image, // Image normale pour les images
                quantity: 1,
                category: ShoppingItemCategory.PROMO_FLASH,
                originalId: item.id.toString(),
                price: item.priceCurrent || 0,
                originalPrice: item.priceOld,
                discountPrice: item.priceCurrent || 0,
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
  videoLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoLoadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
  },
});
