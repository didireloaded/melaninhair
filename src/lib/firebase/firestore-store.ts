import type { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "./admin";

function row<T>(snapshot: QueryDocumentSnapshot<DocumentData>): T {
  return { id: snapshot.id, ...snapshot.data() } as T;
}

export async function allDocuments<T>(collectionName: string): Promise<T[]> {
  const snapshot = await getFirebaseAdminFirestore().collection(collectionName).get();
  return snapshot.docs.map((document) => row<T>(document));
}

export async function oneDocument<T>(collectionName: string, id: string): Promise<T | null> {
  const snapshot = await getFirebaseAdminFirestore().collection(collectionName).doc(id).get();
  return snapshot.exists ? ({ id: snapshot.id, ...snapshot.data() } as T) : null;
}
