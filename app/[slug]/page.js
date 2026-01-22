'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/firebase.config.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useParams } from 'next/navigation';

export default function DynamicPage() {
  const params = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadPage();
  }, [params.slug]);

  const loadPage = async () => {
    try {
      const q = query(
        collection(db, 'customPages'),
        where('slug', '==', params.slug)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setNotFound(true);
      } else {
        const pageData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setPage(pageData);
      }
    } catch (error) {
      console.error('Error loading page:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-blue-900 mb-4">404</h1>
          <p className="text-2xl text-gray-700 mb-8">Page not found</p>
          <a
            href="/"
            className="bg-blue-900 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors inline-block"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-red-800 p-8 text-center">
              <h1 className="text-5xl font-bold text-white mb-2">{page.title}</h1>
            </div>

            <div className="p-8 md:p-12">
              <div 
                className="prose prose-lg max-w-none
                [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:text-blue-900
                [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:mb-3 [&>h2]:text-blue-800
                [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:mb-2 [&>h3]:text-blue-700
                [&>p]:text-gray-700 [&>p]:leading-relaxed [&>p]:mb-4
                [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4
                [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4
                [&>img]:rounded-lg [&>img]:shadow-lg [&>img]:my-6"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
