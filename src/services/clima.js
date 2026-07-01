export const UBICACION_DEFECTO = {
  lat: 9.9281,
  lon: -84.0907,
  nombre: "San José",
};

export const DECORACION_CLIMA = {
  despejado: {
    emoji: "☀️",
    color: "#F5A623",
    colorClaro: "#FFF3D9",
    nombre: "Despejado",
  },
  nublado: {
    emoji: "⛅",
    color: "#7C8B9E",
    colorClaro: "#E9ECEF",
    nombre: "Nublado",
  },
  lluvia: {
    emoji: "🌧️",
    color: "#4A7FB5",
    colorClaro: "#E1EDF8",
    nombre: "Lluvioso",
  },
  niebla: {
    emoji: "🌫️",
    color: "#8E97A0",
    colorClaro: "#ECEEF0",
    nombre: "Neblina",
  },
  nieve: {
    emoji: "❄️",
    color: "#5FAEDB",
    colorClaro: "#E5F3FA",
    nombre: "Nieve",
  },
  tormenta: {
    emoji: "⛈️",
    color: "#5C6BC0",
    colorClaro: "#E6E8F7",
    nombre: "Tormenta",
  },
};

const FRASES_POR_CLIMA = {
  despejado: [
    "Es un excelente día para salir a caminar.",
    "Sol de sobra hoy, buen momento para tus retos al aire libre.",
    "Cielo despejado: ideal para caminar o trotar un rato.",
  ],
  nublado: [
    "Día nublado, perfecto para moverte sin que el sol te canse.",
    "Buen clima para salir a caminar sin pasar calor.",
    "Está fresco, buen día para tus retos de ejercicio.",
  ],
  lluvia: [
    "Hoy llueve, mejor un entrenamiento bajo techo.",
    "Aprovechá la lluvia para tus retos de lectura o meditación.",
    "Día ideal para hidratarte bien y entrenar en casa.",
  ],
  niebla: [
    "Hay neblina hoy, con cuidado si salís a caminar.",
    "Buen día para una rutina tranquila adentro.",
  ],
  nieve: [
    "¡Está nevando! Abrigate bien si salís a moverte.",
    "Día frío, ideal para estirar y entrenar en interiores.",
  ],
  tormenta: [
    "Hay tormenta, mejor quedate adentro y aprovechá para meditar o leer.",
    "No es buen momento para salir, entrená en casa hoy.",
  ],
};

function categorizarClima(codigo) {
  if (codigo === 0) return "despejado";
  if ([1, 2, 3].includes(codigo)) return "nublado";
  if ([45, 48].includes(codigo)) return "niebla";
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(codigo)
  )
    return "lluvia";
  if ([71, 73, 75, 77, 85, 86].includes(codigo)) return "nieve";
  if ([95, 96, 99].includes(codigo)) return "tormenta";
  return "despejado";
}

export function elegirFraseClima(categoria) {
  const lista = FRASES_POR_CLIMA[categoria] || FRASES_POR_CLIMA.despejado;
  return lista[Math.floor(Math.random() * lista.length)];
}

export async function obtenerClimaActual(
  lat = UBICACION_DEFECTO.lat,
  lon = UBICACION_DEFECTO.lon
) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      return { clima: null, error: "No se pudo obtener el clima." };
    }

    const datos = await respuesta.json();

    if (!datos?.current) {
      return { clima: null, error: "Respuesta de clima inválida." };
    }

    const temperatura = Math.round(datos.current.temperature_2m);
    const categoria = categorizarClima(datos.current.weather_code);

    return {
      clima: { temperatura, categoria },
      error: null,
    };
  } catch (error) {
    return { clima: null, error: error.message };
  }
}
