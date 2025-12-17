"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  is_active: boolean;
  image_url?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?active=false");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      setProducts(products.filter((p) => p.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl text-white mb-2">Products</h1>
          <p className="text-gray-400">Manage your product inventory</p>
        </div>
        <Link href="/admin/products/new">
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white font-heading rounded-lg hover:bg-purple-400 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            Add Product
          </motion.button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-akusho-dark border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        />
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="font-heading text-xl text-white mb-2">No products found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery ? "Try a different search term" : "Start by adding your first product"}
          </p>
          {!searchQuery && (
            <Link href="/admin/products/new">
              <button className="px-6 py-3 bg-purple-500 text-white font-heading rounded-lg hover:bg-purple-400 transition-colors">
                Add First Product
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-akusho-dark border border-purple-500/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left p-4 text-gray-400 font-medium">Product</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Category</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Price</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Stock</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-purple-500/10 hover:bg-purple-500/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Product Image */}
                        <div className="relative w-12 h-12 bg-akusho-darker rounded-lg overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-purple-500/20">
                              <Package className="w-6 h-6 text-purple-400" />
                            </div>
                          )}
                        </div>
                        <span className="text-white font-medium line-clamp-2">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400">{product.category || "Uncategorized"}</td>
                    <td className="p-4 text-white">₹{product.price?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`${product.stock > 10 ? "text-green-400" : product.stock > 0 ? "text-yellow-400" : "text-red-400"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${product.is_active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                        {product.is_active ? "Active" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <button className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="font-heading text-xl text-white mb-2">Delete Product?</h3>
            <p className="text-gray-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-purple-500/30 text-white rounded-lg hover:bg-purple-500/10"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}