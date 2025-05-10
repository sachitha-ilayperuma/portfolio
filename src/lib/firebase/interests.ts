import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

const COLLECTION_NAME = "interests"

export interface Interest {
  id: string
  name: string
  description: string
  icon?: string
}

export async function fetchInterests(): Promise<Interest[]> {
  const interestsCollection = collection(db, COLLECTION_NAME)
  const snapshot = await getDocs(interestsCollection)

  if (snapshot.empty) {
    // Return default interests if none exist
    return [
      {
        id: "1",
        name: "Open Source",
        description: "Contributing to open source projects and communities.",
        icon: "🌐",
      },
      {
        id: "2",
        name: "Machine Learning",
        description: "Exploring AI and machine learning applications.",
        icon: "🤖",
      },
      {
        id: "3",
        name: "Photography",
        description: "Capturing moments and landscapes through photography.",
        icon: "📷",
      },
    ]
  }

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interest[]
}

export async function fetchInterest(id: string): Promise<Interest> {
  const interestDoc = doc(db, COLLECTION_NAME, id)
  const snapshot = await getDoc(interestDoc)

  if (!snapshot.exists()) {
    throw new Error("Interest not found")
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Interest
}

export async function addInterest(interestData: Omit<Interest, "id">): Promise<Interest> {
  const interestsCollection = collection(db, COLLECTION_NAME)
  const docRef = await addDoc(interestsCollection, interestData)

  return {
    id: docRef.id,
    ...interestData,
  }
}

export async function updateInterest(id: string, interestData: Omit<Interest, "id">): Promise<Interest> {
  const interestDoc = doc(db, COLLECTION_NAME, id)
  await updateDoc(interestDoc, interestData)

  return {
    id,
    ...interestData,
  }
}

export async function deleteInterest(id: string): Promise<void> {
  const interestDoc = doc(db, COLLECTION_NAME, id)
  await deleteDoc(interestDoc)
}
