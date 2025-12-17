"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Save,
  X,
  ImageIcon,
  Upload,
  Star,
  Plus,
  Trash2,
  Package,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  const [images, setImages] = useState<ProductImage[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "0",
    category: "",
    sku: "",
    is_active: true,
    is_featured: false,
    is_new: false,
  });

  // Fetch product on mount
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("No product ID");
        setIsFetching(false);
        return;
      }

      try {
        setDebugInfo(`Fetching /api/products/${productId}...`);
        
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();

        setDebugInfo(`Response: ${JSON.stringify(data).slice(0, 200)}...`);

        if (!res.ok) {
          setError(`API Error: ${data.error || res.statusText}`);
          return;
        }

        if (!data.product) {
          setError("No product in response");
          return;
        }

        const product = data.product;

        // Set form data
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          stock: product.stock?.toString() || "0",
          category: product.category || "",
          sku: product.sku || "",
          is_active: product.is_active ?? true,
          is_featured: product.is_featured ?? false,
          is_new: product.is_new ?? false,
        });

        // Set images
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          setImages(
            product.images.map((img: any, index: number) => ({
              id: `existing_${index}`,
              url: typeof img === "string" ? img : img.url,
              isMain: img.isMain ?? index === 0,
              label: img.label,
            }))
          );
        } else if (product.image_url) {
          setImages([
            {
              id: "main_image",
              url: product.image_url,
              isMain: true,
            },
          ]);
        }

        setError("");
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(`Fetch failed: ${err.message}`);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const generateId = () => `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      newImages.push({
        id: generateId(),
        url: previewUrl,
        file: file,
        isMain: images.length === 0 && i === 0,
      });
    }

    setImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) return;
    if (!imageUrl.startsWith("http")) {
      alert("Please enter a valid URL");
      return;
    }

    setImages((prev) => [
      ...prev,
      {
        id: generateId(),
        url: imageUrl.trim(),
        isMain: prev.length === 0,
      },
    ]);
    setImageUrl("");
  };

  const handleSetMainImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isMain: img.id === id,
      }))
    );
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.isMain)) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from("products")
        .upload(filePath, file);

      if (error) {
        console.error("Upload error:", error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Upload new images
      const uploadedImages: ProductImage[] = [];

      for (const img of images) {
        if (img.file) {
          setImages((prev) =>
            prev.map((i) => (i.id === img.id ? { ...i, isUploading: true } : i))
          );

          const uploadedUrl = await uploadImageToStorage(img.file);

          if (uploadedUrl) {
            uploadedImages.push({
              id: img.id,
              url: uploadedUrl,
              isMain: img.isMain,
              label: img.label,
            });
          }

          setImages((prev) =>
            prev.map((i) =>
              i.id === img.id ? { ...i, isUploading: false, url: uploadedUrl || i.url } : i
            )
          );
        } else {
          uploadedImages.push({
            id: img.id,
            url: img.url,
            isMain: img.isMain,
            label: img.label,
          });
        }
      }

      const mainImage = uploadedImages.find((img) => img.isMain);
      const mainImageUrl = mainImage?.url || uploadedImages[0]?.url || "";

      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          stock: parseInt(formData.stock) || 0,
          image_url: mainImageUrl,
          images: uploadedImages.map((img) => ({
            url: img.url,
            isMain: img.isMain,
            label: img.label,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update");
      }

      setSuccess("Product updated successfully!");
      setTimeout(() => router.push("/admin/products"), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  const mainImage = images.find((img) => img.isMain);
  const galleryImages = images.filter((img) => !img.isMain);

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        <p className="text-gray-400">Loading product...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <h1 className="font-heading text-3xl text-white">Edit Product</h1>
        <p className="text-gray-400">ID: {productId}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images Section */}
        <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6">
          <h2 className="font-heading text-xl text-white mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            Product Images
          </h2>

          {/* Main Image Display */}
          {mainImage && (
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">Main Image</p>
              <div className="relative w-full h-72 bg-akusho-darker rounded-xl overflow-hidden">
                <Image
                  src={mainImage.url}
                  alt="Main product"
                  fill
                  className="object-contain p-4"
                  unoptimized
                />
                {mainImage.isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
                <div className="absolute top-2 left-2 px-2 py-1 bg-purple-500 text-white text-xs rounded">
                  Main
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(mainImage.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Gallery Images */}
          {galleryImages.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">Additional Images</p>
              <div className="grid grid-cols-4 gap-4">
                {galleryImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square bg-akusho-darker rounded-lg overflow-hidden group"
                  >
                    <Image
                      src={img.url}
                      alt="Product"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {img.isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleSetMainImage(img.id)}
                        className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-400"
                        title="Set as main"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-400"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
          >
            <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Click to upload images</p>
            <p className="text-gray-500 text-sm">PNG, JPG, WEBP up to 5MB each</p>
            <p className="text-purple-400 text-sm mt-2">{images.length} images total</p>
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
            <p className="text-gray-500 text-sm text-center mb-2">OR add image URL</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-400"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6">
          <h2 className="font-heading text-xl text-white mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            Product Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-gray-300 text-sm mb-2">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-gray-300 text-sm mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 resize-none"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Price (₹) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500"
                required
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                min="0"
                className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* SKU */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-purple-500/20">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-purple-500/30 bg-akusho-darker text-purple-500 focus:ring-purple-500"
              />
              <span className="text-gray-300">Active</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-5 h-5 rounded border-purple-500/30 bg-akusho-darker text-purple-500 focus:ring-purple-500"
              />
              <span className="text-gray-300">Featured</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_new}
                onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                className="w-5 h-5 rounded border-purple-500/30 bg-akusho-darker text-purple-500 focus:ring-purple-500"
              />
              <span className="text-gray-300">New Arrival</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/products">
            <button
              type="button"
              className="px-6 py-3 border border-purple-500/30 text-white rounded-lg hover:bg-purple-500/10"
            >
              Cancel
            </button>
          </Link>
          <motion.button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-purple-500 text-white font-heading rounded-lg flex items-center gap-2 hover:bg-purple-400 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Changes
          </motion.button>
        </div>
      </form>
    </div>
  );
}