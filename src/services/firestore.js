import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export const createDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const getAllDocuments = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const documents = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { documents, error: null };
  } catch (error) {
    return { documents: [], error: error.message };
  }
};

export const getDocumentById = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { document: { id: snapshot.id, ...snapshot.data() }, error: null };
    }
    return { document: null, error: "Documento no encontrado" };
  } catch (error) {
    return { document: null, error: error.message };
  }
};

export const updateDocument = async (collectionName, id, data) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const deleteDocument = async (collectionName, id) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const queryDocuments = async (collectionName, field, operator, value) => {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const snapshot = await getDocs(q);
    const documents = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { documents, error: null };
  } catch (error) {
    return { documents: [], error: error.message };
  }
};
