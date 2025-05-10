import { doc, getDoc, setDoc } from "firebase/firestore"
import { db, checkFirebaseAvailability } from "@/lib/firebase/config"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase/config"

const PROFILE_DOC_ID = "main"
const COLLECTION_NAME = "profile"

// Default profile data to use as fallback
const DEFAULT_PROFILE = {
  name: "John Doe",
  title: "Senior Software Engineer",
  bio: "Experienced software engineer with a passion for building innovative solutions.",
  email: "contact@example.com",
  phone: "+1 (234) 567-890",
  location: "San Francisco, CA",
  github: "https://github.com",
  linkedin: "https://linkedin.com",
  website: "https://example.com",
  imageUrl: "",
}

export interface Profile {
  name: string
  title: string
  bio: string
  email: string
  phone: string
  location: string
  github: string
  linkedin: string
  website: string
  imageUrl: string
}

export async function fetchProfile(): Promise<Profile> {
  // Check if Firebase is available before attempting to fetch
  if (!checkFirebaseAvailability()) {
    console.log("Firebase is not available. Using default profile data.")
    return DEFAULT_PROFILE
  }

  try {
    const profileDoc = doc(db, COLLECTION_NAME, PROFILE_DOC_ID)
    const snapshot = await getDoc(profileDoc)

    if (!snapshot.exists()) {
      // If no profile exists, return default data
      console.log("No profile document exists. Using default profile data.")
      return DEFAULT_PROFILE
    }

    return snapshot.data() as Profile
  } catch (error) {
    console.error("Error fetching profile:", error)
    // Return default profile if there's an error (offline, etc.)
    return DEFAULT_PROFILE
  }
}

export async function updateProfile(profileData: Profile): Promise<void> {
  if (!checkFirebaseAvailability()) {
    throw new Error("Firebase is not available. Cannot update profile.")
  }

  try {
    const profileDoc = doc(db, COLLECTION_NAME, PROFILE_DOC_ID)
    await setDoc(profileDoc, profileData)
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}

export async function uploadProfileImage(file: File): Promise<string> {
  if (!checkFirebaseAvailability()) {
    throw new Error("Firebase is not available. Cannot upload image.")
  }

  try {
    const storageRef = ref(storage, `profile/${Date.now()}_${file.name}`)
    const snapshot = await uploadBytes(storageRef, file)
    return getDownloadURL(snapshot.ref)
  } catch (error) {
    console.error("Error uploading profile image:", error)
    throw error
  }
}
