import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { obtenerPerfilUsuario } from "../../src/services/usuarios";
import { logoutUser } from "../../src/services/auth";
import { calcularNivel } from "../../src/services/logros";
import { COLORS, SIZES } from "../../src/constants/theme";

const AVATAR_DEFAULT =
  "https://ui-avatars.com/api/?background=009951&color=fff&size=128&bold=true";

const OPCIONES_MENU = [
  { id: "historial", icono: "📅", label: "Historial de Hábitos" },
  { id: "premios", icono: "🏅", label: "Premios" },
  { id: "amigos", icono: "👥", label: "Amigos" },
  { id: "notificaciones", icono: "🔔", label: "Notificaciones" },
  { id: "configuracion", icono: "⚙️", label: "Configuración" },
  { id: "ayuda", icono: "❓", label: "Ayuda y Soporte" },
];

export default function PerfilScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarPerfil = useCallback(async () => {
    if (!user) return;
    setCargando(true);
    const { perfil: datos } = await obtenerPerfilUsuario(user.uid);
    setPerfil(datos);
    setCargando(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      cargarPerfil();
    }, [cargarPerfil])
  );

  const handleCerrarSesion = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Seguro que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            await logoutUser();
          },
        },
      ]
    );
  };

  const handleOpcionMenu = (id) => {
    switch (id) {
      case "historial":
        router.push("/historial");
        break;
      case "premios":
        router.push("/premios");
        break;
      case "amigos":
        router.push("/amigos");
        break;
      case "configuracion":
        router.push("/configuracion");
        break;
      case "ayuda":
        router.push("/ayuda");
        break;
      case "notificaciones":
        router.push("/notificaciones");
        break;
      default:
        break;
    }
  };

  if (cargando) {
    return (
      <View style={styles.contenedorCarga}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const nombre = perfil?.nombre || user?.email?.split("@")[0] || "Usuario";
  const universidad = perfil?.universidad || "Sin universidad";
  const fotoUrl = perfil?.fotoUrl
    ? perfil.fotoUrl
    : `${AVATAR_DEFAULT}&name=${encodeURIComponent(nombre)}`;

  const { nivel } = calcularNivel(perfil?.puntos ?? 0);
  const puntos = perfil?.puntos ?? 0;
  const retosCompletados = perfil?.retosCompletados ?? 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
    >
      <Text style={styles.tituloPantalla}>Perfil</Text>

      <View style={styles.tarjetaPerfil}>
        <View style={styles.contenedorFoto}>
          <Image
            source={{ uri: fotoUrl }}
            style={styles.foto}
            defaultSource={{ uri: AVATAR_DEFAULT }}
          />
          <TouchableOpacity
            style={styles.botonEditar}
            onPress={() => router.push("/editar-perfil")}
          >
            <Text style={styles.botonEditarTexto}>✏️</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.nombre}>{nombre}</Text>
        <Text style={styles.universidad}>{universidad}</Text>

        <View style={styles.filaStats}>
          <View style={styles.stat}>
            <Text style={styles.valorStat}>{nivel}</Text>
            <Text style={styles.etiquetaStat}>Nivel</Text>
          </View>
          <View style={styles.separadorStat} />
          <View style={styles.stat}>
            <Text style={styles.valorStat}>{puntos.toLocaleString()}</Text>
            <Text style={styles.etiquetaStat}>Puntos</Text>
          </View>
          <View style={styles.separadorStat} />
          <View style={styles.stat}>
            <Text style={styles.valorStat}>{retosCompletados}</Text>
            <Text style={styles.etiquetaStat}>Retos</Text>
          </View>
        </View>
      </View>

      <View style={styles.menu}>
        {OPCIONES_MENU.map((opcion, index) => (
          <TouchableOpacity
            key={opcion.id}
            style={[
              styles.itemMenu,
              index < OPCIONES_MENU.length - 1 && styles.itemMenuConBorde,
            ]}
            onPress={() => handleOpcionMenu(opcion.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.iconoMenu}>{opcion.icono}</Text>
            <Text style={styles.labelMenu}>{opcion.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.botonCerrarSesion} onPress={handleCerrarSesion}>
        <Text style={styles.iconoMenu}>🚪</Text>
        <Text style={styles.labelCerrarSesion}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
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
  tituloPantalla: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 20,
  },
  tarjetaPerfil: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contenedorFoto: {
    position: "relative",
    marginBottom: 14,
  },
  foto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.border,
  },
  botonEditar: {
    position: "absolute",
    bottom: 0,
    right: -4,
    backgroundColor: COLORS.white,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  botonEditarTexto: {
    fontSize: 14,
  },
  nombre: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },
  universidad: {
    fontSize: 15,
    color: COLORS.textLight,
    marginBottom: 20,
    fontFamily: "monospace",
  },
  filaStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  valorStat: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  etiquetaStat: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
  },
  separadorStat: {
    width: 1,
    backgroundColor: COLORS.border,
    height: "100%",
  },
  menu: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  itemMenu: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: SIZES.padding,
  },
  itemMenuConBorde: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconoMenu: {
    fontSize: 20,
    marginRight: 14,
    width: 28,
    textAlign: "center",
  },
  labelMenu: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  chevron: {
    fontSize: 22,
    color: COLORS.textLight,
  },
  botonCerrarSesion: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingVertical: 18,
    paddingHorizontal: SIZES.padding,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  labelCerrarSesion: {
    fontSize: 16,
    color: "#D40924",
    fontWeight: "600",
    flex: 1,
  },
});
