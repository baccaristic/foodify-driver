import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { ScaledSheet, vs } from "react-native-size-matters";
import { useAuth } from "../../contexts/AuthContext";
import HeaderWithBackButton from "../HeaderWithBackButton";
import { useMutation } from "@tanstack/react-query";
import { updateDriverProfile } from "../../types/profile";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ModifyNameOverlay = ({ onClose }: { onClose: () => void }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const { user, updateUser, logoutAndRedirect } = useAuth();
  const displayName = user?.name ?? "Guest User";
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

  useEffect(() => {
    if (user?.name) {
      const parts = user.name.trim().split(/\s+/);
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" "));
    }
  }, [user?.name]);

  const isPending = mutation.isPending;

  const buttonDisabled = useMemo(() => {
    return (
      isPending ||
      !firstName.trim() ||
      !lastName.trim() ||
      `${firstName.trim()} ${lastName.trim()}`.trim() ===
        (user?.name ?? "").trim()
    );
  }, [firstName, isPending, lastName, user?.name]);

  const handleLogout = async () => {
    await logoutAndRedirect();
  };
  const handleSubmit = () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    if (!trimmedFirst || !trimmedLast) {
      setError("Error!");
      return;
    }

    if (`${trimmedFirst} ${trimmedLast}`.trim() === (user?.name ?? "").trim()) {
      setError(null);
      onClose();
      return;
    }

    setError(null);
    Keyboard.dismiss();
    mutation.mutate({ name: `${trimmedFirst} ${trimmedLast}`.trim() });
    handleLogout();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {" "}
        <HeaderWithBackButton title="Modify name" onBack={onClose} />
        <View style={styles.inner}>
          <Text allowFontScaling={false} style={styles.currentLabel}>
            Current Name
          </Text>
          <Text allowFontScaling={false} style={styles.currentValue}>
            {displayName}
          </Text>

          <Text allowFontScaling={false} style={styles.label}>
            Enter your new name
          </Text>

          <TextInput
            placeholder="Flen"
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            placeholder="Foulani"
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />

          <TouchableOpacity
            style={[styles.button, buttonDisabled && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={buttonDisabled}
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
  currentLabel: { color: "#17213A", fontWeight: "700", fontSize: "17@ms" },
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
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ModifyNameOverlay;
