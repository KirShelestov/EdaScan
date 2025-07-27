import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import { FavoriteProvider } from "../components/FavoriteContext";

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <SafeAreaProvider>
            <FavoriteProvider>
                <ThemeProvider
                    value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                >
                    <Stack 
                        screenOptions={{ 
                            headerShown: false,
                            contentStyle: { 
                                paddingTop: 50,
                                backgroundColor: '#dde8ee'
                            }
                        }} 
                    />
                    <StatusBar style="auto" />
                </ThemeProvider>
            </FavoriteProvider>
        </SafeAreaProvider>
    );
}
