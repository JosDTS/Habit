import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { usePreferences } from "../src/context/PreferencesContext";
import { deleteDocument } from "../src/services/firestore";
import { logoutUser } from "../src/services/auth";
import { COLORS, SIZES } from "../src/constants/theme";

const IDIOMAS_DISPONIBLES = [
  { codigo: "es", nombre: "Español" },
  { codigo: "en", nombre: "English" },
  { codigo: "pt", nombre: "Português" },
];

const TRADUCCIONES = {
  es: {
    general: "General",
    notificaciones: "Notificaciones",
    modoOscuro: "Modo oscuro",
    idioma: "Idioma",
    privacidad: "Privacidad",
    cambiarContraseña: "Cambiar contraseña",
    privacidadPerfil: "Privacidad del perfil",
    cuenta: "Cuenta",
    eliminarCuenta: "Eliminar cuenta",
    version: "Versión",
  },
  en: {
    general: "General",
    notificaciones: "Notifications",
    modoOscuro: "Dark mode",
    idioma: "Language",
    privacidad: "Privacy",
    cambiarContraseña: "Change password",
    privacidadPerfil: "Profile privacy",
    cuenta: "Account",
    eliminarCuenta: "Delete account",
    version: "Version",
  },
  pt: {
    general: "Geral",
    notificaciones: "Notificações",
    modoOscuro: "Modo escuro",
    idioma: "Idioma",
    privacidad: "Privacidade",
    cambiarContraseña: "Alterar senha",
    privacidadPerfil: "Privacidade do perfil",
    cuenta: "Conta",
    eliminarCuenta: "Deletar conta",
    version: "Versão",
  },
};

export default function ConfiguracionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    tema,
    cambiarTema,
    idioma,
    cambiarIdioma,
    notificacionesActivas,
    cambiarNotificaciones,
  } = usePreferences();

  const [eliminando, setEliminando] = useState(false);

  const t = (clave) => TRADUCCIONES[idioma]?.[clave] || clave;

  const handleEliminarCuenta = () => {
    Alert.alert(
      t("eliminarCuenta"),
      "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible y perderás todos tus datos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, eliminar mi cuenta",
          style: "destructive",
          onPress: confirmarEliminacion,
        },
      ]
    );
  };

  const confirmarEliminacion = async () => {
    Alert.alert(
      "Confirmación final",
      "Escribe 'ELIMINAR' para confirmar la eliminación de tu cuenta:",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Continuar",
          onPress: () => mostrarConfirmacionFinal(),
        },
      ]
    );
  };

  const mostrarConfirmacionFinal = () => {
    Alert.prompt(
      "Confirmación final",
      'Escribe "ELIMINAR" para confirmar irreversiblemente:',
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: (texto) => {
            if (texto?.toUpperCase() === "ELIMINAR") {
              ejecutarEliminacion();
            } else {
              Alert.alert("Error", "El texto no coincide. Intenta de nuevo.");
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const ejecutarEliminacion = async () => {
    if (!user) return;

    setEliminando(true);

    try {
      const { error } = await deleteDocument("usuarios", user.uid);

      if (error) {
        Alert.alert("Error", "No se pudo eliminar la cuenta. Intenta de nuevo.");
        setEliminando(false);
        return;
      }

      await logoutUser();
      setEliminando(false);
    } catch {
      Alert.alert("Error", "Ocurrió un error inesperado.");
      setEliminando(false);
    }
  };

  const handleCambiarContraseña = () => {
    Alert.alert(
      t("cambiarContraseña"),
      "Enviaremos un enlace de cambio de contraseña a tu correo.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar enlace",
          onPress: () => {
            Alert.alert(
              "Correo enviado",
              "Revisa tu bandeja de entrada para seguir los pasos."
            );
          },
        },
      ]
    );
  };

  const handlePrivacidadPerfil = () => {
    Alert.alert(
      t("privacidadPerfil"),
      "Tu perfil está configurado como Público. Los otros usuarios pueden verlo.",
      [
        { text: "Entendido", style: "default" },
        {
          text: "Cambiar a Privado",
          onPress: () => {
            Alert.alert("Privado", "Tu perfil ahora es privado.");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.botonVolverTexto}>← {t("general")}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tituloSeccion}>{t("general")}</Text>
      <View style={styles.tarjeta}>
        <View style={styles.itemMenu}>
          <Text style={styles.iconoMenu}>🔔</Text>
          <Text style={styles.labelMenu}>{t("notificaciones")}</Text>
          <Switch
            value={notificacionesActivas}
            onValueChange={cambiarNotificaciones}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={notificacionesActivas ? COLORS.white : "#ccc"}
          />
        </View>

        <View style={[styles.itemMenu, styles.itemMenuConBorde]}>
          <Text style={styles.iconoMenu}>🌙</Text>
          <Text style={styles.labelMenu}>{t("modoOscuro")}</Text>
          <Switch
            value={tema === "oscuro"}
            onValueChange={(valor) =>
              cambiarTema(valor ? "oscuro" : "claro")
            }
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={tema === "oscuro" ? COLORS.white : "#ccc"}
          />
        </View>

        <View style={styles.itemMenu}>
          <Text style={styles.iconoMenu}>🌐</Text>
          <View style={styles.infoIdioma}>
            <Text style={styles.labelMenu}>{t("idioma")}</Text>
            <Text style={styles.valorIdioma}>
              {IDIOMAS_DISPONIBLES.find((i) => i.codigo === idioma)?.nombre}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(t("idioma"), "Selecciona un idioma:", [
                ...IDIOMAS_DISPONIBLES.map((i) => ({
                  text: i.nombre,
                  onPress: () => cambiarIdioma(i.codigo),
                })),
                { text: "Cancelar", style: "cancel" },
              ]);
            }}
          >
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.tituloSeccion}>{t("privacidad")}</Text>
      <View style={styles.tarjeta}>
        <TouchableOpacity
          style={[styles.itemMenu, styles.itemMenuConBorde]}
          onPress={handleCambiarContraseña}
        >
          <Text style={styles.iconoMenu}>🔐</Text>
          <Text style={styles.labelMenu}>{t("cambiarContraseña")}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.itemMenu}
          onPress={handlePrivacidadPerfil}
        >
          <Text style={styles.iconoMenu}>🔒</Text>
          <View style={styles.infoIdioma}>
            <Text style={styles.labelMenu}>{t("privacidadPerfil")}</Text>
            <Text style={styles.valorIdioma}>Público</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tituloSeccion}>{t("cuenta")}</Text>
      <TouchableOpacity
        style={styles.botonEliminarCuenta}
        onPress={handleEliminarCuenta}
        disabled={eliminando}
      >
        {eliminando ? (
          <ActivityIndicator color="#D40924" />
        ) : (
          <>
            <Text style={styles.iconoMenu}>🗑️</Text>
            <Text style={styles.labelEliminar}>{t("eliminarCuenta")}</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.version}>HÁBIT v1.0.0</Text>
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
  header: {
    marginBottom: 28,
  },
  botonVolverTexto: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.text,
  },
  tituloSeccion: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: 12,
    marginTop: 20,
  },
  tarjeta: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 18,
    marginRight: 14,
    width: 28,
    textAlign: "center",
  },
  labelMenu: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  infoIdioma: {
    flex: 1,
  },
  valorIdioma: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textLight,
    marginLeft: 12,
  },
  botonEliminarCuenta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingVertical: 18,
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  labelEliminar: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#D40924",
    marginLeft: 12,
  },
  version: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 40,
  },
});
