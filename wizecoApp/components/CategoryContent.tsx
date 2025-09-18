import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import CatalogCard, { CatalogItem } from "./CatalogCard";
import HalteCard, { HalteItem } from "./HalteCard";
import PromoFlashCard, { PromoFlashItem } from "./PromoFlashCard";

// Types pour les props
interface CategoryContentProps {
  data: any[];
  loading: boolean;
  onNavigateToProfile?: () => void;
  isActive?: boolean; // Nouveau prop pour savoir si cette tab est active
  isScreenFocused?: boolean; // Nouveau prop pour savoir si l'écran est focus
  onVideoVisibilityChange?: (itemId: string, isVisible: boolean) => void; // Callback pour la visibilité des vidéos
}

// Composant pour les catalogues
export const CataloguesContent: React.FC<CategoryContentProps> = ({
  data,
  loading,
  onNavigateToProfile,
}) => {
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loaderText}>Chargement des catalogues...</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📚 Aucun catalogue disponible</Text>
        <Text style={styles.emptySubtext}>
          Revenez plus tard pour découvrir de nouveaux catalogues
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CatalogCard
          item={item as CatalogItem}
          onNavigateToProfile={onNavigateToProfile}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

// Composant pour les promos flash
export const PromoFlashContent: React.FC<CategoryContentProps> = ({
  data,
  loading,
  onNavigateToProfile,
  isActive = true, // Nouveau prop pour savoir si cette tab est active
  isScreenFocused = true, // Nouveau prop pour savoir si l'écran est focus
  onVideoVisibilityChange,
}) => {
  const [visibleVideoId, setVisibleVideoId] = React.useState<string | null>(
    null
  );

  // Callback pour détecter les changements de visibilité
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      // Trouver la première vidéo visible
      const visibleVideo = viewableItems.find(
        (item) => item.item && (item.item as PromoFlashItem).type === "video"
      );

      const newVisibleVideoId = visibleVideo
        ? String(visibleVideo.item.id)
        : null;

      if (newVisibleVideoId !== visibleVideoId) {
        console.log("🎥 Changement de visibilité vidéo:", {
          ancien: visibleVideoId,
          nouveau: newVisibleVideoId,
        });

        setVisibleVideoId(newVisibleVideoId);
        onVideoVisibilityChange?.(newVisibleVideoId || "", !!newVisibleVideoId);
      }
    },
    [visibleVideoId, onVideoVisibilityChange]
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, // 50% de la vidéo doit être visible
  };
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loaderText}>Chargement des promos flash...</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>⚡ Aucune promo flash à proximité</Text>
        <Text style={styles.emptySubtext}>
          Découvrez les promotions près de chez vous en activant les
          notifications
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PromoFlashCard
          item={item as PromoFlashItem}
          onNavigateToProfile={onNavigateToProfile}
          isTabActive={isActive}
          isScreenFocused={isScreenFocused}
          isVideoVisible={visibleVideoId === String(item.id)}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
    />
  );
};

// Composant pour les haltes gachi
export const HalteGachiContent: React.FC<CategoryContentProps> = ({
  data,
  loading,
  onNavigateToProfile,
}) => {
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loaderText}>Chargement des haltes gachi...</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          🛑 Aucune halte au gaspillage à proximité
        </Text>
        <Text style={styles.emptySubtext}>
          Découvrez les produits anti-gaspillage près de chez vous
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <HalteCard
          item={item as HalteItem}
          onNavigateToProfile={onNavigateToProfile}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
