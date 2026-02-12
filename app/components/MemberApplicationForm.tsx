'use client';

import { useState, useRef } from 'react';
import { Member, User } from '../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadToCloudinary, dataURLtoFile } from '../lib/cloudinary';
import { showAlert } from './ProfessionalAlert';
import SignaturePad from './SignaturePad';
import Image from 'next/image';

interface MemberApplicationFormProps {
  user: User;
  onSubmit: () => void;
}

export default function MemberApplicationForm({ user, onSubmit }: MemberApplicationFormProps) {
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [signatureData, setSignatureData] = useState<string>('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    // Basic Info
    membershipType: 'Regular' as const,
    chapter: '',
    province: '',
    region: '',
    cpTel: '',
    
    // Name
    lastName: '',
    firstName: '',
    middleName: '',
    pseudonym: '',
    
    // Addresses
    provincialAddress: '',
    cityAddress: '',
    officeAddress: '',
    
    // Personal Info
    dateOfBirth: '',
    placeOfBirth: '',
    age: 0,
    sex: 'Male' as const,
    civilStatus: 'Single' as const,
    religion: '',
    dialect: '',
    height: '',
    weight: '',
    bloodType: '',
    phltNo: '',
    sssNo: '',
    
    // Occupation
    occupation: '',
    emailAddress: user.email,
    
    // Spouse Info
    spouseName: '',
    spouseOccupation: '',
    spouseCompany: '',
    numberOfChildren: 0,
    
    // Parents
    fatherName: '',
    motherName: '',
    
    // Education
    education: {
      elementary: { school: '', course: '', dateCompleted: '' },
      secondary: { school: '', course: '', dateCompleted: '' },
      vocational: { school: '', course: '', dateCompleted: '' },
      college: { school: '', course: '', dateCompleted: '' },
      graduate: { school: '', course: '', dateCompleted: '' },
    },
    
    // Emergency Contact
    emergencyContact: {
      name: '',
      relationship: '',
    },
    
    // References
    references: [
      { name: '', address: '', telCp: '' },
      { name: '', address: '', telCp: '' },
      { name: '', address: '', telCp: '' },
    ],
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName) {
      showAlert('error', 'ERROR', 'Please enter your first and last name.');
      return;
    }

    if (!photoPreview) {
      showAlert('error', 'ERROR', 'Please upload your photo.');
      return;
    }

    if (!signatureData) {
      showAlert('error', 'ERROR', 'Please provide your signature.');
      return;
    }

    setUploading(true);
    try {
      // Upload photo
      const photoFile = dataURLtoFile(photoPreview, 'photo.jpg');
      const photoUrl = await uploadToCloudinary(photoFile);

      // Upload signature
      const signatureFile = dataURLtoFile(signatureData, 'signature.png');
      const signatureUrl = await uploadToCloudinary(signatureFile);

      // Create member application
      await addDoc(collection(db, 'members'), {
        ...formData,
        photoUrl,
        signatureUrl,
        userId: user.id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      showAlert('success', 'SUCCESS', `Your membership application has been submitted!

Please wait for admin approval.`);
      
      onSubmit();
    } catch (error) {
      console.error('Error submitting application:', error);
      showAlert('error', 'ERROR', `Failed to submit application.

Please try again.`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-maagap-blue mb-2">Complete Your Membership Application</h2>
        <p className="text-gray-600 mb-6">Please fill out all required information to apply for membership.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📸 Photo</h3>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300">
                {photoPreview ? (
                  <Image src={photoPreview} alt="Preview" width={128} height={128} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">
                    👤
                  </div>
                )}
              </div>
              <div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="btn-secondary"
                >
                  Upload Photo
                </button>
                <p className="text-sm text-gray-500 mt-2">2x2 ID photo format</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pseudonym/Nickname</label>
                <input
                  type="text"
                  value={formData.pseudonym}
                  onChange={(e) => setFormData({ ...formData, pseudonym: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile/Tel *</label>
                <input
                  type="text"
                  value={formData.cpTel}
                  onChange={(e) => setFormData({ ...formData, cpTel: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.emailAddress}
                  className="input-field bg-gray-50"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">👤 Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
                  className="input-field"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Civil Status</label>
                <select
                  value={formData.civilStatus}
                  onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value as any })}
                  className="input-field"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widow">Widow</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Membership */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎖️ Membership</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chapter *</label>
                <input
                  type="text"
                  value={formData.chapter}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">✍️ Signature *</h3>
            <SignaturePad onSave={setSignatureData} />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="btn-primary disabled:opacity-50"
            >
              {uploading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
