import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { obtenerPerfilUsuario, sumarPuntos } from "../src/services/usuarios";
import { COLORS, SIZES } from "../src/constants/theme";

const RECOMPENSAS_CATALOGO = [
  {
    id: "tema_premium",
    nombre: "Tema premium",
    descripcion: "Desbloquea temas de colores",
    puntos: 1000,
    icono: "🎨",
    tipo: "cosmético",
  },
  {
    id: "avatar_atleta",
    nombre: "Avatar Especial",
    descripcion: "Avatar exclusivo de atleta",
    puntos: 1500,
    icono: "🏅",
    tipo: "cosmético",
  },
  {
    id: "sin_anuncios",
    nombre: "Sin anuncios",
    descripcion: "1 semana sin publicidad",
    puntos: 1000,
    icono: "📵",
    tipo: "premium",
  },
  {
    id: "insignia_dorada",
    nombre: "Insignia Dorada",
    descripcion: "Muestra tu dedicación",
    puntos: 1500,
    icono: "🏆",
    tipo: "insignia",
  },
  {
    id: "donacion_agua",
    nombre: "Donación solidaria",
    descripcion: "Dona un vaso de agua",
    puntos: 2000,
    icono: "💧",
    tipo: "social",
  },
  {
    id: "mentor_vip",
    nombre: "Mentor VIP",
    descripcion: "Acceso a consejos premium",
    puntos: 3000,
    icono: "👑",
    tipo: "premium",
  },
];

