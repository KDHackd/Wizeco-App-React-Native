import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type AddProductModalProps = {
  visible: boolean;
  onClose: () => void;
  onAdd: (productName: string, quantity: string) => void;
};

export default function AddProductModal({
  visible,
  onClose,
  onAdd,
}: AddProductModalProps) {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleAdd = () => {
    if (productName.trim() && quantity.trim()) {
      onAdd(productName.trim(), quantity.trim());
      setProductName("");
      setQuantity("");
      onClose();
    }
  };

  const handleClose = () => {
    setProductName("");
    setQuantity("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Ajouter un Produit</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              activeOpacity={0.6}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Nom du produit */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom du produit</Text>
              <TextInput
                style={styles.input}
                placeholder="nom du produit"
                placeholderTextColor="#9CA3AF"
                value={productName}
                onChangeText={setProductName}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Quantité du produit */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quantité du produit</Text>
              <TextInput
                style={styles.input}
                placeholder="quantité du produit"
                placeholderTextColor="#9CA3AF"
                value={quantity}
                onChangeText={setQuantity}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.cancelButtonPressed,
              ]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.addButtonPressed,
              ]}
              onPress={handleAdd}
            >
              <Text style={styles.addButtonText}>Ajouter</Text>
            </Pressable>
          </View>
        </View>
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
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  closeButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000000",
    borderWidth: 0,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  addButton: {
    flex: 1,
    backgroundColor: "#E53935",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cancelButtonPressed: {
    backgroundColor: "#E5E7EB",
    transform: [{ scale: 0.98 }],
  },
  addButtonPressed: {
    backgroundColor: "#C62828",
    transform: [{ scale: 0.98 }],
  },
});
