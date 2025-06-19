import { MD3LightTheme as DefaultLightTheme } from "react-native-paper";

export const lightTheme = {
  ...DefaultLightTheme,
  colors: {
    ...DefaultLightTheme.colors,
    primary: "#B8846C", // destaque suave
    onPrimary: "#FFFFFF", // texto sobre botões
    secondary: "#733E2E", // cor de ação intensa
    onSecondary: "#FFFFFF",
    secondaryContainer: "#AFA198", // <<==== Para o "contained-tonal"
    onSecondaryContainer: "#1D1E20", // texto dentro do botão tonal
    background: "#D9D3D1", // fundo claro
    surface: "#FFFFFF", // cartões e inputs
    onSurface: "#1D1E20", // texto geral
    surfaceVariant: "#AFA198", // inputs e bordas suaves
    outline: "#AFA198", // bordas e linhas
    error: "#B00020",

    elevation: {
      level0: "transparent",
      level1: "#F5F5F5",
      level2: "#EAEAEA",
      level3: "#E0E0E0",
      level4: "#D6D6D6",
      level5: "#CCCCCC",
    },
  },
};
