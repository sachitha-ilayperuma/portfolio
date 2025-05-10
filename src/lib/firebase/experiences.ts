import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

const COLLECTION_NAME = "experiences"

export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string | null
  description: string
  location: string
}

export async function fetchExperiences(): Promise<Experience[]> {
  const experiencesCollection = collection(db, COLLECTION_NAME)
  const snapshot = await getDocs(experiencesCollection)

  if (snapshot.empty) {
    // Return default experiences if none exist
    return [
      {
        id: "1",
        company: "Tech Innovators",
        position: "Senior Software Engineer",
        startDate: "2020-01-01",
        endDate: null,
        description: "Leading development of cloud-based solutions using React, Node.js, and AWS.",
        location: "San Francisco, CA",
      },
      {
        id: "2",
        company: "Digital Solutions Inc.",
        position: "Software Engineer",
        startDate: "2017-03-15",
        endDate: "2019-12-31",
        description: "Developed and maintained web applications using React and Express.",
        location: "Seattle, WA",
      },
    ]
  }

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Experience[]
}

export async function fetchExperience(id: string): Promise<Experience> {
  const experienceDoc = doc(db, COLLECTION_NAME, id)
  const snapshot = await getDoc(experienceDoc)

  if (!snapshot.exists()) {
    throw new Error("Experience not found")
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Experience
}

export async function addExperience(experienceData: Omit<Experience, "id">): Promise<Experience> {
  const experiencesCollection = collection(db, COLLECTION_NAME)
  const docRef = await addDoc(experiencesCollection, experienceData)

  return {
    id: docRef.id,
    ...experienceData,
  }
}

export async function updateExperience(id: string, experienceData: Omit<Experience, "id">): Promise<Experience> {
  const experienceDoc = doc(db, COLLECTION_NAME, id)
  await updateDoc(experienceDoc, experienceData)

  return {
    id,
    ...experienceData,
  }
}

export async function deleteExperience(id: string): Promise<void> {
  const experienceDoc = doc(db, COLLECTION_NAME, id)
  await deleteDoc(experienceDoc)
}
