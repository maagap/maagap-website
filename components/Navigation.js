'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { db } from '@/firebase.config';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customPages, setCustomPages] = useState([]);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    loadCustomPages();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadCustomPages = async () => {
    try {
      const q = query(
        collection(db, 'customPages'),
        where('showInNav', '==', true),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      const pages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomPages(pages);
    } catch (error) {
      console.error('Error loading custom pages:', error);
    }
  };

  const defaultNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/maagap-prayer', label: 'Maagap Prayer' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/about', label: 'About Us' },
    { href: '/history-mkd', label: 'History of MKD' },
    { href: '/members', label: 'Members' },
  ];

  // Combine default links with custom pages
  const allNavLinks = [
    ...defaultNavLinks,
    ...customPages.map(page => ({
      href: `/${page.slug}`,
      label: page.title
    })),
    { href: '/admin', label: 'Admin' }
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white shadow-lg py-2'
            : 'bg-gradient-to-b from-blue-900/90 to-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 md:w-14 md:h-14 transition-transform group-hover:scale-110">
                <Image
                  src="/images/maagap-logo.png"
                  alt="MAAGAP Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="hidden md:block">
                <span
                  className={`text-xl font-bold transition-colors ${
                    isScrolled ? 'text-blue-900' : 'text-white'
                  }`}
                >
                  MAAGAP Kuwait
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center space-x-1">
              {allNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    pathname === link.href
                      ? isScrolled
                        ? 'bg-blue-900 text-white'
                        : 'bg-white/20 text-white backdrop-blur-sm'
                      : isScrolled
                      ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-900'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className={`w-6 h-6 ${isScrolled ? 'text-blue-900' : 'text-white'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? 'max-h-screen opacity-100'
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="bg-white shadow-lg mt-2 rounded-lg mx-4 py-2">
            {allNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-blue-900 text-white'
                    : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="h-20"></div>
    </>
  );
}
