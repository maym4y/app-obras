import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { Alert, Image, Modal, ScrollView, View } from "react-native";
import {
  Button,
  IconButton,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme } from "../constants/theme";

export default function EditFiscalModal({ visible, toClose, fiscalizacao }) {
  const [formData, setFormData] = useState(fiscalizacao);
  const [enderecoCompleto, setEnderecoCompleto] = useState(fiscalizacao.localizacao?.endereco || "");
  const [imagemUri, setImagemUri] = useState(fiscalizacao.imagem?.uri || "");
  const [localLoading, setLocalLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");

  const statusOptions = [
    { label: "Em Dia", value: "Em Dia" },
    { label: "Atrasada", value: "Atrasada" },
    { label: "Parada", value: "Parada" },
  ];

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const obterLocalizacaoAtual = async () => {
    try {
      setLocalLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão Negada", "Permissão de localização necessária.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addressResponse.length > 0) {
        const endereco = addressResponse[0];
        const enderecoFormatado = [
          endereco.street,
          endereco.streetNumber,
          endereco.district,
          endereco.city,
          endereco.region,
        ]
          .filter(Boolean)
          .join(", ");

        setEnderecoCompleto(enderecoFormatado);

        const localizacaoAtual = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          endereco: enderecoFormatado,
        };
        updateField("localizacao", localizacaoAtual);

        setSnackbarText(`Localização Capturada: ${enderecoFormatado}`);
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error("Erro de localização:", error);
      Alert.alert("Erro", "Não foi possível obter sua localização.");
    } finally {
      setLocalLoading(false);
    }
  };

  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão Negada", "Permissão para usar a câmera é necessária.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImagemUri(uri);
      updateField("imagem", { uri });
    }
  };

  const salvarEdicao = async () => {
    try {
      const { data, status, observacoes, localizacao, imagem, id } = formData;

      if (!status || !observacoes || !data || !imagem?.uri || !localizacao?.endereco) {
        return Alert.alert("Campos obrigatórios", "Preencha todos os campos.");
      }

      const listaSalva = await AsyncStorage.getItem("fiscalizacoes");
      const lista = listaSalva ? JSON.parse(listaSalva) : [];

      const novaLista = lista.map((item) =>
        item.id === id ? { ...formData, imagem, localizacao } : item
      );

      await AsyncStorage.setItem("fiscalizacoes", JSON.stringify(novaLista));

      setSnackbarText("Fiscalização atualizada com sucesso!");
      setSnackbarVisible(true);
      setTimeout(() => toClose(false), 1000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      Alert.alert("Erro", "Não foi possível atualizar a fiscalização.");
    }
  };

  return (
    <Modal visible={visible} onRequestClose={() => toClose(false)}>
      <ScrollView
        style={{
          flex: 1,
          padding: 20,
          backgroundColor: lightTheme.colors.background,
        }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <IconButton
            onPress={() => toClose(false)}
            icon="backspace-outline"
            size={30}
          />
          <Text variant="titleLarge">Editar Fiscalização</Text>
        </View>

        <Text style={{ marginBottom: 4 }}>Endereço:</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput value={enderecoCompleto} disabled style={{ flex: 1 }} />
          <IconButton
            onPress={obterLocalizacaoAtual}
            loading={localLoading}
            icon="map-marker"
            style={{ marginLeft: 10 }}
            iconColor={lightTheme.colors.onSurface}
          />
        </View>

        <Text style={{ marginTop: 20, marginBottom: 4 }}>
          Data de Fiscalização:
        </Text>
        <Button mode="outlined" icon="calendar">
          {new Date(formData.data).toLocaleDateString("pt-BR")}
        </Button>

        <Text style={{ marginTop: 20, marginBottom: 4 }}>Status:</Text>
        <Picker
          selectedValue={formData.status}
          onValueChange={(item) => updateField("status", item)}
          style={{
            backgroundColor: lightTheme.colors.elevation.level2,
          }}
        >
          {statusOptions.map(({ label, value }, index) => (
            <Picker.Item key={index} label={label} value={value} />
          ))}
        </Picker>

        <TextInput
          label="Observações"
          value={formData.observacoes}
          onChangeText={(text) => updateField("observacoes", text)}
          multiline
          style={{ marginTop: 20, marginBottom: 12 }}
        />

        <Button
          icon="camera"
          mode="elevated"
          onPress={tirarFoto}
          buttonColor={lightTheme.colors.elevation.level2}
        >
          Tirar Nova Foto
        </Button>

        {imagemUri ? (
          <Image
            source={{ uri: imagemUri }}
            style={{
              width: "100%",
              height: 200,
              marginTop: 10,
              borderRadius: 8,
            }}
            resizeMode="cover"
          />
        ) : null}

        <View style={{ flexDirection: "row", marginVertical: 30 }}>
          <Button
            onPress={() => toClose(false)}
            style={{ flex: 1 }}
            mode="contained-tonal"
            icon="window-close"
          >
            Cancelar
          </Button>
          <View style={{ width: 15 }} />
          <Button
            onPress={salvarEdicao}
            style={{ flex: 1 }}
            mode="contained"
            icon="content-save"
          >
            Salvar
          </Button>
        </View>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{ label: "OK", onPress: () => setSnackbarVisible(false) }}
        >
          {snackbarText}
        </Snackbar>
      </ScrollView>
    </Modal>
  );
}
