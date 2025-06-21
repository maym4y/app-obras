import { useLocalSearchParams, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View, Image, ScrollView, StyleSheet, Alert } from "react-native";
import { ActivityIndicator, Divider, Text, Chip } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme } from "../../constants/theme";
import EditFiscalModal from "../../components/fiscalEdit";

export default function FiscalizacaoDetalhes() {
  const { id } = useLocalSearchParams();
  const [fiscalizacao, setFiscalizacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);

  const getFiscalizacao = async () => {
    try {
      const data = await AsyncStorage.getItem("fiscalizacoes");
      const lista = data ? JSON.parse(data) : [];
      const encontrado = lista.find((item) => item.id === id);
      setFiscalizacao(encontrado);
    } catch (error) {
      console.error("Erro ao carregar fiscalização:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletarFiscalizacao = (idFiscal, onSuccess = () => {}) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Deseja realmente deletar esta fiscalização?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Ok",
          style: "destructive",
          onPress: async () => {
            try {
              const dados = await AsyncStorage.getItem("fiscalizacoes");
              const lista = dados ? JSON.parse(dados) : [];

              const novaLista = lista.filter(
                (fiscal) => fiscal.id !== idFiscal
              );

              await AsyncStorage.setItem(
                "fiscalizacoes",
                JSON.stringify(novaLista)
              );

              onSuccess(); // Callback opcional para atualizar interface
            } catch (error) {
              console.error("Erro ao deletar fiscalização:", error);
              Alert.alert("Erro", "Não foi possível deletar a fiscalização.");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    getFiscalizacao();
  }, [id]);

  if (loading || !fiscalizacao) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: lightTheme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const { data, status, observacoes, localizacao, imagem } = fiscalizacao;

  const statusColorMap = {
    "Em Dia": "#5C7754",
    Atrasada: "#D4B86D",
    Parada: "#B05C5C",
  };

  const statusTextColor = "#f2f2f2";

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Detalhes de Fiscalização",
          headerStyle: {
            backgroundColor: lightTheme.colors.elevation.level5,
          },
        }}
      />
      <ScrollView style={styles.container}>
        <Chip
          style={{
            backgroundColor: statusColorMap[status] || "#ccc",
            marginBottom: 12,
          }}
          textStyle={{
            color: statusTextColor,
            fontWeight: "bold",
          }}
          icon={
            status === "Em Dia"
              ? "calendar-check"
              : status === "Atrasada"
              ? "calendar-clock"
              : "calendar-remove"
          }
        >
          {status}
        </Chip>

        <Text variant="labelLarge" style={styles.label}>
          Data:
        </Text>
        <Text style={styles.value}>
          {new Date(data).toLocaleDateString("pt-BR")}
        </Text>

        <Divider style={styles.divider} />

        <Text variant="labelLarge" style={styles.label}>
          Localização:
        </Text>
        <Text variant="bodyMedium" style={styles.value}>
          {localizacao.endereco}
        </Text>

        <Divider style={styles.divider} />

        <Text variant="labelLarge" style={styles.label}>
          Observações:
        </Text>
        <Text variant="bodyMedium" style={styles.value}>
          {observacoes}
        </Text>

        <Divider style={styles.divider} />

        {imagem?.uri && (
          <Image
            source={{ uri: imagem.uri }}
            style={styles.imagem}
            resizeMode="cover"
          />
        )}
        <Button
          icon={() => <Icon source="trash-can" size={24} />}
          style={{ marginHorizontal: 10 }}
          mode="contained-tonal"
          onPress={() => deletarFiscalizacao(id)}
        >
          Deletar
        </Button>
        <Button
          icon={() => <Icon source="text-box-edit" size={24} />}
          style={{ marginHorizontal: 10 }}
          mode="contained"
          onPress={() => setEditVisible(true)}
        >
          Editar
        </Button>
        <EditFiscalModal
          visible={editVisible}
          toClose={setEditVisible}
          fiscalizacao={fiscalizacao}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: lightTheme.colors.background,
  },
  label: {
    marginTop: 10,
    marginBottom: 4,
    color: lightTheme.colors.primary,
  },
  value: {
    color: lightTheme.colors.onBackground,
    marginBottom: 10,
  },
  divider: {
    marginVertical: 16,
  },
  imagem: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    marginTop: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
