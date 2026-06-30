import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { registerUser } from "../../src/services/auth";
import { COLORS, SIZES } from "../../src/constants/theme";

export default function RegisterScreen() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (!correo.trim() || !password.trim() || !confirmarPassword.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setCargando(true);
    const { error: errorRegistro } = await registerUser(correo.trim(), password);
    setCargando(false);

    if (errorRegistro) {
      setError(traducirErrorFirebase(errorRegistro));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.titulo}>Crear cuenta</Text>
      <Text style={styles.subtitulo}>Empieza tu racha de hábitos hoy</Text>

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
        placeholder="Contraseña (mínimo 6 caracteres)"
        placeholderTextColor={COLORS.textLight}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        placeholderTextColor={COLORS.textLight}
        value={confirmarPassword}
        onChangeText={setConfirmarPassword}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.boton}
        onPress={handleRegister}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.botonTexto}>Crear cuenta</Text>
        )}
      </TouchableOpacity>

      <Link href="/(auth)/login" asChild>
        <TouchableOpacity style={styles.enlaceContenedor}>
          <Text style={styles.enlace}>
            ¿Ya tienes cuenta? <Text style={styles.enlaceDestacado}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </KeyboardAvoidingView>
  );
}
function traducirErrorFirebase(mensaje) {
  if (mensaje.includes("auth/email-already-in-use"))
    return "Ya existe una cuenta con ese correo.";
  if (mensaje.includes("auth/invalid-email")) return "El correo no es válido.";
  if (mensaje.includes("auth/weak-password"))
    return "La contraseña es demasiado débil.";
  return "Ocurrió un error al crear la cuenta. Intenta de nuevo.";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    paddingHorizontal: SIZES.padding * 1.5,
  },
  titulo: {
    fontSize: 28,
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
