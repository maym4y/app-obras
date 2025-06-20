import { router } from "expo-router";
import { Button, Card, Chip, Icon, IconButton, Text } from "react-native-paper";
import { styles } from "../styles/styles";
import { useEffect, useMemo, useState } from "react";
import { lightTheme } from "../constants/theme";
import { View } from "react-native";

export default function FiscalCard(props) {
  const { id, data, status, observacoes, localizacao, imagem } = props.item;

  const { icon, color, background } = useMemo(() => {
    switch (status) {
      case "Em Dia":
        return {
          icon: "calendar-check",
          color: "#F2F2F2",
          background: "#5C7754",
        };
      case "Atrasada":
        return {
          icon: "calendar-clock",
          color: "#2e2e2e",
          background: "#D4B86D",
        };
      case "Parada":
        return {
          icon: "calendar-remove",
          color: "#F2F2F2",
          background: "#B05C5C",
        };
      default:
        return {
          icon: "calendar-question",
          color: lightTheme.colors.outline,
          background: "F2F2F2",
        };
    }
  }, [status]);

  return (
    <Card
      onPress={() => router.push(`/fiscalizacao/${id}`)}
      style={styles.cardContainer}
    >
      <Card.Cover source={{ uri: imagem.uri }} />
      <Card.Content>
        <Text variant="labelMedium">{localizacao.endereco}</Text>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text variant="labelSmall">{data.split("T")[0]}</Text>
          <IconButton
            icon={() => <Icon source={icon} size={26} color={color} />}
            style={{
              backgroundColor: background,
              alignSelf: "flex-end", // evita que ocupe toda a linha
              alignContent: 'flex-start',
              paddingVertical: 0,
              paddingHorizontal: 4,
              height: 26, // controla altura
            }}
          />
        </View>
        <Text variant="labelSmall">{observacoes.slice(0, 80)}...</Text>
      </Card.Content>
    </Card>
  );
}
