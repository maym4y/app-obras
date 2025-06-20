import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { customNeutralTheme, darkTheme, lightTheme } from "../constants/theme";

export default function Layout() {
  const theme = useColorScheme();
  return (
    <SafeAreaProvider>
      <PaperProvider theme={lightTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
