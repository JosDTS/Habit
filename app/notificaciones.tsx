import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import {
  obtenerNotificaciones,
  marcarTodasLeidas,
  eliminarNotificacion,
  formatearTiempoRelativo,
} from "../src/services/notificaciones";
import { COLORS, SIZES } from "../src/constants/theme";

export default function NotificacionesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    if (!user) return;
    const { notificaciones: datos } = await obtenerNotificaciones(user.uid);
    setNotificaciones(datos);
    setCargando(false);
    setRefrescando(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const handleRefrescar = () => {
    setRefrescando(true);
    cargar();
  };

  const handleMarcarLeidas = async () => {
    if (!user) return;
    setNotificaciones((actuales) => actuales.map((n) => ({ ...n, leida: true })));
    await marcarTodasLeidas(user.uid);
  };

  const handleEliminar = async (id) => {
    if (!user) return;
    setNotificaciones((actuales) => actuales.filter((n) => n.id !== id));
    await eliminarNotificacion(user.uid, id);
  };

  if (cargando) {
    return (
      <View style={styles.contenedorCarga}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={handleRefrescar} />
      }
    >
      <View style={styles.encabezado}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.botonVolver}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Notificaciones</Text>
        <TouchableOpacity onPress={handleMarcarLeidas}>
          <Text style={styles.marcarLeidas}>Marcar leídas</Text>
        </TouchableOpacity>
      </View>

      {notificaciones.length === 0 ? (
        <Text style={styles.textoVacio}>
          No tenés notificaciones todavía. Cuando completes retos vas a
          empezar a verlas acá.
        </Text>
      ) : (
        notificaciones.map((notif) => (
          <View
            key={notif.id}
            style={[styles.tarjeta, !notif.leida && styles.tarjetaNoLeida]}
          >
            <View style={styles.filaTitulo}>
              {!notif.leida && <View style={styles.puntoNoLeido} />}
              <Text style={styles.tituloNotif}>{notif.titulo}</Text>
              <TouchableOpacity onPress={() => handleEliminar(notif.id)}>
                <Text style={styles.iconoEliminar}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.descripcionNotif}>{notif.descripcion}</Text>
            <Text style={styles.tiempoNotif}>
              {formatearTiempoRelativo(notif.fecha)}
            </Text>
          </View>
        ))
      )}
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
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  botonVolver: {
    fontSize: 24,
    color: COLORS.text,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  marcarLeidas: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
  },
  textoVacio: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 40,
  },
  tarjeta: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  tarjetaNoLeida: {
    backgroundColor: "#E8F3F0",
  },
  filaTitulo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  puntoNoLeido: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  tituloNotif: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  iconoEliminar: {
    fontSize: 16,
  },
  descripcionNotif: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 6,
    lineHeight: 18,
  },
  tiempoNotif: {
    fontSize: 11,
    color: COLORS.textLight,
  },
});
