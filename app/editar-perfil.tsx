import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { obtenerPerfilUsuario, actualizarPerfilUsuario } from "../src/services/usuarios";
import { COLORS, SIZES } from "../src/constants/theme";

export default function EditarPerfilScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [universidad, setUniversidad] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarPerfil = async () => {
      if (!user) return;
      const { perfil } = await obtenerPerfilUsuario(user.uid);
      if (perfil) {
        setNombre(perfil.nombre || "");
        setUniversidad(perfil.universidad || "");
        setFotoUrl(perfil.fotoUrl || "");
      }
      setCargando(false);
    };
    cargarPerfil();
  }, [user]);

  const handleGuardar = async () => {
    setError("");

    if (!nombre.trim()) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    setGuardando(true);
    const { error: errorActualizacion } = await actualizarPerfilUsuario(
      user.uid,
      {
        nombre: nombre.trim(),
        universidad: universidad.trim(),
        fotoUrl: fotoUrl.trim(),
      }
    );
    setGuardando(false);

    if (errorActualizacion) {
      setError("Ocurrió un error al guardar. Intenta de nuevo.");
      return;
    }

    router.back();
  };

  if (cargando) {
    return (
      <View style={styles.contenedorCarga}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const urlFotoValida = fotoUrl.trim().startsWith("http");

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contenido}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.botonVolver}>
            <Text style={styles.botonVolverTexto}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Editar Perfil</Text>
        </View>

        <View style={styles.contenedorPreview}>
          {urlFotoValida ? (
            <Image source={{ uri: fotoUrl.trim() }} style={styles.fotoPreview} />
          ) : (
            <View style={[styles.fotoPreview, styles.fotoPlaceholder]}>
              <Text style={styles.fotoPlaceholderTexto}>👤</Text>
            </View>
          )}
          <Text style={styles.etiquetaPreview}>Vista previa de foto</Text>
        </View>

        <Text style={styles.etiqueta}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej. Pedro García"
          placeholderTextColor={COLORS.textLight}
          autoCapitalize="words"
        />

        <Text style={styles.etiqueta}>Universidad</Text>
        <TextInput
          style={styles.input}
          value={universidad}
          onChangeText={setUniversidad}
          placeholder="Ej. Universidad de Costa Rica"
          placeholderTextColor={COLORS.textLight}
          autoCapitalize="words"
        />

        <Text style={styles.etiqueta}>URL de foto de perfil</Text>
        <TextInput
          style={styles.input}
          value={fotoUrl}
          onChangeText={setFotoUrl}
          placeholder="https://ejemplo.com/mi-foto.jpg"
          placeholderTextColor={COLORS.textLight}
          autoCapitalize="none"
          keyboardType="url"
        />
        <Text style={styles.nota}>
          Pega la URL de una imagen en línea (JPG, PNG). Si no tienes una,
          puedes usar tu foto de Google o LinkedIn.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.botonGuardar}
          onPress={handleGuardar}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.botonGuardarTexto}>Guardar cambios</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contenido: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 60,
    paddingBottom: 40,
  },
  contenedorCarga: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    marginBottom: 28,
  },
  botonVolver: {
    marginBottom: 10,
  },
  botonVolverTexto: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "600",
  },
  titulo: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.text,
  },
  contenedorPreview: {
    alignItems: "center",
    marginBottom: 28,
  },
  fotoPreview: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8,
  },
  fotoPlaceholder: {
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  fotoPlaceholderTexto: {
    fontSize: 36,
  },
  etiquetaPreview: {
    fontSize: 12,
    color: COLORS.textLight,
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
    marginBottom: 20,
  },
  nota: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: -14,
    marginBottom: 20,
    lineHeight: 18,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  botonGuardar: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  botonGuardarTexto: {
    color: COLORS.white,
    fontSize: SIZES.fontMedium,
    fontWeight: "600",
  },
});
