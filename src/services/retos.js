import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { sumarPuntos } from "./usuarios";

function fechaDeHoy() {
  return new Date().toISOString().split("T")[0];
}

export const obtenerCatalogoRetos = async () => {
  try {
    const snapshot = await getDocs(collection(db, "retosCatalogo"));
    const retos = snapshot.docs.map((d) => ({ retoId: d.id, ...d.data() }));
    return { retos, error: null };
  } catch (error) {
    return { retos: [], error: error.message };
  }
};

export const obtenerRetosDeHoy = async (uid) => {
  try {
    const { retos: catalogo, error: errorCatalogo } = await obtenerCatalogoRetos();
    if (errorCatalogo) return { retos: [], error: errorCatalogo };

    const fecha = fechaDeHoy();
    const retosConProgreso = [];

    for (const reto of catalogo) {
      const idDocumento = `${reto.retoId}_${fecha}`;
      const refDocumento = doc(db, "usuarios", uid, "retosActivos", idDocumento);
      const snapshot = await getDoc(refDocumento);

      if (snapshot.exists()) {
        retosConProgreso.push({ ...reto, ...snapshot.data(), idDocumento });
      } else {
        const progresoInicial = {
          retoId: reto.retoId,
          fecha,
          progresoActual: 0,
          completado: false,
        };
        await setDoc(refDocumento, progresoInicial);
        retosConProgreso.push({ ...reto, ...progresoInicial, idDocumento });
      }
    }

    return { retos: retosConProgreso, error: null };
  } catch (error) {
    return { retos: [], error: error.message };
  }
};

export const incrementarProgresoReto = async (uid, reto) => {
  try {
    if (reto.completado) {
      return { error: "Este reto ya fue completado hoy." };
    }

    const incremento = reto.incrementoUnidad ?? 1;
    const nuevoProgreso =
      reto.incrementoUnidad === null
        ? reto.metaValor 
        : Math.min(reto.progresoActual + incremento, reto.metaValor);

    const seAcabaDeCompletar = nuevoProgreso >= reto.metaValor;

    const refDocumento = doc(db, "usuarios", uid, "retosActivos", reto.idDocumento);
    await updateDoc(refDocumento, {
      progresoActual: nuevoProgreso,
      completado: seAcabaDeCompletar,
    });

    if (seAcabaDeCompletar) {
      await sumarPuntos(uid, reto.puntosOtorga);
    }

    return {
      progresoActual: nuevoProgreso,
      completado: seAcabaDeCompletar,
      error: null,
    };
  } catch (error) {
    return { error: error.message };
  }
};
