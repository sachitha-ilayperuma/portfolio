import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

const COLLECTION_NAME = "education"

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string | null
  description: string
  location: string
  logoUrl?: string
}

export async function fetchEducation(): Promise<Education[]> {
  const educationCollection = collection(db, COLLECTION_NAME)
  const snapshot = await getDocs(educationCollection)

  if (snapshot.empty) {
    // Return default education if none exist
    return [
      {
        id: "1",
        institution: "Stanford University",
        degree: "Master of Science",
        field: "Computer Science",
        startDate: "2015-09-01",
        endDate: "2017-06-30",
        description: "Specialized in Artificial Intelligence and Machine Learning.",
        location: "Stanford, CA",
      },
      {
        id: "2",
        institution: "University of Washington",
        degree: "Bachelor of Science",
        field: "Computer Engineering",
        startDate: "2011-09-01",
        endDate: "2015-06-30",
        description: "Graduated with honors. Participated in various hackathons and coding competitions.",
        location: "Seattle, WA",
      },
    ]
  }

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Education[]
}

export async function fetchEducationItem(id: string): Promise<Education> {
  const educationDoc = doc(db, COLLECTION_NAME, id)
  const snapshot = await getDoc(educationDoc)

  if (!snapshot.exists()) {
    throw new Error("Education not found")
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Education
}

export async function addEducation(educationData: Omit<Education, "id">): Promise<Education> {
  const educationCollection = collection(db, COLLECTION_NAME)
  const docRef = await addDoc(educationCollection, educationData)

  return {
    id: docRef.id,
    ...educationData,
  }
}

export async function updateEducation(id: string, educationData: Omit<Education, "id">): Promise<Education> {
  const educationDoc = doc(db, COLLECTION_NAME, id)
  await updateDoc(educationDoc, educationData)

  return {
    id,
    ...educationData,
  }
}

export async function deleteEducation(id: string): Promise<void> {
  const educationDoc = doc(db, COLLECTION_NAME, id)
  await deleteDoc(educationDoc)
}
