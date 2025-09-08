import { useCart } from "@/contexts/CartContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export type HalteItem = {
  id: string;
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
};

type HalteCardProps = {
  item: HalteItem;
  onPress?: (id: string) => void;
};

function splitPrice(value: number): { intPart: string; fracPart: string } {
  const [intPart, fracPart] = value.toFixed(2).split(".");
  return { intPart, fracPart };
}

export default function HalteCard({ item, onPress }: HalteCardProps) {
  const { addToCart } = useCart();
  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image source={item.image} style={styles.cover} resizeMode="cover" />
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
            >
              <Ionicons name="heart-outline" size={22} color="#E53935" />
              <Text style={styles.stat}> {item.likes}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.statButton,
                pressed && styles.statButtonPressed,
              ]}
            >
              <Ionicons name="share-social-outline" size={22} color="#E53935" />
              <Text style={styles.stat}> {item.comments}</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              addToCart();
              onPress?.(item.id);
            }}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          >
            <Ionicons name="cart-outline" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
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
    height: 180,
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
