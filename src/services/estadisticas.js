import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const DIAS_SEMANA = ["D", "L", "M", "X", "J", "V", "S"]; 

function ultimasFechas(n) {
  const fechas = [];
  for (let i = n - 1; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    fechas.push(fecha.toISOString().split("T")[0]);
  }
  return fechas;
}

async function obtenerHistorialUltimaSemana(uid) {
  const fechas = ultimasFechas(7);
  const refSubcoleccion = collection(db, "usuarios", uid, "retosActivos");
  const q = query(refSubcoleccion, where("fecha", "in", fechas));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data());
}

export const obtenerCumplimientoSemanal = async (uid) => {
  try {
    const fechas = ultimasFechas(7);
    const historial = await obtenerHistorialUltimaSemana(uid);

    const porcentajePorDia = fechas.map((fecha) => {
      const retosDelDia = historial.filter((r) => r.fecha === fecha);
      if (retosDelDia.length === 0) return { fecha, porcentaje: 0 };

      const completados = retosDelDia.filter((r) => r.completado).length;
      const porcentaje = Math.round((completados / retosDelDia.length) * 100);
      return { fecha, porcentaje };
    });

    const promedio = Math.round(
      porcentajePorDia.reduce((suma, d) => suma + d.porcentaje, 0) /
        porcentajePorDia.length
    );

    const mejorDia = porcentajePorDia.reduce(
      (mejor, actual) => (actual.porcentaje > mejor.porcentaje ? actual : mejor),
      porcentajePorDia[0]
    );

    const nombreMejorDia = DIAS_SEMANA[new Date(mejorDia.fecha + "T00:00:00").getDay()];

    return {
      porcentajePorDia: porcentajePorDia.map((d) => ({
        ...d,
        diaLetra: DIAS_SEMANA[new Date(d.fecha + "T00:00:00").getDay()],
      })),
      promedio,
      mejorDia: { nombre: nombreMejorDia, porcentaje: mejorDia.porcentaje },
      error: null,
    };
  } catch (error) {
    return { porcentajePorDia: [], promedio: 0, mejorDia: null, error: error.message };
  }
};

export const obtenerEstadisticasPorCategoria = async (uid) => {
  try {
    const historial = await obtenerHistorialUltimaSemana(uid);
    const fechas = ultimasFechas(7);

    const categorias = {};
    for (const registro of historial) {
      if (!registro.categoria) continue;
      if (!categorias[registro.categoria]) categorias[registro.categoria] = [];
      categorias[registro.categoria].push(registro);
    }

    const resultado = Object.entries(categorias).map(([categoria, registros]) => {
      const promedioGeneral =
        registros.reduce((suma, r) => suma + (r.progresoActual || 0), 0) /
        registros.length;

      const fechasRecientes = fechas.slice(-3);
      const fechasAnteriores = fechas.slice(0, 3);

      const registrosRecientes = registros.filter((r) =>
        fechasRecientes.includes(r.fecha)
      );
      const registrosAnteriores = registros.filter((r) =>
        fechasAnteriores.includes(r.fecha)
      );

      const promedioReciente = registrosRecientes.length
        ? registrosRecientes.reduce((s, r) => s + (r.progresoActual || 0), 0) /
          registrosRecientes.length
        : 0;
      const promedioAnterior = registrosAnteriores.length
        ? registrosAnteriores.reduce((s, r) => s + (r.progresoActual || 0), 0) /
          registrosAnteriores.length
        : 0;

      let tendenciaPorcentaje = 0;
      if (promedioAnterior > 0) {
        tendenciaPorcentaje = Math.round(
          ((promedioReciente - promedioAnterior) / promedioAnterior) * 100
        );
      } else if (promedioReciente > 0) {
        tendenciaPorcentaje = 100;
      }

      return {
        categoria,
        promedio: Math.round(promedioGeneral * 10) / 10,
        unidad: registros[0]?.unidad || "",
        tendenciaPorcentaje,
      };
    });

    return { categorias: resultado, error: null };
  } catch (error) {
    return { categorias: [], error: error.message };
  }
};
