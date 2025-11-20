import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { ScaledSheet, vs } from "react-native-size-matters";
import HeaderWithBackButton from "../HeaderWithBackButton";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { updateDriverProfile } from "../../types/profile";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ModifyPasswordOverlay = ({ onClose }: { onClose: () => void }) => {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const { updateUser, logoutAndRedirect } = useAuth();

  const invalidError = "Error! Invalid Input";
  const mismatchError = "Error! Mismatch";

  const mutation = useMutation({
    mutationFn: updateDriverProfile,
    onSuccess: async (updatedUser) => {
      await updateUser(updatedUser);
      setError(null);
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      onClose();
    },
    onError: () => {
      setError("profile.modals.password.errors.generic");
    },
  });

  const isPending = mutation.isPending;
  const handleLogout = async () => {
    await logoutAndRedirect();
  };
  const handleContinue = () => {
    if (newPass !== confirmPass) {
      setError(mismatchError);
      return;
    }
    const trimmedCurrent = currentPass.trim();
    const trimmedNew = newPass.trim();

    if (!trimmedCurrent || !trimmedNew) {
      setError(invalidError);
      return;
    }

    setError(null);
    Keyboard.dismiss();
    mutation.mutate({
      currentPassword: trimmedCurrent,
      newPassword: trimmedNew,
    });
    handleLogout();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {" "}
        <HeaderWithBackButton title="Modify password" onBack={onClose} />
        <View style={styles.inner}>
          <Text allowFontScaling={false} style={styles.label}>
            Enter your current password
          </Text>
          <TextInput
            secureTextEntry
            placeholder="Current password"
            style={styles.input}
            value={currentPass}
            onChangeText={(t) => {
              setError(null);
              setCurrentPass(t);
            }}
          />

          {error?.includes("Wrong Password") && (
            <Text style={styles.error}>{error}</Text>
          )}

          <Text allowFontScaling={false} style={styles.label}>
            Enter your new password
          </Text>
          <TextInput
            secureTextEntry
            placeholder="Password"
            style={styles.input}
            value={newPass}
            onChangeText={(t) => {
              setError(null);
              setNewPass(t);
            }}
          />

          <Text allowFontScaling={false} style={styles.label}>
            Confirm new password
          </Text>
          <TextInput
            secureTextEntry
            placeholder="Password"
            style={styles.input}
            value={confirmPass}
            onChangeText={(t) => {
              setError(null);
              setConfirmPass(t);
            }}
          />

          {error?.includes("match") && (
            <Text style={styles.error}>{error}</Text>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            disabled={isPending}
          >
            <Text allowFontScaling={false} style={styles.buttonText}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inner: { paddingHorizontal: "20@s", paddingVertical: "30@vs" },
  label: {
    color: "#000",
    fontSize: "16@ms",
    fontWeight: "600",
    marginBottom: "6@vs",
  },
  input: {
    backgroundColor: "#D9D9D9",
    borderRadius: "8@ms",
    paddingHorizontal: "12@s",
    paddingVertical: "10@vs",
    fontSize: "15@ms",
    color: "#000",
    marginBottom: "10@vs",
  },
  button: {
    backgroundColor: "#747C8C",
    borderRadius: "10@ms",
    height: "46@vs",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "20@vs",
  },
  buttonText: { color: "#fff", fontSize: "16@ms", fontWeight: "600" },
  error: { color: "#CA251B", fontSize: "14@ms", marginVertical: "5@vs" },
});

export default ModifyPasswordOverlay;
