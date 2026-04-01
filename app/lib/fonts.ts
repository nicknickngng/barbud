import { useFonts } from "expo-font";
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from "@expo-google-fonts/cormorant-garamond";
import {
  TenorSans_400Regular,
} from "@expo-google-fonts/tenor-sans";

export function useAppFonts() {
  return useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    TenorSans_400Regular,
  });
}
