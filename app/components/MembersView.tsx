'use client';

import { useState } from 'react';
import { showAlert, showConfirm } from './ProfessionalAlert';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Member, User } from '../types';
import SignaturePad from './SignaturePad';
import { uploadToCloudinary, dataURLtoFile } from '../lib/cloudinary';

interface MemberFormProps {
  member?: Member;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
}

export function MemberForm({ member, onClose, onSuccess, user }: MemberFormProps) {
  const [formData, setFormData] = useState<Partial<Member>>(member || {
    membershipType: 'Regular',
    sex: 'Male',
    civilStatus: 'Single',
    education: {
      elementary: { school: '', course: '', dateCompleted: '' },
      secondary: { school: '', course: '', dateCompleted: '' },
      vocational: { school: '', course: '', dateCompleted: '' },
      college: { school: '', course: '', dateCompleted: '' },
      graduate: { school: '', course: '', dateCompleted: '' },
    },
    emergencyContact: { name: '', relationship: '' },
    references: [
      { name: '', address: '', telCp: '' },
      { name: '', address: '', telCp: '' },
      { name: '', address: '', telCp: '' },
    ],
    status: 'pending',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(member?.photoUrl || '');
  const [signature, setSignature] = useState(member?.signatureUrl || '');
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoUrl = formData.photoUrl || '';
      let signatureUrl = formData.signatureUrl || '';

      // Upload photo if new file selected
      if (photoFile) {
        photoUrl = await uploadToCloudinary(photoFile);
      }

      // Upload signature if changed
      if (signature && signature !== formData.signatureUrl) {
        const signatureFile = dataURLtoFile(signature, 'signature.png');
        signatureUrl = await uploadToCloudinary(signatureFile);
      }

      const memberData = {
        ...formData,
        photoUrl,
        signatureUrl,
        updatedAt: new Date(),
      };

      if (member?.id) {
        await updateDoc(doc(db, 'members', member.id), memberData);
      } else {
        await addDoc(collection(db, 'members'), {
          ...memberData,
          userId: user.id,
          createdAt: new Date(),
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving member:', error);
      showAlert('error', 'ERROR', `Failed to save member.

Please verify your data and try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="bg-maagap-blue text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {member ? 'Edit Member' : 'New Member Registration'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Membership Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Membership Type *</label>
            <div className="flex gap-4">
              {(['Regular', 'Associate', 'Honorary'] as const).map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="membershipType"
                    value={type}
                    checked={formData.membershipType === type}
                    onChange={(e) => setFormData({ ...formData, membershipType: e.target.value as any })}
                    className="mr-2"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
                <input
                  type="text"
                  value={formData.chapter || ''}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province/City *</label>
                <input
                  type="text"
                  value={formData.province || ''}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <input
                  type="text"
                  value={formData.region || ''}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CP/Tel No. *</label>
                <input
                  type="text"
                  value={formData.cpTel || ''}
                  onChange={(e) => setFormData({ ...formData, cpTel: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Full Name</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName || ''}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pseudonym</label>
                <input
                  type="text"
                  value={formData.pseudonym || ''}
                  onChange={(e) => setFormData({ ...formData, pseudonym: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                <input
                  type="text"
                  value={formData.idNumber || ''}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  className="input-field"
                  placeholder="e.g., MAAGAP-2025-001"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Addresses</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provincial Address (Complete)</label>
                <input
                  type="text"
                  value={formData.provincialAddress || ''}
                  onChange={(e) => setFormData({ ...formData, provincialAddress: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City Address (Complete)</label>
                <input
                  type="text"
                  value={formData.cityAddress || ''}
                  onChange={(e) => setFormData({ ...formData, cityAddress: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office/Business Address</label>
                <input
                  type="text"
                  value={formData.officeAddress || ''}
                  onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth *</label>
                <input
                  type="text"
                  value={formData.placeOfBirth || ''}
                  onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sex *</label>
                <select
                  value={formData.sex || 'Male'}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
                  className="input-field"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Civil Status *</label>
                <select
                  value={formData.civilStatus || 'Single'}
                  onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value as any })}
                  className="input-field"
                  required
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widow">Widow</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                <input
                  type="text"
                  value={formData.religion || ''}
                  onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dialect</label>
                <input
                  type="text"
                  value={formData.dialect || ''}
                  onChange={(e) => setFormData({ ...formData, dialect: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <input
                  type="text"
                  value={formData.height || ''}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 5'6&quot;"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                <input
                  type="text"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 65 kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                <input
                  type="text"
                  value={formData.bloodType || ''}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PHLT No.</label>
                <input
                  type="text"
                  value={formData.phltNo || ''}
                  onChange={(e) => setFormData({ ...formData, phltNo: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SSS No.</label>
                <input
                  type="text"
                  value={formData.sssNo || ''}
                  onChange={(e) => setFormData({ ...formData, sssNo: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Occupation */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Occupation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input
                  type="text"
                  value={formData.occupation || ''}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.emailAddress || ''}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Spouse Information */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Spouse Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name of Spouse</label>
                <input
                  type="text"
                  value={formData.spouseName || ''}
                  onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. of Children</label>
                <input
                  type="number"
                  value={formData.numberOfChildren || 0}
                  onChange={(e) => setFormData({ ...formData, numberOfChildren: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spouse Occupation</label>
                <input
                  type="text"
                  value={formData.spouseOccupation || ''}
                  onChange={(e) => setFormData({ ...formData, spouseOccupation: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spouse Company</label>
                <input
                  type="text"
                  value={formData.spouseCompany || ''}
                  onChange={(e) => setFormData({ ...formData, spouseCompany: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Parents */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Parents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name of Father</label>
                <input
                  type="text"
                  value={formData.fatherName || ''}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name of Mother</label>
                <input
                  type="text"
                  value={formData.motherName || ''}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Education - simplified for space, you can expand this */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Educational Attainment</h3>
            <p className="text-sm text-gray-600 mb-2">Note: Full education details can be added after basic registration</p>
          </div>

          {/* Emergency Contact */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={formData.emergencyContact?.name || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact!, name: e.target.value }
                  })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <input
                  type="text"
                  value={formData.emergencyContact?.relationship || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact!, relationship: e.target.value }
                  })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Photo (2x2) *</h3>
            <div className="flex items-center gap-4">
              {photoPreview && (
                <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300" />
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="input-field"
                  required={!member}
                />
                <p className="text-xs text-gray-500 mt-1">Upload a 2x2 ID photo</p>
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Signature *</h3>
            <SignaturePad
              onSave={setSignature}
              initialValue={signature}
            />
          </div>

          {/* Approval Information */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Approval Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sponsored By</label>
                <input
                  type="text"
                  value={formData.sponsoredBy || ''}
                  onChange={(e) => setFormData({ ...formData, sponsoredBy: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Accomplished</label>
                <input
                  type="date"
                  value={formData.dateAccomplished || ''}
                  onChange={(e) => setFormData({ ...formData, dateAccomplished: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end pt-4">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : member ? 'Update Member' : 'Register Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MembersView({ members, user, onRefresh }: any) {
  const [showForm, setShowForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | undefined>();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = members
    .filter((m: Member) => {
      // Filter by status
      const statusMatch = filter === 'all' || m.status === filter;
      
      // Filter by search query
      if (!searchQuery) return statusMatch;
      
      const query = searchQuery.toLowerCase();
      const searchMatch = 
        (m.lastName || '').toLowerCase().includes(query) ||
        (m.firstName || '').toLowerCase().includes(query) ||
        (m.middleName || '').toLowerCase().includes(query) ||
        (m.emailAddress || '').toLowerCase().includes(query) ||
        (m.cpTel || '').toLowerCase().includes(query) ||
        (m.chapter || '').toLowerCase().includes(query);
      
      return statusMatch && searchMatch;
    })
    .sort((a: Member, b: Member) => {
      const lastNameA = (a.lastName || '').toUpperCase();
      const lastNameB = (b.lastName || '').toUpperCase();
      return lastNameA.localeCompare(lastNameB);
    });

  const handleApprove = async (memberId: string) => {
    if (user.role !== 'admin') return;
    await updateDoc(doc(db, 'members', memberId), {
      status: 'approved',
      approvedBy: user.email,
    });
    onRefresh();
  };

  const handleDelete = async (memberId: string) => {
    if (user.role !== 'admin') return;
    if (confirm(`⚠️ CONFIRM DELETE

Are you sure you want to delete this member?

This action cannot be undone.`)) {
      await deleteDoc(doc(db, 'members', memberId));
      onRefresh();
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let imported = 0;
      let errors = 0;

      for (const row of jsonData as any[]) {
        try {
          const memberData = {
            // Basic Info
            chapter: row['Chapter'] || '',
            province: row['Province/City'] || '',
            region: row['Region'] || '',
            cpTel: row['CP/Tel No.'] || '',
            
            // Name
            lastName: row['Last Name'] || '',
            firstName: row['First Name'] || '',
            middleName: row['Middle Name'] || '',
            pseudonym: row['Pseudonym'] || '',
            
            // Position and Addresses
            position: row['Position'] || '',
            provincialAddress: row['Provincial Address (Complete)'] || '',
            cityAddress: row['City Address (Complete)'] || '',
            officeAddress: row['Office/Business Address'] || '',
            
            // Personal Details
            dateOfBirth: row['Date of Birth'] || '',
            placeOfBirth: row['Place of Birth'] || '',
            age: row['Age'] ? parseInt(row['Age']) : 0,
            sex: row['Sex'] || 'Male',
            civilStatus: row['Civil Status'] || 'Single',
            religion: row['Religion'] || '',
            dialect: row['Dialect'] || '',
            height: row['Height'] || '',
            weight: row['Weight'] || '',
            bloodType: row['Blood Type'] || '',
            eyes: row['Eyes'] || '',
            hair: row['Hair'] || '',
            
            // IDs
            phltNo: row['PHLT No.'] || '',
            sssNo: row['SSS No.'] || '',
            tin: row['TIN'] || '',
            
            // Work and Contact
            occupation: row['Occupation'] || '',
            emailAddress: row['Email Address'] || '',
            
            // Family
            spouse: row['Name of Spouse'] || '',
            childrenCount: row['No. of Children'] ? parseInt(row['No. of Children']) : 0,
            spouseOccupation: row['Spouse Occupation'] || '',
            spouseCompany: row['Spouse Company'] || '',
            father: row['Name of Father'] || '',
            mother: row['Name of Mother'] || '',
            
            // Emergency Contact
            emergencyContact: {
              name: row['Contact Name'] || '',
              relationship: row['Relationship'] || '',
              telephone: row['Incase of Emergency (Contact)'] || '',
            },
            
            // Sponsorship
            sponsoredBy: row['Sponsored By'] || '',
            dateAccomplished: row['Date Accomplished'] || '',
            rank: row['RANK'] || '',
            
            // Status
            status: row['STATUS']?.toLowerCase() === 'approved' ? 'approved' : 'pending',
            membershipType: 'Regular',
            
            // Default values for required fields
            education: {
              elementary: { school: '', course: '', dateCompleted: '' },
              secondary: { school: '', course: '', dateCompleted: '' },
              vocational: { school: '', course: '', dateCompleted: '' },
              college: { school: '', course: '', dateCompleted: '' },
              graduate: { school: '', course: '', dateCompleted: '' },
            },
            references: [
              { name: '', address: '', telCp: '' },
              { name: '', address: '', telCp: '' },
              { name: '', address: '', telCp: '' },
            ],
            
            // Metadata
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: user.id,
          };

          await addDoc(collection(db, 'members'), memberData);
          imported++;
        } catch (error) {
          console.error('Error importing row:', error);
          errors++;
        }
      }

      const errorMessage = errors > 0 ? '\n\nPlease check browser console (F12) for error details.' : '';
      alert(`📊 EXCEL IMPORT COMPLETE

✅ Successfully imported: ${imported} member(s)
❌ Failed: ${errors} record(s)${errorMessage}`);
      onRefresh();
    } catch (error) {
      console.error('Error importing Excel:', error);
      showAlert('error', 'IMPORT ERROR', `Failed to import Excel file.

Please ensure:
- File is .xlsx or .xls format
- Column headers match exactly
- Required fields are filled`);
    } finally {
      setImporting(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
      // Prepare data for export
      const exportData = filteredMembers.map((member: Member) => ({
        'Last Name': member.lastName || '',
        'First Name': member.firstName || '',
        'Middle Name': member.middleName || '',
        'Chapter': member.chapter || '',
        'Province/City': member.province || '',
        'Region': member.region || '',
        'Contact': member.cpTel || '',
        'Email': member.emailAddress || '',
        'Sex': member.sex || '',
        'Civil Status': member.civilStatus || '',
        'Date of Birth': member.dateOfBirth || '',
        'Age': member.age || '',
        'Occupation': member.occupation || '',
        'Status': member.status || '',
        'Provincial Address': member.provincialAddress || '',
        'City Address': member.cityAddress || '',
        'Office Address': member.officeAddress || '',
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Members');

      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `MAAGAP_Members_${date}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
      
      showAlert('success', 'SUCCESS', `Exported ${filteredMembers.length} member(s) to Excel successfully.

File: ${filename}`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showAlert('error', 'ERROR', `Failed to export to Excel.

Please try again.`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Members Management</h2>
          <p className="text-gray-600">Total Members: {members.length} | Showing: {filteredMembers.length}</p>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="🔍 Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-64"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="input-field w-auto"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
          <button onClick={handleExportExcel} className="btn-secondary">
            📥 Export Excel
          </button>
          {user.role === 'admin' && (
            <label className="btn-secondary cursor-pointer">
              {importing ? 'Importing...' : '📊 Import Excel'}
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
                disabled={importing}
                className="hidden"
              />
            </label>
          )}
          <button
            onClick={() => {
              setSelectedMember(undefined);
              setShowForm(true);
            }}
            className="btn-primary"
          >
            + New Member
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Photo</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pseudonym</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID Number</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMembers.map((member: Member) => (
              <tr key={member.id}>
                <td className="px-4 py-3">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.firstName} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      No Photo
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">
                    {member.firstName} {member.middleName} {member.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{member.emailAddress}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {member.pseudonym ? `"${member.pseudonym}"` : '-'}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-gray-700">
                  {member.idNumber || '-'}
                </td>
                <td className="px-4 py-3 text-sm">{member.membershipType}</td>
                <td className="px-4 py-3 text-sm">{member.cpTel}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.status === 'approved' ? 'bg-green-100 text-green-800' :
                    member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {user.role === 'admin' && member.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(member.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <MemberForm
          member={selectedMember}
          onClose={() => setShowForm(false)}
          onSuccess={onRefresh}
          user={user}
        />
      )}
    </div>
  );
}
