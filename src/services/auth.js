import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { crearPerfilUsuario } from "./usuarios";

export const registerUser = async (email, password, datosExtra = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const { error: errorPerfil } = await crearPerfilUsuario(
      userCredential.user.uid,
      { correo: email, ...datosExtra }
    );

    if (errorPerfil) {

      return { user: userCredential.user, error: `Cuenta creada, pero hubo un error guardando el perfil: ${errorPerfil}` };
    }

    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};


export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};
