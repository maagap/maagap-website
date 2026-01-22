'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { db } from '@/firebase';
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