export default function PremiosScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tabActivo, setTabActivo] = useState("insignias");
  const [canjeando, setCanjeando] = useState(null);
  const [canjeadas, setCanjeadas] = useState(new Set());

  const cargarPerfil = useCallback(async () => {
    if (!user) return;
    const { perfil: datos } = await obtenerPerfilUsuario(user.uid);
    setPerfil(datos);
    setCargando(false);
  }, [user]);

  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  const handleCanjear = (recompensa) => {
    if (canjeadas.has(recompensa.id)) {
      Alert.alert("Ya canjeada", "Ya has usado esta recompensa.");
      return;
    }

    if ((perfil?.puntos ?? 0) < recompensa.puntos) {
      Alert.alert(
        "Puntos insuficientes",
        `Necesitas ${recompensa.puntos} puntos. Tienes ${perfil?.puntos ?? 0}.`
      );
      return;
    }

    Alert.alert(
      "Canjear recompensa",
      `¿Deseas canjear "${recompensa.nombre}" por ${recompensa.puntos} puntos?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, canjear",
          onPress: () => confirmarCanje(recompensa),
        },
      ]
    );
  };

  const confirmarCanje = async (recompensa) => {
    setCanjeando(recompensa.id);

    try {
      await sumarPuntos(user.uid, -recompensa.puntos);

      const nuevasCanjeadas = new Set(canjeadas);
      nuevasCanjeadas.add(recompensa.id);
      setCanjeadas(nuevasCanjeadas);

      const { perfil: actualizado } = await obtenerPerfilUsuario(user.uid);
      setPerfil(actualizado);

      Alert.alert("¡Éxito!", `Has canjeado "${recompensa.nombre}".`);
    } catch {
      Alert.alert("Error", "No se pudo procesar el canje. Intenta de nuevo.");
    } finally {
      setCanjeando(null);
    }
  };

  if (cargando) {
    return (
      <View style={styles.contenedorCarga}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const puntos = perfil?.puntos ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.botonVolverTexto}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTexto}>
          <Text style={styles.titulo}>Premios</Text>
          <Text style={styles.subtitulo}>Canjea tus puntos por premios</Text>
        </View>
      </View>

      <View style={styles.tarjetaPuntos}>
        <View style={styles.infoPuntos}>
          <Text style={styles.labelPuntos}>Tus puntos</Text>
          <Text style={styles.valorPuntos}>{puntos.toLocaleString()}</Text>
        </View>
        <Text style={styles.iconoPuntos}>⭐</Text>
        <View style={styles.motivacion}>
          <Text style={styles.textoMotivacion}>
            ¡Estás a {Math.max(0, 250 - puntos)} puntos de la próxima recompensa!
          </Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tabActivo === "insignias" && styles.tabActivo]}
          onPress={() => setTabActivo("insignias")}
        >
          <Text style={styles.iconoTab}>⭐</Text>
          <Text style={styles.labelTab}>Insignias</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tabActivo === "sorteos" && styles.tabActivo]}
          onPress={() => setTabActivo("sorteos")}
        >
          <Text style={styles.iconoTab}>🎁</Text>
          <Text style={styles.labelTab}>Sorteos</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tituloSeccion}>Disponibles</Text>

      {RECOMPENSAS_CATALOGO.map((recompensa) => {
        const tienePuntos = puntos >= recompensa.puntos;
        const yaCanjeada = canjeadas.has(recompensa.id);

        return (
          <View
            key={recompensa.id}
            style={[
              styles.tarjetaRecompensa,
              !tienePuntos && styles.tarjetaBloqueada,
            ]}
          >
            <View
              style={[
                styles.iconoRecompensa,
                !tienePuntos && styles.iconoBloqueado,
              ]}
            >
              <Text style={{ fontSize: 20, opacity: tienePuntos ? 1 : 0.4 }}>
                {tienePuntos ? recompensa.icono : "🔒"}
              </Text>
            </View>

            <View style={styles.detalleRecompensa}>
              <Text
                style={[
                  styles.nombreRecompensa,
                  !tienePuntos && styles.textoBloqueado,
                ]}
              >
                {recompensa.nombre}
              </Text>
              <Text
                style={[
                  styles.descripcionRecompensa,
                  !tienePuntos && styles.textoBloqueado,
                ]}
              >
                {recompensa.descripcion}
              </Text>
            </View>

            {tienePuntos ? (
              <TouchableOpacity
                style={styles.botonCanjear}
                onPress={() => handleCanjear(recompensa)}
                disabled={canjeando === recompensa.id || yaCanjeada}
              >
                {canjeando === recompensa.id ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : yaCanjeada ? (
                  <Text style={styles.botonCanjeadoTexto}>✓</Text>
                ) : (
                  <Text style={styles.botonCanjearTexto}>Usar</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.puntosNecesarios}>
                <Text style={styles.valorPuntosNecesarios}>
                  {recompensa.puntos}
                </Text>
                <Text style={styles.labelPuntosNecesarios}>Puntos</Text>
              </View>
            )}
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  botonVolverTexto: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: "700",
    marginRight: 12,
  },
  headerTexto: {
    flex: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitulo: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  tarjetaPuntos: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  infoPuntos: {
    flex: 1,
  },
  labelPuntos: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  valorPuntos: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.white,
  },
  iconoPuntos: {
    fontSize: 40,
    marginRight: 12,
  },
  motivacion: {
    flex: 1,
    marginLeft: 12,
  },
  textoMotivacion: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 18,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 24,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabActivo: {
    backgroundColor: COLORS.primary,
  },
  iconoTab: {
    fontSize: 16,
    marginRight: 6,
  },
  labelTab: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  tabActivo_labelTab: {
    color: COLORS.white,
  },
  tituloSeccion: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  tarjetaRecompensa: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  tarjetaBloqueada: {
    backgroundColor: "#FAFBFB",
  },
  iconoRecompensa: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 153, 81, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconoBloqueado: {
    backgroundColor: "rgba(200, 200, 200, 0.1)",
  },
  detalleRecompensa: {
    flex: 1,
  },
  nombreRecompensa: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  descripcionRecompensa: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  textoBloqueado: {
    color: "rgba(0,0,0,0.5)",
  },
  botonCanjear: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  botonCanjearTexto: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  botonCanjeadoTexto: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  puntosNecesarios: {
    alignItems: "center",
  },
  valorPuntosNecesarios: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  labelPuntosNecesarios: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
