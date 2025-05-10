import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore"
import { db, checkFirebaseAvailability } from "@/lib/firebase/config"

const COLLECTION_NAME = "sections"

interface Section {
  id: string
  name: string
  visible: boolean
}

// Default sections to use as fallback
const DEFAULT_SECTIONS = [
  { id: "profile", name: "Profile", visible: true },
  { id: "projects", name: "Projects", visible: true },
  { id: "skills", name: "Skills", visible: true },
  { id: "experience", name: "Experience", visible: true },
  { id: "education", name: "Education", visible: true },
  { id: "interests", name: "Interests", visible: true },
  { id: "contact", name: "Contact", visible: true },
]

export async function fetchSectionVisibility(sectionId: string): Promise<boolean> {
  // Check if Firebase is available before attempting to fetch
  if (!checkFirebaseAvailability()) {
    console.log(`Firebase is not available. Assuming section ${sectionId} is visible.`)
    return true
  }

  try {
    const sectionDoc = doc(db, COLLECTION_NAME, sectionId)
    const snapshot = await getDoc(sectionDoc)

    if (!snapshot.exists()) {
      // Default to visible if section doesn't exist
      return true
    }

    return snapshot.data().visible
  } catch (error) {
    console.warn(`Error fetching visibility for section ${sectionId}:`, error)
    // Default to visible if there's an error
    return true
  }
}

export async function updateSectionVisibility(sectionId: string, visible: boolean): Promise<void> {
  if (!checkFirebaseAvailability()) {
    throw new Error("Firebase is not available. Cannot update section visibility.")
  }

  try {
    const sectionDoc = doc(db, COLLECTION_NAME, sectionId)
    await setDoc(sectionDoc, { visible, name: getSectionName(sectionId) }, { merge: true })
  } catch (error) {
    console.error(`Error updating visibility for section ${sectionId}:`, error)
    throw error
  }
}

export async function fetchVisibleSections(): Promise<Section[]> {
  // Check if Firebase is available before attempting to fetch
  if (!checkFirebaseAvailability()) {
    console.log("Firebase is not available. Using default sections data.")
    return DEFAULT_SECTIONS
  }

  try {
    const sectionsCollection = collection(db, COLLECTION_NAME)
    const snapshot = await getDocs(sectionsCollection)

    if (snapshot.empty) {
      // Return default sections if none exist
      return DEFAULT_SECTIONS
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Section[]
  } catch (error) {
    console.error("Error fetching sections:", error)
    // Return default sections if there's an error
    return DEFAULT_SECTIONS
  }
}

function getSectionName(sectionId: string): string {
  const sectionNames: Record<string, string> = {
    profile: "Profile",
    projects: "Projects",
    skills: "Skills",
    experience: "Experience",
    education: "Education",
    interests: "Interests",
    contact: "Contact",
  }

  return sectionNames[sectionId] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1)
}
