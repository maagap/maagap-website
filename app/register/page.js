'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { db, storage } from '@/firebase.config.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [memberType, setMemberType] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    memberClassification: '', sponsor: '', chapter: '', provinceCity: '',
    region: '', cpTelNo: '', lastName: '', firstName: '', middleName: '',
    pseudonym: '', provincialAddress: '', cityAddress: '', officeBusinessAddress: '',
    occupation: '', dateOfBirth: '', placeOfBirth: '', email: '', age: '',
    sex: '', civilStatus: '', religion: '', dialect: '', height: '', weight: '',
    bloodType: '', phltNo: '', sssNo: '', spouseName: '', numberOfChildren: '',
    spouseOccupation: '', spouseCompany: '', fatherName: '', motherName: '',
    elementary: { school: '', course: '', dateCompleted: '' },
    secondary: { school: '', course: '', dateCompleted: '' },
    vocational: { school: '', course: '', dateCompleted: '' },
    college: { school: '', course: '', dateCompleted: '' },
    graduate: { school: '', course: '', dateCompleted: '' },
    emergencyContactName: '', emergencyRelationship: '', emergencyAddress: '',
    emergencyTelCpNo: '', reference1Name: '', reference1Address: '',
    reference1Contact: '', reference2Name: '', reference2Address: '',
    reference2Contact: '', reference3Name: '', reference3Address: '',
    reference3Contact: '', hasBarangayClearance: false, hasPNPClearance: false,
    hasNBIClearance: false, has2x2Photos: false, paidMembershipFee: false,
    paidIDFee: false, paidInsurance: false, paidDamayan: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleEducationChange = (level, field, value) => {
    setFormData({
      ...formData,
      [level]: { ...formData[level], [field]: value }
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMemberTypeSelection = (type) => {
    setMemberType(type);
    setFormData({ ...formData, memberClassification: type });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      let photoURL = '';
      if (photoFile) {
        const photoRef = ref(storage, `member-photos/${Date.now()}_${photoFile.name}`);
        await uploadBytes(photoRef, photoFile);
        photoURL = await getDownloadURL(photoRef);
      }

      let calculatedAge = formData.age;
      if (!calculatedAge && formData.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(formData.dateOfBirth);
        calculatedAge = today.getFullYear() - birthDate.getFullYear();
      }

      await addDoc(collection(db, 'members'), {
        ...formData, age: calculatedAge, photoURL, status: 'Active',
        registrationDate: serverTimestamp(), createdAt: serverTimestamp()
      });

      setMessage({ type: 'success', text: 'Registration successful! Welcome to MAAGAP family!' });
      setStep(1); setMemberType(''); setPhotoFile(null); setPhotoPreview(null);
      setFormData({
        memberClassification: '', sponsor: '', chapter: '', provinceCity: '',
        region: '', cpTelNo: '', lastName: '', firstName: '', middleName: '',
        pseudonym: '', provincialAddress: '', cityAddress: '', officeBusinessAddress: '',
        occupation: '', dateOfBirth: '', placeOfBirth: '', email: '', age: '',
        sex: '', civilStatus: '', religion: '', dialect: '', height: '', weight: '',
        bloodType: '', phltNo: '', sssNo: '', spouseName: '', numberOfChildren: '',
        spouseOccupation: '', spouseCompany: '', fatherName: '', motherName: '',
        elementary: { school: '', course: '', dateCompleted: '' },
        secondary: { school: '', course: '', dateCompleted: '' },
        vocational: { school: '', course: '', dateCompleted: '' },
        college: { school: '', course: '', dateCompleted: '' },
        graduate: { school: '', course: '', dateCompleted: '' },
        emergencyContactName: '', emergencyRelationship: '', emergencyAddress: '',
        emergencyTelCpNo: '', reference1Name: '', reference1Address: '',
        reference1Contact: '', reference2Name: '', reference2Address: '',
        reference2Contact: '', reference3Name: '', reference3Address: '',
        reference3Contact: '', hasBarangayClearance: false, hasPNPClearance: false,
        hasNBIClearance: false, has2x2Photos: false, paidMembershipFee: false,
        paidIDFee: false, paidInsurance: false, paidDamayan: false
      });
      window.scrollTo(0, 0);
    } catch (error) {
      setMessage({ type: 'error', text: 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Member Type Selection Screen
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-900 to-red-800 p-8 text-center">
                <h1 className="text-4xl font-bold text-white mb-2">Join MAAGAP</h1>
                <p className="text-yellow-300 text-lg">Select Your Member Classification</p>
              </div>

              <div className="p-12">
                {message.text && (
                  <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleMemberTypeSelection('Regular')}
                    className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all">
                    <div className="text-5xl mb-4">👤</div>
                    <h3 className="text-2xl font-bold mb-2">Regular</h3>
                    <p className="text-blue-100">Full membership</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleMemberTypeSelection('Associate')}
                    className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all">
                    <div className="text-5xl mb-4">🤝</div>
                    <h3 className="text-2xl font-bold mb-2">Associate</h3>
                    <p className="text-purple-100">Associate member</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleMemberTypeSelection('Honorary')}
                    className="bg-gradient-to-br from-yellow-600 to-yellow-800 text-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all">
                    <div className="text-5xl mb-4">⭐</div>
                    <h3 className="text-2xl font-bold mb-2">Honorary</h3>
                    <p className="text-yellow-100">Honorary member</p>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Short version for quick registration - will create full version after
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-900 to-red-800 p-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">MAAGAP Membership Application</h1>
            <p className="text-yellow-300 text-xl">{memberType} Member Registration</p>
            <button onClick={() => setStep(1)} className="mt-4 text-yellow-300 hover:text-white underline">
              ← Change Member Type
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Photo Upload */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Photo Upload (2x2 ID Picture)</h3>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-white">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-sm text-center px-2">No photo</span>
                  )}
                </div>
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={handlePhotoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  <p className="text-sm text-gray-600 mt-2">Upload colored 2x2 ID picture</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Middle Name</label>
                <input type="text" name="middleName" value={formData.middleName} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone Number *</label>
                <input type="tel" name="cpTelNo" value={formData.cpTelNo} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Current Address *</label>
              <textarea name="cityAddress" value={formData.cityAddress} onChange={handleChange} required rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Date of Birth *</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Occupation *</label>
                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Contact Name *</label>
                  <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Contact Number *</label>
                  <input type="tel" name="emergencyTelCpNo" value={formData.emergencyTelCpNo} onChange={handleChange} required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-900 to-red-800 text-white font-bold py-4 px-8 rounded-lg text-xl hover:shadow-lg transition-all disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit MAAGAP Membership Application'}
            </button>

            <p className="text-center text-gray-600 text-sm">
              By submitting, you agree to support MAAGAP's Vision, Mission, and Constitution.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
