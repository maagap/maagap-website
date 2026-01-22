'use client';

import { motion } from 'framer-motion';

export default function HistoryMKDPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-red-800 p-8 text-center">
              <h1 className="text-5xl font-bold text-white mb-2">History of MKD</h1>
              <p className="text-yellow-300 text-xl">The Journey of MAAGAP Kuwait District</p>
            </div>

            <div className="p-8 md:p-12 space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-blue-900 mb-4">Our Beginning</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  MAAGAP Kuwait District (MKD) was established by Filipino families in Kuwait who felt the 
                  calling to create a community rooted in faith, family values, and service. What started 
                  as small prayer meetings among friends has grown into a vibrant organization serving 
                  the Filipino community in Kuwait.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-blue-900 mb-4">Growth and Development</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  Over the years, MAAGAP Kuwait has:
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg text-gray-700 ml-4">
                  <li>Organized regular spiritual formation programs and prayer meetings</li>
                  <li>Coordinated community outreach and charitable activities</li>
                  <li>Provided support systems for Filipino families in Kuwait</li>
                  <li>Fostered unity across different generations of members</li>
                  <li>Built partnerships with other Filipino organizations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-blue-900 mb-4">Our Present</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Today, MAAGAP Kuwait continues to thrive as a community of active believers committed 
                  to living out our faith in practical ways. We remain dedicated to our founding principles 
                  while adapting to serve the evolving needs of our community.
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-100 to-red-100 p-8 rounded-xl">
                <h2 className="text-3xl font-bold text-blue-900 mb-4 text-center">Our Commitment</h2>
                <p className="text-xl text-gray-800 text-center italic">
                  "As we honor our past and celebrate our present, we remain committed to our mission 
                  of being multigeneration guardians of faith, actively serving God and our community 
                  with apostolic zeal."
                </p>
              </div>

              <div className="text-center bg-yellow-50 p-8 rounded-xl">
                <p className="text-3xl font-bold text-blue-900 mb-2">"THE TRUTH STILL STAND"</p>
                <p className="text-lg text-gray-700">
                  This motto embodies our unwavering commitment to biblical truth and Christian values, 
                  regardless of changing times and circumstances.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
