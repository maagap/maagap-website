export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-red-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-yellow-300">MAAGAP Kuwait</h3>
            <p className="text-gray-200">
              Multigeneration of Active Apostolic Guardians Association of the Philippines
            </p>
            <p className="mt-4 italic text-yellow-300">"THE TRUTH STILL STAND"</p>
          </div>
          
          <div>
            <h4 className="text-xl font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-yellow-300 transition-colors">Home</a></li>
              <li><a href="/about" className="hover:text-yellow-300 transition-colors">About Us</a></li>
              <li><a href="/gallery" className="hover:text-yellow-300 transition-colors">Gallery</a></li>
              <li><a href="/register" className="hover:text-yellow-300 transition-colors">Join Us</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xl font-bold mb-4">Contact</h4>
            <p className="text-gray-200">Kuwait</p>
            <p className="text-gray-200 mt-2">Email: info@maagapkuwait.org</p>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p>&copy; 2025 MAAGAP Kuwait. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
