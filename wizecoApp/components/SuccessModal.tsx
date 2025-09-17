import React from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  productName?: string; // Optionnel pour le cas produit
  title?: string; // Optionnel pour le cas profil
  message?: string; // Optionnel pour le cas profil
  icon?: string; // Optionnel pour le cas profil
  autoCloseDelay?: number; // Optionnel pour le cas profil
}

const { width } = Dimensions.get("window");

export default function SuccessModal({
  visible,
  onClose,
  productName,
  title,
  message,
  icon,
  autoCloseDelay,
}: SuccessModalProps) {
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Auto-fermeture si autoCloseDelay est défini
      if (autoCloseDelay && autoCloseDelay > 0) {
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      scaleValue.setValue(0);
    }
  }, [visible, scaleValue, autoCloseDelay, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {/* Icône de succès */}
          <View style={styles.iconContainer}>
            <Text style={styles.checkIcon}>
              {icon === "checkmark-circle" ? "✓" : "✓"}
            </Text>
          </View>

          {/* Titre */}
          <Text style={styles.title}>{title || "Produit ajouté !"}</Text>

          {/* Message */}
          <Text style={styles.message}>
            {message ? (
              message
            ) : (
              <>
                <Text style={styles.productName}>"{productName}"</Text>
                {"\n"}a été ajouté à votre liste de courses
              </>
            )}
          </Text>

          {/* Bouton de fermeture */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Parfait !</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 20,
    maxWidth: width * 0.9,
    minWidth: width * 0.8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  checkIcon: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 28,
  },
  productName: {
    fontWeight: "600",
    color: "#10B981",
  },
  closeButton: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
