import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, getDoc } from "firebase/firestore"
import { db, checkFirebaseAvailability } from "@/lib/firebase/config"

const COLLECTION_NAME = "projects"

// Default projects data
const DEFAULT_PROJECTS = [
  {
    id: "1",
    title: "E-commerce Platform",
    description: "A full-featured e-commerce platform with product management, shopping cart, and payment processing.",
    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    imageUrl: "/placeholder.svg?height=200&width=400",
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/example/ecommerce",
    // New fields for detailed view
    detailedDescription:
      "This e-commerce platform provides a complete solution for online stores, featuring product management, inventory tracking, shopping cart functionality, secure checkout with Stripe integration, and order management.",
    role: "Lead Developer",
    contribution:
      "As the lead developer, I was responsible for the overall architecture, frontend development using React, and integration with the Stripe payment gateway. I also implemented the shopping cart functionality and user authentication system.",
    additionalImages: [],
    features: [
      "User authentication and profile management",
      "Product catalog with search and filtering",
      "Shopping cart and checkout process",
      "Payment processing with Stripe",
      "Order tracking and history",
    ],
    challenges:
      "One of the main challenges was implementing a real-time inventory system that could handle high traffic and prevent overselling products.",
    duration: "6 months",
  },
  {
    id: "2",
    title: "Task Management App",
    description: "A productivity application for managing tasks, projects, and team collaboration.",
    technologies: ["Next.js", "TypeScript", "Firebase", "Tailwind CSS"],
    imageUrl: "/placeholder.svg?height=200&width=400",
    githubUrl: "https://github.com/example/taskmanager",
    // New fields for detailed view
    detailedDescription:
      "This task management application helps teams organize their work, track progress, and collaborate effectively. It features task creation, assignment, due dates, priority levels, and project grouping.",
    role: "Full Stack Developer",
    contribution:
      "I designed and implemented the entire application, including the frontend using Next.js and TypeScript, and the backend using Firebase. I also implemented real-time updates and notifications using Firebase's real-time database.",
    additionalImages: [],
    features: [
      "Task creation and assignment",
      "Project organization and grouping",
      "Due date and priority management",
      "Team collaboration and comments",
      "Real-time updates and notifications",
    ],
    challenges:
      "Implementing real-time updates across multiple clients while maintaining performance was a significant challenge.",
    duration: "4 months",
  },
]

export interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  imageUrl: string
  demoUrl?: string
  githubUrl?: string
  // New fields for detailed view
  detailedDescription?: string
  role?: string
  contribution?: string
  additionalImages?: string[]
  features?: string[]
  challenges?: string
  duration?: string
}

export async function fetchProjects(): Promise<Project[]> {
  // Check if Firebase is available before attempting to fetch
  if (!checkFirebaseAvailability()) {
    console.log("Firebase is not available. Using default projects data.")
    return DEFAULT_PROJECTS
  }

  try {
    const projectsCollection = collection(db, COLLECTION_NAME)
    const snapshot = await getDocs(projectsCollection)

    if (snapshot.empty) {
      // Return default projects if none exist
      return DEFAULT_PROJECTS
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[]
  } catch (error) {
    console.error("Error fetching projects:", error)
    // Return default projects if there's an error
    return DEFAULT_PROJECTS
  }
}

export async function fetchProject(id: string): Promise<Project> {
  if (!checkFirebaseAvailability()) {
    // Find the default project with the matching ID
    const defaultProject = DEFAULT_PROJECTS.find((project) => project.id === id)
    if (defaultProject) {
      return defaultProject
    }
    throw new Error("Project not found")
  }

  try {
    const projectDoc = doc(db, COLLECTION_NAME, id)
    const snapshot = await getDoc(projectDoc)

    if (!snapshot.exists()) {
      throw new Error("Project not found")
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Project
  } catch (error) {
    console.error("Error fetching project:", error)
    throw error
  }
}

export async function addProject(projectData: Omit<Project, "id">): Promise<Project> {
  if (!checkFirebaseAvailability()) {
    throw new Error("Firebase is not available. Cannot add project.")
  }

  try {
    const projectsCollection = collection(db, COLLECTION_NAME)
    const docRef = await addDoc(projectsCollection, projectData)

    return {
      id: docRef.id,
      ...projectData,
    }
  } catch (error) {
    console.error("Error adding project:", error)
    throw error
  }
}

export async function updateProject(id: string, projectData: Omit<Project, "id">): Promise<Project> {
  if (!checkFirebaseAvailability()) {
    throw new Error("Firebase is not available. Cannot update project.")
  }

  try {
    const projectDoc = doc(db, COLLECTION_NAME, id)
    await updateDoc(projectDoc, projectData)

    return {
      id,
      ...projectData,
    }
  } catch (error) {
    console.error("Error updating project:", error)
    throw error
  }
}

export async function deleteProject(id: string): Promise<void> {
  if (!checkFirebaseAvailability()) {
    throw new Error("Firebase is not available. Cannot delete project.")
  }

  try {
    const projectDoc = doc(db, COLLECTION_NAME, id)
    await deleteDoc(projectDoc)
  } catch (error) {
    console.error("Error deleting project:", error)
    throw error
  }
}
