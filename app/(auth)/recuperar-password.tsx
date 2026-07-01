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
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { enviarCorreoRecuperacion } from "../../src/services/auth";
import { COLORS, SIZES } from "../../src/constants/theme";

export default function RecuperarPasswordScreen() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = async () => {
    setError("");

    if (!correo.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    setCargando(true);
    const { error: errorEnvio } = await enviarCorreoRecuperacion(correo.trim());
    setCargando(false);

    if (errorEnvio) {
      setError(traducirErrorFirebase(errorEnvio));
      return;
    }

    setEnviado(true);
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

        <Text style={styles.titulo}>¿Olvidaste tu contraseña?</Text>
        <Text style={styles.descripcion}>
          No te preocupes, ingresa tu correo electrónico y te enviaremos
          instrucciones para restablecer tu contraseña.
        </Text>

        <View style={styles.tarjeta}>
          {enviado ? (
            <Text style={styles.mensajeExito}>
              Listo. Revisá tu correo ({correo.trim()}) para seguir las
              instrucciones de recuperación.
            </Text>
          ) : (
            <>
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

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                style={styles.boton}
                onPress={handleEnviar}
                disabled={cargando}
              >
                {cargando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.botonTexto}>Enviar instrucciones</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.enlaceContenedor}>
            <Text style={styles.enlace}>Volver a iniciar sesión</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function traducirErrorFirebase(mensaje) {
  if (mensaje.includes("auth/invalid-email")) return "El correo no es válido.";
  if (mensaje.includes("auth/user-not-found"))
    return "No existe una cuenta con ese correo.";
  return "Ocurrió un error al enviar el correo. Intenta de nuevo.";
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
    marginBottom: 30,
  },
  botonVolverTexto: {
    fontSize: 26,
    color: COLORS.text,
  },
  titulo: {
    fontSize: 26,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 14,
    fontFamily: "SawarabiMincho_400Regular",
  },
  descripcion: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 10,
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
  mensajeExito: {
    color: COLORS.primaryDark,
    fontSize: SIZES.fontMedium,
    textAlign: "center",
    lineHeight: 22,
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
  enlaceContenedor: {
    marginTop: 22,
    alignItems: "center",
  },
  enlace: {
    color: COLORS.primary,
    fontSize: SIZES.fontSmall,
    fontWeight: "600",
  },
});
