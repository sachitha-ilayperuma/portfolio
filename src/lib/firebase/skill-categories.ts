import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore"
import { db, checkFirebaseAvailability } from "@/lib/firebase/config"

const COLLECTION_NAME = "skillCategories"

// Default categories data with ordering
const DEFAULT_CATEGORIES = [
  { id: "frontend", name: "Frontend", order: 1 },
  { id: "backend", name: "Backend", order: 2 },
  { id: "devops", name: "DevOps & Cloud", order: 3 },
  { id: "tools", name: "Tools", order: 4 },
  { id: "softskills", name: "Soft Skills", order: 5 },
  { id: "other", name: "Other", order: 6 },
]

export interface SkillCategory {
  id: string
  name: string
  order: number
}

export async function fetchSkillCategories(): Promise<SkillCategory[]> {
  // Check if Firebase is available before attempting to fetch
  if (!checkFirebaseAvailability()) {
    console.log("Firebase is not available. Using default categories data.")
    return DEFAULT_CATEGORIES
  }

  try {
    const categoriesCollection = collection(db, COLLECTION_NAME)
    const snapshot = await getDocs(categoriesCollection)

    if (snapshot.empty) {
      // If no categories exist, create the default ones
      try {
        await Promise.all(
          DEFAULT_CATEGORIES.map(async (category) => {
            await setDoc(doc(db, COLLECTION_NAME, category.id), {
              name: category.name,
              order: category.order,
            })
          }),
        )
        return DEFAULT_CATEGORIES
      } catch (error) {
        console.error("Error creating default categories:", error)
        return DEFAULT_CATEGORIES
      }
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SkillCategory[]
  } catch (error) {
    console.error("Error fetching skill categories:", error)
    // Return default categories if there's an error
    return DEFAULT_CATEGORIES
  }
}

export async function updateCategoryOrder(id: string, order: number): Promise<void> {
  if (!checkFirebaseAvailability()) {
    throw new Error("Firebase is not available. Cannot update category order.")
  }

  try {
    const categoryDoc = doc(db, COLLECTION_NAME, id)
    await updateDoc(categoryDoc, { order })
  } catch (error) {
    console.error("Error updating category order:", error)
    throw error
  }
}

export async function addCategory(categoryData: Omit<SkillCategory, "id">): Promise<SkillCategory> {
  if (!checkFirebaseAvailability()) {
    throw new Error("Firebase is not available. Cannot add category.")
  }

  try {
    const categoriesCollection = collection(db, COLLECTION_NAME)
    const docRef = await addDoc(categoriesCollection, categoryData)

    return {
      id: docRef.id,
      ...categoryData,
    }
  } catch (error) {
    console.error("Error adding category:", error)
    throw error
  }
}

export async function updateCategory(id: string, categoryData: Omit<SkillCategory, "id">): Promise<SkillCategory> {
  if (!checkFirebaseAvailability()) {
    throw new Error("Firebase is not available. Cannot update category.")
  }

  try {
    const categoryDoc = doc(db, COLLECTION_NAME, id)
    await updateDoc(categoryDoc, categoryData)

    return {
      id,
      ...categoryData,
    }
  } catch (error) {
    console.error("Error updating category:", error)
    throw error
  }
}

export async function deleteCategory(id: string): Promise<void> {
  if (!checkFirebaseAvailability()) {
    throw new Error("Firebase is not available. Cannot delete category.")
  }

  try {
    const categoryDoc = doc(db, COLLECTION_NAME, id)
    await deleteDoc(categoryDoc)
  } catch (error) {
    console.error("Error deleting category:", error)
    throw error
  }
}
