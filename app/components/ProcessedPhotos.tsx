import {
  View,
  Image,
  Pressable,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SelectedImage } from "./ImagePickerButton";
import { colors, fonts, spacing, borders } from "../lib/theme";

interface Props {
  images: SelectedImage[];
  onRemove: (index: number) => void;
}

export default function ProcessedPhotos({ images, onRemove }: Props) {
  if (images.length === 0) return null;

  return (
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
            onPress={() => onRemove(index)}
          >
            <Text style={styles.removeBtnText}>x</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const THUMB_SIZE = 80;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    opacity: 0.85,
  },
  removeBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: {
    color: colors.parchment,
    fontSize: 11,
    fontFamily: fonts.headingSemiBold,
  },
});
