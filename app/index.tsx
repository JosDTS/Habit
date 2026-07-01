import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { COLORS, SIZES } from "../src/constants/theme";


export default function BienvenidaScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.contenido}>
        <View style={styles.circuloExterno}>
          <View style={styles.circuloInterno}>
            <Image
              source={require("../assets/images/logo-habit.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>
        <Text style={styles.tituloLogo}>HÁBIT</Text>

        <Text style={styles.titulo}>
          Transforma tus hábitos,{"\n"}transforma tu vida
        </Text>
        <Text style={styles.subtitulo}>
          Completa retos diarios, gana puntos y compite con tus amigos
          mientras mejoras tu bienestar.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => router.push("/(auth)/register")}
      >
        <Text style={styles.botonTexto}>Registrate</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botonSecundario}
        onPress={() => router.push("/(auth)/login")}
      >
        <Text style={styles.botonSecundarioTexto}>Ya tengo una cuenta</Text>
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
  circuloExterno: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#DCEEE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  circuloInterno: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#BFE2D2",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 600,
    overflow: "hidden",
  },
  tituloLogo: {
    fontSize: 26,
    color: COLORS.text,
    letterSpacing: 1,
    marginBottom: 32,
     fontFamily: "SawarabiMincho_400Regular"
  },
  titulo: {
    fontSize: 26,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 32,
    fontFamily: "SawarabiMincho_400Regular",
  },
  subtitulo: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    paddingHorizontal: 10,
    lineHeight: 20,
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
  botonSecundario: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  botonSecundarioTexto: {
    color: COLORS.text,
    fontSize: SIZES.fontMedium,
    fontWeight: "600",
  },
});