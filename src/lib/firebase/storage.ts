import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase/config"

export async function uploadProfileImage(file: File): Promise<string> {
  const storageRef = ref(storage, `profile/${Date.now()}_${file.name}`)
  const snapshot = await uploadBytes(storageRef, file)
  return getDownloadURL(snapshot.ref)
}

export async function uploadProjectImage(file: File): Promise<string> {
  const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`)
  const snapshot = await uploadBytes(storageRef, file)
  return getDownloadURL(snapshot.ref)
}

export async function uploadEducationLogo(file: File): Promise<string> {
  const storageRef = ref(storage, `education/${Date.now()}_${file.name}`)
  const snapshot = await uploadBytes(storageRef, file)
  return getDownloadURL(snapshot.ref)
}

export async function uploadAdditionalProjectImage(file: File): Promise<string> {
  const storageRef = ref(storage, `projects/additional/${Date.now()}_${file.name}`)
  const snapshot = await uploadBytes(storageRef, file)
  return getDownloadURL(snapshot.ref)
}

export async function uploadSkillIcon(file: File): Promise<string> {
  const storageRef = ref(storage, `skills/icons/${Date.now()}_${file.name}`)
  const snapshot = await uploadBytes(storageRef, file)
  return getDownloadURL(snapshot.ref)
}
