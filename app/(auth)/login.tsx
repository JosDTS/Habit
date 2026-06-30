import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { loginUser } from "../../src/services/auth";
import { COLORS, SIZES } from "../../src/constants/theme";

export default function LoginScreen() {
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.titulo}>Hábit</Text>
      <Text style={styles.subtitulo}>Inicia sesión para continuar</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor={COLORS.textLight}
        value={correo}
        onChangeText={setCorreo}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
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
          <Text style={styles.botonTexto}>Iniciar sesión</Text>
        )}
      </TouchableOpacity>

      <Link href="/(auth)/register" asChild>
        <TouchableOpacity style={styles.enlaceContenedor}>
          <Text style={styles.enlace}>
            ¿No tienes cuenta? <Text style={styles.enlaceDestacado}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </Link>
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
    justifyContent: "center",
    paddingHorizontal: SIZES.padding * 1.5,
  },
  titulo: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: SIZES.fontMedium,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#E7F1F1",
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: SIZES.fontMedium,
    color: COLORS.text,
    marginBottom: 14,
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
    marginTop: 6,
  },
  botonTexto: {
    color: "#FFFFFF",
    fontSize: SIZES.fontMedium,
    fontWeight: "600",
  },
  enlaceContenedor: {
    marginTop: 22,
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
