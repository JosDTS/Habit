import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import {
  obtenerAmigos,
  obtenerSolicitudesPendientes,
  obtenerRanking,
  buscarUsuarios,
  invitarAmigo,
  aceptarSolicitud,
  rechazarSolicitud,
  eliminarAmigo,
} from "../src/services/amistades";
import { COLORS, SIZES } from "../src/constants/theme";

export default function AmigosScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [tab, setTab] = useState("ranking");
  const [cargando, setCargando] = useState(true);
  const [ranking, setRanking] = useState([]);
  const [amigos, setAmigos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [posicionUsuario, setPosicionUsuario] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [invitando, setInvitando] = useState(null);
  const [procesando, setProcesando] = useState(null);

  const cargarDatos = useCallback(async () => {
    if (!user) return;

    try {
      const { usuarios: datosRanking } = await obtenerRanking(user.uid);
      setRanking(datosRanking);

      let posicion = datosRanking.length + 1;
      for (let i = 0; i < datosRanking.length; i++) {
        if (datosRanking[i].uid === user.uid) {
          posicion = i + 1;
          break;
        }
      }
      setPosicionUsuario(posicion);

      const { amigos: datosAmigos } = await obtenerAmigos(user.uid);
      setAmigos(datosAmigos);

      const { solicitudes: datosSolicitudes } = await obtenerSolicitudesPendientes(user.uid);
      setSolicitudes(datosSolicitudes);
    } catch (error) {
      console.error("Error cargando datos de amigos:", error);
    } finally {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const busquedaActualRef = useRef("");

  const handleBuscarEnTiempoReal = useCallback(
    async (texto) => {
      if (!texto.trim() || !user) {
        setResultadosBusqueda([]);
        setBuscando(false);
        return;
      }

      try {
        const { usuarios: resultados } = await buscarUsuarios(texto, user.uid);
        // Descarta la respuesta si el usuario ya siguió escribiendo:
        // evita que una búsqueda vieja y más lenta pise resultados más recientes.
        if (busquedaActualRef.current === texto) {
          setResultadosBusqueda(resultados);
          setBuscando(false);
        }
      } catch (error) {
        console.error("Error en búsqueda:", error);
        if (busquedaActualRef.current === texto) {
          setBuscando(false);
        }
      }
    },
    [user]
  );

  useEffect(() => {
    busquedaActualRef.current = busqueda;

    if (!busqueda.trim()) {
      setResultadosBusqueda([]);
      setBuscando(false);
      return;
    }

    setBuscando(true);
    const timeoutId = setTimeout(() => {
      handleBuscarEnTiempoReal(busqueda);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [busqueda, handleBuscarEnTiempoReal]);

  const handleInvitar = async (usuarioUid) => {
    setInvitando(usuarioUid);

    const { error } = await invitarAmigo(user.uid, usuarioUid);

    if (error) {
      Alert.alert("Error", error);
    } else {
      Alert.alert("Éxito", "Solicitud de amistad enviada");
      setBusqueda("");
      setResultadosBusqueda([]);
      await cargarDatos();
    }

    setInvitando(null);
  };

  const handleAceptarSolicitud = async (amistadId) => {
    setProcesando(amistadId);

    const { error } = await aceptarSolicitud(amistadId);

    if (error) {
      Alert.alert("Error", error);
    } else {
      Alert.alert("¡Amistad confirmada!");
      await cargarDatos();
    }

    setProcesando(null);
  };

  const handleRechazarSolicitud = async (amistadId) => {
    setProcesando(amistadId);

    const { error } = await rechazarSolicitud(amistadId);

    if (error) {
      Alert.alert("Error", error);
    } else {
      await cargarDatos();
    }

    setProcesando(null);
  };

  const handleEliminarAmigo = (amistadId, nombreAmigo) => {
    Alert.alert(
      "Eliminar amigo",
      `¿Seguro que quieres eliminar a ${nombreAmigo} de tu lista de amigos?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const { error } = await eliminarAmigo(amistadId);
            if (error) {
              Alert.alert("Error", error);
            } else {
              await cargarDatos();
            }
          },
        },
      ]
    );
  };

  if (cargando) {
    return (
      <View style={styles.contenedorCarga}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.botonVolverTexto}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Amigos</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "ranking" && styles.tabActivo]}
          onPress={() => setTab("ranking")}
        >
          <Text style={styles.tabLabel}>Ranking</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "amigos" && styles.tabActivo]}
          onPress={() => setTab("amigos")}
        >
          <Text style={styles.tabLabel}>
            Mis Amigos {amigos.length > 0 && `(${amigos.length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "solicitudes" && styles.tabActivo]}
          onPress={() => setTab("solicitudes")}
        >
          <Text style={styles.tabLabel}>
            Solicitudes {solicitudes.length > 0 && `(${solicitudes.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.contenido}
        contentContainerStyle={styles.contenidoScroll}
      >
        {tab === "ranking" && (
          <>
            <View style={styles.seccionBusqueda}>
              <Text style={styles.labelBusqueda}>Invitar amigos</Text>
              <TextInput
                style={styles.inputBusqueda}
                placeholder="Buscar usuario..."
                value={busqueda}
                onChangeText={setBusqueda}
                placeholderTextColor={COLORS.textLight}
              />

              {busqueda.trim().length > 0 && (
                <View style={styles.resultados}>
                  {buscando ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.primary}
                      style={styles.indicadorBusqueda}
                    />
                  ) : resultadosBusqueda.length > 0 ? (
                    resultadosBusqueda.map((usuario) => (
                      <View key={usuario.uid} style={styles.itemResultado}>
                        <View style={styles.infoResultado}>
                          <Text style={styles.nombreResultado}>
                            {usuario.nombre}
                          </Text>
                          <Text style={styles.puntosResultado}>
                            {usuario.puntos} puntos
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.botonInvitar}
                          onPress={() => handleInvitar(usuario.uid)}
                          disabled={invitando === usuario.uid}
                        >
                          {invitando === usuario.uid ? (
                            <ActivityIndicator
                              size="small"
                              color={COLORS.white}
                            />
                          ) : (
                            <Text style={styles.botonInvitarTexto}>+</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.textoSinResultados}>
                      No se encontró ningún participante con ese nombre.
                    </Text>
                  )}
                </View>
              )}
            </View>

            <Text style={styles.tituloSeccion}>Clasificación</Text>
            {ranking.map((usuario, index) => (
              <View key={usuario.uid} style={styles.itemRanking}>
                <Text style={styles.posicion}>#{index + 1}</Text>
                <View style={styles.infoRanking}>
                  <Text style={styles.nombreRanking}>{usuario.nombre}</Text>
                </View>
                <Text style={styles.puntosRanking}>
                  {usuario.puntos.toLocaleString()} pts
                </Text>
              </View>
            ))}

            {posicionUsuario && (
              <View style={styles.tuPosicion}>
                <Text style={styles.trofeo}>🏆</Text>
                <Text style={styles.tuPosicionTexto}>Tu posición</Text>
                <Text style={styles.tuPosicionNumero}>#{posicionUsuario}</Text>
              </View>
            )}
          </>
        )}

        {tab === "amigos" && (
          <>
            <Text style={styles.tituloSeccion}>Tus Amigos</Text>
            {amigos.length === 0 ? (
              <Text style={styles.textoVacio}>
                Aún no tienes amigos. ¡Invita a alguien! 👋
              </Text>
            ) : (
              amigos.map((amigo) => (
                <View key={amigo.uid} style={styles.itemAmigo}>
                  <View style={styles.infoAmigo}>
                    <Text style={styles.nombreAmigo}>{amigo.nombre}</Text>
                    <Text style={styles.puntosAmigo}>
                      {amigo.puntos.toLocaleString()} puntos
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.botonEliminar}
                    onPress={() => handleEliminarAmigo(amigo.id, amigo.nombre)}
                  >
                    <Text style={styles.botonEliminarTexto}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}

        {tab === "solicitudes" && (
          <>
            <Text style={styles.tituloSeccion}>Solicitudes Pendientes</Text>
            {solicitudes.length === 0 ? (
              <Text style={styles.textoVacio}>
                No tienes solicitudes pendientes
              </Text>
            ) : (
              solicitudes.map((solicitud) => (
                <View key={solicitud.id} style={styles.itemSolicitud}>
                  <View style={styles.infoSolicitud}>
                    <Text style={styles.nombreSolicitud}>
                      {solicitud.nombre}
                    </Text>
                    <Text style={styles.puntosSolicitud}>
                      {solicitud.puntos.toLocaleString()} puntos
                    </Text>
                  </View>
                  <View style={styles.botonesSolicitud}>
                    <TouchableOpacity
                      style={[
                        styles.botonSolicitud,
                        styles.botonAceptar,
                      ]}
                      onPress={() => handleAceptarSolicitud(solicitud.id)}
                      disabled={procesando === solicitud.id}
                    >
                      {procesando === solicitud.id ? (
                        <ActivityIndicator
                          size="small"
                          color={COLORS.white}
                        />
                      ) : (
                        <Text style={styles.botonTexto}>✓</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.botonSolicitud, styles.botonRechazar]}
                      onPress={() => handleRechazarSolicitud(solicitud.id)}
                      disabled={procesando === solicitud.id}
                    >
                      <Text style={styles.botonTexto}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contenedorCarga: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingTop: 60,
    paddingBottom: 16,
  },
  botonVolverTexto: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: "700",
    marginRight: 12,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: SIZES.padding,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActivo: {
    borderBottomColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  contenido: {
    flex: 1,
  },
  contenidoScroll: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
  },
  seccionBusqueda: {
    marginBottom: 24,
  },
  labelBusqueda: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 10,
  },
  inputBusqueda: {
    flex: 1,
    backgroundColor: "#E7F1F1",
    borderRadius: SIZES.radius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  resultados: {
    marginTop: 12,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  indicadorBusqueda: {
    paddingVertical: 8,
  },
  textoSinResultados: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: "center",
    paddingVertical: 8,
  },
  itemResultado: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoResultado: {
    flex: 1,
  },
  nombreResultado: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  puntosResultado: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  botonInvitar: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  botonInvitarTexto: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
  tituloSeccion: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 10,
    marginTop: 16,
  },
  textoVacio: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 20,
  },
  itemRanking: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  posicion: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
    width: 40,
  },
  infoRanking: {
    flex: 1,
  },
  nombreRanking: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  puntosRanking: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  tuPosicion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  trofeo: {
    fontSize: 24,
  },
  tuPosicionTexto: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
  },
  tuPosicionNumero: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  itemAmigo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  infoAmigo: {
    flex: 1,
  },
  nombreAmigo: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  puntosAmigo: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  botonEliminar: {
    padding: 8,
  },
  botonEliminarTexto: {
    fontSize: 16,
  },
  itemSolicitud: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  infoSolicitud: {
    flex: 1,
  },
  nombreSolicitud: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  puntosSolicitud: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  botonesSolicitud: {
    flexDirection: "row",
    gap: 8,
  },
  botonSolicitud: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  botonAceptar: {
    backgroundColor: COLORS.primary,
  },
  botonRechazar: {
    backgroundColor: "#EF4444",
  },
  botonTexto: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
});
