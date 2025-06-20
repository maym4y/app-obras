import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { Alert, Image, Modal, ScrollView, View } from "react-native";
import { Button, IconButton, Text, TextInput } from "react-native-paper";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { lightTheme } from "../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddFiscalModal({ obraID, visible, toClose }) {
  const [formData, setFormData] = useState({
    id: "",
    data: new Date(),
    status: "Em Dia",
    observacoes: "",
    localizacao: {},
    imagem: {},
    idObra: obraID,
  });
  const [enderecoCompleto, setEnderecoCompleto] = useState("");
  const [imagemUri, setImagemUri] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

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

        Alert.alert("Localização Capturada", enderecoFormatado);
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
      Alert.alert(
        "Permissão Negada",
        "Permissão para usar a câmera é necessária."
      );
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

  const salvarFiscalizacao = async (formData) => {
    try {
      // 🔒 Validação de campos obrigatórios
      const { data, status, observacoes, localizacao, imagem, idObra } =
        formData;

      if (
        !status ||
        !observacoes ||
        !data ||
        !imagem ||
        !localizacao?.endereco
      ) {
        return Alert.alert(
          "Campos obrigatórios",
          "Por favor, preencha todos os campos obrigatórios."
        );
      }

      // 🆔 Geração de ID único
      const novoFiscal = {
        id: uuidv4(10),
        status: status,
        observacoes: observacoes || "",
        data: data.toISOString(),
        localizacao: localizacao,
        imagem: imagem,
        idObra,
      };

      // 📥 Recuperar obras anteriores
      const fiscalSalvos = await AsyncStorage.getItem("fiscalizacoes");
      const lista = fiscalSalvos ? JSON.parse(fiscalSalvos) : [];

      // ➕ Adicionar nova obra
      const novaLista = [...lista, novoFiscal];

      // 💾 Salvar no AsyncStorage
      await AsyncStorage.setItem("fiscalizacoes", JSON.stringify(novaLista));

      Alert.alert("Sucesso", "Fiscalizacao salva com sucesso!");
      toClose(false);
    } catch (error) {
      console.error("Erro ao salvar obra:", error);
      Alert.alert("Erro", "Não foi possível salvar a obra.");
      return false;
    }
  };

  useEffect(() => {
    if (visible) {
    obterLocalizacaoAtual();
    }
  }, [visible]);

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
        <View style={{ display: "flex", flexDirection: "row", alignItems: 'center'}}>
          <IconButton onPress={() => toClose(false)} icon="backspace-outline" size={30} />
          <Text variant="titleLarge">Nova Fiscalizacao:</Text>
        </View>
        <Text style={{ marginBottom: 4 }}>Endereço:</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            value={enderecoCompleto}
            style={{ flex: 1 }}
            disabled={true}
          />
          <IconButton
            mode="contained"
            onPress={obterLocalizacaoAtual}
            style={{ marginLeft: 10 }}
            loading={localLoading}
            icon="map-marker"
            size={30}
            iconColor={lightTheme.colors.onSurface}
          />
        </View>

        <Text style={{ marginTop: 20, marginBottom: 4 }}>
          Data de Fiscalização:
        </Text>
        <Button mode="outlined" icon="calendar">
          {formData.data.toLocaleDateString("pt-BR")}
        </Button>
        <Picker
          selectedValue={formData.status}
          onValueChange={(item) => updateField("status", item)}
          style={{
            marginTop: 20,
            marginBottom: 4,
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
          style={{ height: "10%", justifyContent: "center" }}
          mode="elevated"
          icon="camera"
          buttonColor={lightTheme.colors.elevation.level2}
          onPress={tirarFoto}
        >
          Tirar Foto da Obra
        </Button>

        {imagemUri && (
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
        )}
        <View style={{ flex: 1, flexDirection: "row", marginVertical: 30 }}>
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
            onPress={() => salvarFiscalizacao(formData)}
            style={{ flex: 1 }}
            mode="contained"
            icon="content-save"
          >
            Salvar
          </Button>
        </View>
      </ScrollView>
    </Modal>
  );
}
