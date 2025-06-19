import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Divider, Text } from "react-native-paper";
import { lightTheme } from "../../constants/theme";

export default function ObraDetalhes() {
  const [obra, setObra] = useState({});
  const [loading, setLoading] = useState(true);
  const { id } = useLocalSearchParams();
  const getObra = async () => {
    try {
      setLoading(true);
      const lista = await AsyncStorage.getItem("obras");
      const obra = JSON.parse(lista).find((item) => item.id == id);
      if (!obra) {
        Alert.alert(
          "Não foi possível renderizar esta obra. Tente novamente depois."
        );
        router.replace("/index");
      }
      console.log(obra);
      setObra(obra);
    } catch (error) {
      console.log(error.response ? error.response : error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getObra();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: lightTheme.colors.background }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

 return (
    <>
      <Stack.Screen options={{headerTitle: "Detalhes da Obra", headerStyle: { backgroundColor: lightTheme.colors.elevation.level5 }}}/>
      <View style={styles.container}>
        <Text variant="titleLarge" style={styles.nome}>
          {obra.nome}
        </Text>
        <Text variant="titleSmall" style={styles.endereco}>
          {obra.local.endereco}
        </Text>
        <Text variant="labelLarge" style={styles.responsavel}>
          {obra.responsavel}
        </Text>

        <Divider style={styles.divider} />

        <Text variant="bodyLarge" style={styles.descricao}>
          {obra.descricao}
        </Text>

        <Divider style={styles.divider} />

        <View style={styles.datasContainer}>
          <Text style={styles.dataTexto}>
            Início de Obra: {obra.dataInicio.split("T")[0]}
          </Text>
          <Text style={styles.dataTexto}>
            Previsão de Término: {obra.dataFim.split("T")[0]}
          </Text>
        </View>

        <Divider style={styles.divider} />

        <Image
          style={styles.imagem}
          source={{ uri: obra.imagem.uri }}
        />
        <Divider style={styles.divider} />
        <Button mode="contained">Deletar</Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingVertical: 20,
    justifyContent: "flex-start",
    backgroundColor: lightTheme.colors.background
  },
  nome: {
    marginBottom: 5,
  },
  endereco: {
    color: "#666",
    marginBottom: 2,
  },
  responsavel: {
    color: "#888",
    marginBottom: 10,
  },
  descricao: {
    marginVertical: 10,
    lineHeight: 22,
  },
  datasContainer: {
    marginVertical: 10,
  },
  dataTexto: {
    fontSize: 14,
    color: "#444",
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: lightTheme.colors.elevation.level3,
    borderRadius: 30,
    width: "100%"
  },
  divider: {
    marginVertical: 10,
  },
  imagem: {
    height: 220,
    width: "100%",
    resizeMode: "contain",
    marginTop: 15,
    borderRadius: 8,
  },
});