"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save,
  X,
  Loader2,
  Package,
  DollarSign,
  Tag,
  FileText,
  Layers,
  Hash,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import ProductImageUpload, { ProductImage } from "./ProductImageUpload";

interface ProductFormData {
  name: string;
  description: string;
  price: number | string;
  compare_price: number | string;
  category: string;
  sku: string;
  stock: number | string;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
}

interface ProductFormProps {
  productId?: number;
  initialData?: Partial<ProductFormData> & { images?: string[] };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const INITIAL_FORM_DATA: ProductFormData = {
  name: "",
  description: "",
  price: "",
  compare_price: "",
  category: "",
  sku: "",
  stock: "",
  is_active: true,
  is_featured: false,
  is_new: true,
};

export default function ProductForm({
  productId,
  initialData,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!productId;

  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM_DATA);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price || "",
        compare_price: initialData.compare_price || "",
        category: initialData.category || "",
        sku: initialData.sku || "",
        stock: initialData.stock ?? "",
        is_active: initialData.is_active ?? true,
        is_featured: initialData.is_featured ?? false,
        is_new: initialData.is_new ?? true,
      });

      // Initialize images from existing data
      if (initialData.images && initialData.images.length > 0) {
        const existingImages: ProductImage[] = initialData.images.map((url, index) => ({
          id: `existing_${index}`,
          url,
          isMain: index === 0,
          label: index === 0 ? "Main" : undefined,
        }));
        setImages(existingImages);
      }
    }
  }, [initialData]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories?active=true");
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle toggle switches
  const handleToggle = (field: keyof ProductFormData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (formData.compare_price && Number(formData.compare_price) <= Number(formData.price)) {
      newErrors.compare_price = "Compare price should be higher than sale price";
    }

    if (images.length === 0) {
      newErrors.images = "At least one product image is required";
    }

    if (formData.stock !== "" && Number(formData.stock) < 0) {
      newErrors.stock = "Stock cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSaving(true);

    try {
      // Prepare image URLs (main image first)
      const mainImage = images.find((img) => img.isMain);
      const otherImages = images.filter((img) => !img.isMain);
      const imageUrls = [
        mainImage?.url,
        ...otherImages.map((img) => img.url),
      ].filter(Boolean);

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        compare_price: formData.compare_price ? Number(formData.compare_price) : null,
        category: formData.category || null,
        sku: formData.sku.trim() || null,
        stock: formData.stock !== "" ? Number(formData.stock) : 0,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        is_new: formData.is_new,
        image_url: imageUrls[0] || null, // Main image for backwards compatibility
        images: imageUrls, // All images array
      };

      const url = isEditing ? `/api/products/${productId}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success(isEditing ? "Product updated successfully!" : "Product created successfully!");
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/products");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Product Images */}
      <div className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl p-6">
        <ProductImageUpload
          images={images}
          onChange={setImages}
          maxImages={8}
          bucketName="products"
          folderPath="images"
        />
        {errors.images && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.images}
          </p>
        )}
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl p-6">
        <h3 className="text-lg font-heading text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-500" />
          Basic Information
        </h3>

        <div className="space-y-5">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Monkey D. Luffy Gear 5 Figure"
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-akusho-darker border rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                errors.name
                  ? "border-red-500"
                  : "border-gray-200 dark:border-purple-500/20"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your product in detail..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Layers className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl p-6">
        <h3 className="text-lg font-heading text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-500" />
          Pricing
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sale Price (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-akusho-darker border rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.price
                    ? "border-red-500"
                    : "border-gray-200 dark:border-purple-500/20"
                }`}
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          {/* Compare Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Compare Price (₹)
              <span className="text-gray-400 text-xs ml-1">(Original price for showing discount)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                name="compare_price"
                value={formData.compare_price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-akusho-darker border rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.compare_price
                    ? "border-red-500"
                    : "border-gray-200 dark:border-purple-500/20"
                }`}
              />
            </div>
            {errors.compare_price && (
              <p className="mt-1 text-sm text-red-500">{errors.compare_price}</p>
            )}
          </div>
        </div>

        {/* Discount Preview */}
        {formData.price && formData.compare_price && Number(formData.compare_price) > Number(formData.price) && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-400">
              💰 Discount: {Math.round((1 - Number(formData.price) / Number(formData.compare_price)) * 100)}% off
              <span className="text-green-600 dark:text-green-500 ml-2">
                (Save ₹{(Number(formData.compare_price) - Number(formData.price)).toFixed(2)})
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Inventory */}
      <div className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl p-6">
        <h3 className="text-lg font-heading text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Hash className="w-5 h-5 text-purple-500" />
          Inventory
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SKU (Stock Keeping Unit)
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g., AKU-OP-LUFFY-G5-001"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-darker border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              min="0"
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-akusho-darker border rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                errors.stock
                  ? "border-red-500"
                  : "border-gray-200 dark:border-purple-500/20"
              }`}
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-500">{errors.stock}</p>
            )}
          </div>
        </div>
      </div>

      {/* Status & Visibility */}
      <div className="bg-white dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-xl p-6">
        <h3 className="text-lg font-heading text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Tag className="w-5 h-5 text-purple-500" />
          Status & Visibility
        </h3>

        <div className="space-y-4">
          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-akusho-darker rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Active</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Product is visible on the storefront
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("is_active")}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                formData.is_active ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <motion.div
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ left: formData.is_active ? "calc(100% - 28px)" : "4px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-akusho-darker rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Featured
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Show in featured section on homepage
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("is_featured")}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                formData.is_featured ? "bg-yellow-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <motion.div
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ left: formData.is_featured ? "calc(100% - 28px)" : "4px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* New Badge Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-akusho-darker rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">New Arrival</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Display &quot;NEW&quot; badge on product
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("is_new")}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                formData.is_new ? "bg-purple-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <motion.div
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ left: formData.is_new ? "calc(100% - 28px)" : "4px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <button
          type="button"
          onClick={onCancel || (() => router.push("/admin/products"))}
          className="px-6 py-3 border border-gray-300 dark:border-purple-500/30 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-purple-500/10 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3 bg-purple-500 text-white font-heading rounded-lg hover:bg-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isEditing ? "Update Product" : "Create Product"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}