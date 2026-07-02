import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { fechaLocalTexto } from "../utils/fecha";

function fechaDeHoy() {
  return fechaLocalTexto();
}

export function useRecargarAlCambiarDia(callbackRecarga) {
  const ultimaFechaCargada = useRef(fechaDeHoy());

  useEffect(() => {
    const suscripcion = AppState.addEventListener("change", (siguienteEstado) => {
      if (siguienteEstado !== "active") return;

      const fechaActual = fechaDeHoy();
      if (fechaActual !== ultimaFechaCargada.current) {
        ultimaFechaCargada.current = fechaActual;
        callbackRecarga();
      }
    });

    return () => suscripcion.remove();
  }, [callbackRecarga]);
}
