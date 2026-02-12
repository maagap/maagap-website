'use client';

import { useState, useRef } from 'react';
import { Maggot, User } from '../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadToCloudinary, dataURLtoFile } from '../lib/cloudinary';
import { showAlert } from './ProfessionalAlert';
import SignaturePad from './SignaturePad';
import Image from 'next/image';

interface MaggotApplicationFormProps {
  user: User;
  onSubmit: () => void;
}

export default function MaggotApplicationForm({ user, onSubmit }: MaggotApplicationFormProps) {
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [signatureData, setSignatureData] = useState<string>('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user.name || '',
    address: '',
    maggotBy: '',
    telephone: '',
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
    if (!formData.name) {
      showAlert('error', 'ERROR', 'Please enter your name.');
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

      // Create maggot application
      await addDoc(collection(db, 'maggots'), {
        ...formData,
        photoUrl,
        signatureUrl,
        userId: user.id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      showAlert('success', 'SUCCESS', `Your MAGGOT application has been submitted!

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
        <h2 className="text-2xl font-bold text-maagap-blue mb-2">Complete Your MAGGOT Application</h2>
        <p className="text-gray-600 mb-6">Please fill out all required information to apply as MAGGOT.</p>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telephone *</label>
                <input
                  type="text"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">MAGGOT By *</label>
                <input
                  type="text"
                  value={formData.maggotBy}
                  onChange={(e) => setFormData({ ...formData, maggotBy: e.target.value })}
                  className="input-field"
                  placeholder="Sponsored/Endorsed by"
                  required
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
