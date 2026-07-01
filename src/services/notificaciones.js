import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export const crearNotificacion = async (uid, { titulo, descripcion }) => {
  try {
    await addDoc(collection(db, "usuarios", uid, "notificaciones"), {
      titulo,
      descripcion,
      fecha: serverTimestamp(),
      leida: false,
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const obtenerNotificaciones = async (uid) => {
  try {
    const refColeccion = collection(db, "usuarios", uid, "notificaciones");
    const q = query(refColeccion, orderBy("fecha", "desc"));
    const snapshot = await getDocs(q);
    const notificaciones = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    return { notificaciones, error: null };
  } catch (error) {
    return { notificaciones: [], error: error.message };
  }
};

export const marcarTodasLeidas = async (uid) => {
  try {
    const refColeccion = collection(db, "usuarios", uid, "notificaciones");
    const snapshot = await getDocs(refColeccion);
    const lote = writeBatch(db);
    snapshot.docs.forEach((d) => {
      if (!d.data().leida) {
        lote.update(d.ref, { leida: true });
      }
    });
    await lote.commit();
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const eliminarNotificacion = async (uid, notificacionId) => {
  try {
    await deleteDoc(doc(db, "usuarios", uid, "notificaciones", notificacionId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export function formatearTiempoRelativo(fecha) {
  if (!fecha) return "";
  const fechaJs = fecha.toDate ? fecha.toDate() : new Date(fecha);
  const ahora = new Date();
  const diffMin = Math.floor((ahora - fechaJs) / 60000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;

  const diffHoras = Math.floor(diffMin / 60);
  if (diffHoras < 24) return `Hace ${diffHoras} ${diffHoras === 1 ? "hora" : "horas"}`;

  const diffDias = Math.floor(diffHoras / 24);
  if (diffDias === 1) return "Ayer";
  if (diffDias < 7) return `Hace ${diffDias} días`;

  return fechaJs.toLocaleDateString("es-ES");
}
