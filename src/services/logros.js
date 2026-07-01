import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const XP_POR_NIVEL = 200;

export function calcularNivel(puntosTotal) {
  const nivel = Math.floor(puntosTotal / XP_POR_NIVEL) + 1;
  const xpEnNivelActual = puntosTotal % XP_POR_NIVEL;
  const xpNecesarioParaSiguiente = XP_POR_NIVEL;

  return {
    nivel,
    xpActual: xpEnNivelActual,
    xpNecesario: xpNecesarioParaSiguiente,
    xpTotal: puntosTotal,
  };
}

async function calcularRachaPorCategoria(uid, categoria) {
  const refSubcoleccion = collection(db, "usuarios", uid, "retosActivos");
  const snapshot = await getDocs(refSubcoleccion);
  const registros = snapshot.docs
    .map((d) => d.data())
    .filter((r) => r.categoria === categoria && r.completado);

  const fechasCompletadas = new Set(registros.map((r) => r.fecha));

  let racha = 0;
  for (let i = 0; i < 365; i++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    const fechaTexto = fecha.toISOString().split("T")[0];

    if (fechasCompletadas.has(fechaTexto)) {
      racha++;
    } else {
      break;
    }
  }

  return racha;
}

export const obtenerInsigniasConEstado = async (uid, perfil) => {
  try {
    const snapshotCatalogo = await getDocs(collection(db, "insigniasCatalogo"));
    const catalogo = snapshotCatalogo.docs.map((d) => ({
      insigniaId: d.id,
      ...d.data(),
    }));

    const insigniasEvaluadas = [];

    for (const insignia of catalogo) {
      let progresoActual = 0;
      let desbloqueada = false;

      if (insignia.pendienteImplementar) {
        progresoActual = 0;
        desbloqueada = false;
      } else if (insignia.criterioTipo === "retosCompletados") {
        progresoActual = perfil?.retosCompletados ?? 0;
        desbloqueada = progresoActual >= insignia.criterioValor;
      } else if (insignia.criterioTipo === "rachaDias") {
        progresoActual = perfil?.rachaDias ?? 0;
        desbloqueada = progresoActual >= insignia.criterioValor;
      } else if (insignia.criterioTipo === "categoriaRachaDias") {
        progresoActual = await calcularRachaPorCategoria(uid, insignia.criterioCategoria);
        desbloqueada = progresoActual >= insignia.criterioValor;
      } else if (insignia.criterioTipo === "puntos") {
        progresoActual = perfil?.puntos ?? 0;
        desbloqueada = progresoActual >= insignia.criterioValor;
      }

      insigniasEvaluadas.push({ ...insignia, progresoActual, desbloqueada });
    }

    return { insignias: insigniasEvaluadas, error: null };
  } catch (error) {
    return { insignias: [], error: error.message };
  }
};
