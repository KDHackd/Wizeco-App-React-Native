import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type Category = {
  id: string;
  label: string;
  component: React.ComponentType<any>;
  data?: any[];
  loading?: boolean;
};

type AnimatedCategoryTabsProps = {
  categories: Category[];
  initialId?: string;
  onChange?: (categoryId: string) => void;
  onNavigateToProfile?: () => void;
};

const { width: screenWidth } = Dimensions.get("window");

export default function AnimatedCategoryTabs({
  categories,
  initialId,
  onChange,
  onNavigateToProfile,
}: AnimatedCategoryTabsProps) {
  const defaultIndex = useMemo(() => {
    const index = categories.findIndex((cat) => cat.id === initialId);
    return index >= 0 ? index : 0;
  }, [categories, initialId]);

  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    onChange?.(categories[index].id);

    // Animation de scroll
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * screenWidth,
        animated: true,
      });
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(index);
    onChange?.(categories[index].id);
  };

  const renderTabBar = () => {
    const tabBarWidth = screenWidth - 32; // Largeur totale de la tabBar
    const tabWidth = (tabBarWidth - 12) / categories.length; // Largeur d'une tab

    const indicatorTranslateX = scrollX.interpolate({
      inputRange: [0, screenWidth * (categories.length - 1)],
      outputRange: [2, tabWidth * (categories.length - 1) + 2],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.indicator,
            {
              width: tabWidth - 4,
              transform: [{ translateX: indicatorTranslateX }],
            },
          ]}
        />
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            style={styles.tab}
            onPress={() => handleTabPress(index)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeIndex === index
                  ? styles.tabTextActive
                  : styles.tabTextInactive,
              ]}
              numberOfLines={1}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderContent = () => (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onScroll={handleScroll}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      scrollEventThrottle={16}
      style={styles.contentContainer}
    >
      {categories.map((category) => {
        const Component = category.component;
        return (
          <View key={category.id} style={styles.pageContainer}>
            <Component
              data={category.data || []}
              loading={category.loading || false}
              onNavigateToProfile={onNavigateToProfile}
            />
          </View>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {renderTabBar()}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E53935",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 26,
    paddingHorizontal: 6,
    paddingVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 2,
  },
  indicator: {
    position: "absolute",
    top: "20%",
    left: 2,
    height: "90%",
    backgroundColor: "#E53935",
    borderRadius: 20,
    zIndex: 1,
    marginHorizontal: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    color: "#000000",
  },
  tabTextInactive: {
    color: "#000000",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  contentContainer: {
    flex: 1,
  },
  pageContainer: {
    width: screenWidth,
    flex: 1,
  },
});
