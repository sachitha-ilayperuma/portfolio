import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db, checkFirebaseAvailability } from "@/lib/firebase/config"

const COLLECTION_NAME = "skills"

// Default skills data
const DEFAULT_SKILLS = [
  { id: "1", name: "JavaScript", category: "Frontend", icon: "Code", order: 1 },
  { id: "2", name: "React", category: "Frontend", icon: "Code", order: 2 },
  { id: "3", name: "TypeScript", category: "Frontend", icon: "Code", order: 3 },
  { id: "4", name: "HTML/CSS", category: "Frontend", icon: "Globe", order: 4 },
  { id: "5", name: "Node.js", category: "Backend", icon: "Server", order: 1 },
  { id: "6", name: "Express", category: "Backend", icon: "Server", order: 2 },
  { id: "7", name: "MongoDB", category: "Backend", icon: "Database", order: 3 },
  { id: "8", name: "PostgreSQL", category: "Backend", icon: "Database", order: 4 },
  { id: "9", name: "AWS", category: "DevOps & Cloud", icon: "Cloud", order: 1 },
  { id: "10", name: "Docker", category: "DevOps & Cloud", icon: "Layers", order: 2 },
  { id: "11", name: "Git", category: "Tools", icon: "GitBranch", order: 1 },
  { id: "12", name: "Agile Methodologies", category: "Soft Skills", icon: "Users", order: 1 },
]

export interface Skill {
  id: string
  name: string
  level?: number // Make level optional
  category: string
  icon?: string // Lucide icon name
  iconUrl?: string // Custom uploaded icon URL
  order?: number // Add order field for sorting
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
