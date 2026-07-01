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
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { registerUser } from "../../src/services/auth";
import { COLORS, SIZES } from "../../src/constants/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (!nombre.trim() || !correo.trim() || !password.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setCargando(true);
    const { error: errorRegistro } = await registerUser(correo.trim(), password, {
      nombre: nombre.trim(),
    });
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

        <Text style={styles.titulo}>Crear Cuenta</Text>
        <Text style={styles.subtitulo}>Únete a la comunidad de HÁBIT</Text>

        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            placeholderTextColor={COLORS.textLight}
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
          />

          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@gmail.com"
            placeholderTextColor={COLORS.textLight}
            value={correo}
            onChangeText={setCorreo}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.etiqueta}>Contraseña</Text>
          <View style={styles.inputConIcono}>
            <TextInput
              style={styles.inputTextoConIcono}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor={COLORS.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!mostrarPassword}
            />
            <TouchableOpacity
              onPress={() => setMostrarPassword((actual) => !actual)}
              style={styles.botonOjo}
            >
              {mostrarPassword ? (
                <Eye size={20} color={COLORS.textLight} />
              ) : (
                <EyeOff size={20} color={COLORS.textLight} />
              )}
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.boton}
            onPress={handleRegister}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.botonTexto}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>
        </View>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.enlaceContenedor}>
            <Text style={styles.enlace}>
              ¿Ya tienes cuenta? <Text style={styles.enlaceDestacado}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
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
    fontSize: 24,
    color: COLORS.text,
    textAlign: "center",
    marginTop: 24,
    marginBottom: 4,
    fontFamily: "SawarabiMincho_400Regular",
  },
  subtitulo: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: "center",
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
  inputConIcono: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E7F1F1",
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  inputTextoConIcono: {
    flex: 1,
    paddingVertical: 14,
    fontSize: SIZES.fontMedium,
    color: COLORS.text,
  },
  botonOjo: {
    paddingLeft: 10,
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
