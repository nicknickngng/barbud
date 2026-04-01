import { View, Text, StyleSheet } from "react-native";
import { Ingredient } from "../lib/api";
import {
  colors,
  fonts,
  letterSpacing,
  borders,
  shadows,
} from "../lib/theme";

interface Props {
  ingredients: Ingredient[];
  stale?: boolean;
}

export default function IngredientsTable({ ingredients, stale }: Props) {
  if (ingredients.length === 0) return null;

  return (
    <View style={[styles.table, stale && styles.tableStale]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, styles.nameCol]}>INGREDIENT</Text>
        <View style={styles.divider} />
        <Text style={[styles.headerText, styles.qtyCol]}>QTY</Text>
        <View style={styles.divider} />
        <Text style={[styles.headerText, styles.volCol]}>EST. VOLUME</Text>
      </View>

      {/* Rows */}
      {ingredients.map((item, index) => (
        <View
          key={index}
          style={[
            styles.row,
            index % 2 === 1 && styles.rowAlt,
            index < ingredients.length - 1 && styles.rowBorder,
          ]}
        >
          <Text
            style={[styles.cell, styles.nameCol, stale && styles.cellStale]}
          >
            {item.name}
          </Text>
          <View style={styles.divider} />
          <Text
            style={[styles.cell, styles.qtyCol, stale && styles.cellStale]}
          >
            {item.quantity}
          </Text>
          <View style={styles.divider} />
          <Text
            style={[
              styles.cell,
              styles.volCol,
              styles.volText,
              stale && styles.cellStale,
            ]}
          >
            {item.volume || "—"}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderRadius: borders.radius.md,
    overflow: "hidden",
    borderWidth: borders.hairline,
    borderColor: colors.goldDim,
    backgroundColor: colors.charcoal,
    ...shadows.soft,
  },
  tableStale: {
    opacity: 0.45,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.charcoalLight,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: borders.hairline,
    borderBottomColor: colors.goldDim,
  },
  headerText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.gold,
    letterSpacing: letterSpacing.label,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 0,
    backgroundColor: colors.charcoal,
  },
  rowAlt: {
    backgroundColor: colors.obsidian,
  },
  rowBorder: {
    borderBottomWidth: borders.hairline,
    borderBottomColor: colors.parchmentFaint,
  },
  cell: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.parchment,
    letterSpacing: letterSpacing.gallery,
    paddingHorizontal: 12,
  },
  cellStale: {
    color: colors.parchmentMuted,
  },
  nameCol: {
    flex: 3,
  },
  qtyCol: {
    flex: 2,
    textAlign: "center",
  },
  volCol: {
    flex: 3,
    textAlign: "right",
  },
  volText: {
    fontSize: 13,
    color: colors.parchmentMuted,
  },
  divider: {
    width: borders.hairline,
    alignSelf: "stretch",
    backgroundColor: colors.goldDim,
  },
});
