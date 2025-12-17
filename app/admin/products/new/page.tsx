"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Save,
  X,
  ImageIcon,
  Upload,
  Star,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// Types
interface ProductImage {
  id: string;
  url: string;
  file?: File;
  isMain: boolean;
  isUploading?: boolean;
  label?: string;
}

const categories = [
  "Figures",
  "Plush",
  "Apparel",
  "Accessories",
  "Posters",
  "Keychains",
];

const imageLabels = ["Main", "Front", "Back", "Side", "Detail", "Box"];

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Multi-image state - IMPORTANT: Initialize as empty array, NOT undefined
  const [images, setImages] = useState<ProductImage[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "0",
    category: "",
    sku: "",
    is_active: true,
    is_featured: false,
    is_new: true,
  });

  // Generate unique ID for images
  const generateId = () => `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Handle multiple image selection
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not an image file`);
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is larger than 5MB`);
        continue;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      newImages.push({
        id: generateId(),
        url: previewUrl,
        file: file,
        isMain: images.length === 0 && newImages.length === 0, // First image is main
        isUploading: false,
      });
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
      setError("");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Add image from URL
  const [urlInput, setUrlInput] = useState("");
  const handleAddImageUrl = () => {
    if (!urlInput.trim()) return;

    // Basic URL validation
    try {
      new URL(urlInput);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    const newImage: ProductImage = {
      id: generateId(),
      url: urlInput.trim(),
      isMain: images.length === 0,
      isUploading: false,
    };

    setImages((prev) => [...prev, newImage]);
    setUrlInput("");
    setError("");
  };

  // Remove image
  const removeImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      // If removed image was main and there are other images, make first one main
      if (filtered.length > 0 && !filtered.some((img) => img.isMain)) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  // Set image as main
  const setAsMain = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isMain: img.id === id,
      }))
    );
  };

  // Set image label
  const setImageLabel = (id: string, label: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, label } : img
      )
    );
  };

  // Upload single image to Supabase Storage
  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err) {
      console.error("Upload failed:", err);
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Upload all images that have files
      const uploadedImages: { url: string; isMain: boolean; label?: string }[] = [];

      for (const img of images) {
        if (img.file) {
          // Update UI to show uploading
          setImages((prev) =>
            prev.map((i) =>
              i.id === img.id ? { ...i, isUploading: true } : i
            )
          );

          const uploadedUrl = await uploadImageToStorage(img.file);

          if (uploadedUrl) {
            uploadedImages.push({
              url: uploadedUrl,
              isMain: img.isMain,
              label: img.label,
            });
          } else {
            setError(`Failed to upload image: ${img.file.name}`);
            setIsLoading(false);
            return;
          }

          // Update UI to show uploaded
          setImages((prev) =>
            prev.map((i) =>
              i.id === img.id ? { ...i, isUploading: false, url: uploadedUrl } : i
            )
          );
        } else {
          // Image from URL, no upload needed
          uploadedImages.push({
            url: img.url,
            isMain: img.isMain,
            label: img.label,
          });
        }
      }

      // Get main image URL
      const mainImage = uploadedImages.find((img) => img.isMain);
      const mainImageUrl = mainImage?.url || uploadedImages[0]?.url || null;

      // Create product
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          stock: parseInt(formData.stock) || 0,
          category: formData.category || null,
          sku: formData.sku || null,
          image_url: mainImageUrl,
          images: uploadedImages, // Array of all images
          is_active: formData.is_active,
          is_featured: formData.is_featured,
          is_new: formData.is_new,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Product created successfully!");
        setTimeout(() => {
          router.push("/admin/products");
        }, 1500);
      } else {
        setError(data.error || "Failed to create product");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Safe access to images array - always returns valid data even if images is somehow undefined
  const mainImage = images?.find((img) => img.isMain) || null;
  const galleryImages = images?.filter((img) => !img.isMain) || [];

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <h1 className="font-heading text-3xl text-white">Add New Product</h1>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* Success */}
      {success && (
        <motion.div
          className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {success}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6">
          <h2 className="font-heading text-xl text-white mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            Product Images
          </h2>

          {/* Main Image Display */}
          {mainImage && (
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">
                Main Image
              </label>
              <div className="relative w-full h-72 bg-akusho-darker rounded-xl overflow-hidden group">
                <Image
                  src={mainImage.url}
                  alt="Main product image"
                  fill
                  className="object-contain"
                  unoptimized
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-purple-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    Main
                  </span>
                </div>
                {mainImage.isUploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                )}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => removeImage(mainImage.id)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Gallery Images */}
          {galleryImages.length > 0 && (
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">
                Gallery Images ({galleryImages.length})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {galleryImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square bg-akusho-darker rounded-lg overflow-hidden group"
                  >
                    <Image
                      src={img.url}
                      alt="Product image"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {img.isUploading && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAsMain(img.id)}
                        className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-400 transition-colors"
                        title="Set as main"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-400 transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {img.label && (
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-0.5 bg-black/60 text-white text-xs rounded">
                          {img.label}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-40 border-2 border-dashed border-purple-500/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
          >
            <Upload className="w-10 h-10 text-gray-500 mb-3" />
            <p className="text-gray-400 mb-1">Click to upload images</p>
            <p className="text-gray-500 text-sm">PNG, JPG, WEBP up to 5MB each</p>
            <p className="text-purple-400 text-sm mt-2">
              {images.length} image{images.length !== 1 ? "s" : ""} selected
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* URL Input */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-purple-500/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-akusho-dark text-gray-500">
                  OR add image URL
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-3 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6 space-y-6">
          <h2 className="font-heading text-xl text-white mb-4">
            Product Details
          </h2>

          {/* Name */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
              placeholder="Enter product description"
            />
          </div>

          {/* Price, Stock, SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Price (₹) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                min="0"
                className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="AKU-001"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 pt-4 border-t border-purple-500/20">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-5 h-5 rounded border-purple-500/30 bg-akusho-darker text-purple-500 focus:ring-purple-500"
              />
              <span className="text-gray-300">Active</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData({ ...formData, is_featured: e.target.checked })
                }
                className="w-5 h-5 rounded border-purple-500/30 bg-akusho-darker text-purple-500 focus:ring-purple-500"
              />
              <span className="text-gray-300">Featured</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_new}
                onChange={(e) =>
                  setFormData({ ...formData, is_new: e.target.checked })
                }
                className="w-5 h-5 rounded border-purple-500/30 bg-akusho-darker text-purple-500 focus:ring-purple-500"
              />
              <span className="text-gray-300">New Arrival</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Link href="/admin/products" className="flex-1">
            <button
              type="button"
              className="w-full py-3 border border-purple-500/30 text-gray-300 font-heading uppercase tracking-wider rounded-lg hover:bg-purple-500/10 transition-colors"
            >
              Cancel
            </button>
          </Link>
          <motion.button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 bg-purple-500 text-white font-heading uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 hover:bg-purple-400 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Product
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}