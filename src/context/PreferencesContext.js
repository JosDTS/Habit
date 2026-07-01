import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PreferencesContext = createContext();

export const PreferencesProvider = ({ children }) => {
  const [tema, setTema] = useState("claro");
  const [idioma, setIdioma] = useState("es");
  const [notificacionesActivas, setNotificacionesActivas] = useState(true);
  const [cargado, setCargado] = useState(false);

  const cargarPreferencias = async () => {
    try {
      const [temaSaved, idiomaSaved, notifSaved] = await Promise.all([
        AsyncStorage.getItem("tema"),
        AsyncStorage.getItem("idioma"),
        AsyncStorage.getItem("notificaciones"),
      ]);

      if (temaSaved) setTema(temaSaved);
      if (idiomaSaved) setIdioma(idiomaSaved);
      if (notifSaved) setNotificacionesActivas(JSON.parse(notifSaved));

      setCargado(true);
    } catch (error) {
      console.error("Error cargando preferencias:", error);
      setCargado(true);
    }
  };

  useEffect(() => {
    cargarPreferencias();
  }, []);

  const cambiarTema = async (nuevoTema) => {
    try {
      setTema(nuevoTema);
      await AsyncStorage.setItem("tema", nuevoTema);
    } catch (error) {
      console.error("Error guardando tema:", error);
    }
  };

  const cambiarIdioma = async (nuevoIdioma) => {
    try {
      setIdioma(nuevoIdioma);
      await AsyncStorage.setItem("idioma", nuevoIdioma);
    } catch (error) {
      console.error("Error guardando idioma:", error);
    }
  };

  const cambiarNotificaciones = async (activas) => {
    try {
      setNotificacionesActivas(activas);
      await AsyncStorage.setItem("notificaciones", JSON.stringify(activas));
    } catch (error) {
      console.error("Error guardando notificaciones:", error);
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        tema,
        cambiarTema,
        idioma,
        cambiarIdioma,
        notificacionesActivas,
        cambiarNotificaciones,
        cargado,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences debe usarse dentro de PreferencesProvider");
  }
  return context;
};
