import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { ScaledSheet, s, vs } from "react-native-size-matters";
import { useAuth } from "../../contexts/AuthContext";
import HeaderWithBackButton from "../HeaderWithBackButton";
import { useMutation } from "@tanstack/react-query";
import { updateDriverProfile } from "../../types/profile";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const palette = {
  accent: "#CA251B",
  dark: "#17213A",
};

const ModifyEmailOverlay = ({ onClose }: { onClose: () => void }) => {
  const [newEmail, setNewEmail] = useState("");
  const [stage, setStage] = useState<"form" | "verify">("form");
  const [error, setError] = useState<string | null>(null);
  const { user, updateUser, logoutAndRedirect } = useAuth();
  const insets = useSafeAreaInsets();

  const displayEmail = user?.email ?? "Add email address";

  const mutation = useMutation({
    mutationFn: updateDriverProfile,
    onSuccess: async (updatedUser) => {
      await updateUser(updatedUser);
      onClose();
    },
    onError: () => {
      setError("Check Error");
    },
  });

  const isPending = mutation.isPending;

  const handleLogout = async () => {
    await logoutAndRedirect();
  };

  const handleContinue = () => {
    const trimmedEmail = newEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Invalid Email ");
      return;
    }

    if (trimmedEmail === (user?.email ?? "").trim()) {
      setError(null);
      onClose();
      return;
    }

    setError(null);
    Keyboard.dismiss();
    mutation.mutate({ email: trimmedEmail });
    handleLogout();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} >
      <View style={[styles.overlayContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <HeaderWithBackButton title="Modify email address" onBack={onClose} />
        <View style={styles.innerContainer}>
          <Text allowFontScaling={false} style={styles.currentLabel}>
            Current mail
          </Text>
          <Text allowFontScaling={false} style={styles.currentValue}>
            {displayEmail}
          </Text>

          <Text allowFontScaling={false} style={styles.label}>
            Enter your new e-mail
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your e-mail"
            placeholderTextColor="#666"
            value={newEmail}
            onChangeText={(t) => {
              setError(null);
              setNewEmail(t);
            }}
          />

          {error && (
            <Text allowFontScaling={false} style={styles.errorText}>
              {error}
            </Text>
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
  overlayContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    paddingHorizontal: "20@s",
    paddingVertical: "30@vs",
  },
  currentLabel: {
    color: "#17213A",
    fontWeight: "700",
    fontSize: "16@ms",
  },
  currentValue: {
    color: "#17213A",
    fontWeight: "500",
    fontSize: "15@ms",
    marginBottom: "20@vs",
  },
  label: {
    color: "#000",
    fontSize: "16@ms",
    fontWeight: "600",
    marginBottom: "8@vs",
  },
  input: {
    backgroundColor: "#D9D9D9",
    borderRadius: "8@ms",
    paddingHorizontal: "12@s",
    paddingVertical: "10@vs",
    fontSize: "15@ms",
    color: "#000",
  },
  errorText: {
    color: palette.accent,
    fontSize: "14@ms",
    marginVertical: "8@vs",
  },
  button: {
    backgroundColor: "#747C8C",
    borderRadius: "10@ms",
    height: "46@vs",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "24@vs",
  },
  buttonText: {
    color: "#fff",
    fontSize: "16@ms",
    fontWeight: "600",
  },
});

export default ModifyEmailOverlay;
