'use client';

import { motion } from 'framer-motion';

export default function MaagapPrayerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-red-800 p-8 text-center">
              <h1 className="text-5xl font-bold text-white mb-2">MAAGAP Prayer</h1>
              <p className="text-yellow-300 text-xl">Our Daily Prayer of Faith and Dedication</p>
            </div>

            <div className="p-8 md:p-12">
              <div className="bg-blue-50 border-l-4 border-blue-900 p-8 rounded-lg mb-8">
                <div className="text-center mb-8">
                  <p className="text-xl text-gray-700 italic mb-2">In the name of the Father,</p>
                  <p className="text-xl text-gray-700 italic mb-2">and of the Son,</p>
                  <p className="text-xl text-gray-700 italic">and of the Holy Spirit. Amen.</p>
                </div>

                <div className="space-y-6 text-lg text-gray-800 leading-relaxed">
                  <p>
                    Heavenly Father, we come before you as members of MAAGAP, united in our faith 
                    and commitment to serve you. We thank you for bringing us together as a community 
                    of believers in this land of Kuwait.
                  </p>

                  <p>
                    Lord, strengthen our families and help us to be faithful guardians of your truth. 
                    Guide us in our daily lives, that we may be living witnesses of your love and grace 
                    to those around us.
                  </p>

                  <p>
                    Grant us wisdom and courage to face the challenges of each day. Help us to support 
                    one another in times of difficulty and to celebrate together in times of joy.
                  </p>

                  <p>
                    May our association be a beacon of hope and faith, spanning across generations, 
                    always active in your service, and apostolic in our mission to spread your Word.
                  </p>

                  <p>
                    We pray for our families back home in the Philippines and for all Filipino 
                    communities around the world. Keep us united in spirit and purpose.
                  </p>

                  <p className="font-bold text-blue-900">
                    For THE TRUTH STILL STANDS, and in this truth, we find our strength and purpose.
                  </p>

                  <p>
                    We ask this through Christ our Lord.
                  </p>

                  <p className="text-center font-bold text-xl text-blue-900">
                    Amen.
                  </p>
                </div>
              </div>

              <div className="text-center bg-yellow-50 p-6 rounded-lg">
                <p className="text-gray-700 italic">
                  "Let your light shine before others, that they may see your good deeds and glorify your Father in heaven."
                </p>
                <p className="text-gray-600 mt-2">- Matthew 5:16</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
