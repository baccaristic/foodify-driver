import React, { JSX, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { moderateScale, verticalScale, s } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";

import { UploadStep } from "../../../types/upload";
import HeaderWithBackButton from "../../../components/HeaderWithBackButton";
import { UploadSlot } from "../../../components/ProfilSettings/UploadSlot";

type RouteParams = RouteProp<Record<string, UploadStep>, string>;

export default function UploadStepScreen(): JSX.Element {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { title, description, type, icon: IconComp, uploadFields = [] } = route.params;

  const [textValue, setTextValue] = useState("");
  const [loading, setLoading] = useState(false);

  const [uploads, setUploads] = useState<
    Record<string, DocumentPicker.DocumentPickerAsset | null>
  >({});

  const pick = (key: string, file: DocumentPicker.DocumentPickerAsset) => {
    setUploads((prev) => ({ ...prev, [key]: file }));
  };

  const remove = (key: string) => {
    setUploads((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Example of uploading files to backend
      const formData = new FormData();
      Object.entries(uploads).forEach(([key, file]) => {
        if (file) {
          formData.append(key, {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || "application/octet-stream",
          } as any);
        }
      });
      navigation.goBack();
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

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
            style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]}
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
