import {
  View,
  Image,
  Pressable,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { resizeImageIfNeeded } from "../lib/resizeImage";
import { colors, fonts, spacing, borders } from "../lib/theme";

export interface SelectedImage {
  base64: string;
  uri: string;
  mimeType: string;
}

interface Props {
  images: SelectedImage[];
  onImagesChanged: (images: SelectedImage[]) => void;
  maxImages?: number;
}

export default function ImagePickerButton({ images, onImagesChanged, maxImages }: Props) {
  const atLimit = maxImages !== undefined && images.length >= maxImages;

  const pickImages = async () => {
    if (atLimit) return;
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please grant photo library access to use this feature."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      base64: true,
      allowsMultipleSelection: true,
    });

    if (result.canceled || result.assets.length === 0) return;

    const slotsLeft = maxImages !== undefined ? maxImages - images.length : result.assets.length;
    const assetsToProcess = result.assets.slice(0, slotsLeft);

    const newImages: SelectedImage[] = [];
    for (const asset of assetsToProcess) {
      if (!asset.base64) continue;
      const resized = await resizeImageIfNeeded(
        asset.uri,
        asset.base64,
        asset.mimeType ?? "image/jpeg"
      );
      newImages.push({
        base64: resized.base64,
        uri: asset.uri,
        mimeType: resized.mimeType,
      });
    }

    if (newImages.length === 0) {
      Alert.alert("Error", "Could not read image data.");
      return;
    }

    onImagesChanged([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    onImagesChanged(images.filter((_, i) => i !== index));
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {images.map((img, index) => (
          <View key={index} style={styles.thumbWrapper}>
            <Image source={{ uri: img.uri }} style={styles.thumb} />
            <Pressable
              style={styles.removeBtn}
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeBtnText}>x</Text>
            </Pressable>
          </View>
        ))}

        {!atLimit && (
          <Pressable style={styles.addButton} onPress={pickImages}>
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addText}>
              {images.length === 0 ? "Add photos" : "Add more"}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const THUMB_SIZE = 100;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: spacing.xs,
  },
  thumbWrapper: {
    position: "relative",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: borders.radius.sm,
    borderWidth: borders.hairline,
    borderColor: colors.goldDim,
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: colors.error,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: {
    color: colors.parchment,
    fontSize: 12,
    fontFamily: fonts.headingSemiBold,
  },
  addButton: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: borders.radius.sm,
    borderWidth: 1,
    borderColor: colors.goldDim,
    borderStyle: "dashed",
    backgroundColor: colors.charcoal,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addIcon: {
    fontSize: 28,
    color: colors.gold,
    fontFamily: fonts.body,
  },
  addText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.parchmentMuted,
    marginTop: 2,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
