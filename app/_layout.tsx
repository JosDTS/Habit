import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { View, Text, Image, ActivityIndicator, StyleSheet } from "react-native";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { COLORS } from "../src/constants/theme";
import { useFonts, SawarabiMincho_400Regular } from "@expo-google-fonts/sawarabi-mincho";

function PantallaPreinicio() {
  return (
    <View style={estilosPreinicio.container}>
      <View style={estilosPreinicio.contenido}>
        <Image
          source={require("../assets/images/logo-habit.png")}
          style={estilosPreinicio.logo}
          resizeMode="contain"
        />
        <Text style={estilosPreinicio.titulo} >HÁBIT</Text>
        <Text style={estilosPreinicio.subtitulo}>Hábitos Saludables</Text>
      </View>
      <ActivityIndicator color="#FFFFFF" size="large" style={estilosPreinicio.loader} />
    </View>
  );
}

const estilosPreinicio = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  contenido: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 28,
    borderRadius: 22,
    overflow: "hidden",
  },
  titulo: {
    fontSize: 40,
    color: "#FFFFFF",
    letterSpacing: 1,
    marginBottom: 10,
    fontFamily: "SawarabiMincho_400Regular"
  },
  subtitulo: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  loader: {
    marginBottom: 80,
  },
});

function RutaProtegida() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const enGrupoAuth = segments[0] === "(auth)";
    const enBienvenida = segments.length === 0;

    if (enBienvenida) {
      if (user) router.replace("/(tabs)");
      return;
    }

    if (!user && !enGrupoAuth) {

      router.replace("/(auth)/login");
    } else if (user && enGrupoAuth) {

      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  if (loading) {
    return <PantallaPreinicio />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="editar-perfil"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen name="notificaciones" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SawarabiMincho_400Regular,
  });

  if (!fontsLoaded) {
    return <PantallaPreinicio />;
  }

  return (
    <AuthProvider>
      <RutaProtegida />
    </AuthProvider>
  );
}