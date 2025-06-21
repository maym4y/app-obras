import { useLocalSearchParams, Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Image, ScrollView, StyleSheet, Alert } from "react-native";
import {
  ActivityIndicator,
  Divider,
  Text,
  Chip,
  Portal,
  Modal,
  IconButton,
  Button,
  Icon,
  TextInput,
  Snackbar,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme } from "../../constants/theme";
import axios from "axios";
import EditFiscalModal from "../../components/fiscalEdit";

async function enviarEmailFiscalizacao(fiscalizacao) {
  if (!fiscalizacao.destinatario || !fiscalizacao.destinatario.includes("@")) {
    throw new Error("E-mail inválido");
  }

  const form = new FormData();
  form.append("data", fiscalizacao.data);
  form.append("status", fiscalizacao.status);
  form.append("observacoes", fiscalizacao.observacoes);
  form.append("local", fiscalizacao.localizacao?.endereco || "");
  form.append("destinatario", fiscalizacao.destinatario);
  form.append("nomeObra", fiscalizacao.nomeObra);

  if (fiscalizacao.imagem?.uri) {
    form.append("imagem", {
      uri: fiscalizacao.imagem.uri,
      name: fiscalizacao.imagem.name || "fiscal.jpg",
      type: fiscalizacao.imagem.type || "image/jpeg",
    });
  }
  await axios.post(
    "http://192.168.15.149:3001/enviar-email-fiscalizacao",
    form,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
}

export default function FiscalizacaoDetalhes() {
  const { id } = useLocalSearchParams();
  const [fiscalizacao, setFiscalizacao] = useState(null);
  const [nomeObra, setNomeObra] = useState("");
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailParaEnvio, setEmailParaEnvio] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");

  const getFiscalizacao = async () => {
    try {
      const data = await AsyncStorage.getItem("fiscalizacoes");
      const lista = data ? JSON.parse(data) : [];
      const encontrado = lista.find((item) => item.id === id);
      if (!encontrado) {
        Alert.alert("Erro", "Fiscalização não encontrada.");
        return;
      }
      setFiscalizacao(encontrado);
      const listaObras = await AsyncStorage.getItem("obras");
      const parseado = listaObras
        ? JSON.parse(listaObras).find((item) => item.id === encontrado.idObra)
        : {};
      const nomeObra = parseado.nome;
      setNomeObra(nomeObra);
    } catch (error) {
      console.error("Erro ao carregar fiscalização:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletarFiscalizacao = (idFiscal) => {
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

              router.back();
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
        <Text variant="titleMedium">Fiscalização:</Text>
        <Text variant="titleLarge" style={{ paddingBottom: 10 }}>
          {nomeObra}
        </Text>
        <Text variant="titleSmall" style={styles.label}>Status:</Text>
        <Chip
          style={{
            backgroundColor: statusColorMap[status] || "#ccc",
            marginBottom: 12,
          }}
          textStyle={{
            color: statusTextColor,
            fontWeight: "bold",
          }}
          icon={() => (
            <Icon
              source={
                status === "Em Dia"
                  ? "calendar-check"
                  : status === "Atrasada"
                  ? "calendar-clock"
                  : "calendar-remove"
              }
              color="#f2f2f2" // ← aqui você define a cor que quiser
              size={18} // tamanho opcional
            />
          )}
        >
          {status}
        </Chip>

        <Text variant="labelLarge" style={styles.label}>
          Data:
        </Text>
        <Text style={styles.value}>
          {new Date(data).toLocaleDateString("pt-BR")}
        </Text>

        <Text variant="labelLarge" style={styles.label}>
          Localização:
        </Text>
        <Text variant="bodyMedium" style={styles.value}>
          {localizacao.endereco}
        </Text>

        <Text variant="labelLarge" style={styles.label}>
          Observações:
        </Text>
        <Text variant="bodyMedium" style={styles.value}>
          {observacoes}
        </Text>

        {imagem?.uri && (
          <Image
            source={{ uri: imagem.uri }}
            style={styles.imagem}
            resizeMode="cover"
          />
        )}
        <View
          style={{ display: "flex", flexDirection: "row", marginBottom: 30 }}
        >
          <Button
            icon={() => <Icon source="trash-can" size={24} />}
            style={{ margin: 5, marginTop: 10 }}
            mode="contained-tonal"
            onPress={() => deletarFiscalizacao(id)}
          >
            Deletar
          </Button>
          <Button
            icon={() => <Icon source="pencil" size={24} color="#f2f2f2" />}
            style={{ margin: 5, marginTop: 10 }}
            mode="contained"
            onPress={() => setEditVisible(true)}
          >
            Editar
          </Button>
          <IconButton
            style={{
              marginTop: 10,
              borderWidth: 2,
              backgroundColor: lightTheme.colors.elevation.level3,
            }}
            icon={() => <Icon source="email-fast" size={24} />}
            mode="outlined"
            onPress={() => setEmailModalVisible(true)}
          />
        </View>
        <EditFiscalModal
          visible={editVisible}
          toClose={setEditVisible}
          fiscalizacao={fiscalizacao}
        />
        <Portal>
          <Modal
            visible={emailModalVisible}
            onDismiss={() => setEmailModalVisible(false)}
            contentContainerStyle={{
              backgroundColor: "white",
              padding: 20,
              margin: 20,
              borderRadius: 10,
            }}
          >
            <Text variant="titleMedium" style={{ marginBottom: 10 }}>
              Enviar Fiscalização por E-mail
            </Text>

            <TextInput
              label="E-mail do destinatário"
              value={emailParaEnvio}
              onChangeText={setEmailParaEnvio}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ marginBottom: 20 }}
            />

            <Button
              mode="contained"
              loading={emailLoading}
              disabled={emailLoading}
              onPress={async () => {
                setEmailLoading(true);
                try {
                  await enviarEmailFiscalizacao({
                    ...fiscalizacao, // você precisa garantir que esse objeto existe
                    destinatario: emailParaEnvio,
                    nomeObra: nomeObra,
                  });
                  setSnackbarText("Fiscalização enviada com sucesso!");
                  setEmailModalVisible(false);
                } catch (err) {
                  console.error(err);
                  setSnackbarText("Erro ao enviar a fiscalização.");
                } finally {
                  setEmailLoading(false);
                  setSnackbarVisible(true);
                  setEmailParaEnvio("");
                }
              }}
            >
              Enviar
            </Button>
          </Modal>
        </Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: "OK",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarText}
        </Snackbar>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: lightTheme.colors.background,
    marginBottom: 50,
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
