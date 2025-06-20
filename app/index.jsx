import { useEffect, useState } from "react";
import { Modal, ScrollView, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  FAB,
  Searchbar,
  TextInput,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import ObrasCard from "../components/obrasCard";
import { router } from "expo-router";
import AddObra from "../components/obrasAdd";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { customNeutralTheme, darkCustomTheme, darkTheme, lightTheme } from "../constants/theme";

export default function MainScreen() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [allObras, setAllObras] = useState([]);

  const getObras = async () => {
    try {
      setLoading(true);
      const obras = await AsyncStorage.getItem("obras");
      const jsonObras = JSON.parse(obras) || [];
      setAllObras(jsonObras);
      setObras(jsonObras); // inicializa a lista filtrada com tudo
    } catch (error) {
      console.log(error.response ? error.response.message : error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterObras = () => {
    if (query.trim() === "") {
      setObras(allObras); // se a pesquisa estiver vazia, mostra tudo
      return;
    }

    const filtered = allObras.filter((item) => {
      const q = query.toLowerCase();
      return (
        item.nome.toLowerCase().includes(q) ||
        item.responsavel.toLowerCase().includes(q) ||
        item.local.endereco.toLowerCase().includes(q)
      );
    });

    setObras(filtered);
  };

  useEffect(() => {
    getObras();
  }, [modalVisible]);

  useEffect(() => {
    filterObras();
  }, [query]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 15,
        backgroundColor: lightTheme.colors.background,
        paddingBottom: 120
      }}
    >
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <AddObra visible={modalVisible} toClose={setModalVisible} />
      </Modal>
      <View style={{ marginVertical: 5}}>
        <Searchbar
          placeholder="Pesquise..."
          value={query}
          onChangeText={setQuery}
          style={{
            backgroundColor: lightTheme.colors.elevation.level5,
            borderWidth: 0.3,
            borderColor: lightTheme.colors.inverseSurface
          }}
        />
      </View>
      <View style={{ marginVertical: 5}}>
        <Button
          onPress={() => setModalVisible(true)}
          mode="contained"
          icon="plus"
        >
          Adicionar Obra
        </Button>
      </View>
      <View>
        <ScrollView>
          {loading && <ActivityIndicator size="large" />}
          {!loading &&
            obras.map((item, index) => {
              return <ObrasCard key={index} item={item} />;
            })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
