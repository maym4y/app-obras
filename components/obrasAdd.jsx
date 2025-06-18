import { useState } from "react";
import { View } from "react-native";
import { TextInput } from "react-native-paper";

export default function AddObra() {
    const [obra, setObra] = useState({
        id: "",
        nome: "",
        responsavel: "",
        dataInicio: new Date(),
        local: {},
        imagem: {},
    })
    return(
        <View>
            <TextInput />
            <TextInput />
            <TextInput />

        </View>
    )
}