import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { ModelType } from "../lib/api";
import {
  colors,
  fonts,
  letterSpacing,
  spacing,
  borders,
  shadows,
  frostedGlass,
} from "../lib/theme";

const MODEL_OPTIONS: { label: string; value: ModelType }[] = [
  { label: "Claude", value: "claude" },
  { label: "GPT-4o", value: "gpt4o" },
  { label: "Gemini", value: "gemini" },
];

interface Props {
  selected: ModelType;
  onSelect: (model: ModelType) => void;
}

export default function ModelSelector({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  const selectedLabel =
    MODEL_OPTIONS.find((o) => o.value === selected)?.label ?? selected;

  return (
    <View>
      <Pressable style={styles.selector} onPress={() => setOpen(true)}>
        <Text style={styles.selectorText}>{selectedLabel}</Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.dropdown}>
            <FlatList
              data={MODEL_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.option,
                    item.value === selected && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === selected && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.charcoal,
    borderRadius: borders.radius.sm,
    borderWidth: borders.hairline,
    borderColor: colors.goldDim,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  selectorText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.parchment,
    letterSpacing: letterSpacing.gallery,
  },
  chevron: {
    fontSize: 10,
    color: colors.gold,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    ...frostedGlass,
  },
  dropdown: {
    backgroundColor: colors.charcoal,
    borderRadius: borders.radius.md,
    borderWidth: borders.hairline,
    borderColor: colors.goldDim,
    width: 240,
    overflow: "hidden",
    ...shadows.warm,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: borders.hairline,
    borderBottomColor: colors.parchmentFaint,
  },
  optionSelected: {
    backgroundColor: colors.goldFaint,
  },
  optionText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.parchment,
    letterSpacing: letterSpacing.gallery,
  },
  optionTextSelected: {
    fontFamily: fonts.headingSemiBold,
    color: colors.gold,
  },
});
