import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CatalogCard, { CatalogItem } from "./CatalogCard";
import HalteCard, { HalteItem } from "./HalteCard";
import PromoFlashCard, { PromoFlashItem } from "./PromoFlashCard";

// Types pour les props
interface CategoryContentProps {
  data: any[];
  loading: boolean;
  onNavigateToProfile?: () => void;
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
}) => {
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
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
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
