"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Upload,
  X,
  Star,
  Image as ImageIcon,
  GripVertical,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
  label?: string;
  file?: File;
  uploading?: boolean;
  error?: string;
}

interface ProductImageUploadProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxImages?: number;
  bucketName?: string;
  folderPath?: string;
}

const IMAGE_LABELS = [
  "Main",
  "Front",
  "Back",
  "Left Side",
  "Right Side",
  "Detail",
  "Box/Packaging",
  "Size Reference",
];

export default function ProductImageUpload({
  images,
  onChange,
  maxImages = 8,
  bucketName = "products",
  folderPath = "images",
}: ProductImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate unique ID
  const generateId = () => `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Upload image to Supabase Storage
  const uploadToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${folderPath}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  // Handle file selection
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remainingSlots = maxImages - images.length;

      if (fileArray.length > remainingSlots) {
        alert(`You can only add ${remainingSlots} more image(s). Maximum is ${maxImages}.`);
        return;
      }

      // Validate files
      const validFiles = fileArray.filter((file) => {
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} is not an image file.`);
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 5MB.`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // Create preview images with uploading state
      const newImages: ProductImage[] = validFiles.map((file, index) => ({
        id: generateId(),
        url: URL.createObjectURL(file),
        isMain: images.length === 0 && index === 0,
        label: IMAGE_LABELS[images.length + index] || undefined,
        file,
        uploading: true,
      }));

      // Add to state immediately for preview
      const updatedImages = [...images, ...newImages];
      onChange(updatedImages);
      setUploadingCount(validFiles.length);

      // Upload each file
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i];
        const file = validFiles[i];

        const uploadedUrl = await uploadToSupabase(file);

        // Update the image with the uploaded URL or error
        const finalImages = updatedImages.map((img) => {
          if (img.id === image.id) {
            if (uploadedUrl) {
              // Revoke the blob URL and use the uploaded URL
              URL.revokeObjectURL(img.url);
              return {
                ...img,
                url: uploadedUrl,
                uploading: false,
                file: undefined,
              };
            } else {
              return {
                ...img,
                uploading: false,
                error: "Upload failed",
              };
            }
          }
          return img;
        });

        onChange(finalImages);
        // Update updatedImages for next iteration
        updatedImages.splice(0, updatedImages.length, ...finalImages);
      }

      setUploadingCount(0);
    },
    [images, maxImages, onChange, bucketName, folderPath]
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  // Set main image
  const setMainImage = (id: string) => {
    const updated = images.map((img) => ({
      ...img,
      isMain: img.id === id,
    }));
    onChange(updated);
  };

  // Remove image
  const removeImage = async (id: string) => {
    const imageToRemove = images.find((img) => img.id === id);
    
    // If it's a blob URL, revoke it
    if (imageToRemove?.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    // Remove from Supabase Storage if it's an uploaded file
    if (imageToRemove?.url.includes(bucketName)) {
      try {
        const urlParts = imageToRemove.url.split(`${bucketName}/`);
        if (urlParts[1]) {
          await supabase.storage.from(bucketName).remove([urlParts[1]]);
        }
      } catch (error) {
        console.error("Error deleting from storage:", error);
      }
    }

    const filtered = images.filter((img) => img.id !== id);
    
    // If we removed the main image, set the first remaining as main
    if (imageToRemove?.isMain && filtered.length > 0) {
      filtered[0].isMain = true;
    }
    
    onChange(filtered);
  };

  // Update image label
  const updateLabel = (id: string, label: string) => {
    const updated = images.map((img) =>
      img.id === id ? { ...img, label } : img
    );
    onChange(updated);
  };

  // Handle reorder
  const handleReorder = (reorderedImages: ProductImage[]) => {
    onChange(reorderedImages);
  };

  const mainImage = images.find((img) => img.isMain);
  const galleryImages = images.filter((img) => !img.isMain);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-heading text-gray-900 dark:text-white">
            Product Images
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add up to {maxImages} images. First image will be the main product image.
          </p>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Main Image + Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Image Display */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Star className="w-4 h-4 text-yellow-500" />
            Main Product Image
          </label>
          
          {mainImage ? (
            <div className="relative aspect-square bg-gray-100 dark:bg-akusho-dark rounded-xl overflow-hidden border-2 border-purple-500/50">
              <img
                src={mainImage.url}
                alt="Main product"
                className="w-full h-full object-contain"
              />
              {mainImage.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              {mainImage.error && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <div className="text-center text-white">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{mainImage.error}</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => removeImage(mainImage.id)}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <span className="text-white text-sm font-medium flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  Main Image
                </span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square bg-gray-100 dark:bg-akusho-dark rounded-xl border-2 border-dashed border-gray-300 dark:border-purple-500/30 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
            >
              <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Click to upload main image
              </p>
            </div>
          )}
        </div>

        {/* Drop Zone */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload Images
          </label>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center ${
              isDragging
                ? "border-purple-500 bg-purple-500/10"
                : "border-gray-300 dark:border-purple-500/30 bg-gray-50 dark:bg-akusho-dark hover:border-purple-500 dark:hover:border-purple-500"
            }`}
          >
            {uploadingCount > 0 ? (
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Uploading {uploadingCount} image(s)...
                </p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">
                  Drag & drop images here
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  or click to browse
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-3">
                  PNG, JPG, WEBP up to 5MB each
                </p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* Gallery Images */}
      {galleryImages.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Additional Images ({galleryImages.length})
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Drag to reorder. Click the star to set as main image.
          </p>

          <Reorder.Group
            axis="x"
            values={galleryImages}
            onReorder={(newOrder) => {
              const newImages = mainImage ? [mainImage, ...newOrder] : newOrder;
              handleReorder(newImages);
            }}
            className="flex flex-wrap gap-4"
          >
            {galleryImages.map((image, index) => (
              <Reorder.Item
                key={image.id}
                value={image}
                className="relative"
              >
                <motion.div
                  layout
                  className="relative w-32 h-32 bg-gray-100 dark:bg-akusho-dark rounded-xl overflow-hidden border border-gray-200 dark:border-purple-500/20 group cursor-grab active:cursor-grabbing"
                >
                  <img
                    src={image.url}
                    alt={image.label || `Product image ${index + 2}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Uploading/Error overlay */}
                  {image.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                  {image.error && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                    {/* Drag handle */}
                    <div className="absolute top-1 left-1 p-1 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-4 h-4 text-white" />
                    </div>

                    {/* Actions */}
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMainImage(image.id);
                        }}
                        className="p-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-400 transition-colors"
                        title="Set as main image"
                      >
                        <Star className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(image.id);
                        }}
                        className="p-1.5 bg-red-500 text-white rounded hover:bg-red-400 transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Label */}
                  {image.label && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                      <p className="text-white text-xs truncate">{image.label}</p>
                    </div>
                  )}
                </motion.div>
              </Reorder.Item>
            ))}

            {/* Add more button */}
            {images.length < maxImages && (
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-purple-500/30 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:border-purple-500 hover:text-purple-500 dark:hover:border-purple-500 dark:hover:text-purple-400 transition-colors"
              >
                <Plus className="w-8 h-8 mb-1" />
                <span className="text-xs">Add Image</span>
              </motion.button>
            )}
          </Reorder.Group>
        </div>
      )}

      {/* Image Labels Editor */}
      {images.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Image Labels (Optional)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={image.id} className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-akusho-dark">
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <select
                  value={image.label || ""}
                  onChange={(e) => updateLabel(image.id, e.target.value)}
                  className="flex-1 text-sm px-2 py-1.5 bg-gray-50 dark:bg-akusho-dark border border-gray-200 dark:border-purple-500/20 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="">No label</option>
                  {IMAGE_LABELS.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl p-4">
        <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
          📸 Image Tips
        </h4>
        <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
          <li>• Use high-quality images with white or transparent backgrounds</li>
          <li>• Show the product from multiple angles (front, back, sides)</li>
          <li>• Include detail shots of important features</li>
          <li>• Add a size reference image if applicable</li>
          <li>• Recommended size: 1000x1000px or larger</li>
        </ul>
      </div>
    </div>
  );
}