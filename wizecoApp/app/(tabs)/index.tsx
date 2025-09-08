import CatalogCard, { CatalogItem } from "@/components/CatalogCard";
import CategoryTabs, { Category } from "@/components/CategoryTabs";
import HalteCard, { HalteItem } from "@/components/HalteCard";
import HomeHeader from "@/components/HomeHeader";
import PromoFlashCard, { PromoFlashItem } from "@/components/PromoFlashCard";
import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES: Category[] = [
  { id: "catalogues", label: "Catalogues" },
  { id: "promo", label: "Promo Flash" },
  { id: "halte", label: "Halte au..." },
];

const MOCK_ITEMS: CatalogItem[] = [
  {
    id: "1",
    title: "Catalogue",
    subtitle:
      "Lorem ipsum dolor sit amet consectetur. ac fermentum pellentesque vel donec...",
    validity: "Valable du 30 Apr 2025 au 29 Mai 2025",
    likes: 22,
    comments: 5,
    image: require("@/assets/images/react-logo.png"),
    priceCurrent: 10,
    priceOld: 12,
    currency: "€",
  },
  {
    id: "2",
    title: "Catalogue",
    subtitle:
      "Lorem ipsum dolor sit amet consectetur. ac fermentum pellentesque vel donec...",
    validity: "Valable du 30 Apr 2025 au 29 Mai 2025",
    likes: 18,
    comments: 3,
    image: require("@/assets/images/react-logo.png"),
    priceCurrent: 8.5,
    priceOld: 9.99,
    currency: "€",
  },
];

const MOCK_PROMO_ITEMS: PromoFlashItem[] = [
  {
    id: "promo1",
    title: "Promo Flash",
    subtitle:
      "Lorem ipsum dolor sit amet consectetur. ac fermentum pellentesque vel donec...",
    validity: "Valable du 30 Apr 2025 au 29 Mai 2025",
    likes: 15,
    comments: 2,
    image: require("@/assets/images/react-logo.png"),
    priceCurrent: 7.5,
    priceOld: 12.99,
    currency: "€",
    distanceKm: 5.4,
  },
  {
    id: "promo2",
    title: "Promo Flash",
    subtitle:
      "Lorem ipsum dolor sit amet consectetur. ac fermentum pellentesque vel donec...",
    validity: "Valable du 30 Apr 2025 au 29 Mai 2025",
    likes: 8,
    comments: 1,
    image: require("@/assets/images/react-logo.png"),
    priceCurrent: 6.0,
    priceOld: 9.99,
    currency: "€",
    distanceKm: 2.1,
  },
];

const MOCK_HALTE_ITEMS: HalteItem[] = [
  {
    id: "halte1",
    title: "Halte au gaspillage",
    subtitle:
      "Lorem ipsum dolor sit amet consectetur. ac fermentum pellentesque vel donec...",
    validity: "Valable du 30 Apr 2025 au 29 Mai 2025",
    likes: 12,
    comments: 3,
    image: require("@/assets/images/react-logo.png"),
    priceCurrent: 4.5,
    priceOld: 8.99,
    currency: "€",
    distanceKm: 5.4,
    consumeBefore: "02 jul 2025",
  },
  {
    id: "halte2",
    title: "Halte au gaspillage",
    subtitle:
      "Lorem ipsum dolor sit amet consectetur. ac fermentum pellentesque vel donec...",
    validity: "Valable du 30 Apr 2025 au 29 Mai 2025",
    likes: 7,
    comments: 1,
    image: require("@/assets/images/react-logo.png"),
    priceCurrent: 3.0,
    priceOld: 6.99,
    currency: "€",
    distanceKm: 2.1,
    consumeBefore: "15 jun 2025",
  },
];

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState<string>("catalogues");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <HomeHeader />
      <CategoryTabs
        categories={CATEGORIES}
        initialId={activeCategory}
        onChange={setActiveCategory}
      />
      <View style={{ height: 12 }} />
      <FlatList
        data={
          activeCategory === "catalogues"
            ? MOCK_ITEMS
            : activeCategory === "promo"
            ? MOCK_PROMO_ITEMS
            : activeCategory === "halte"
            ? MOCK_HALTE_ITEMS
            : []
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          activeCategory === "promo" ? (
            <PromoFlashCard item={item as PromoFlashItem} />
          ) : activeCategory === "halte" ? (
            <HalteCard item={item as HalteItem} />
          ) : (
            <CatalogCard item={item as CatalogItem} />
          )
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7F9",
  },
  listContent: {
    paddingBottom: 24,
  },
});
