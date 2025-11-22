import React, { JSX, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { moderateScale, verticalScale, s } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { UploadStep, mapDocumentTypeToApi } from "../../../types/upload";
import HeaderWithBackButton from "../../../components/HeaderWithBackButton";
import { UploadSlot } from "../../../components/ProfilSettings/UploadSlot";
import { uploadDriverDocument } from "../../../services/driverService";

type ImageAsset = {
  uri: string;
  name: string;
  mimeType?: string;
};

type RouteParams = RouteProp<Record<string, UploadStep>, string>;

export default function UploadStepScreen(): JSX.Element {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { title, description, type, icon: IconComp, uploadFields = [], documentType } = route.params;

  const [textValue, setTextValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uploads, setUploads] = useState<
    Record<string, ImageAsset | null>
  >({});

  const pick = (key: string, file: ImageAsset) => {
    setUploads((prev) => ({ ...prev, [key]: file }));
    setError(null);
  };

  const remove = (key: string) => {
    setUploads((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async () => {
    // Validate that at least one file is uploaded for image types
    if (type !== "text") {
      const hasFiles = Object.values(uploads).some((file) => file !== null);
      if (!hasFiles) {
        setError("Please select a file to upload");
        return;
      }
    }

    // For text type (Patent Number), validate text input
    if (type === "text" && !textValue.trim()) {
      setError("Please enter your patent number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the API-friendly document type
      const apiDocumentType = mapDocumentTypeToApi(documentType);

      // For dual-image (ID Card), we need to upload front and back separately
      // For now, we'll upload the first file found (you may need to adjust based on backend requirements)
      if (type === "dual-image") {
        // Upload front side if available
        const frontFile = uploads['front'];
        if (frontFile) {
          await uploadDriverDocument(apiDocumentType, {
            uri: frontFile.uri,
            name: frontFile.name,
            type: frontFile.mimeType || "image/jpeg",
          });
        }

        // Note: The backend may need separate endpoints for front/back
        // or may accept multiple files. Adjust as needed.
      } else if (type === "single-image") {
        // Upload single image
        const file = Object.values(uploads).find((f) => f !== null);
        if (file) {
          await uploadDriverDocument(apiDocumentType, {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || "image/jpeg",
          });
        }
      } else if (type === "text") {
        // For patent number, we might need to handle differently
        // Since the backend expects an image upload, we may need to skip this
        // or create a text file. For now, we'll show an error.
        setError("Text upload for patent number is not yet supported. Please upload a photo of your patent proof.");
        setLoading(false);
        return;
      }

      // Success! Navigate back to profile completion
      Alert.alert(
        "Success",
        "Document uploaded successfully! It will be reviewed shortly.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      console.error("Upload error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to upload document. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = type === "text" ? textValue.trim().length > 0 : Object.values(uploads).some((f) => f !== null);

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <HeaderWithBackButton title="WELCOME BACK, RIDER" titleMarginLeft={s(40)} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>PLEASE UPLOAD YOUR</Text>

          <View style={styles.iconRow}>
            <View style={styles.iconCircle}>
              <IconComp color="#CA251B" size={28} />
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={{ marginTop: verticalScale(14) }}>
            {type === "text" && (
              <TextInput
                placeholder={`Your ${title.toLowerCase()}`}
                placeholderTextColor="#9CA3AF"
                value={textValue}
                onChangeText={setTextValue}
                style={styles.input}
              />
            )}

            {type === "single-image" &&
              uploadFields.map((f) => (
                <UploadSlot
                  key={f.key}
                  label={f.label}
                  file={uploads[f.key]}
                  onPick={(file) => pick(f.key, file)}
                  onRemove={() => remove(f.key)}
                />
              ))}

            {type === "dual-image" &&
              uploadFields.map((f) => (
                <UploadSlot
                  key={f.key}
                  label={f.label}
                  file={uploads[f.key]}
                  onPick={(file) => pick(f.key, file)}
                  onRemove={() => remove(f.key)}
                />
              ))}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={!canSubmit || loading}
            style={[
              styles.submitBtn,
              { opacity: !canSubmit || loading ? 0.5 : 1 }
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flex: 1,
  },
  sectionContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 2,
    borderColor: "#E6E8EB",
    paddingHorizontal: s(18),
    paddingTop: verticalScale(26),
    paddingBottom: verticalScale(30),
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginTop: verticalScale(10),
  },
  sectionHeader: {
    textAlign: "center",
    color: "#CA251B",
    fontWeight: "800",
    fontSize: moderateScale(18),
    marginBottom: verticalScale(18),
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 70,
    backgroundColor: "#FDE4E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: s(14),
  },
  title: {
    color: "#17213A",
    fontWeight: "800",
    fontSize: moderateScale(15),
    marginBottom: 4,
  },
  description: {
    color: "#6B7280",
    fontSize: moderateScale(13),
    lineHeight: 18,
  },
  errorContainer: {
    backgroundColor: "#FEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: "#CA251B",
    fontSize: moderateScale(13),
    textAlign: "center",
  },
  input: {
    height: 48,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: s(12),
    color: "#17213A",
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: "#17213A",
    borderRadius: 14,
    paddingVertical: verticalScale(15),
    alignItems: "center",
    marginTop: verticalScale(20),
  },
  submitText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: moderateScale(16),
  },
});
