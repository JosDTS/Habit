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
import {
  obtenerCumplimientoSemanal,
  obtenerEstadisticasPorCategoria,
} from "../../src/services/estadisticas";
import { useRecargarAlCambiarDia } from "../../src/hooks/useRecargarAlCambiarDia";
import { COLORS, SIZES } from "../../src/constants/theme";

const ICONOS_CATEGORIA = {
  hidratacion: "💧",
  ejercicio: "🏃",
  sueno: "🌙",
  alimentacion: "🍎",
};

const NOMBRES_CATEGORIA = {
  hidratacion: "Hidratación",
  ejercicio: "Ejercicio",
  sueno: "Sueño",
  alimentacion: "Alimentación",
};

export default function EstadisticasScreen() {
  const { user } = useAuth();
  const [cumplimiento, setCumplimiento] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarDatos = useCallback(async () => {
    if (!user) return;

    const [resultadoCumplimiento, resultadoCategorias] = await Promise.all([
      obtenerCumplimientoSemanal(user.uid),
      obtenerEstadisticasPorCategoria(user.uid),
    ]);

    setCumplimiento(resultadoCumplimiento);
    setCategorias(resultadoCategorias.categorias);
    setCargando(false);
    setRefrescando(false);
  }, [user]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Si la app estuvo en segundo plano y al volver ya es otro día,
  // se recalculan las estadísticas con la nueva ventana de 7 días.
  useRecargarAlCambiarDia(cargarDatos);

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={handleRefrescar} />
      }
    >
      <Text style={styles.titulo}>Estadísticas</Text>
      <Text style={styles.subtitulo}>Tu progreso semanal</Text>

      {/* Cumplimiento semanal */}
      <View style={styles.tarjetaCumplimiento}>
        <View style={styles.filaTituloTarjeta}>
          <Text style={styles.tituloTarjeta}>Cumplimiento semanal</Text>
          <Text style={styles.etiquetaSemana}>Esta semana</Text>
        </View>

        <View style={styles.filaDias}>
          {cumplimiento?.porcentajePorDia.map((dia, i) => (
            <Text key={i} style={styles.letraDia}>
              {dia.diaLetra}
            </Text>
          ))}
        </View>

        <View style={styles.divisor} />

        <View style={styles.filaResumenSemanal}>
          <View>
            <Text style={styles.etiquetaResumen}>Promedio</Text>
            <Text style={styles.valorPromedio}>{cumplimiento?.promedio ?? 0}%</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.etiquetaResumen}>Mejor día</Text>
            <Text style={styles.valorMejorDia}>
              {cumplimiento?.mejorDia
                ? `${nombreCompleto(cumplimiento.mejorDia.nombre)} (${cumplimiento.mejorDia.porcentaje}%)`
                : "—"}
            </Text>
          </View>
        </View>
      </View>

      {/* Por hábito */}
      <Text style={styles.tituloSeccion}>Por hábito</Text>

      {categorias.length === 0 ? (
        <Text style={styles.textoVacio}>
          Aún no hay suficiente historial esta semana. Completa retos en los
          próximos días para ver tus estadísticas.
        </Text>
      ) : (
        categorias.map((cat) => {
          const esPositiva = cat.tendenciaPorcentaje >= 0;
          return (
            <View key={cat.categoria} style={styles.tarjetaCategoria}>
              <View
                style={[
                  styles.icono,
                  { backgroundColor: COLORS.categoria[cat.categoria] || COLORS.primary },
                ]}
              >
                <Text style={{ fontSize: 18 }}>
                  {ICONOS_CATEGORIA[cat.categoria] || "✅"}
                </Text>
              </View>

              <View style={styles.infoCategoria}>
                <Text style={styles.nombreCategoria}>
                  {NOMBRES_CATEGORIA[cat.categoria] || cat.categoria}
                </Text>
                <Text style={styles.promedioCategoria}>
                  Promedio: {cat.promedio} {cat.unidad}/día
                </Text>
              </View>

              <View style={styles.tendenciaContenedor}>
                <Text style={{ fontSize: 14 }}>{esPositiva ? "📈" : "📉"}</Text>
                <Text
                  style={[
                    styles.tendenciaTexto,
                    { color: esPositiva ? COLORS.primaryDark : "#D40924" },
                  ]}
                >
                  {esPositiva ? "+" : ""}
                  {cat.tendenciaPorcentaje}%
                </Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

function nombreCompleto(letra) {
  const nombres = {
    D: "Domingo",
    L: "Lunes",
    M: "Martes",
    X: "Miércoles",
    J: "Jueves",
    V: "Viernes",
    S: "Sábado",
  };
  return nombres[letra] || letra;
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
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  tarjetaCumplimiento: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 20,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filaTituloTarjeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  tituloTarjeta: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  etiquetaSemana: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: "600",
  },
  filaDias: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  letraDia: {
    fontSize: 15,
    color: COLORS.textLight,
    width: 24,
    textAlign: "center",
  },
  divisor: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  filaResumenSemanal: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  etiquetaResumen: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  valorPromedio: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  valorMejorDia: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  tituloSeccion: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
  },
  textoVacio: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  tarjetaCategoria: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  icono: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  infoCategoria: {
    flex: 1,
  },
  nombreCategoria: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  promedioCategoria: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  tendenciaContenedor: {
    alignItems: "center",
  },
  tendenciaTexto: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
});
