import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Platform,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { loginUser } from "../../src/services/auth";
import { COLORS, SIZES } from "../../src/constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!correo.trim() || !password.trim()) {
      setError("Por favor completa correo y contraseña.");
      return;
    }

    setCargando(true);
    const { error: errorLogin } = await loginUser(correo.trim(), password);
    setCargando(false);

    if (errorLogin) {
      setError(traducirErrorFirebase(errorLogin));
    }
  };

  const handleLoginSocial = (proveedor) => {
    Alert.alert(
      "Próximamente",
      `Iniciar sesión con ${proveedor} todavía no está disponible.`
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => router.back()}
        >
          <Text style={styles.botonVolverTexto}>←</Text>
        </TouchableOpacity>

        <View style={styles.encabezado}>
          <View style={styles.logoFondo}>
            <Image
              source={require("../../assets/images/logo-habit.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.tituloLogo}>HÁBIT</Text>
        </View>

        <Text style={styles.titulo}>Iniciar Sesión</Text>

        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@correo.com"
            placeholderTextColor={COLORS.textLight}
            value={correo}
            onChangeText={setCorreo}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.etiqueta}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="*******"
            placeholderTextColor={COLORS.textLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.boton}
            onPress={handleLogin}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.botonTexto}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <Link href="/(auth)/recuperar-password" asChild>
            <TouchableOpacity>
              <Text style={styles.enlaceOlvido}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.filaDivisor}>
          <View style={styles.linea} />
          <Text style={styles.textoDivisor}>o continúa con</Text>
          <View style={styles.linea} />
        </View>

        <View style={styles.filaSocial}>
          <TouchableOpacity
            style={styles.botonSocial}
            onPress={() => handleLoginSocial("Google")}
          >
            <Text style={styles.iconoSocial}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botonSocial}
            onPress={() => handleLoginSocial("Apple")}
          >
            <Text style={styles.iconoSocial}>Apple</Text>
          </TouchableOpacity>
        </View>

        <Link href="/(auth)/register" asChild>
          <TouchableOpacity style={styles.enlaceContenedor}>
            <Text style={styles.enlace}>
              ¿No tienes cuenta? <Text style={styles.enlaceDestacado}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function traducirErrorFirebase(mensaje) {
  if (mensaje.includes("auth/invalid-email")) return "El correo no es válido.";
  if (mensaje.includes("auth/invalid-credential") || mensaje.includes("auth/wrong-password"))
    return "Correo o contraseña incorrectos.";
  if (mensaje.includes("auth/user-not-found")) return "No existe una cuenta con ese correo.";
  if (mensaje.includes("auth/too-many-requests"))
    return "Demasiados intentos. Intenta de nuevo más tarde.";
  return "Ocurrió un error al iniciar sesión. Intenta de nuevo.";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contenido: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: 50,
    paddingBottom: 40,
  },
  botonVolver: {
    marginBottom: 20,
  },
  botonVolverTexto: {
    fontSize: 26,
    color: COLORS.text,
  },
  encabezado: {
    alignItems: "center",
    marginBottom: 8,
  },
  logoFondo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  logo: {
    width: 38,
    height: 38,
  },
  tituloLogo: {
    fontSize: 20,
    color: COLORS.text,
    letterSpacing: 1,
    fontFamily: "SawarabiMincho_400Regular",
  },
  titulo: {
    fontSize: 18,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  tarjeta: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#E7F1F1",
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: SIZES.fontMedium,
    color: COLORS.text,
    marginBottom: 18,
  },
  error: {
    color: COLORS.error,
    fontSize: SIZES.fontSmall,
    marginBottom: 10,
    textAlign: "center",
  },
  boton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  botonTexto: {
    color: "#FFFFFF",
    fontSize: SIZES.fontMedium,
    fontWeight: "600",
  },
  enlaceOlvido: {
    color: COLORS.primary,
    fontSize: SIZES.fontSmall,
    fontWeight: "600",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  filaDivisor: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 20,
  },
  linea: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  textoDivisor: {
    marginHorizontal: 12,
    fontSize: 13,
    color: COLORS.textLight,
  },
  filaSocial: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 24,
  },
  botonSocial: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  iconoSocial: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  enlaceContenedor: {
    alignItems: "center",
  },
  enlace: {
    color: COLORS.textLight,
    fontSize: SIZES.fontSmall,
  },
  enlaceDestacado: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});
