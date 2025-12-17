"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, FolderOpen, Save, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  product_count?: number;
  created_at?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/categories");
      const data = await res.json();
      
      if (data.categories) {
        setCategories(data.categories);
      } else if (data.error) {
        toast.error("Failed to load categories");
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategory.trim(),
          slug: generateSlug(newCategory),
          description: newDescription.trim() || null,
          is_active: true,
        }),
      });

      const data = await res.json();

      if (data.category) {
        setCategories([...categories, data.category]);
        setNewCategory("");
        setNewDescription("");
        setIsAdding(false);
        toast.success("Category created successfully");
      } else {
        toast.error(data.error || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (!editName.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          slug: generateSlug(editName),
          description: editDescription.trim() || null,
        }),
      });

      const data = await res.json();

      if (data.category) {
        setCategories(
          categories.map((cat) => (cat.id === id ? data.category : cat))
        );
        setEditingId(null);
        setEditName("");
        setEditDescription("");
        toast.success("Category updated successfully");
      } else {
        toast.error(data.error || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setCategories(categories.filter((cat) => cat.id !== id));
        setDeleteId(null);
        toast.success("Category deleted successfully");
      } else {
        toast.error(data.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading categories...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl text-gray-900 dark:text-white mb-2">Categories</h1>
          <p className="text-gray-500 dark:text-gray-400">Organize your products into categories</p>
        </div>
        {!isAdding && (
          <motion.button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white font-heading rounded-lg hover:bg-purple-400 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            Add Category
          </motion.button>
        )}
      </div>

      {/* Add New Category Form */}
      {isAdding && (
        <motion.div
          className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl p-6 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-heading text-lg text-gray-900 dark:text-white mb-4">New Category</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g., Figures, Apparel, Accessories"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Description (optional)
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Brief description of this category"
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Category
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewCategory("");
                  setNewDescription("");
                }}
                className="px-6 py-2 border border-gray-300 dark:border-purple-500/30 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-purple-500/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Categories List */}
      <div className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="font-heading text-xl text-gray-900 dark:text-white mb-2">No categories</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Add your first category to get started</p>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-6 py-3 bg-purple-500 text-white font-heading rounded-lg hover:bg-purple-400 transition-colors"
              >
                Add First Category
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-purple-500/10">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                layout
                className="p-4 hover:bg-gray-50 dark:hover:bg-purple-500/5 transition-colors"
              >
                {editingId === category.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      autoFocus
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description (optional)"
                      rows={2}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(category.id)}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 border border-gray-300 dark:border-purple-500/30 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-purple-500/10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">{category.name}</p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm">/{category.slug}</p>
                        {category.description && (
                          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 dark:text-gray-500 text-sm">
                        {category.product_count || 0} products
                      </span>
                      <button
                        onClick={() => startEdit(category)}
                        className="p-2 text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(category.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl p-6 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-heading text-xl text-gray-900 dark:text-white">Delete Category?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Products in this category will not be deleted, but they will no longer be assigned to this category.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-purple-500/30 text-gray-700 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-purple-500/10"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}