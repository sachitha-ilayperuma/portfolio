"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, Plus, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  fetchSkillCategories,
  updateCategory,
  addCategory,
  deleteCategory,
  type SkillCategory,
} from "@/lib/firebase/skill-categories"
import { Loader } from "@/components/ui/loader"
import { Badge } from "@/components/ui/badge"

export default function SkillCategoriesPage() {
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categoryToEdit, setCategoryToEdit] = useState<SkillCategory | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [categoryOrder, setCategoryOrder] = useState(1) // Default to 1
  const { toast } = useToast()

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await fetchSkillCategories()
        // Sort by order
        setCategories(categoriesData.sort((a, b) => a.order - b.order))
      } catch (error) {
        console.error("Error loading categories:", error)
        toast({
          title: "Error",
          description: "Failed to load skill categories",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [toast])

  const handleEditCategory = (category: SkillCategory) => {
    setCategoryToEdit(category)
    setCategoryName(category.name)
    setCategoryOrder(category.order)
    setIsDialogOpen(true)
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      await deleteCategory(categoryToDelete)
      setCategories(categories.filter((c) => c.id !== categoryToDelete))
      toast({
        title: "Success",
        description: "Category deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const confirmDelete = (categoryId: string) => {
    setCategoryToDelete(categoryId)
    setIsDeleteDialogOpen(true)
  }

  const handleAddOrUpdateCategory = async () => {
    try {
      let savedCategory: SkillCategory

      if (categoryToEdit) {
        // Update existing category
        savedCategory = await updateCategory(categoryToEdit.id, {
          name: categoryName,
          order: categoryOrder,
        })
        setCategories(
          categories.map((c) => (c.id === savedCategory.id ? savedCategory : c)).sort((a, b) => a.order - b.order),
        )
        toast({
          title: "Success",
          description: "Category updated successfully",
        })
      } else {
        // Add new category
        savedCategory = await addCategory({
          name: categoryName,
          order: categoryOrder,
        })
        setCategories([...categories, savedCategory].sort((a, b) => a.order - b.order))
        toast({
          title: "Success",
          description: "Category added successfully",
        })
      }

      setIsDialogOpen(false)
      setCategoryToEdit(null)
      setCategoryName("")
      setCategoryOrder(1)
    } catch (error) {
      console.error("Error saving category:", error)
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      })
    }
  }

  const handleMoveCategory = async (category: SkillCategory, direction: "up" | "down") => {
    try {
      // Find the category to swap with
      const sortedCategories = [...categories].sort((a, b) => a.order - b.order)
      const currentIndex = sortedCategories.findIndex((c) => c.id === category.id)

      // Can't move first category up or last category down
      if (
        (direction === "up" && currentIndex === 0) ||
        (direction === "down" && currentIndex === sortedCategories.length - 1)
      ) {
        return
      }

      // Get the adjacent category
      const adjacentIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
      const adjacentCategory = sortedCategories[adjacentIndex]

      // Swap orders
      const updatedCurrentCategory = await updateCategory(category.id, {
        ...category,
        order: adjacentCategory.order,
      })

      const updatedAdjacentCategory = await updateCategory(adjacentCategory.id, {
        ...adjacentCategory,
        order: category.order,
      })

      // Update state
      setCategories(
        categories
          .map((c) => {
            if (c.id === updatedCurrentCategory.id) return updatedCurrentCategory
            if (c.id === updatedAdjacentCategory.id) return updatedAdjacentCategory
            return c
          })
          .sort((a, b) => a.order - b.order),
      )

      toast({
        title: "Success",
        description: `Category moved ${direction}`,
      })
    } catch (error) {
      console.error(`Error moving category ${direction}:`, error)
      toast({
        title: "Error",
        description: `Failed to move category ${direction}`,
        variant: "destructive",
      })
    }
  }

  const handleOpenAddDialog = () => {
    setCategoryToEdit(null)
    setCategoryName("")
    setCategoryOrder(1)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <Loader />
  }

  // Get next available order number for new categories
  const getNextOrder = () => {
    if (categories.length === 0) return 1
    return Math.max(...categories.map((c) => c.order)) + 1
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Skill Categories</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{categoryToEdit ? "Edit Category" : "Add New Category"}</DialogTitle>
              <DialogDescription>
                {categoryToEdit ? "Update category details below" : "Fill in the details for your new category"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Frontend, Backend, DevOps"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={categoryOrder}
                  onChange={(e) => setCategoryOrder(Number(e.target.value))}
                  placeholder="Enter display order (lower numbers appear first)"
                />
                <p className="text-xs text-muted-foreground">
                  Categories with lower order numbers will appear first in the skills section.
                </p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddOrUpdateCategory}>{categoryToEdit ? "Update Category" : "Add Category"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>
            Order and manage your skill categories. Categories with lower order numbers will appear first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No categories yet. Click "Add Category" to create your first category.
              </p>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{category.name}</div>
                    <Badge variant="outline" className="ml-2">
                      Order: {category.order}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMoveCategory(category, "up")}
                      disabled={category.order <= 1}
                    >
                      <ArrowUp className="h-4 w-4" />
                      <span className="sr-only">Move up</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMoveCategory(category, "down")}
                      disabled={category.order >= getNextOrder() - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                      <span className="sr-only">Move down</span>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEditCategory(category)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive"
                      onClick={() => confirmDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
