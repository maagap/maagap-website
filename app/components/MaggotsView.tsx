'use client';

import { useState } from 'react';
import { showAlert, showConfirm } from './ProfessionalAlert';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Maggot, User } from '../types';
import SignaturePad from './SignaturePad';
import { uploadToCloudinary, dataURLtoFile } from '../lib/cloudinary';

interface MaggotFormProps {
  maggot?: Maggot;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
}

function MaggotForm({ maggot, onClose, onSuccess, user }: MaggotFormProps) {
  const [formData, setFormData] = useState({
    name: maggot?.name || '',
    address: maggot?.address || '',
    maggotBy: maggot?.maggotBy || '',
    telephone: maggot?.telephone || '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(maggot?.photoUrl || '');
  const [signature, setSignature] = useState(maggot?.signatureUrl || '');
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoUrl = maggot?.photoUrl || '';
      let signatureUrl = maggot?.signatureUrl || '';

      if (photoFile) {
        photoUrl = await uploadToCloudinary(photoFile);
      }

      if (signature && signature !== maggot?.signatureUrl) {
        const signatureFile = dataURLtoFile(signature, 'signature.png');
        signatureUrl = await uploadToCloudinary(signatureFile);
      }

      const maggotData = {
        ...formData,
        photoUrl,
        signatureUrl,
        status: 'pending',
        updatedAt: new Date(),
      };

      if (maggot?.id) {
        await updateDoc(doc(db, 'maggots', maggot.id), maggotData);
      } else {
        await addDoc(collection(db, 'maggots'), {
          ...maggotData,
          userId: user.id,
          createdAt: new Date(),
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving maggot:', error);
      showAlert('error', 'ERROR', `Failed to save maggot.

Please verify your data and try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="bg-maagap-blue text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {maggot ? 'Edit Maggot' : 'New Maggot Registration'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maggot By *</label>
            <input
              type="text"
              value={formData.maggotBy}
              onChange={(e) => setFormData({ ...formData, maggotBy: e.target.value })}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photo *</label>
            <div className="flex items-center gap-4">
              {photoPreview && (
                <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="input-field"
                required={!maggot}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Signature *</label>
            <SignaturePad onSave={setSignature} initialValue={signature} />
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : maggot ? 'Update' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MaggotsView({ maggots, user, onRefresh }: any) {
  const [showForm, setShowForm] = useState(false);
  const [selectedMaggot, setSelectedMaggot] = useState<Maggot | undefined>();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMaggots = maggots
    .filter((m: Maggot) => {
      // Filter by status
      const statusMatch = filter === 'all' || m.status === filter;
      
      // Filter by search query
      if (!searchQuery) return statusMatch;
      
      const query = searchQuery.toLowerCase();
      const searchMatch = 
        (m.name || '').toLowerCase().includes(query) ||
        (m.address || '').toLowerCase().includes(query) ||
        (m.maggotBy || '').toLowerCase().includes(query) ||
        (m.telephone || '').toLowerCase().includes(query);
      
      return statusMatch && searchMatch;
    })
    .sort((a: Maggot, b: Maggot) => {
      const nameA = (a.name || '').toUpperCase();
      const nameB = (b.name || '').toUpperCase();
      return nameA.localeCompare(nameB);
    });

  const handleApprove = async (maggotId: string) => {
    if (user.role !== 'admin') return;
    await updateDoc(doc(db, 'maggots', maggotId), {
      status: 'approved',
    });
    onRefresh();
  };

  const handleDelete = async (maggotId: string) => {
    if (user.role !== 'admin') return;
    if (confirm(`⚠️ CONFIRM DELETE

Are you sure you want to delete this maggot?

This action cannot be undone.`)) {
      await deleteDoc(doc(db, 'maggots', maggotId));
      onRefresh();
    }
  };

  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
      // Prepare data for export
      const exportData = filteredMaggots.map((maggot: Maggot) => ({
        'Name': maggot.name || '',
        'Address': maggot.address || '',
        'Maggot By': maggot.maggotBy || '',
        'Telephone': maggot.telephone || '',
        'Status': maggot.status || '',
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Maggots');

      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `MAAGAP_Maggots_${date}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
      
      showAlert('success', 'SUCCESS', `Exported ${filteredMaggots.length} maggot(s) to Excel successfully.

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
          <h2 className="text-2xl font-bold text-gray-800">Maggots Management</h2>
          <p className="text-gray-600">Total Maggots: {maggots.length} | Showing: {filteredMaggots.length}</p>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="🔍 Search maggots..."
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
          <button
            onClick={() => {
              setSelectedMaggot(undefined);
              setShowForm(true);
            }}
            className="btn-primary"
          >
            + New Maggot
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Photo</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Address</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Maggot By</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMaggots.map((maggot: Maggot) => (
              <tr key={maggot.id}>
                <td className="px-4 py-3">
                  {maggot.photoUrl ? (
                    <img src={maggot.photoUrl} alt={maggot.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                      No Photo
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{maggot.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{maggot.address}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{maggot.maggotBy}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{maggot.telephone}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    maggot.status === 'approved' ? 'bg-green-100 text-green-800' :
                    maggot.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {maggot.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {user.role === 'admin' && maggot.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(maggot.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedMaggot(maggot);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(maggot.id)}
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
        <MaggotForm
          maggot={selectedMaggot}
          onClose={() => setShowForm(false)}
          onSuccess={onRefresh}
          user={user}
        />
      )}
    </div>
  );
}
