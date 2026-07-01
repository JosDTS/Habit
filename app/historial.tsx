import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SectionList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { COLORS, SIZES } from "../src/constants/theme";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const ICONOS_CATEGORIA = {
  hidratacion: "💧",
  ejercicio: "🏃",
  sueno: "🌙",
  alimentacion: "🍎",
  meditacion: "🧘",
};

const NOMBRES_CATEGORIA = {
  hidratacion: "Hidratación",
  ejercicio: "Ejercicio",
  sueno: "Sueño",
  alimentacion: "Alimentación",
  meditacion: "Meditación",
};

export default function HistorialScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [seccionesHistorial, setSeccionesHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [totalCompletados, setTotalCompletados] = useState(0);

  const cargarHistorial = useCallback(async () => {
    if (!user) return;

    try {
      const refSubcoleccion = collection(db, "usuarios", user.uid, "retosActivos");
      const snapshot = await getDocs(refSubcoleccion);

      const completados = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((reto) => reto.completado)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      setTotalCompletados(completados.length);

      const agrupadosPorFecha = {};
      completados.forEach((reto) => {
        const fecha = reto.fecha || new Date().toISOString().split("T")[0];
        if (!agrupadosPorFecha[fecha]) {
          agrupadosPorFecha[fecha] = [];
        }
        agrupadosPorFecha[fecha].push(reto);
      });

      const secciones = Object.entries(agrupadosPorFecha)
        .sort(([fechaA], [fechaB]) => fechaB.localeCompare(fechaA))
        .map(([fecha, retos]) => {
          const fechaObj = new Date(fecha + "T00:00:00");
          const hoy = new Date();
          const ayer = new Date(hoy);
          ayer.setDate(ayer.getDate() - 1);

          let titulo = fecha;
          if (fecha === hoy.toISOString().split("T")[0]) {
            titulo = "Hoy";
          } else if (fecha === ayer.toISOString().split("T")[0]) {
            titulo = "Ayer";
          } else {
            titulo = fechaObj.toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            });
          }

          return {
            title: titulo,
            data: retos,
          };
        });

      setSeccionesHistorial(secciones);
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

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
        <TouchableOpacity onPress={() => router.back()} style={styles.botonVolver}>
          <Text style={styles.botonVolverTexto}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTexto}>
          <Text style={styles.titulo}>Historial de Hábitos</Text>
          <Text style={styles.subtitulo}>{totalCompletados} retos completados</Text>
        </View>
      </View>

      {totalCompletados === 0 ? (
        <View style={styles.contenedorVacio}>
          <Text style={styles.textoVacio}>
            Aún no has completado ningún reto. ¡Comienza hoy! 🎯
          </Text>
        </View>
      ) : (
        <SectionList
          sections={seccionesHistorial}
          keyExtractor={(item, index) => item.id || `${item.fecha}-${index}`}
          renderItem={({ item: reto }) => (
            <View style={styles.itemReto}>
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

              <View style={styles.detalleReto}>
                <Text style={styles.nombreReto}>{reto.titulo}</Text>
                <Text style={styles.categoriaReto}>
                  {NOMBRES_CATEGORIA[reto.categoria] || reto.categoria}
                </Text>
              </View>

              <View style={styles.puntosReto}>
                <Text style={styles.valorPuntos}>
                  +{reto.puntosOtorga || 20}
                </Text>
                <Text style={styles.labelPuntos}>pts</Text>
              </View>
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.tituloSeccion}>{title}</Text>
          )}
          contentContainerStyle={styles.contenido}
          scrollEnabled={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingTop: 60,
    paddingBottom: 20,
  },
  botonVolver: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  botonVolverTexto: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: "700",
  },
  headerTexto: {
    flex: 1,
    marginLeft: 12,
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
  contenido: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
  },
  contenedorCarga: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  contenedorVacio: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SIZES.padding,
  },
  textoVacio: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 24,
  },
  tituloSeccion: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 12,
    textTransform: "capitalize",
  },
  itemReto: {
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
  iconoReto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  detalleReto: {
    flex: 1,
  },
  nombreReto: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  categoriaReto: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  puntosReto: {
    alignItems: "flex-end",
  },
  valorPuntos: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  labelPuntos: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
