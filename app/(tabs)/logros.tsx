import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { obtenerPerfilUsuario } from "../../src/services/usuarios";
import { obtenerInsigniasConEstado, calcularNivel } from "../../src/services/logros";
import { COLORS, SIZES } from "../../src/constants/theme";

const ICONOS_INSIGNIA = {
  insignia_atleta: "🏃",
  insignia_hidratado: "💧",
  insignia_dormilon_pro: "🌙",
  insignia_nutricionista: "🍎",
  insignia_leyenda: "🏆",
  insignia_madrugador: "🌅",
  insignia_zen_master: "🧘",
  insignia_social: "👥",
};

const MORADO_NIVEL = "#9747FF";

export default function LogrosScreen() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [insignias, setInsignias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarDatos = useCallback(async () => {
    if (!user) return;

    const { perfil: datosPerfil } = await obtenerPerfilUsuario(user.uid);
    setPerfil(datosPerfil);

    const { insignias: datosInsignias } = await obtenerInsigniasConEstado(
      user.uid,
      datosPerfil
    );
    setInsignias(datosInsignias);

    setCargando(false);
    setRefrescando(false);
  }, [user]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleRefrescar = () => {
    setRefrescando(true);
    cargarDatos();
  };

  if (cargando) {
    return (
      <View style={styles.contenedorCarga}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const { nivel, xpActual, xpNecesario } = calcularNivel(perfil?.puntos ?? 0);
  const porcentajeNivel = Math.round((xpActual / xpNecesario) * 100);
  const desbloqueadas = insignias.filter((i) => i.desbloqueada).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={handleRefrescar} />
      }
    >
      <Text style={styles.titulo}>Insignias y Niveles</Text>

      <View style={[styles.tarjetaNivel, { backgroundColor: MORADO_NIVEL }]}>
        <View style={styles.circuloNivel}>
          <Text style={styles.numeroNivel}>{nivel}</Text>
        </View>
        <Text style={styles.nombreNivel}>Nivel Avanzado</Text>
        <Text style={styles.xpTexto}>
          {xpActual} / {xpNecesario} XP
        </Text>

        <View style={styles.barraFondoNivel}>
          <View
            style={[styles.barraProgresoNivel, { width: `${porcentajeNivel}%` }]}
          />
        </View>
      </View>

      <Text style={styles.tituloSeccion}>Progreso de nivel</Text>
      <View style={styles.filaNiveles}>
        {Array.from({ length: 5 }).map((_, i) => {
          const completado = i < (nivel - 1) % 5;
          const actual = i === (nivel - 1) % 5;
          return (
            <View
              key={i}
              style={[
                styles.barraNivelPequena,
                completado && { backgroundColor: COLORS.primary },
                actual && { backgroundColor: MORADO_NIVEL },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.filaEtiquetasNivel}>
        <Text style={styles.etiquetaNivelExtremo}>Nv 1</Text>
        <Text style={styles.etiquetaNivelExtremo}>Nv 25</Text>
      </View>

      <Text style={styles.tituloSeccion}>
        Insignias ({desbloqueadas}/{insignias.length})
      </Text>

      <View style={styles.grilla}>
        {insignias.map((insignia) => (
          <View
            key={insignia.insigniaId}
            style={[
              styles.tarjetaInsignia,
              !insignia.desbloqueada && styles.tarjetaInsigniaBloqueada,
            ]}
          >
            <View
              style={[
                styles.iconoInsignia,
                insignia.desbloqueada && { backgroundColor: "#E8F3F0" },
              ]}
            >
              <Text style={{ fontSize: 22, opacity: insignia.desbloqueada ? 1 : 0.3 }}>
                {insignia.desbloqueada
                  ? ICONOS_INSIGNIA[insignia.insigniaId] || "🏅"
                  : "🔒"}
              </Text>
            </View>

            <Text
              style={[
                styles.nombreInsignia,
                !insignia.desbloqueada && styles.textoBloqueado,
              ]}
            >
              {insignia.nombre}
            </Text>

            <Text style={styles.descripcionInsignia}>{insignia.descripcion}</Text>

            {!insignia.desbloqueada && !insignia.pendienteImplementar && (
              <Text style={styles.progresoInsignia}>
                {insignia.progresoActual}/{insignia.criterioValor}
              </Text>
            )}
          </View>
        ))}
      </View>
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
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 20,
  },
  tarjetaNivel: {
    borderRadius: SIZES.radius,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  circuloNivel: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  numeroNivel: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.white,
  },
  nombreNivel: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
  },
  xpTexto: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 14,
  },
  barraFondoNivel: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  barraProgresoNivel: {
    height: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
  tituloSeccion: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 10,
  },
  filaNiveles: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  barraNivelPequena: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  filaEtiquetasNivel: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  etiquetaNivelExtremo: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  grilla: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tarjetaInsignia: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tarjetaInsigniaBloqueada: {
    backgroundColor: "#FAFBFB",
  },
  iconoInsignia: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  nombreInsignia: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 6,
  },
  textoBloqueado: {
    color: COLORS.textLight,
  },
  descripcionInsignia: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 16,
  },
  progresoInsignia: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primaryDark,
    marginTop: 6,
  },
});
