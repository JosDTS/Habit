import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { COLORS, SIZES } from "../src/constants/theme";

export default function BienvenidaScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.contenido}>
        <Text style={styles.titulo}>Hábit</Text>
        <Text style={styles.subtitulo}>
          Construye mejores hábitos, un día a la vez
        </Text>
      </View>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => router.push("/(auth)/login")}
      >
        <Text style={styles.botonTexto}>Comenzar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding * 1.5,
    paddingVertical: 60,
  },
  contenido: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    fontSize: 40,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 12,
  },
  subtitulo: {
    fontSize: SIZES.fontMedium,
    color: COLORS.textLight,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  boton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 16,
    alignItems: "center",
  },
  botonTexto: {
    color: "#FFFFFF",
    fontSize: SIZES.fontMedium,
    fontWeight: "600",
  },
});
