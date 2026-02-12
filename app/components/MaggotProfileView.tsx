'use client';

import { useState, useRef } from 'react';
import { Maggot, User } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadToCloudinary, dataURLtoFile } from '../lib/cloudinary';
import { showAlert } from './ProfessionalAlert';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Image from 'next/image';
import * as XLSX from 'xlsx';

interface MaggotProfileViewProps {
  maggot: Maggot;
  user: User;
  onRefresh: () => void;
}

export default function MaggotProfileView({ maggot, user, onRefresh }: MaggotProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: maggot.name || '',
    address: maggot.address || '',
    maggotBy: maggot.maggotBy || '',
    telephone: maggot.telephone || '',
  });

  const [photoPreview, setPhotoPreview] = useState<string>('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let updatedData: any = {
        ...formData,
        updatedAt: new Date(),
      };

      // Upload new photo if changed
      if (photoPreview) {
        const photoFile = dataURLtoFile(photoPreview, 'photo.jpg');
        const photoUrl = await uploadToCloudinary(photoFile);
        updatedData.photoUrl = photoUrl;
      }

      await updateDoc(doc(db, 'maggots', maggot.id), updatedData);

      showAlert('success', 'SUCCESS', 'Profile updated successfully.');
      setIsEditing(false);
      setPhotoPreview('');
      onRefresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert('error', 'ERROR', `Failed to update profile.

Please try again.`);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert('error', 'ERROR', 'New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showAlert('error', 'ERROR', 'Password must be at least 6 characters.');
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) return;

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, passwordData.newPassword);

      showAlert('success', 'SUCCESS', 'Password changed successfully.');
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showAlert('error', 'ERROR', error.code === 'auth/wrong-password' 
        ? 'Current password is incorrect.' 
        : 'Failed to change password. Please try again.');
    }
  };

  const handleExportExcel = async () => {
    try {
      const data = [
        ['MAGGOT PROFILE'],
        [''],
        ['Name', formData.name],
        ['Address', formData.address],
        ['Telephone', formData.telephone],
        ['MAGGOT By', formData.maggotBy],
        ['Status', maggot.status.toUpperCase()],
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'My Profile');

      const filename = `MAAGAP_MAGGOT_${formData.name.replace(/ /g, '_')}.xlsx`;
      XLSX.writeFile(wb, filename);

      showAlert('success', 'SUCCESS', `Profile exported successfully.

File: ${filename}`);
    } catch (error) {
      console.error('Error exporting:', error);
      showAlert('error', 'ERROR', 'Failed to export profile.');
    }
  };

  const handleExportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      require('jspdf-autotable');

      const doc = new jsPDF() as any;
      let yPos = 20;

      // Add photo if available
      if (maggot.photoUrl) {
        try {
          doc.addImage(maggot.photoUrl, 'JPEG', 165, 10, 35, 35);
        } catch (err) {
          console.log('Could not add photo to PDF');
        }
      }

      // Header
      doc.setFontSize(20);
      doc.setTextColor(0, 51, 153);
      doc.text(formData.name.toUpperCase(), 105, yPos, { align: 'center' });
      
      yPos += 8;
      doc.setFontSize(12);
      doc.setTextColor(128, 0, 128);
      doc.text('MAGGOT Profile', 105, yPos, { align: 'center' });
      
      yPos += 15;

      // Information
      doc.setFontSize(12);
      doc.setTextColor(0, 51, 153);
      doc.text('INFORMATION', 14, yPos);
      yPos += 6;

      doc.autoTable({
        startY: yPos,
        head: [],
        body: [
          ['Name:', formData.name],
          ['Address:', formData.address],
          ['Telephone:', formData.telephone],
          ['MAGGOT By:', formData.maggotBy],
          ['Status:', maggot.status.toUpperCase()],
        ],
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 140 },
        }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`MAAGAP MAGGOT Profile - Generated: ${new Date().toLocaleDateString()}`, 105, 287, { align: 'center' });
      }

      const filename = `${formData.name.replace(/ /g, '_')}_MAGGOT_Profile.pdf`;
      doc.save(filename);

      showAlert('success', 'SUCCESS', `Profile exported to PDF.

File: ${filename}`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showAlert('error', 'ERROR', 'Failed to export to PDF.');
    }
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-900">{value || '-'}</span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-8 rounded-lg shadow-lg mb-6">
        <div className="flex items-center gap-6">
          {/* Photo */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
              {photoPreview ? (
                <Image src={photoPreview} alt="Preview" width={128} height={128} className="object-cover w-full h-full" />
              ) : maggot.photoUrl ? (
                <Image src={maggot.photoUrl} alt={maggot.name} width={128} height={128} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-purple-500 flex items-center justify-center text-5xl">
                  👤
                </div>
              )}
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white text-purple-600 rounded-full p-2 shadow-lg hover:bg-gray-100"
              >
                📷
              </button>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{maggot.name}</h1>
            <p className="text-purple-100 mb-3">MAGGOT Profile</p>
            <div className="flex gap-2">
              <span className="bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
                {maggot.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button onClick={handleExportExcel} className="btn-secondary bg-white text-purple-600">
              📥 Export Excel
            </button>
            <button onClick={handleExportPDF} className="btn-secondary bg-white text-purple-600">
              📄 Export PDF
            </button>
            {!isEditing && !showPasswordChange && (
              <>
                <button onClick={() => setIsEditing(true)} className="btn-primary bg-yellow-500">
                  ✏️ Edit Profile
                </button>
                {maggot.status === 'approved' && (
                  <button onClick={() => setShowPasswordChange(true)} className="btn-secondary bg-white text-purple-600">
                    🔒 Change Password
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Form */}
      {showPasswordChange && (
        <div className="card mb-6">
          <h3 className="text-lg font-bold text-purple-600 mb-4">🔒 Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setShowPasswordChange(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Change Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content */}
      {isEditing ? (
        /* Edit Mode */
        <div className="card">
          <h3 className="text-lg font-bold text-purple-600 mb-4">✏️ Edit Profile Information</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telephone</label>
                <input
                  type="text"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">MAGGOT By</label>
                <input
                  type="text"
                  value={formData.maggotBy}
                  onChange={(e) => setFormData({ ...formData, maggotBy: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-4 border-t">
              <button type="button" onClick={() => { setIsEditing(false); setPhotoPreview(''); }} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* View Mode */
        <div className="card">
          <h3 className="text-lg font-bold text-purple-600 mb-4">📋 Profile Information</h3>
          <div className="space-y-2 text-sm">
            <InfoRow label="Full Name" value={formData.name} />
            <InfoRow label="Address" value={formData.address} />
            <InfoRow label="Telephone" value={formData.telephone} />
            <InfoRow label="MAGGOT By" value={formData.maggotBy} />
            <InfoRow label="Status" value={maggot.status.toUpperCase()} />
          </div>
        </div>
      )}
    </div>
  );
}
