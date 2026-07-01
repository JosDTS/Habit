import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { obtenerPerfilUsuario } from "../../src/services/usuarios";
import { obtenerRetosDeHoy, incrementarProgresoReto } from "../../src/services/retos";
import { useRecargarAlCambiarDia } from "../../src/hooks/useRecargarAlCambiarDia";
import {
  obtenerClimaActual,
  elegirFraseClima,
  DECORACION_CLIMA,
  UBICACION_DEFECTO,
} from "../../src/services/clima";
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

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [perfil, setPerfil] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [retos, setRetos] = useState([]);
  const [cargandoRetos, setCargandoRetos] = useState(true);
  const [actualizandoId, setActualizandoId] = useState(null);
  const [clima, setClima] = useState(null);
  const [fraseClima, setFraseClima] = useState("");
  const [cargandoClima, setCargandoClima] = useState(true);

  const cargarDatos = useCallback(async () => {
    if (!user) return;

    const { perfil: datosPerfil } = await obtenerPerfilUsuario(user.uid);
    setPerfil(datosPerfil);
    setCargandoPerfil(false);

    const { retos: datosRetos } = await obtenerRetosDeHoy(user.uid);
    setRetos(datosRetos);
    setCargandoRetos(false);
  }, [user]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    const cargarClima = async () => {
      const { clima: datosClima } = await obtenerClimaActual(
        UBICACION_DEFECTO.lat,
        UBICACION_DEFECTO.lon
      );
      if (datosClima) {
        setClima(datosClima);
        setFraseClima(elegirFraseClima(datosClima.categoria));
      }
      setCargandoClima(false);
    };
    cargarClima();
  }, []);

  useRecargarAlCambiarDia(cargarDatos);

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
    if (resultado.completado) {
      const { perfil: perfilActualizado } = await obtenerPerfilUsuario(user.uid);
      setPerfil(perfilActualizado);
    }
  };

  const nombre = perfil?.nombre || user?.email?.split("@")[0] || "Usuario";
  const puntos = perfil?.puntos ?? 0;
  const retosCompletados = perfil?.retosCompletados ?? 0;
  const rachaDias = perfil?.rachaDias ?? 0;
  const retosVistaPrevia = retos.slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
    >
      {/* Encabezado: saludo y nombre */}
      <View style={styles.encabezado}>
        <View>
          <Text style={styles.saludo}>Buenos días</Text>
          <Text style={styles.nombre}>{nombre}</Text>
        </View>
        <TouchableOpacity
          style={styles.botonNotificacion}
          onPress={() => router.push("/notificaciones")}
        >
          <Text style={{ fontSize: 18 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Tarjeta de clima */}
      {!cargandoClima && clima && (
        <View
          style={[
            styles.tarjetaClima,
            { backgroundColor: DECORACION_CLIMA[clima.categoria].colorClaro },
          ]}
        >
          <View style={styles.filaClima}>
            <View
              style={[
                styles.iconoClimaCirculo,
                { backgroundColor: DECORACION_CLIMA[clima.categoria].color },
              ]}
            >
              <Text style={styles.emojiClima}>
                {DECORACION_CLIMA[clima.categoria].emoji}
              </Text>
            </View>
            <View style={styles.infoClima}>
              <View style={styles.filaTemperatura}>
                <Text style={styles.temperaturaClima}>
                  {clima.temperatura}°
                </Text>
                <Text
                  style={[
                    styles.nombreClima,
                    { color: DECORACION_CLIMA[clima.categoria].color },
                  ]}
                >
                  {DECORACION_CLIMA[clima.categoria].nombre}
                </Text>
              </View>
              <Text style={styles.ubicacionClima}>{UBICACION_DEFECTO.nombre}</Text>
            </View>
          </View>
          <Text style={styles.fraseClima}>{fraseClima}</Text>
        </View>
      )}

      {/* Tarjeta de racha */}
      <View style={styles.tarjetaRacha}>
        <Text style={styles.textoRacha}>{rachaDias} días</Text>
        <Text style={{ fontSize: 24 }}>🔥</Text>
        <View style={styles.puntosRacha}>
          {Array.from({ length: 7 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.puntoRacha,
                i < rachaDias % 7 || rachaDias >= 7
                  ? styles.puntoRachaActivo
                  : null,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Retos de hoy */}
      <View style={styles.filaTitulo}>
        <Text style={styles.tituloSeccion}>Retos de hoy</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/retos")}>
          <Text style={styles.verTodo}>Ver todo</Text>
        </TouchableOpacity>
      </View>

      {cargandoRetos ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginBottom: 20 }} />
      ) : (
        retosVistaPrevia.map((reto) => {
          const porcentaje = Math.round(
            (reto.progresoActual / reto.metaValor) * 100
          );

          return (
            <TouchableOpacity
              key={reto.idDocumento}
              style={styles.tarjetaReto}
              onPress={() => !reto.completado && handleIncrementar(reto)}
              disabled={reto.completado || actualizandoId === reto.idDocumento}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconoReto,
                  { backgroundColor: COLORS.categoria[reto.categoria] || COLORS.primary },
                ]}
              >
                <Text style={{ fontSize: 18 }}>
                  {ICONOS_CATEGORIA[reto.categoria] || "✅"}
                </Text>
              </View>

              <View style={styles.infoReto}>
                <Text style={styles.tituloReto}>{reto.titulo}</Text>
                <Text style={styles.progresoTextoReto}>
                  {reto.progresoActual}/{reto.metaValor} {reto.unidad}
                </Text>
              </View>

              {actualizandoId === reto.idDocumento ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <ProgresoCircular
                  porcentaje={porcentaje}
                  color={reto.completado ? COLORS.primary : COLORS.categoria[reto.categoria] || COLORS.primary}
                />
              )}
            </TouchableOpacity>
          );
        })
      )}

      {/* Resumen semanal */}
      <Text style={styles.tituloResumen}>Resumen semanal</Text>
      <View style={styles.filaResumen}>
        <View style={styles.tarjetaResumen}>
          <Text style={[styles.numeroResumen, { color: COLORS.primaryDark }]}>
            {cargandoPerfil ? "…" : puntos.toLocaleString()}
          </Text>
          <Text style={styles.etiquetaResumen}>Puntos</Text>
        </View>

        <View style={styles.tarjetaResumen}>
          <Text style={[styles.numeroResumen, { color: COLORS.info }]}>
            {cargandoPerfil ? "…" : retosCompletados}
          </Text>
          <Text style={styles.etiquetaResumen}>Retos completados</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function ProgresoCircular({ porcentaje, color }) {
  const radio = 20;
  const grosor = 4;
  const circunferencia = 2 * Math.PI * radio;
  const progreso = circunferencia - (porcentaje / 100) * circunferencia;

  return (
    <View style={styles.contenedorProgreso}>
      <Svg width={51} height={51} viewBox="0 0 51 51">
        <Circle
          cx="25.5"
          cy="25.5"
          r={radio}
          stroke={COLORS.border}
          strokeWidth={grosor}
          fill="none"
        />
        <Circle
          cx="25.5"
          cy="25.5"
          r={radio}
          stroke={color}
          strokeWidth={grosor}
          fill="none"
          strokeDasharray={circunferencia}
          strokeDashoffset={progreso}
          strokeLinecap="round"
          rotation="-90"
          originX="25.5"
          originY="25.5"
        />
      </Svg>
      <Text style={styles.textoPorcentaje}>{porcentaje}%</Text>
    </View>
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
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  saludo: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  nombre: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  botonNotificacion: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E7F1F1",
    alignItems: "center",
    justifyContent: "center",
  },
  tarjetaClima: {
    borderRadius: SIZES.radius,
    padding: 18,
    marginBottom: 20,
  },
  filaClima: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconoClimaCirculo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  emojiClima: {
    fontSize: 26,
  },
  infoClima: {
    flex: 1,
  },
  filaTemperatura: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  temperaturaClima: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    marginRight: 8,
  },
  nombreClima: {
    fontSize: 15,
    fontWeight: "600",
  },
  ubicacionClima: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  fraseClima: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    fontStyle: "italic",
  },
  tarjetaRacha: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: 20,
    marginBottom: 24,
  },
  textoRacha: {
    fontSize: 25,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 12,
  },
  puntosRacha: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  puntoRacha: {
    width: 28,
    height: 6,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  puntoRachaActivo: {
    backgroundColor: COLORS.white,
  },
  filaTitulo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  verTodo: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: "600",
  },
  tarjetaReto: {
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
  iconoReto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  infoReto: {
    flex: 1,
  },
  tituloReto: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  progresoTextoReto: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  contenedorProgreso: {
    width: 51,
    height: 51,
    alignItems: "center",
    justifyContent: "center",
  },
  textoPorcentaje: {
    position: "absolute",
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text,
  },
  tituloResumen: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  filaResumen: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  tarjetaResumen: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  numeroResumen: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  etiquetaResumen: {
    fontSize: 13,
    color: COLORS.textLight,
  },
});
