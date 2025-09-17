import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

interface DeleteButtonProps {
  onPress: () => void;
  isRemoving: boolean;
}

export default function DeleteButton({
  onPress,
  isRemoving,
}: DeleteButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={onPress}
      disabled={isRemoving}
    >
      {isRemoving ? (
        <ActivityIndicator size="small" color="#E53935" />
      ) : (
        <Text style={styles.buttonText}>✕</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 8,
  },
  buttonPressed: {
    backgroundColor: "#E5E7EB",
    transform: [{ scale: 0.95 }],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
});
