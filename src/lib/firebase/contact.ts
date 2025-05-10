import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

const COLLECTION_NAME = "messages"

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

export async function submitContactForm(formData: ContactForm): Promise<void> {
  const messagesCollection = collection(db, COLLECTION_NAME)
  await addDoc(messagesCollection, {
    ...formData,
    createdAt: new Date().toISOString(),
    read: false,
  })
}
