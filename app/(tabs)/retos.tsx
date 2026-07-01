
import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { obtenerRetosDeHoy, incrementarProgresoReto } from "../../src/services/retos";
import { useRecargarAlCambiarDia } from "../../src/hooks/useRecargarAlCambiarDia";
import { COLORS, SIZES } from "../../src/constants/theme";


const ICONOS_CATEGORIA = {
  hidratacion: "💧",
  ejercicio: "🏃",
  sueno: "🌙",
  alimentacion: "🍎",
  meditacion: "🧘",
  lectura: "📖",
  pasos: "👣",
};

export default function RetosScreen() {
  const { user } = useAuth();
  const [retos, setRetos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [actualizandoId, setActualizandoId] = useState(null);

  const cargarRetos = useCallback(async () => {
    if (!user) return;
    const { retos: datos } = await obtenerRetosDeHoy(user.uid);
    setRetos(datos);
    setCargando(false);
    setRefrescando(false);
  }, [user]);

  useEffect(() => {
    cargarRetos();
  }, [cargarRetos]);
 
  useRecargarAlCambiarDia(cargarRetos);

  const handleRefrescar = () => {
    setRefrescando(true);
    cargarRetos();
  };

  const handleIncrementar = async (reto) => {
    setActualizandoId(reto.idDocumento);
    const resultado = await incrementarProgresoReto(user.uid, reto);
    setActualizandoId(null);

    if (resultado.error) return;

    setRetos((retosActuales) =>
      retosActuales.map((r) =>
        r.idDocumento === reto.idDocumento
          ? { ...r, progresoActual: resultado.progresoActual, completado: resultado.completado }
          : r
      )
    );
  };

  const totalRetos = retos.length;
  const retosCompletadosHoy = retos.filter((r) => r.completado).length;
  const puntosGanadosHoy = retos
    .filter((r) => r.completado)
    .reduce((suma, r) => suma + r.puntosOtorga, 0);

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
      <Text style={styles.titulo}>Retos Diarios</Text>
      <Text style={styles.subtitulo}>Completa retos para ganar puntos</Text>

      <View style={styles.tarjetaResumen}>
        <View>
          <Text style={styles.etiquetaResumen}>Progreso de hoy</Text>
          <Text style={styles.valorResumen}>
            {retosCompletadosHoy} de {totalRetos} completados
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.etiquetaResumen}>Puntos ganados</Text>
          <Text style={styles.puntosResumen}>+{puntosGanadosHoy}</Text>
        </View>
      </View>

      {retos.map((reto) => {
        const porcentaje = Math.round(
          (reto.progresoActual / reto.metaValor) * 100
        );

        return (
          <View key={reto.idDocumento} style={styles.tarjetaReto}>
            <View style={styles.filaSuperior}>
              <View
                style={[
                  styles.icono,
                  { backgroundColor: COLORS.categoria[reto.categoria] || COLORS.primary },
                ]}
              >
                <Text style={{ fontSize: 16 }}>
                  {ICONOS_CATEGORIA[reto.categoria] || "✅"}
                </Text>
              </View>

              <Text style={styles.tituloReto}>{reto.titulo}</Text>

              <Text style={styles.puntosReto}>+{reto.puntosOtorga}</Text>
            </View>

            <View style={styles.filaProgreso}>
              <View style={styles.barraFondo}>
                <View
                  style={[
                    styles.barraProgreso,
                    {
                      width: `${porcentaje}%`,
                      backgroundColor: reto.completado
                        ? COLORS.primary
                        : COLORS.categoria[reto.categoria] || COLORS.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.porcentajeTexto}>{porcentaje}%</Text>
            </View>

            <View style={styles.filaInferior}>
              <Text style={styles.progresoTextoReto}>
                {reto.progresoActual}/{reto.metaValor} {reto.unidad}
              </Text>

              <TouchableOpacity
                style={[
                  styles.botonMas,
                  reto.completado && styles.botonMasDeshabilitado,
                ]}
                onPress={() => handleIncrementar(reto)}
                disabled={reto.completado || actualizandoId === reto.idDocumento}
              >
                {actualizandoId === reto.idDocumento ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.botonMasTexto}>
                    {reto.completado
                      ? "✓ Completado"
                      : reto.incrementoUnidad === null
                      ? "Marcar hecho"
                      : `+${reto.incrementoUnidad}`}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
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
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 20,
  },
  tarjetaResumen: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E8F3F0",
    borderRadius: SIZES.radius,
    padding: 18,
    marginBottom: 20,
  },
  etiquetaResumen: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 6,
  },
  valorResumen: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  puntosResumen: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  tarjetaReto: {
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
  filaSuperior: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tituloReto: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  puntosReto: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  filaProgreso: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  barraFondo: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 10,
  },
  barraProgreso: {
    height: "100%",
    borderRadius: 4,
  },
  porcentajeTexto: {
    fontSize: 12,
    color: COLORS.textLight,
    width: 36,
    textAlign: "right",
  },
  filaInferior: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progresoTextoReto: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  botonMas: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    minWidth: 70,
    alignItems: "center",
  },
  botonMasDeshabilitado: {
    backgroundColor: COLORS.border,
  },
  botonMasTexto: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
  },
});
