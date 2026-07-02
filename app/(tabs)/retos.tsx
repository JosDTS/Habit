
import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import {
  obtenerRetosDeHoy,
  incrementarProgresoReto,
  crearRetoPersonalizado,
} from "../../src/services/retos";
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

const NOMBRES_CATEGORIA = {
  hidratacion: "Hidratación",
  ejercicio: "Ejercicio",
  sueno: "Sueño",
  alimentacion: "Alimentación",
  meditacion: "Meditación",
  lectura: "Lectura",
  pasos: "Pasos",
};

const CATEGORIAS_DISPONIBLES = Object.keys(ICONOS_CATEGORIA);

export default function RetosScreen() {
  const { user } = useAuth();
  const [retos, setRetos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [actualizandoId, setActualizandoId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [tituloNuevo, setTituloNuevo] = useState("");
  const [categoriaNueva, setCategoriaNueva] = useState(CATEGORIAS_DISPONIBLES[0]);
  const [metaNueva, setMetaNueva] = useState("");
  const [unidadNueva, setUnidadNueva] = useState("");

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

  const limpiarFormulario = () => {
    setTituloNuevo("");
    setCategoriaNueva(CATEGORIAS_DISPONIBLES[0]);
    setMetaNueva("");
    setUnidadNueva("");
  };

  const handleAbrirModal = () => {
    limpiarFormulario();
    setModalVisible(true);
  };

  const handleGuardarRetoPersonal = async () => {
    if (!tituloNuevo.trim() || !metaNueva.trim() || !unidadNueva.trim()) {
      Alert.alert("Campos incompletos", "Completa el título, la meta y la unidad.");
      return;
    }

    const metaValor = Number(metaNueva);

    if (!Number.isFinite(metaValor) || metaValor <= 0) {
      Alert.alert("Datos inválidos", "La meta debe ser un número mayor a 0.");
      return;
    }

    setGuardando(true);
    const { error } = await crearRetoPersonalizado(user.uid, {
      titulo: tituloNuevo.trim(),
      categoria: categoriaNueva,
      metaValor,
      unidad: unidadNueva.trim(),
      incrementoUnidad: null,
    });
    setGuardando(false);

    if (error) {
      Alert.alert("Error", "No se pudo crear el reto. Intenta de nuevo.");
      return;
    }

    setModalVisible(false);
    limpiarFormulario();
    cargarRetos();
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
    <>
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

      <TouchableOpacity style={styles.cajaAgregar} onPress={handleAbrirModal}>
        <Text style={styles.cajaAgregarIcono}>+</Text>
        <Text style={styles.cajaAgregarTexto}>Agregar reto personal</Text>
      </TouchableOpacity>

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

              <View style={{ flex: 1 }}>
                <Text style={styles.tituloReto}>{reto.titulo}</Text>
                {reto.personalizado && (
                  <Text style={styles.etiquetaPersonal}>Personal</Text>
                )}
              </View>

              {!reto.personalizado && (
                <Text style={styles.puntosReto}>+{reto.puntosOtorga}</Text>
              )}
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

    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.fondoModal}>
        <View style={styles.tarjetaModal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.tituloModal}>Nuevo reto personal</Text>

            <Text style={styles.etiquetaCampo}>Título</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Practicar guitarra"
              value={tituloNuevo}
              onChangeText={setTituloNuevo}
            />

            <Text style={styles.etiquetaCampo}>Categoría</Text>
            <View style={styles.filaCategorias}>
              {CATEGORIAS_DISPONIBLES.map((categoria) => {
                const seleccionada = categoriaNueva === categoria;
                return (
                  <TouchableOpacity
                    key={categoria}
                    style={[
                      styles.etiquetaCategoria,
                      {
                        backgroundColor: seleccionada
                          ? COLORS.categoria[categoria]
                          : COLORS.background,
                        borderColor: seleccionada
                          ? COLORS.categoria[categoria]
                          : COLORS.border,
                      },
                    ]}
                    onPress={() => setCategoriaNueva(categoria)}
                  >
                    <Text style={{ fontSize: 13 }}>{ICONOS_CATEGORIA[categoria]}</Text>
                    <Text
                      style={[
                        styles.etiquetaCategoriaTexto,
                        { color: seleccionada ? COLORS.white : COLORS.textLight },
                      ]}
                    >
                      {NOMBRES_CATEGORIA[categoria]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.filaDosColumnas}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.etiquetaCampo}>Meta</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. 20"
                  keyboardType="numeric"
                  value={metaNueva}
                  onChangeText={setMetaNueva}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.etiquetaCampo}>Unidad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. min"
                  value={unidadNueva}
                  onChangeText={setUnidadNueva}
                />
              </View>
            </View>

            <View style={styles.filaBotonesModal}>
              <TouchableOpacity
                style={styles.botonCancelarModal}
                onPress={() => setModalVisible(false)}
                disabled={guardando}
              >
                <Text style={styles.botonCancelarModalTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botonGuardarModal}
                onPress={handleGuardarRetoPersonal}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.botonGuardarModalTexto}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
    </>
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
  cajaAgregar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    marginBottom: 20,
  },
  cajaAgregarIcono: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginRight: 8,
  },
  cajaAgregarTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  etiquetaPersonal: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  fondoModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  tarjetaModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  tituloModal: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
    textAlign: "center",
  },
  etiquetaCampo: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  filaCategorias: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  etiquetaCategoria: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  etiquetaCategoriaTexto: {
    fontSize: 13,
    fontWeight: "600",
  },
  filaDosColumnas: {
    flexDirection: "row",
  },
  filaBotonesModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 8,
  },
  botonCancelarModal: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  botonCancelarModalTexto: {
    color: COLORS.textLight,
    fontWeight: "600",
  },
  botonGuardarModal: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  botonGuardarModalTexto: {
    color: COLORS.white,
    fontWeight: "600",
  },
});
