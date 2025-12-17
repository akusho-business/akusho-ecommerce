"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Store, Bell, Shield } from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("store");
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [storeSettings, setStoreSettings] = useState({
    storeName: "AKUSHO",
    email: "business.akusho@gmail.com",
    phone: "",
    currency: "INR",
    taxRate: "18",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    orderNotifications: true,
    lowStockAlerts: true,
  });

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "store", name: "Store", icon: Store },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your store configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-purple-500 text-white"
                  : "text-gray-400 hover:bg-purple-500/10 hover:text-purple-400"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-akusho-dark border border-purple-500/20 rounded-xl p-6">
        {/* Store Tab */}
        {activeTab === "store" && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div>
              <label className="block text-gray-300 text-sm mb-2">Store Name</label>
              <input
                type="text"
                value={storeSettings.storeName}
                onChange={(e) =>
                  setStoreSettings({ ...storeSettings, storeName: e.target.value })
                }
                className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">Contact Email</label>
              <input
                type="email"
                value={storeSettings.email}
                onChange={(e) =>
                  setStoreSettings({ ...storeSettings, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">Phone Number</label>
              <input
                type="tel"
                value={storeSettings.phone}
                onChange={(e) =>
                  setStoreSettings({ ...storeSettings, phone: e.target.value })
                }
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Currency</label>
                <select
                  value={storeSettings.currency}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, currency: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  value={storeSettings.taxRate}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, taxRate: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-akusho-darker border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <label className="flex items-center justify-between p-4 bg-akusho-darker rounded-lg cursor-pointer">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-gray-500 text-sm">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailNotifications}
                onChange={(e) =>
                  setNotifications({ ...notifications, emailNotifications: e.target.checked })
                }
                className="w-5 h-5 rounded border-purple-500/30 bg-akusho-dark text-purple-500 focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-akusho-darker rounded-lg cursor-pointer">
              <div>
                <p className="text-white font-medium">Order Notifications</p>
                <p className="text-gray-500 text-sm">Get notified for new orders</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.orderNotifications}
                onChange={(e) =>
                  setNotifications({ ...notifications, orderNotifications: e.target.checked })
                }
                className="w-5 h-5 rounded border-purple-500/30 bg-akusho-dark text-purple-500 focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-akusho-darker rounded-lg cursor-pointer">
              <div>
                <p className="text-white font-medium">Low Stock Alerts</p>
                <p className="text-gray-500 text-sm">Alert when products are running low</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.lowStockAlerts}
                onChange={(e) =>
                  setNotifications({ ...notifications, lowStockAlerts: e.target.checked })
                }
                className="w-5 h-5 rounded border-purple-500/30 bg-akusho-dark text-purple-500 focus:ring-purple-500"
              />
            </label>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="p-4 bg-akusho-darker rounded-lg">
              <p className="text-white font-medium mb-2">Admin Access</p>
              <p className="text-gray-400 text-sm">
                Admin access is controlled through the <code className="text-purple-400">is_admin</code> field 
                in your Supabase profiles table. To grant admin access to a user, set their 
                <code className="text-purple-400"> is_admin</code> field to <code className="text-purple-400">true</code>.
              </p>
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-purple-400 font-medium mb-2">Current Admin</p>
              <p className="text-gray-400">business.akusho@gmail.com</p>
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex items-center gap-4">
          <motion.button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white font-heading rounded-lg hover:bg-purple-400 transition-colors disabled:opacity-50"
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
          {saved && (
            <motion.span
              className="text-green-400"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              ✓ Changes saved!
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}