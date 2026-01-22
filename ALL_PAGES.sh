#!/bin/bash

# Gallery Page
cat > app/gallery/page.js << 'GALEOF'
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { db } from '@/firebase.config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const q = query(collection(db, 'gallery'), orderBy('uploadedAt', 'desc'));
      const snapshot = await getDocs(q);
      const photoData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPhotos(photoData);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-blue-900 mb-4">Photo Gallery</h1>
            <p className="text-xl text-gray-700">Capturing moments of faith and fellowship</p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading photos...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <p className="text-2xl text-gray-600">No photos yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all"
                >
                  <Image
                    src={photo.url}
                    alt={photo.title || 'MAAGAP Activity'}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold">{photo.title || 'Activity Photo'}</h3>
                      {photo.date && <p className="text-gray-300 text-sm">{photo.date}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Lightbox */}
          {selectedPhoto && (
            <div
              onClick={() => setSelectedPhoto(null)}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative max-w-4xl max-h-screen"
              >
                <Image
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title || 'Photo'}
                  width={1200}
                  height={800}
                  className="rounded-lg"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  ✕
                </button>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
GALEOF

# About Page
cat > app/about/page.js << 'ABOUTEOF'
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
ABOUTEOF

# MAAGAP Prayer Page
cat > app/maagap-prayer/page.js << 'PRAYEOF'
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
PRAYEOF

# History of MKD Page
cat > app/history-mkd/page.js << 'HISTEOF'
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
HISTEOF

# Members Page
cat > app/members/page.js << 'MEMEOF'
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/firebase.config';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveMembers();
  }, []);

  const fetchActiveMembers = async () => {
    try {
      const q = query(
        collection(db, 'members'),
        where('status', '==', 'Active'),
        orderBy('lastName', 'asc')
      );
      const snapshot = await getDocs(q);
      const memberData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(memberData);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-blue-900 mb-4">Our Members</h1>
            <p className="text-xl text-gray-700">Active members of the MAAGAP Kuwait family</p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading members...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-blue-900">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-gray-600">{member.occupation || 'Member'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      member.memberType === 'Maggot'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member.memberType}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>📧 {member.email}</p>
                    <p>📱 {member.phone}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
MEMEOF

echo "All pages created successfully!"
