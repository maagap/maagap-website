'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, storage } from '@/firebase.config.js';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
  query, orderBy, serverTimestamp, getDoc, setDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState('settings');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Website Settings
  const [websiteSettings, setWebsiteSettings] = useState({
    siteTitle: 'MAAGAP Kuwait',
    siteSubtitle: 'Multigeneration of Active Apostolic Guardians Association',
    motto: 'THE TRUTH STILL STAND',
    contactEmail: 'info@maagapkuwait.org',
    contactPhone: '',
    location: 'Kuwait',
    showBanner: true,
    maintenanceMode: false
  });

  // Banners
  const [banners, setBanners] = useState([]);
  const [newBanner, setNewBanner] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
    active: true
  });
  const [bannerFile, setBannerFile] = useState(null);

  // Custom Pages
  const [customPages, setCustomPages] = useState([]);
  const [newPage, setNewPage] = useState({
    title: '',
    slug: '',
    content: '',
    order: 0,
    showInNav: true
  });

  // Activities
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    photos: [],
    videos: []
  });
  const [activityFiles, setActivityFiles] = useState([]);

  // Promotions
  const [promotions, setPromotions] = useState([]);
  const [newPromotion, setNewPromotion] = useState({
    title: '',
    description: '',
    validUntil: '',
    imageUrl: '',
    active: true
  });

  // History Content
  const [historyContent, setHistoryContent] = useState({
    beginning: '',
    growth: '',
    present: '',
    commitment: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadWebsiteSettings(),
        loadBanners(),
        loadCustomPages(),
        loadActivities(),
        loadPromotions(),
        loadHistoryContent()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load Website Settings
  const loadWebsiteSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'website');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setWebsiteSettings(docSnap.data());
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveWebsiteSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'website'), {
        ...websiteSettings,
        updatedAt: serverTimestamp()
      });
      setMessage({ type: 'success', text: 'Website settings saved!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    }
  };

  // Load Banners
  const loadBanners = async () => {
    try {
      const q = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBanners(data);
    } catch (error) {
      console.error('Error loading banners:', error);
    }
  };

  const uploadBannerImage = async () => {
    if (!bannerFile) return '';
    const storageRef = ref(storage, `banners/${Date.now()}_${bannerFile.name}`);
    await uploadBytes(storageRef, bannerFile);
    return await getDownloadURL(storageRef);
  };

  const addBanner = async () => {
    try {
      setLoading(true);
      const imageUrl = await uploadBannerImage();
      await addDoc(collection(db, 'banners'), {
        ...newBanner,
        imageUrl,
        createdAt: serverTimestamp()
      });
      setNewBanner({ title: '', description: '', imageUrl: '', link: '', active: true });
      setBannerFile(null);
      await loadBanners();
      setMessage({ type: 'success', text: 'Banner added!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add banner' });
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await deleteDoc(doc(db, 'banners', id));
      await loadBanners();
      setMessage({ type: 'success', text: 'Banner deleted!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete banner' });
    }
  };

  // Load Custom Pages
  const loadCustomPages = async () => {
    try {
      const q = query(collection(db, 'customPages'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomPages(data);
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  };

  const addCustomPage = async () => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'customPages'), {
        ...newPage,
        slug: newPage.slug || newPage.title.toLowerCase().replace(/\s+/g, '-'),
        createdAt: serverTimestamp()
      });
      setNewPage({ title: '', slug: '', content: '', order: 0, showInNav: true });
      await loadCustomPages();
      setMessage({ type: 'success', text: 'Page added! Refresh to see in navigation.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add page' });
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomPage = async (id) => {
    if (!confirm('Delete this page?')) return;
    try {
      await deleteDoc(doc(db, 'customPages', id));
      await loadCustomPages();
      setMessage({ type: 'success', text: 'Page deleted!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete page' });
    }
  };

  // Load Activities
  const loadActivities = async () => {
    try {
      const q = query(collection(db, 'activities'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const uploadActivityFiles = async () => {
    const urls = [];
    for (const file of activityFiles) {
      const storageRef = ref(storage, `activities/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push({ url, type: file.type.startsWith('image/') ? 'image' : 'video' });
    }
    return urls;
  };

  const addActivity = async () => {
    try {
      setLoading(true);
      const mediaFiles = await uploadActivityFiles();
      const photos = mediaFiles.filter(f => f.type === 'image').map(f => f.url);
      const videos = mediaFiles.filter(f => f.type === 'video').map(f => f.url);
      
      await addDoc(collection(db, 'activities'), {
        ...newActivity,
        photos,
        videos,
        createdAt: serverTimestamp()
      });
      
      setNewActivity({ title: '', description: '', date: '', location: '', photos: [], videos: [] });
      setActivityFiles([]);
      await loadActivities();
      setMessage({ type: 'success', text: 'Activity added!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add activity' });
    } finally {
      setLoading(false);
    }
  };

  const deleteActivity = async (id) => {
    if (!confirm('Delete this activity?')) return;
    try {
      await deleteDoc(doc(db, 'activities', id));
      await loadActivities();
      setMessage({ type: 'success', text: 'Activity deleted!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete activity' });
    }
  };

  // Load Promotions
  const loadPromotions = async () => {
    try {
      const q = query(collection(db, 'promotions'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPromotions(data);
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  };

  const addPromotion = async () => {
    try {
      setLoading(true);
      await addDoc(collection(db, 'promotions'), {
        ...newPromotion,
        createdAt: serverTimestamp()
      });
      setNewPromotion({ title: '', description: '', validUntil: '', imageUrl: '', active: true });
      await loadPromotions();
      setMessage({ type: 'success', text: 'Promotion added!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add promotion' });
    } finally {
      setLoading(false);
    }
  };

  const togglePromotion = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'promotions', id), { active: !currentStatus });
      await loadPromotions();
      setMessage({ type: 'success', text: 'Promotion updated!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update promotion' });
    }
  };

  // Load History Content
  const loadHistoryContent = async () => {
    try {
      const docRef = doc(db, 'content', 'history');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setHistoryContent(docSnap.data());
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const saveHistoryContent = async () => {
    try {
      setLoading(true);
      await setDoc(doc(db, 'content', 'history'), {
        ...historyContent,
        updatedAt: serverTimestamp()
      });
      setMessage({ type: 'success', text: 'History content saved!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save history' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-red-800 p-8">
              <h1 className="text-4xl font-bold text-white mb-2">Website Content Management</h1>
              <p className="text-yellow-300 text-lg">Customize your MAAGAP Kuwait website</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap border-b border-gray-200 overflow-x-auto">
              {[
                { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
                { id: 'banners', label: '🖼️ Banners', icon: '🖼️' },
                { id: 'pages', label: '📄 Custom Pages', icon: '📄' },
                { id: 'activities', label: '🎉 Activities', icon: '🎉' },
                { id: 'promotions', label: '📢 Promotions', icon: '📢' },
                { id: 'history', label: '📜 History', icon: '📜' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-900 text-white border-b-4 border-yellow-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="p-8">
              {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Website Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Website Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Site Title</label>
                      <input
                        type="text"
                        value={websiteSettings.siteTitle}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, siteTitle: e.target.value})}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Site Subtitle</label>
                      <input
                        type="text"
                        value={websiteSettings.siteSubtitle}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, siteSubtitle: e.target.value})}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Motto</label>
                      <input
                        type="text"
                        value={websiteSettings.motto}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, motto: e.target.value})}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={websiteSettings.contactEmail}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, contactEmail: e.target.value})}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Contact Phone</label>
                      <input
                        type="tel"
                        value={websiteSettings.contactPhone}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, contactPhone: e.target.value})}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Location</label>
                      <input
                        type="text"
                        value={websiteSettings.location}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, location: e.target.value})}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={websiteSettings.showBanner}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, showBanner: e.target.checked})}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span>Show Banners on Homepage</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={websiteSettings.maintenanceMode}
                        onChange={(e) => setWebsiteSettings({...websiteSettings, maintenanceMode: e.target.checked})}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span>Maintenance Mode</span>
                    </label>
                  </div>
                  
                  <button
                    onClick={saveWebsiteSettings}
                    className="bg-blue-900 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
              )}

              {/* Banners Tab */}
              {activeTab === 'banners' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Homepage Banners</h2>
                  
                  {/* Add New Banner */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Add New Banner</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Banner Title"
                        value={newBanner.title}
                        onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                        className="px-4 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Link URL (optional)"
                        value={newBanner.link}
                        onChange={(e) => setNewBanner({...newBanner, link: e.target.value})}
                        className="px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      value={newBanner.description}
                      onChange={(e) => setNewBanner({...newBanner, description: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-2 border rounded-lg mb-4"
                    ></textarea>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBannerFile(e.target.files[0])}
                      className="mb-4"
                    />
                    <button
                      onClick={addBanner}
                      disabled={loading}
                      className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50"
                    >
                      {loading ? 'Uploading...' : 'Add Banner'}
                    </button>
                  </div>
                  
                  {/* Existing Banners */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banners.map(banner => (
                      <div key={banner.id} className="border rounded-lg p-4">
                        {banner.imageUrl && (
                          <img src={banner.imageUrl} alt={banner.title} className="w-full h-40 object-cover rounded mb-2" />
                        )}
                        <h4 className="font-bold">{banner.title}</h4>
                        <p className="text-sm text-gray-600">{banner.description}</p>
                        <button
                          onClick={() => deleteBanner(banner.id)}
                          className="mt-2 text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Pages Tab */}
              {activeTab === 'pages' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Custom Pages</h2>
                  
                  {/* Add New Page */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Add New Page</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Page Title"
                        value={newPage.title}
                        onChange={(e) => setNewPage({...newPage, title: e.target.value})}
                        className="px-4 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="URL Slug (auto-generated)"
                        value={newPage.slug}
                        onChange={(e) => setNewPage({...newPage, slug: e.target.value})}
                        className="px-4 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Order (0-100)"
                        value={newPage.order}
                        onChange={(e) => setNewPage({...newPage, order: parseInt(e.target.value)})}
                        className="px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <textarea
                      placeholder="Page Content (HTML supported)"
                      value={newPage.content}
                      onChange={(e) => setNewPage({...newPage, content: e.target.value})}
                      rows="10"
                      className="w-full px-4 py-2 border rounded-lg mb-4 font-mono text-sm"
                    ></textarea>
                    <label className="flex items-center space-x-2 mb-4">
                      <input
                        type="checkbox"
                        checked={newPage.showInNav}
                        onChange={(e) => setNewPage({...newPage, showInNav: e.target.checked})}
                        className="w-5 h-5"
                      />
                      <span>Show in Navigation</span>
                    </label>
                    <button
                      onClick={addCustomPage}
                      disabled={loading}
                      className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Page'}
                    </button>
                  </div>
                  
                  {/* Existing Pages */}
                  <div className="space-y-4">
                    {customPages.map(page => (
                      <div key={page.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg">{page.title}</h4>
                            <p className="text-sm text-gray-600">/{page.slug}</p>
                            <p className="text-sm text-gray-500">Order: {page.order} | In Nav: {page.showInNav ? 'Yes' : 'No'}</p>
                          </div>
                          <button
                            onClick={() => deleteCustomPage(page.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activities Tab */}
              {activeTab === 'activities' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Activities & Events</h2>
                  
                  {/* Add New Activity */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Add New Activity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Activity Title"
                        value={newActivity.title}
                        onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                        className="px-4 py-2 border rounded-lg"
                      />
                      <input
                        type="date"
                        value={newActivity.date}
                        onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                        className="px-4 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={newActivity.location}
                        onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                        className="px-4 py-2 border rounded-lg md:col-span-2"
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                      rows="4"
                      className="w-full px-4 py-2 border rounded-lg mb-4"
                    ></textarea>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={(e) => setActivityFiles(Array.from(e.target.files))}
                      className="mb-4"
                    />
                    <button
                      onClick={addActivity}
                      disabled={loading}
                      className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50"
                    >
                      {loading ? 'Uploading...' : 'Add Activity'}
                    </button>
                  </div>
                  
                  {/* Existing Activities */}
                  <div className="space-y-4">
                    {activities.map(activity => (
                      <div key={activity.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg">{activity.title}</h4>
                            <p className="text-sm text-gray-600">{activity.date} • {activity.location}</p>
                            <p className="text-gray-700 mt-2">{activity.description}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              📷 {activity.photos?.length || 0} photos • 🎥 {activity.videos?.length || 0} videos
                            </p>
                          </div>
                          <button
                            onClick={() => deleteActivity(activity.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Promotions Tab */}
              {activeTab === 'promotions' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Promotions & Announcements</h2>
                  
                  {/* Add New Promotion */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Add New Promotion</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Promotion Title"
                        value={newPromotion.title}
                        onChange={(e) => setNewPromotion({...newPromotion, title: e.target.value})}
                        className="px-4 py-2 border rounded-lg"
                      />
                      <input
                        type="date"
                        placeholder="Valid Until"
                        value={newPromotion.validUntil}
                        onChange={(e) => setNewPromotion({...newPromotion, validUntil: e.target.value})}
                        className="px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      value={newPromotion.description}
                      onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-2 border rounded-lg mb-4"
                    ></textarea>
                    <input
                      type="text"
                      placeholder="Image URL (optional)"
                      value={newPromotion.imageUrl}
                      onChange={(e) => setNewPromotion({...newPromotion, imageUrl: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg mb-4"
                    />
                    <button
                      onClick={addPromotion}
                      disabled={loading}
                      className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Promotion'}
                    </button>
                  </div>
                  
                  {/* Existing Promotions */}
                  <div className="space-y-4">
                    {promotions.map(promo => (
                      <div key={promo.id} className={`border rounded-lg p-4 ${promo.active ? '' : 'opacity-50'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg">{promo.title}</h4>
                            <p className="text-sm text-gray-600">Valid until: {promo.validUntil}</p>
                            <p className="text-gray-700 mt-2">{promo.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => togglePromotion(promo.id, promo.active)}
                              className={`px-4 py-2 rounded ${promo.active ? 'bg-yellow-500' : 'bg-green-500'} text-white`}
                            >
                              {promo.active ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">Edit History Content</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Our Beginning</label>
                      <textarea
                        value={historyContent.beginning}
                        onChange={(e) => setHistoryContent({...historyContent, beginning: e.target.value})}
                        rows="6"
                        className="w-full px-4 py-3 border rounded-lg"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Growth and Development</label>
                      <textarea
                        value={historyContent.growth}
                        onChange={(e) => setHistoryContent({...historyContent, growth: e.target.value})}
                        rows="6"
                        className="w-full px-4 py-3 border rounded-lg"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Our Present</label>
                      <textarea
                        value={historyContent.present}
                        onChange={(e) => setHistoryContent({...historyContent, present: e.target.value})}
                        rows="6"
                        className="w-full px-4 py-3 border rounded-lg"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Our Commitment</label>
                      <textarea
                        value={historyContent.commitment}
                        onChange={(e) => setHistoryContent({...historyContent, commitment: e.target.value})}
                        rows="6"
                        className="w-full px-4 py-3 border rounded-lg"
                      ></textarea>
                    </div>
                  </div>
                  
                  <button
                    onClick={saveHistoryContent}
                    disabled={loading}
                    className="bg-blue-900 text-white px-8 py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save History Content'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
