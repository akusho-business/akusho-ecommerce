"use client";

import { motion } from "framer-motion";
import { Target, Heart, Shield, Sparkles } from "lucide-react";
import { SectionHeader, NeonText, Button } from "@/components";

const values = [
  {
    icon: Shield,
    title: "Authenticity",
    description:
      "Every piece in our collection is 100% genuine, sourced directly from official manufacturers.",
  },
  {
    icon: Heart,
    title: "Passion",
    description:
      "We're anime fans first. Our love for the art drives everything we do.",
  },
  {
    icon: Sparkles,
    title: "Quality",
    description:
      "We handpick only the finest collectibles that meet our exacting standards.",
  },
  {
    icon: Target,
    title: "Community",
    description:
      "Building a global community of collectors who share our passion for anime.",
  },
];

const stats = [
  { value: "10K+", label: "Happy Collectors" },
  { value: "500+", label: "Products" },
  { value: "50+", label: "Anime Series" },
  { value: "99%", label: "Satisfaction" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-akusho-deepest pt-24">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Glow Effects - dark mode only */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-transparent dark:bg-akusho-neon/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-transparent dark:bg-akusho-neonDark/30 blur-[150px] rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 mb-6 text-sm font-body text-purple-600 dark:text-akusho-neon border border-purple-300 dark:border-akusho-neon/50 rounded-full">
              Our Story
            </span>
            <NeonText as="h1" className="text-4xl md:text-6xl lg:text-7xl mb-6">
              THE AKUSHO STORY
            </NeonText>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Born from a deep love for anime culture, AKUSHO was created to bring
              the most premium collectibles to fans worldwide. We believe every
              figure tells a story, and we're here to help you build yours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white dark:bg-akusho-darker">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image Placeholder */}
            <motion.div
              className="relative aspect-square bg-gray-100 dark:bg-akusho-dark rounded-lg overflow-hidden border border-gray-200 dark:border-purple-500/20 dark:glow-border"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 dark:from-akusho-neon/10 to-transparent flex items-center justify-center">
                <span className="font-heading text-6xl text-purple-300 dark:text-akusho-neon/20">悪所</span>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-3xl md:text-4xl text-gray-900 dark:text-white mb-6">
                From Fans, For Fans
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  AKUSHO started in 2020 with a simple mission: make authentic anime
                  collectibles accessible to everyone. As lifelong anime enthusiasts,
                  we understood the frustration of finding quality products.
                </p>
                <p>
                  Today, we've grown into a community of over 10,000 collectors worldwide,
                  united by our shared passion for anime culture. Every figure we sell is
                  handpicked by our team of experts who share the same excitement you do.
                </p>
                <p>
                  The name AKUSHO (悪所) represents our rebellious spirit — breaking the
                  mold of traditional retail and creating something extraordinary for
                  our community.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50 dark:bg-akusho-deepest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Our Values"
            subtitle="The principles that guide everything we do."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className="text-center p-8 bg-white dark:bg-akusho-dark rounded-lg border border-gray-200 dark:border-purple-500/20 dark:glow-border"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-akusho-neon/10 rounded-full mb-6">
                  <value.icon className="w-8 h-8 text-purple-600 dark:text-akusho-neon" />
                </div>
                <h3 className="font-heading text-xl text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-akusho-darker">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <span className="font-heading text-5xl md:text-6xl text-purple-600 dark:text-akusho-neon dark:neon-text">
                  {stat.value}
                </span>
                <span className="block text-gray-500 dark:text-gray-400 mt-2">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-akusho-deepest">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl text-gray-900 dark:text-white mb-6">
              Ready to Join the Family?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Explore our collection and find your next prized possession.
            </p>
            <Button href="/shop" size="lg">
              Explore Collection
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}