import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Chip,
  Icon,
  Text,
} from "react-native-paper";
import Swiper from "react-native-screens-swiper";
import { lightTheme } from "../../constants/theme";
import FiscalCard from "../../components/fiscalCard";
import AddFiscalModal from "../../components/fiscalAdd";
import { SafeAreaView } from "react-native-safe-area-context";

const formatarData = (dataString) => {
  if (!dataString) return "N/A";
  const data = new Date(dataString);
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const ObraTab = ({ obra }) => {
  return (
    <View style={{ padding: 15 }}>
      <Text variant="bodyLarge" style={styles.descricao}>
        {obra.descricao}
      </Text>

      <View style={styles.datasContainer}>
        <Text style={styles.dataTexto}>
          Início de Obra: {formatarData(obra.dataInicio)}
        </Text>
        <Text style={styles.dataTexto}>
          Previsão de Término: {formatarData(obra.dataFim)}
        </Text>
      </View>

      <Image style={styles.imagem} source={{ uri: obra.imagem.uri }} />
    </View>
  );
};

const FiscalizacaoTab = ({ fiscal }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "nowrap",
          justifyContent: "space-between",
          paddingHorizontal: 10,
          gap: 6, // espaçamento entre chips
        }}
      >
        <Chip
          mode="flat"
          icon={() => (
            <Icon source="calendar-check" color="#f2f2f2" size={14} />
          )}
          style={{
            backgroundColor: "#5C7754",
            paddingVertical: 0,
            paddingHorizontal: 6,
            minWidth: 80,
            height: 32,
            justifyContent: "center",
            alignContent: "center",
          }}
          textStyle={{
            color: "#f2f2f2",
            fontSize: 11,
            lineHeight: 20,
          }}
        >
          Em Dia
        </Chip>

        <Chip
          mode="flat"
          icon={() => (
            <Icon source="calendar-clock" color="#2e2e2e" size={14} />
          )}
          style={{
            backgroundColor: "#D4B86D",
            paddingVertical: 0,
            paddingHorizontal: 6,
            minWidth: 80,
            height: 32,
            justifyContent: "center",
          }}
          textStyle={{
            color: "#2e2e2e",
            fontSize: 11,
            lineHeight: 16,
          }}
        >
          Atrasada
        </Chip>

        <Chip
          mode="flat"
          icon={() => (
            <Icon source="calendar-remove" color="#f2f2f2" size={14} />
          )}
          style={{
            backgroundColor: "#B05C5C",
            paddingVertical: 0,
            paddingHorizontal: 6,
            minWidth: 80,
            height: 32,
            justifyContent: "center",
          }}
          textStyle={{
            color: "#f2f2f2",
            fontSize: 11,
            lineHeight: 16,
          }}
        >
          Parada
        </Chip>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      >
        {fiscal.map((item, index) => (
          <FiscalCard key={index} item={item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default function ObraDetalhes() {
  const [obra, setObra] = useState({});
  const [fiscal, setFiscal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addFiscal, setAddFiscal] = useState(false);
  const { id } = useLocalSearchParams();

  const getObra = async () => {
    try {
      setLoading(true);
      const lista = await AsyncStorage.getItem("obras");
      if (!lista) {
        Alert.alert(
          "Não foi possível renderizar esta obra. Tente novamente depois."
        );
      }
      const obra = JSON.parse(lista).find((item) => item.id == id);
      setObra(obra);
    } catch (error) {
      console.log(error.response ? error.response : error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFiscalizacoes = async () => {
    try {
      const lista = await AsyncStorage.getItem("fiscalizacoes");
      const fiscalizacoes = lista ? JSON.parse(lista) : [];
      const filtrados = fiscalizacoes.filter((item) => item.idObra === id);
      setFiscal(filtrados);
    } catch (error) {
      console.log(error.response || error.message);
    }
  };

  const info = [
    {
      tabLabel: "Sobre a Obra",
      component: ObraTab,
      props: { obra },
    },
    {
      tabLabel: "Fiscalizações",
      component: FiscalizacaoTab,
      props: { fiscal, setAddFiscal },
    },
  ];

  const deletarObra = async (idObra) => {
    Alert.alert(
      "Excluir Obra",
      "Deletar esta obra também excluirá todas as fiscalizações associadas a ela. Deseja continuar?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              // 🔸 Excluir Obra
              const obrasData = await AsyncStorage.getItem("obras");
              const obras = obrasData ? JSON.parse(obrasData) : [];
              const novasObras = obras.filter((obra) => obra.id !== idObra);
              await AsyncStorage.setItem("obras", JSON.stringify(novasObras));

              // 🔸 Excluir Fiscalizações da Obra
              const fiscData = await AsyncStorage.getItem("fiscalizacoes");
              const fisc = fiscData ? JSON.parse(fiscData) : [];
              const novasFisc = fisc.filter((f) => f.idObra !== idObra);
              await AsyncStorage.setItem(
                "fiscalizacoes",
                JSON.stringify(novasFisc)
              );

              Alert.alert(
                "Sucesso",
                "Obra e fiscalizações deletadas com sucesso."
              );
              router.replace("/"); // Você pode usar isso para atualizar a UI ou redirecionar
            } catch (error) {
              console.error("Erro ao deletar obra:", error);
              Alert.alert("Erro", "Não foi possível excluir a obra.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  useEffect(() => {
    getObra();
  }, [id]);

  useEffect(() => {
    if (!addFiscal) {
      getFiscalizacoes();
    }
  }, [addFiscal]);

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerTitle: "Detalhes da Obra",
            headerStyle: {
              backgroundColor: lightTheme.colors.elevation.level5,
            },
          }}
        />
        <View
          style={{ flex: 1, backgroundColor: lightTheme.colors.background }}
        >
          <ActivityIndicator size="large" />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Detalhes da Obra",
          headerStyle: { backgroundColor: lightTheme.colors.elevation.level5 },
        }}
      />
      <AddFiscalModal obraID={id} visible={addFiscal} toClose={setAddFiscal} />

      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text variant="titleLarge" style={styles.nome}>
            {obra.nome}
          </Text>
          <Text variant="titleSmall" style={styles.endereco}>
            {obra.local.endereco}
          </Text>
          <Text variant="labelLarge" style={styles.responsavel}>
            {obra.responsavel}
          </Text>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <Button
              icon={() => <Icon source="trash-can" size={24} />}
              style={{ marginHorizontal: 10 }}
              mode="contained-tonal"
              onPress={() => deletarObra(id)}
            >
              Deletar
            </Button>
            <Button
              mode="contained"
              onPress={() => setAddFiscal(true)}
              icon={() => (
                <Icon
                  source="plus"
                  size={28}
                  color={lightTheme.colors.onPrimary}
                />
              )}
            >
              Fiscalização
            </Button>
          </View>
        </View>
        <Swiper
          data={info}
          isStaticPills={true}
          scrollableContainer={true}
          stickyHeaderEnabled={false}
          style={{
            staticPillContainer: {
              backgroundColor: lightTheme.colors.background,
              borderBottomWidth: 1,
              borderBottomColor: lightTheme.colors.primary,
              paddingVertical: 10,
            },
            borderActive: {
              borderColor: lightTheme.colors.secondary,
              borderWidth: 2,
            },
            activeLabel: {
              color: lightTheme.colors.secondary,
              fontWeight: "bold",
              fontSize: 14,
            },
            inactiveLabel: {
              color: lightTheme.colors.secondaryContainer,
              fontSize: 14,
            },
            pill: {
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              marginHorizontal: 6,
            },
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 50,
    backgroundColor: lightTheme.colors.background,
  },
  headerContainer: {
    padding: 10,
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
    paddingVertical: 5,
    backgroundColor: lightTheme.colors.elevation.level3,
    borderRadius: 30,
    width: "100%",
  },
  divider: {
    marginVertical: 10,
  },
  imagem: {
    height: 220,
    width: "100%",
    resizeMode: "cover",
    marginTop: 15,
    borderRadius: 8,
  },
});
