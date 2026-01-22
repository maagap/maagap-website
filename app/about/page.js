'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-red-800 p-8 text-center">
              <h1 className="text-5xl font-bold text-white mb-2">About MAAGAP</h1>
              <p className="text-yellow-300 text-xl">Multigeneration of Active Apostolic Guardians Association of the Philippines</p>
            </div>

            <div className="p-8 space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-blue-900 mb-4">Our Vision</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  To be a vibrant community of Filipino families in Kuwait, united in faith, strengthened by fellowship, 
                  and committed to living out the Gospel through active service and witness.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-blue-900 mb-4">Our Mission</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  MAAGAP Kuwait exists to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg text-gray-700 ml-4">
                  <li>Foster spiritual growth through prayer, worship, and biblical teaching</li>
                  <li>Build strong family relationships rooted in Christian values</li>
                  <li>Provide support and fellowship for Filipino families in Kuwait</li>
                  <li>Serve our community through charitable works and outreach</li>
                  <li>Promote unity across generations in faith and service</li>
                </ul>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-blue-900 mb-4">Our Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Faith</h3>
                    <p className="text-gray-700">Grounded in Christian beliefs and committed to spiritual growth</p>
                  </div>
                  <div className="bg-red-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-red-900 mb-2">Family</h3>
                    <p className="text-gray-700">Strengthening families as the foundation of our community</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Fellowship</h3>
                    <p className="text-gray-700">Building meaningful relationships and supporting one another</p>
                  </div>
                  <div className="bg-red-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-red-900 mb-2">Service</h3>
                    <p className="text-gray-700">Actively serving God and our community through love and action</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-900 to-red-800 text-white p-8 rounded-xl text-center">
                <p className="text-3xl font-bold italic mb-2">"THE TRUTH STILL STAND"</p>
                <p className="text-yellow-300 text-lg">Our commitment to faith, integrity, and righteousness</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
