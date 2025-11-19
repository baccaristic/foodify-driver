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
import VerificationCodeTemplate from "../VerificationCodeTemplate";
import HeaderWithBackButton from "../HeaderWithBackButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { updateDriverProfile } from "../../types/profile";

const ModifyPhoneOverlay = ({ onClose }: { onClose: () => void }) => {
  const [newNumber, setNewNumber] = useState("");
  const [stage, setStage] = useState<"form" | "verify">("form");
  const [error, setError] = useState<string | null>(null);
  const { user, updateUser, logoutAndRedirect } = useAuth();
  const insets = useSafeAreaInsets();
  const displayPhone = user?.phone ?? "Add phone number";

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
    if (!/^\d{8,15}$/.test(newNumber)) {
      setError("Please enter a valid phone number");
      return;
    }
    setStage("verify");
    handleLogout();
  };

  if (stage === "verify") {
    return (
      <VerificationCodeTemplate
        contact={newNumber}
        resendMethod="SMS"
        onResendPress={() => console.log("Resent code via SMS")}
        onSubmit={(code) => console.log("Phone verified:", code)}
        resendButtonLabel="Resend the code via SMS"
        errorMessage={error}
        onClearError={() => setError(null)}
      />
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.overlayContainer, { paddingTop: insets.top }]}>
        {" "}
        <HeaderWithBackButton title="Modify Phone number" onBack={onClose} />
        <View style={styles.innerContainer}>
          <Text allowFontScaling={false} style={styles.currentLabel}>
            Current Phone number
          </Text>
          <Text allowFontScaling={false} style={styles.currentValue}>
            {displayPhone}
          </Text>

          <Text allowFontScaling={false} style={styles.label}>
            Enter your new number
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Eg.98765432"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
            value={newNumber}
            onChangeText={(t) => {
              setError(null);
              setNewNumber(t);
            }}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

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
    color: "#CA251B",
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

export default ModifyPhoneOverlay;
