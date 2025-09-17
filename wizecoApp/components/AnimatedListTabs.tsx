import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface ListTab {
  id: string;
  label: string;
}

interface AnimatedListTabsProps {
  tabs: ListTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function AnimatedListTabs({
  tabs,
  activeTab,
  onTabChange,
}: AnimatedListTabsProps) {
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const tabWidth = width / tabs.length;

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (activeIndex !== -1) {
      Animated.spring(indicatorPosition, {
        toValue: activeIndex * tabWidth,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [activeTab, tabWidth, indicatorPosition, tabs]);

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.id}
            style={[styles.tab, { width: tabWidth }]}
            onPress={() => onTabChange(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Indicateur animé */}
      <Animated.View
        style={[
          styles.indicator,
          {
            width: tabWidth,
            transform: [{ translateX: indicatorPosition }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabsContainer: {
    flexDirection: "row",
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#E53935",
    fontWeight: "600",
  },
  indicator: {
    height: 3,
    backgroundColor: "#E53935",
    position: "absolute",
    bottom: 0,
  },
});
