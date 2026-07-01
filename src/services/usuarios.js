import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { calcularNivel } from "./logros";

export const crearPerfilUsuario = async (uid, datos) => {
  try {
    await setDoc(doc(db, "usuarios", uid), {
      nombre: datos.nombre || "",
      correo: datos.correo || "",
      universidad: datos.universidad || "",
      fotoUrl: datos.fotoUrl || "",
      puntos: 0,
      nivel: 1,
      rachaDias: 0,
      retosCompletados: 0,
      creadoEn: serverTimestamp(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const obtenerPerfilUsuario = async (uid) => {
  try {
    const snapshot = await getDoc(doc(db, "usuarios", uid));
    if (snapshot.exists()) {
      return { perfil: { uid: snapshot.id, ...snapshot.data() }, error: null };
    }
    return { perfil: null, error: "Perfil no encontrado" };
  } catch (error) {
    return { perfil: null, error: error.message };
  }
};

export const actualizarPerfilUsuario = async (uid, cambios) => {
  try {
    await updateDoc(doc(db, "usuarios", uid), cambios);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const sumarPuntos = async (uid, puntosGanados) => {
  try {
    const { perfil, error } = await obtenerPerfilUsuario(uid);
    if (error) return { error };

    const nuevosPuntos = (perfil.puntos || 0) + puntosGanados;
    const { nivel: nuevoNivel } = calcularNivel(nuevosPuntos);

    await updateDoc(doc(db, "usuarios", uid), {
      puntos: nuevosPuntos,
      nivel: nuevoNivel,
      retosCompletados: (perfil.retosCompletados || 0) + 1,
    });

    return { puntos: nuevosPuntos, nivel: nuevoNivel, error: null };
  } catch (error) {
    return { error: error.message };
  }
};
