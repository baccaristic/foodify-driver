import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Trash2, Upload } from "lucide-react-native";
import { moderateScale, s, verticalScale } from "react-native-size-matters";

type Props = {
  label: string;
  file?: DocumentPicker.DocumentPickerAsset | null;
  onPick: (file: DocumentPicker.DocumentPickerAsset) => void;
  onRemove: () => void;
};

export const UploadSlot: React.FC<Props> = ({ label, file, onPick, onRemove }) => {
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onPick(result.assets[0]);
      }
    } catch (error) {
      console.warn("File picking error:", error);
    }
  };

  return (
    <View style={styles.container}>
      {!file ? (
        <TouchableOpacity onPress={pickFile} style={styles.uploadBox} activeOpacity={0.8}>
          <Text style={styles.uploadText}>{label}</Text>
          <Upload color="#CA251B" size={moderateScale(20)} />
        </TouchableOpacity>
      ) : (
        <View style={styles.previewBox}>
          {file.mimeType?.includes("image") ? (
            <Image
              source={{ uri: file.uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.fileName}>{file.name}</Text>
          )}
          <TouchableOpacity onPress={onRemove} style={styles.deleteButton} activeOpacity={0.8}>
            <Trash2 color="#CA251B" size={18} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(12),
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CA251B",
    borderRadius: 14,
    height: verticalScale(120),
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  uploadText: {
    color: "#CA251B",
    fontWeight: "700",
    fontSize: moderateScale(15),
  },
  previewBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CA251B",
    borderRadius: 14,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    height: verticalScale(150),
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  fileName: {
    color: "#17213A",
    fontSize: moderateScale(14),
    textAlign: "center",
  },
  deleteButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#FFF",
    borderRadius: 50,
    padding: 4,
    elevation: 2,
  },
});
