import { useState } from "react";
import { Modal, ScrollView, View } from "react-native";
import { Button, FAB, Searchbar, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import ObrasCard from "../components/obrasCard";
import { router } from "expo-router";
import AddObra from "../components/obrasAdd";

export default function MainScreen() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView>
      <Modal>
        <AddObra />
      </Modal>
      <View>
        <Searchbar
          placeholder="Pesquise..."
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <View>
        <Button icon="plus">Adicionar Obra</Button>
      </View>
      <View>
        <ScrollView>
          {obras.map((item) => {
            <ObrasCard item={item} />;
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
