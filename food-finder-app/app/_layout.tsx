import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import "react-native-reanimated";
import { FavoriteProvider } from "../components/FavoriteContext";

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <FavoriteProvider>
            <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
                <Stack />
                <StatusBar style="auto" />
            </ThemeProvider>
        </FavoriteProvider>
    );
}
