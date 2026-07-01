import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export const invitarAmigo = async (usuario1_uid, usuario2_uid) => {
  try {
    const existente = await verificarAmistad(usuario1_uid, usuario2_uid);
    if (existente) {
      return { error: "Ya existe una solicitud o amistad con este usuario." };
    }

    const refAmistades = collection(db, "amistades");
    const nuevoDoc = await addDoc(refAmistades, {
      usuario1_uid,
      usuario2_uid,
      estado: "pendiente",
      fecha_solicitud: new Date().toISOString(),
      fecha_aceptacion: null,
    });

    return { id: nuevoDoc.id, error: null };
  } catch (error) {
    return { error: error.message };
  }
};

const verificarAmistad = async (uid1, uid2) => {
  try {
    const refAmistades = collection(db, "amistades");
    const q = query(
      refAmistades,
      where("usuario1_uid", "in", [uid1, uid2]),
      where("usuario2_uid", "in", [uid1, uid2])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0;
  } catch (_error) {
    return false;
  }
};

export const obtenerAmigos = async (uid) => {
  try {
    const refAmistades = collection(db, "amistades");
    const [comoUsuario1, comoUsuario2] = await Promise.all([
      getDocs(
        query(
          refAmistades,
          where("usuario1_uid", "==", uid),
          where("estado", "==", "aceptada")
        )
      ),
      getDocs(
        query(
          refAmistades,
          where("usuario2_uid", "==", uid),
          where("estado", "==", "aceptada")
        )
      ),
    ]);

    const docsAmistad = [...comoUsuario1.docs, ...comoUsuario2.docs];

    const amigos = [];
    for (const docAmistad of docsAmistad) {
      const data = docAmistad.data();
      const amigoUid = data.usuario1_uid === uid ? data.usuario2_uid : data.usuario1_uid;
      const amigoData = await obtenerDatosUsuario(amigoUid);
      amigos.push({
        id: docAmistad.id,
        uid: amigoUid,
        nombre: amigoData?.nombre || "Usuario",
        puntos: amigoData?.puntos || 0,
      });
    }

    amigos.sort((a, b) => b.puntos - a.puntos);
    return { amigos, error: null };
  } catch (error) {
    return { amigos: [], error: error.message };
  }
};

export const obtenerSolicitudesPendientes = async (uid) => {
  try {
    const refAmistades = collection(db, "amistades");
    const q = query(
      refAmistades,
      where("usuario2_uid", "==", uid),
      where("estado", "==", "pendiente")
    );
    const snapshot = await getDocs(q);

    const solicitudes = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const solicitanteData = await obtenerDatosUsuario(data.usuario1_uid);
      solicitudes.push({
        id: doc.id,
        usuario1_uid: data.usuario1_uid,
        nombre: solicitanteData?.nombre || "Usuario",
        puntos: solicitanteData?.puntos || 0,
      });
    }

    return { solicitudes, error: null };
  } catch (error) {
    return { solicitudes: [], error: error.message };
  }
};

export const obtenerRanking = async (uid_actual) => {
  try {
    const refUsuarios = collection(db, "usuarios");
    const snapshot = await getDocs(refUsuarios);

    const usuarios = [];
    for (const doc of snapshot.docs) {
      if (doc.id !== uid_actual) {
        usuarios.push({
          uid: doc.id,
          nombre: doc.data().nombre || "Usuario",
          puntos: doc.data().puntos || 0,
        });
      }
    }

    usuarios.sort((a, b) => b.puntos - a.puntos);
    return { usuarios, error: null };
  } catch (error) {
    return { usuarios: [], error: error.message };
  }
};

export const buscarUsuarios = async (textoBusqueda, uid_actual) => {
  try {
    if (!textoBusqueda.trim()) {
      return { usuarios: [], error: null };
    }

    const refUsuarios = collection(db, "usuarios");
    const snapshot = await getDocs(refUsuarios);

    const usuariosFiltrados = [];
    for (const doc of snapshot.docs) {
      if (doc.id !== uid_actual) {
        const nombre = (doc.data().nombre || "Usuario").toLowerCase();
        if (nombre.includes(textoBusqueda.toLowerCase())) {
          usuariosFiltrados.push({
            uid: doc.id,
            nombre: doc.data().nombre || "Usuario",
            puntos: doc.data().puntos || 0,
          });
        }
      }
    }

    usuariosFiltrados.sort((a, b) => b.puntos - a.puntos);
    return { usuarios: usuariosFiltrados, error: null };
  } catch (error) {
    return { usuarios: [], error: error.message };
  }
};

export const aceptarSolicitud = async (amistadId) => {
  try {
    const refAmistad = doc(db, "amistades", amistadId);
    await updateDoc(refAmistad, {
      estado: "aceptada",
      fecha_aceptacion: new Date().toISOString(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const rechazarSolicitud = async (amistadId) => {
  try {
    const refAmistad = doc(db, "amistades", amistadId);
    await updateDoc(refAmistad, {
      estado: "rechazada",
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const eliminarAmigo = async (amistadId) => {
  try {
    const refAmistad = doc(db, "amistades", amistadId);
    await deleteDoc(refAmistad);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

const obtenerDatosUsuario = async (uid) => {
  try {
    const refUsuario = doc(db, "usuarios", uid);
    const snapshot = await getDoc(refUsuario);
    return snapshot.exists() ? snapshot.data() : null;
  } catch (_error) {
    return null;
  }
};
