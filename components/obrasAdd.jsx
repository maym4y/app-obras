import { useEffect, useState } from "react";
import { Alert, View, Image, ScrollView } from "react-native";
import {
  Button,
  IconButton,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { lightTheme } from "../constants/theme";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddObra({ visible, toClose }) {
  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    responsavel: "",
    descricao: "",
    dataInicio: new Date(),
    dataFim: new Date(),
    local: {},
    imagem: {},
  });

  const [enderecoCompleto, setEnderecoCompleto] = useState("");
  const [showDateInicio, setShowDateInicio] = useState(false);
  const [showDateFim, setShowDateFim] = useState(false);
  const [imagemUri, setImagemUri] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      id: "",
      nome: "",
      responsavel: "",
      dataInicio: new Date(),
      local: {},
      imagem: {},
    });
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
        updateField("local", localizacaoAtual);

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

  const onChangeInicio = (event, selectedDate) => {
    if (selectedDate) {
      updateField("dataInicio", selectedDate);
    }
    setShowDateInicio(false);
  };

  const onChangeFim = (event, selectedDate) => {
    if (selectedDate) {
      updateField("dataFim", selectedDate);
    }
    setShowDateFim(false);
  };

  const salvarObra = async (formData) => {
    try {
      // 🔒 Validação de campos obrigatórios
      const {
        nome,
        responsavel,
        dataInicio,
        dataFim,
        local,
        descricao,
        imagem,
      } = formData;

      if (
        !nome ||
        !responsavel ||
        !dataInicio ||
        !dataFim ||
        !local?.endereco
      ) {
        return Alert.alert(
          "Campos obrigatórios",
          "Por favor, preencha todos os campos obrigatórios."
        );
      }

      // 🗓️ Validação de datas
      if (new Date(dataFim) <= new Date(dataInicio)) {
        return Alert.alert(
          "Datas inválidas",
          "A data de término deve ser posterior à data de início."
        );
      }

      // 🆔 Geração de ID único
      const novaObra = {
        id: uuidv4(),
        nome,
        responsavel,
        descricao: descricao || "",
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString(),
        local,
        imagem,
        criadoEm: new Date().toISOString(),
      };

      // 📥 Recuperar obras anteriores
      const obrasSalvas = await AsyncStorage.getItem("obras");
      const lista = obrasSalvas ? JSON.parse(obrasSalvas) : [];

      // ➕ Adicionar nova obra
      const novaLista = [...lista, novaObra];

      // 💾 Salvar no AsyncStorage
      await AsyncStorage.setItem("obras", JSON.stringify(novaLista));

      Alert.alert("Sucesso", "Obra salva com sucesso!");
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
    <ScrollView
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: lightTheme.colors.background,
      }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <IconButton
          onPress={() => toClose(false)}
          icon="backspace-outline"
          size={30}
        />
        <Text variant="titleLarge">Adicionar Nova Obra:</Text>
      </View>
      <TextInput
        label="Nome da Obra"
        value={formData.nome}
        onChangeText={(text) => updateField("nome", text)}
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Responsável"
        value={formData.responsavel}
        onChangeText={(text) => updateField("responsavel", text)}
        style={{ marginBottom: 12 }}
      />

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

      <Text style={{ marginTop: 20, marginBottom: 4 }}>Data de Início:</Text>
      <Button
        mode="outlined"
        onPress={() => setShowDateInicio(true)}
        icon="calendar"
      >
        {formData.dataInicio.toLocaleDateString("pt-BR")}
      </Button>
      {showDateInicio && (
        <DateTimePicker
          value={formData.dataInicio}
          mode="date"
          display="default"
          onChange={onChangeInicio}
        />
      )}

      <Text style={{ marginTop: 20, marginBottom: 4 }}>Data de Término:</Text>
      <Button
        mode="outlined"
        onPress={() => setShowDateFim(true)}
        icon="calendar"
      >
        {formData.dataFim.toLocaleDateString("pt-BR")}
      </Button>
      {showDateFim && (
        <DateTimePicker
          value={formData.dataFim}
          mode="date"
          display="default"
          onChange={onChangeFim}
        />
      )}

      <TextInput
        label="Descrição"
        value={formData.descricao}
        onChangeText={(text) => updateField("descricao", text)}
        multiline
        style={{ marginTop: 20, marginBottom: 12 }}
      />

      <Button
        style={{ height: "6%", justifyContent: "center" }}
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
          onPress={() => salvarObra(formData)}
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
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarText}
      </Snackbar>
    </ScrollView>
  );
}
