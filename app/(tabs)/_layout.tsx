import { Tabs } from "expo-router";
import { Text } from "react-native";
import { COLORS } from "../../src/constants/theme";

import {
  House,
  Target,
  ChartColumn,
  Award,
  CircleUserRound,
} from "lucide-react-native";

const ICONOS = {
  index: House,
  retos: Target,
  estadisticas: ChartColumn,
  logros: Award,
  perfil: CircleUserRound,
};

function TabIcon({ nombre, enfocado }) {
  const Icono = ICONOS[nombre];

  return (
    <Icono
      size={enfocado ? 26 : 22}
      color={enfocado ? COLORS.primary : "#8E8E93"}
      strokeWidth={2.3}
    />
  );
}
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          height: 75,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused }) => (
            <TabIcon nombre="index" enfocado={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="retos"
        options={{
          title: "Retos",
          tabBarIcon: ({ focused }) => (
            <TabIcon nombre="retos" enfocado={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="estadisticas"
        options={{
          title: "Estadísticas",
          tabBarIcon: ({ focused }) => (
            <TabIcon nombre="estadisticas" enfocado={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="logros"
        options={{
          title: "Logros",
          tabBarIcon: ({ focused }) => (
            <TabIcon nombre="logros" enfocado={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => (
            <TabIcon nombre="perfil" enfocado={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
