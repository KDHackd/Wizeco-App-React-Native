import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export type Category = {
  id: string;
  label: string;
};

type CategoryTabsProps = {
  categories: Category[];
  initialId?: string;
  onChange?: (categoryId: string) => void;
};

export default function CategoryTabs({
  categories,
  initialId,
  onChange,
}: CategoryTabsProps) {
  const defaultId = useMemo(
    () => initialId ?? categories[0]?.id,
    [categories, initialId]
  );
  const [activeId, setActiveId] = useState<string | undefined>(defaultId);

  function handlePress(id: string) {
    setActiveId(id);
    onChange?.(id);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isActive = cat.id === activeId;
          return (
            <Pressable
              key={cat.id}
              onPress={() => handlePress(cat.id)}
              style={[
                styles.tab,
                isActive ? styles.tabActive : styles.tabInactive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#F3E5E5",
    padding: 6,
    marginTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 10,
    gap: 16,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 26,
  },
  tabInactive: {
    backgroundColor: "transparent",
  },
  tabActive: {
    backgroundColor: "#E53935",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextInactive: {
    color: "#E53935",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
});
