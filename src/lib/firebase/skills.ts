import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db, checkFirebaseAvailability } from "@/lib/firebase/config"

const COLLECTION_NAME = "skills"

// Default skills data
const DEFAULT_SKILLS = [
  { id: "1", name: "JavaScript", category: "Frontend" },
  { id: "2", name: "React", category: "Frontend" },
  { id: "3", name: "TypeScript", category: "Frontend" },
  { id: "4", name: "Node.js", category: "Backend" },
  { id: "5", name: "Express", category: "Backend" },
  { id: "6", name: "Firebase", category: "Backend" },
  { id: "7", name: "Git", category: "Tools" },
  { id: "8", name: "AWS", category: "DevOps & Cloud" },
  { id: "9", name: "Docker", category: "DevOps & Cloud" },
  { id: "10", name: "Agile Methodologies", category: "Soft Skills" },
]

export interface Skill {
  id: string
  name: string
  level?: number // Make level optional
  category: string
}

export async function fetchSkills(): Promise<Skill[]> {
  // Check if Firebase is available before attempting to fetch
  if (!checkFirebaseAvailability()) {
    console.log("Firebase is not available. Using default skills data.")
    return DEFAULT_SKILLS
  }

  try {
    const skillsCollection = collection(db, COLLECTION_NAME)
    const snapshot = await getDocs(skillsCollection)

    if (snapshot.empty) {
      // Return default skills if none exist
      return DEFAULT_SKILLS
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Skill[]
  } catch (error) {
    console.error("Error fetching skills:", error)
    // Return default skills if there's an error
    return DEFAULT_SKILLS
  }
}

export async function fetchSkill(id: string): Promise<Skill> {
  if (!checkFirebaseAvailability()) {
    throw new Error("Firebase is not available. Cannot fetch skill.")
  }

  try {
    const skillDoc = doc(db, COLLECTION_NAME, id)
    const snapshot = await getDoc(skillDoc)

    if (!snapshot.exists()) {
      throw new Error("Skill not found")
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Skill
  } catch (error) {
    console.error("Error fetching skill:", error)
    throw error
  }
}

export async function addSkill(skillData: Omit<Skill, "id">): Promise<Skill> {
  if (!checkFirebaseAvailability()) {
    throw new Error("Firebase is not available. Cannot add skill.")
  }

  try {
    const skillsCollection = collection(db, COLLECTION_NAME)
    const docRef = await addDoc(skillsCollection, skillData)

    return {
      id: docRef.id,
      ...skillData,
    }
  } catch (error) {
    console.error("Error adding skill:", error)
    throw error
  }
}

export async function updateSkill(id: string, skillData: Omit<Skill, "id">): Promise<Skill> {
  if (!checkFirebaseAvailability()) {
    throw new Error("Firebase is not available. Cannot update skill.")
  }

  try {
    const skillDoc = doc(db, COLLECTION_NAME, id)
    await updateDoc(skillDoc, skillData)

    return {
      id,
      ...skillData,
    }
  } catch (error) {
    console.error("Error updating skill:", error)
    throw error
  }
}

export async function deleteSkill(id: string): Promise<void> {
  if (!checkFirebaseAvailability()) {
    throw new Error("Firebase is not available. Cannot delete skill.")
  }

  try {
    const skillDoc = doc(db, COLLECTION_NAME, id)
    await deleteDoc(skillDoc)
  } catch (error) {
    console.error("Error deleting skill:", error)
    throw error
  }
}
