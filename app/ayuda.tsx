import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { COLORS, SIZES } from "../src/constants/theme";

const PREGUNTAS_FAQ = [
  {
    id: 1,
    pregunta: "¿Cómo empiezo a usar HÁBIT?",
    respuesta:
      "1. Crea una cuenta con tu correo\n2. Completa tu perfil\n3. Selecciona los hábitos que quieres mejorar\n4. Completa retos diarios para ganar puntos\n5. Compite con tus amigos en el ranking",
  },
  {
    id: 2,
    pregunta: "¿Cómo gano puntos?",
    respuesta:
      "Ganas puntos completando retos diarios. Cada reto completado suma puntos específicos. Cuantos más retos completes, más puntos acumulas y subes de nivel.",
  },
  {
    id: 3,
    pregunta: "¿Qué son las insignias?",
    respuesta:
      "Las insignias son logros desbloqueables por cumplir criterios específicos, como completar 7 días consecutivos de agua o 30 días de ejercicio. Demuestran tu dedicación y progreso.",
  },
  {
    id: 4,
    pregunta: "¿Cómo funciona el ranking?",
    respuesta:
      "El ranking muestra los usuarios ordenados por cantidad de puntos acumulados. Puedes invitar amigos para competir juntos y ver quién progresa más rápido.",
  },
  {
    id: 5,
    pregunta: "¿Puedo eliminar mi cuenta?",
    respuesta:
      "Sí. Ve a Perfil > Configuración > Eliminar cuenta. Ten en cuenta que esta acción es irreversible y perderás todos tus datos.",
  },
  {
    id: 6,
    pregunta: "¿Cómo canjeo mis puntos?",
    respuesta:
      "Abre Perfil > Premios. Ahí verás las recompensas disponibles. Selecciona una con suficientes puntos y toca 'Usar' para canjearla.",
  },
  {
    id: 7,
    pregunta: "¿Cómo invito amigos?",
    respuesta:
      "Ve a Perfil > Amigos > Ranking. Usa la barra de búsqueda para encontrar a la persona que quieres invitar y toca el botón '+'. Ellos recibirán una solicitud de amistad.",
  },
  {
    id: 8,
    pregunta: "¿Puedo cambiar mi contraseña?",
    respuesta:
      "Sí. Ve a Perfil > Configuración > Cambiar contraseña. Recibirás un enlace en tu correo para establecer una nueva.",
  },
];

const CONTACTO = [
  { tipo: "Email", valor: "soporte@habitapp.com", icono: "📧", accion: "email" },
  { tipo: "Teléfono", valor: "+506 2222-HÁBIT", icono: "📱", accion: "tel" },
  {
    tipo: "Instagram",
    valor: "@habitapp_cr",
    icono: "📸",
    accion: "https://instagram.com/habitapp_cr",
  },
  {
    tipo: "Twitter",
    valor: "@habitapp",
    icono: "𝕏",
    accion: "https://twitter.com/habitapp",
  },
];

export default function AyudaScreen() {
  const router = useRouter();
  const [preguntasAbiertas, setPreguntasAbiertas] = useState(new Set());

  const togglePregunta = (id) => {
    const nuevas = new Set(preguntasAbiertas);
    if (nuevas.has(id)) {
      nuevas.delete(id);
    } else {
      nuevas.add(id);
    }
    setPreguntasAbiertas(nuevas);
  };

  const handleContacto = (contacto) => {
    if (contacto.accion === "email") {
      Linking.openURL(`mailto:${contacto.valor}`);
    } else if (contacto.accion === "tel") {
      Linking.openURL(`tel:${contacto.valor}`);
    } else if (contacto.accion.startsWith("https")) {
      Linking.openURL(contacto.accion);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.botonVolverTexto}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTexto}>
          <Text style={styles.titulo}>Ayuda y Soporte</Text>
          <Text style={styles.subtitulo}>Estamos aquí para ayudarte</Text>
        </View>
      </View>

      <Text style={styles.tituloSeccion}>Contáctanos</Text>
      <View style={styles.seccionContacto}>
        {CONTACTO.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.itemContacto,
              index < CONTACTO.length - 1 && styles.itemContactoConBorde,
            ]}
            onPress={() => handleContacto(item)}
          >
            <Text style={styles.iconoContacto}>{item.icono}</Text>
            <View style={styles.infoContacto}>
              <Text style={styles.tipoContacto}>{item.tipo}</Text>
              <Text style={styles.valorContacto}>{item.valor}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.tituloSeccion}>Preguntas Frecuentes</Text>
      <View style={styles.seccionFAQ}>
        {PREGUNTAS_FAQ.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.itemFAQ,
              index < PREGUNTAS_FAQ.length - 1 && styles.itemFAQConBorde,
            ]}
          >
            <TouchableOpacity
              style={styles.pregunta}
              onPress={() => togglePregunta(item.id)}
            >
              <Text style={styles.textoPregunta}>{item.pregunta}</Text>
              <Text
                style={[
                  styles.iconoExpandir,
                  preguntasAbiertas.has(item.id) && styles.iconoExpandirAbierto,
                ]}
              >
                ▼
              </Text>
            </TouchableOpacity>

            {preguntasAbiertas.has(item.id) && (
              <View style={styles.respuestaContenedor}>
                <Text style={styles.respuesta}>{item.respuesta}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <Text style={styles.tituloSeccion}>Información de la App</Text>
      <View style={styles.seccionInfo}>
        <View style={styles.itemInfo}>
          <Text style={styles.labelInfo}>Versión</Text>
          <Text style={styles.valorInfo}>1.0.0</Text>
        </View>
        <View style={[styles.itemInfo, styles.itemInfoConBorde]}>
          <Text style={styles.labelInfo}>Desarrollado por</Text>
          <Text style={styles.valorInfo}>Universidad de Costa Rica</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.labelInfo}>Año</Text>
          <Text style={styles.valorInfo}>2026</Text>
        </View>
      </View>

      <Text style={styles.piePagina}>
        Gracias por usar HÁBIT. Estamos comprometidos a ayudarte a mejorar tus
        hábitos diarios. 💚
      </Text>
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
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
  tituloSeccion: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 20,
  },
  seccionContacto: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  itemContacto: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: SIZES.padding,
  },
  itemContactoConBorde: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconoContacto: {
    fontSize: 20,
    marginRight: 14,
    width: 28,
    textAlign: "center",
  },
  infoContacto: {
    flex: 1,
  },
  tipoContacto: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  valorContacto: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textLight,
  },
  seccionFAQ: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  itemFAQ: {
    paddingVertical: 14,
    paddingHorizontal: SIZES.padding,
  },
  itemFAQConBorde: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pregunta: {
    flexDirection: "row",
    alignItems: "center",
  },
  textoPregunta: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 20,
  },
  iconoExpandir: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 8,
    transform: [{ rotate: "0deg" }],
  },
  iconoExpandirAbierto: {
    transform: [{ rotate: "180deg" }],
  },
  respuestaContenedor: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  respuesta: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  seccionInfo: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: SIZES.padding,
  },
  itemInfoConBorde: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  labelInfo: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  valorInfo: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  piePagina: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 20,
    marginBottom: 20,
  },
});
