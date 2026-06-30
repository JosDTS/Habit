import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

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

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
        name="editar-perfil"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RutaProtegida />
    </AuthProvider>
  );
}
