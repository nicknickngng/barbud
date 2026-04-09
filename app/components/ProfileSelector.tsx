import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { Profile } from "../lib/profiles";
import {
  colors,
  fonts,
  letterSpacing,
  spacing,
  borders,
  shadows,
  frostedGlass,
} from "../lib/theme";

interface Props {
  profiles: Profile[];
  activeProfileId: string;
  onSelect: (profileId: string) => void;
  onRename: (profileId: string, newName: string) => void;
  onDelete: (profileId: string) => void;
  onAdd: (name: string) => void;
}

export default function ProfileSelector({
  profiles,
  activeProfileId,
  onSelect,
  onRename,
  onDelete,
  onAdd,
}: Props) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const activeLabel =
    profiles.find((p) => p.id === activeProfileId)?.name ?? "Default Profile";

  const startRename = (profile: Profile) => {
    setEditingId(profile.id);
    setEditText(profile.name);
  };

  const commitRename = () => {
    if (editingId && editText.trim()) {
      onRename(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText("");
  };

  const handleAdd = () => {
    onAdd(`Profile ${profiles.length + 1}`);
    setOpen(false);
  };

  return (
    <View>
      <Pressable style={styles.selector} onPress={() => setOpen(true)}>
        <Text style={styles.selectorText}>{activeLabel}</Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          style={styles.overlay}
          onPress={() => {
            commitRename();
            setOpen(false);
          }}
        >
          <Pressable
            style={styles.dropdown}
            onPress={(e) => e.stopPropagation()}
          >
            <FlatList
              data={profiles}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.option,
                    item.id === activeProfileId && styles.optionSelected,
                  ]}
                  onPress={() => {
                    if (editingId) commitRename();
                    onSelect(item.id);
                    setOpen(false);
                  }}
                  onLongPress={() => startRename(item)}
                >
                  <View style={styles.optionContent}>
                    {/* Left: name + ingredient count */}
                    <View style={styles.optionLeft}>
                      {editingId === item.id ? (
                        <TextInput
                          style={styles.editInput}
                          value={editText}
                          onChangeText={setEditText}
                          onSubmitEditing={commitRename}
                          onBlur={commitRename}
                          autoFocus
                          selectTextOnFocus
                        />
                      ) : (
                        <Text
                          style={[
                            styles.optionText,
                            item.id === activeProfileId && styles.optionTextSelected,
                          ]}
                        >
                          {item.name}
                        </Text>
                      )}
                      <Text style={styles.ingredientCount}>
                        {item.ingredients.length} ingredient
                        {item.ingredients.length !== 1 ? "s" : ""}
                      </Text>
                    </View>

                    {/* Right: rename + delete */}
                    {editingId !== item.id && (
                      <View style={styles.optionActions}>
                        <Pressable
                          style={styles.actionBtn}
                          onPress={() => startRename(item)}
                          hitSlop={8}
                        >
                          <Text style={styles.actionBtnText}>rename</Text>
                        </Pressable>
                        {profiles.length > 1 && (
                          <Pressable
                            style={styles.actionBtn}
                            onPress={() => {
                              onDelete(item.id);
                              setOpen(false);
                            }}
                            hitSlop={8}
                          >
                            <Text style={[styles.actionBtnText, styles.deleteBtnText]}>delete</Text>
                          </Pressable>
                        )}
                      </View>
                    )}
                  </View>
                </Pressable>
              )}
              ListFooterComponent={
                <Pressable style={styles.addOption} onPress={handleAdd}>
                  <Text style={styles.addOptionText}>+ Add Profile</Text>
                </Pressable>
              }
            />
          </Pressable>
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
    width: 300,
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
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionLeft: {
    flex: 1,
    gap: 3,
  },
  optionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  optionText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.parchment,
    letterSpacing: letterSpacing.gallery,
    flex: 1,
  },
  optionTextSelected: {
    fontFamily: fonts.headingSemiBold,
    color: colors.gold,
  },
  editInput: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.parchment,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold,
    paddingVertical: 2,
    flex: 1,
    marginRight: 12,
  },
  ingredientCount: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.parchmentMuted,
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  actionBtnText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.goldDim,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  deleteBtnText: {
    color: colors.error,
  },
  addOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
  },
  addOptionText: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 14,
    color: colors.gold,
    letterSpacing: letterSpacing.gallery,
  },
});
