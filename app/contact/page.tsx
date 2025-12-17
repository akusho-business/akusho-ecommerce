"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Instagram, Twitter, Youtube } from "lucide-react";
import { SectionHeader, NeonText, Button } from "@/components";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "hello@akusho.com",
    href: "mailto:hello@akusho.com",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Tokyo, Japan",
    href: "#",
  },
];

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-akusho-deepest pt-24">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-transparent dark:bg-akusho-neon/20 blur-[150px] rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <NeonText as="h1" className="text-4xl md:text-6xl mb-6">
              GET IN TOUCH
            </NeonText>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Have a question or just want to say hi? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 bg-white dark:bg-akusho-darker">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl text-gray-900 dark:text-white mb-8">
                Send us a Message
              </h2>

              {submitted ? (
                <motion.div
                  className="p-8 bg-gray-50 dark:bg-akusho-dark rounded-lg border border-gray-200 dark:border-purple-500/20 dark:glow-border text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-16 h-16 bg-purple-100 dark:bg-akusho-neon/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-purple-600 dark:text-akusho-neon" />
                  </div>
                  <h3 className="font-heading text-xl text-gray-900 dark:text-white mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Thanks for reaching out. We'll get back to you soon.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-dark border border-gray-200 dark:border-akusho-neon/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 dark:focus:border-akusho-neon transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-dark border border-gray-200 dark:border-akusho-neon/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 dark:focus:border-akusho-neon transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-dark border border-gray-200 dark:border-akusho-neon/30 rounded-lg text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-akusho-neon transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Support</option>
                      <option value="returns">Returns & Refunds</option>
                      <option value="wholesale">Wholesale Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-akusho-dark border border-gray-200 dark:border-akusho-neon/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 dark:focus:border-akusho-neon transition-colors resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          className="w-5 h-5 border-2 border-white dark:border-akusho-deepest border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="w-5 h-5" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl text-gray-900 dark:text-white mb-8">
                Contact Information
              </h2>

              <div className="space-y-6 mb-12">
                {contactInfo.map((info, index) => (
                  <motion.a
                    key={info.title}
                    href={info.href}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-akusho-dark rounded-lg border border-gray-200 dark:border-purple-500/20 dark:glow-border group hover:bg-purple-50 dark:hover:bg-akusho-neon/10 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-12 h-12 bg-purple-100 dark:bg-akusho-neon/20 rounded-full flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-akusho-neon/30 transition-colors">
                      <info.icon className="w-6 h-6 text-purple-600 dark:text-akusho-neon" />
                    </div>
                    <div>
                      <span className="block text-gray-500 dark:text-gray-400 text-sm">
                        {info.title}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">{info.value}</span>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Social Links */}
              <div>
                <h3 className="font-heading text-xl text-gray-900 dark:text-white mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  {socialLinks.map(({ icon: Icon, href, label }) => (
                    <motion.a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-gray-50 dark:bg-akusho-dark rounded-lg text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-akusho-neon hover:bg-purple-50 dark:hover:bg-akusho-neon/10 transition-colors border border-gray-200 dark:border-purple-500/20 dark:glow-border"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={label}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* FAQ Prompt */}
              <div className="mt-12 p-6 bg-gray-100 dark:bg-akusho-deepest rounded-lg border border-gray-200 dark:border-akusho-neon/20">
                <h3 className="font-heading text-xl text-gray-900 dark:text-white mb-2">
                  Looking for Quick Answers?
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Check out our FAQ section for common questions about orders,
                  shipping, and more.
                </p>
                <Button href="/faq" variant="outline" size="sm">
                  View FAQs
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}