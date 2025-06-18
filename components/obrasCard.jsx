import { router } from "expo-router";
import { Card, Text } from "react-native-paper";

export default function ObrasCard(props) {
    const {   
        id,
        nome,
        responsavel,
        dataInicio,
        local,
        imagem,
    } = props.item;
    return (
        <Card onPress={() => router.push(`/obra/${id}`)}>
            <Card.Title title={nome} />
            <Card.Cover source={{uri: imagem.uri}} />
            <Card.Content>
                <Text variant="titleMedium">{nome}</Text>
                <Text variant="labelMedium">{local.endereco}</Text>
                <Text variant="bodySmall">{dataInicio}</Text>
                <Text variant="bodySmall">{responsavel}</Text>
            </Card.Content>
        </Card>
    )
}