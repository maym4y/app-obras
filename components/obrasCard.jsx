import { router } from "expo-router";
import { Card, Text } from "react-native-paper";
import { styles } from "../styles/styles";

export default function ObrasCard(props) {
  const { id, nome, responsavel, dataInicio, local, imagem } = props.item;

  return (
    <Card onPress={() => router.push(`/obra/${id}`)} style={styles.cardContainer}>
      <Card.Title title={nome} />
      <Card.Cover source={{ uri: imagem.uri }} />
      <Card.Content>
        <Text variant="labelMedium">{local.endereco}</Text>
        <Text variant="labelSmall">{responsavel}</Text>
        <Text variant="labelSmall">{dataInicio.split('T')[0]}</Text>
      </Card.Content>
    </Card>
  );
}
