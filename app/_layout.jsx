import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { customNeutralTheme, darkTheme, lightTheme } from "../constants/theme";

export default function Layout() {
  const theme = useColorScheme();
  return (
    <PaperProvider theme={lightTheme}>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
