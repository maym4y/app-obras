import { Stack, useLocalSearchParams } from "expo-router";
import { Text } from "react-native-paper";

export default function ObraDetalhes() {
  const { id } = useLocalSearchParams();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Text
        style={{
            margin: 50
        }}
      >
        {id}
      </Text>
    </>
  );
}
