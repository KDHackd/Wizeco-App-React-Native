import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
      <View style={styles.tabsContainer}>
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
      </View>
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
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 26,
    marginHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  tabInactive: {
    backgroundColor: "transparent",
  },
  tabActive: {
    backgroundColor: "#E53935",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  tabTextInactive: {
    color: "#E53935",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
});
