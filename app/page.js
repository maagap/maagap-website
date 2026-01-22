'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-red-800 to-blue-900 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('/images/hero-pattern.png')] opacity-10"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8 flex justify-center"
          >
            <Image
              src="/images/maagap-logo.png"
              alt="MAAGAP Logo"
              width={200}
              height={200}
              className="drop-shadow-2xl"
            />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            MAAGAP Kuwait
          </h1>
          
          <p className="text-2xl md:text-3xl text-yellow-300 mb-4 font-semibold">
            Multigeneration of Active Apostolic Guardians
          </p>
          
          <p className="text-xl md:text-2xl text-yellow-300 mb-8">
            Association of the Philippines
          </p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-white mb-12 italic font-light"
          >
            "THE TRUTH STILL STAND"
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              href="/register"
              className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Join MAAGAP Family
            </Link>
            
            <Link
              href="/about"
              className="bg-white hover:bg-gray-100 text-blue-900 font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Learn More
            </Link>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">Our Mission</h2>
            <div className="h-1 w-24 bg-red-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-700 leading-relaxed">
              MAAGAP is dedicated to fostering unity, faith, and service among Filipino families in Kuwait. 
              We are committed to upholding Christian values, promoting spiritual growth, and building a 
              strong community that supports one another in faith and fellowship.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-red-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-blue-900 mb-16">
            What We Offer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-red-800">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Join Our Community?
            </h2>
            <p className="text-xl text-yellow-300 mb-8 max-w-2xl mx-auto">
              Become part of the MAAGAP family and experience fellowship, faith, and service.
            </p>
            <Link
              href="/register"
              className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg inline-block"
            >
              Register Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: '🙏',
    title: 'Spiritual Growth',
    description: 'Regular prayer meetings, bible studies, and spiritual enrichment programs to deepen your faith.'
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Family Fellowship',
    description: 'Build lasting relationships with fellow Filipino families in Kuwait through our community activities.'
  },
  {
    icon: '🤝',
    title: 'Community Service',
    description: 'Engage in meaningful outreach programs and charitable activities that make a difference.'
  },
  {
    icon: '📚',
    title: 'Educational Programs',
    description: 'Access workshops, seminars, and training sessions for personal and spiritual development.'
  },
  {
    icon: '🎉',
    title: 'Events & Activities',
    description: 'Participate in celebrations, gatherings, and cultural events that bring our community together.'
  },
  {
    icon: '💪',
    title: 'Support Network',
    description: 'Find support and encouragement from a caring community during life\'s challenges and triumphs.'
  }
];
