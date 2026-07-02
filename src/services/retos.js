import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { sumarPuntos, actualizarPerfilUsuario } from "./usuarios";
import { crearNotificacion } from "./notificaciones";
import { calcularRachaGlobal } from "./logros";
import { fechaLocalTexto } from "../utils/fecha";

function fechaDeHoy() {
  return fechaLocalTexto();
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

export const obtenerRetosPersonalizados = async (uid) => {
  try {
    const snapshot = await getDocs(
      collection(db, "usuarios", uid, "retosPersonalizados")
    );
    const retos = snapshot.docs.map((d) => ({
      retoId: d.id,
      personalizado: true,
      ...d.data(),
    }));
    return { retos, error: null };
  } catch (error) {
    return { retos: [], error: error.message };
  }
};

export const crearRetoPersonalizado = async (uid, datos) => {
  try {
    const refDocumento = doc(collection(db, "usuarios", uid, "retosPersonalizados"));
    await setDoc(refDocumento, {
      titulo: datos.titulo,
      categoria: datos.categoria,
      metaValor: datos.metaValor,
      unidad: datos.unidad,
      incrementoUnidad: datos.incrementoUnidad,
      puntosOtorga: 0,
      creadoEn: serverTimestamp(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const eliminarRetoPersonalizado = async (uid, retoId) => {
  try {
    await deleteDoc(doc(db, "usuarios", uid, "retosPersonalizados", retoId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const obtenerRetosDeHoy = async (uid) => {
  try {
    const { retos: catalogo, error: errorCatalogo } = await obtenerCatalogoRetos();
    if (errorCatalogo) return { retos: [], error: errorCatalogo };

    const { retos: personalizados, error: errorPersonalizados } =
      await obtenerRetosPersonalizados(uid);
    if (errorPersonalizados) return { retos: [], error: errorPersonalizados };

    const fecha = fechaDeHoy();
    const retosConProgreso = [];

    for (const reto of [...catalogo, ...personalizados]) {
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

      const nuevaRacha = await calcularRachaGlobal(uid);
      await actualizarPerfilUsuario(uid, { rachaDias: nuevaRacha });

      await crearNotificacion(uid, {
        titulo: "¡Reto completado!",
        descripcion:
          reto.puntosOtorga > 0
            ? `Completaste "${reto.titulo}" y ganaste +${reto.puntosOtorga} puntos.`
            : `Completaste "${reto.titulo}".`,
      });
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
