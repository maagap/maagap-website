'use client';

import { useState } from 'react';
import { showAlert, showConfirm } from './ProfessionalAlert';
import { collection, addDoc, updateDoc, doc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction, Member, User, BillingItem, BillingRecord } from '../lib/types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// TRANSACTIONS VIEW
export function TransactionsView({ transactions, members, user, onRefresh }: any) {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fundTypeFilter, setFundTypeFilter] = useState<'all' | 'Members Assistance Funds' | 'MAAGAP Fund'>('all');
  const [formData, setFormData] = useState({
    receiptNumber: '',
    type: 'IN' as 'IN' | 'OUT',
    fundType: 'Members Assistance Funds' as 'Members Assistance Funds' | 'MAAGAP Fund',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    description: '',
    memberId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedMember = members.find((m: Member) => m.id === formData.memberId);
      
      if (editingTransaction) {
        // Update existing transaction
        await updateDoc(doc(db, 'transactions', editingTransaction.id), {
          ...formData,
          amount: parseFloat(formData.amount),
          memberName: selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : '',
          date: new Date(formData.date),
        });
        showAlert('success', 'SUCCESS', 'Transaction has been updated successfully.');
      } else {
        // Create new transaction
        const transactionRef = await addDoc(collection(db, 'transactions'), {
          ...formData,
          amount: parseFloat(formData.amount),
          memberName: selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : '',
          createdBy: user.id,
          createdByName: user.email,
          date: new Date(formData.date),
          createdAt: new Date(),
        });

        // Auto-update billing record if member is selected and type is IN
        if (formData.memberId && formData.type === 'IN' && selectedMember) {
          try {
            // Get the month from the transaction date (format: YYYY-MM)
            const txMonth = formData.date.substring(0, 7);

            // Find matching billing records for this member
            // Try to match by: memberId + (category matches billingItemName OR month matches)
            const billingQuery = query(
              collection(db, 'billingRecords'),
              where('memberId', '==', formData.memberId),
              where('status', '==', 'pending')
            );
            const billingSnap = await getDocs(billingQuery);

            // Find best matching billing record
            let bestMatch: any = null;

            billingSnap.docs.forEach(docSnap => {
              const record = { id: docSnap.id, ...docSnap.data() };
              const r = record as any;
              // Match by category name (case-insensitive) AND month
              const categoryMatch = formData.category && r.billingItemName &&
                r.billingItemName.toLowerCase().includes(formData.category.toLowerCase());
              const monthMatch = r.month === txMonth;

              if (categoryMatch && monthMatch) {
                bestMatch = record; // Perfect match
              } else if (!bestMatch && categoryMatch) {
                bestMatch = record; // Category match only
              } else if (!bestMatch && monthMatch) {
                bestMatch = record; // Month match only
              } else if (!bestMatch) {
                bestMatch = record; // Take first pending if no other match
              }
            });

            // Update the matched billing record
            if (bestMatch) {
              await updateDoc(doc(db, 'billingRecords', bestMatch.id), {
                status: 'paid',
                paidDate: new Date(formData.date),
                transactionId: transactionRef.id,
              });
            }
          } catch (billingError) {
            console.error('Error updating billing record:', billingError);
            // Don't fail the whole transaction if billing update fails
          }
        }

        showAlert('success', 'SUCCESS', 'Transaction has been created successfully.');
      }
      
      setFormData({
        receiptNumber: '',
        type: 'IN',
        fundType: 'Members Assistance Funds',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        description: '',
        memberId: '',
      });
      setEditingTransaction(null);
      setShowForm(false);
      onRefresh();
    } catch (error) {
      console.error('Error saving transaction:', error);
      showAlert('error', 'ERROR', `Failed to save transaction.

Please verify your data and try again.`);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      receiptNumber: transaction.receiptNumber,
      type: transaction.type,
      fundType: transaction.fundType || 'Members Assistance Funds',
      date: new Date(transaction.date).toISOString().split('T')[0],
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      memberId: transaction.memberId || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (transactionId: string) => {
    const confirmed = await showConfirm('CONFIRM DELETE', `Are you sure you want to delete this transaction?

This action cannot be undone.`);
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, 'transactions', transactionId));
      showAlert('success', 'SUCCESS', 'Transaction has been deleted successfully.');
      onRefresh();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showAlert('error', 'ERROR', `Failed to delete transaction.

Please try again or contact support.`);
    }
  };

  // Filter transactions by search query and fund type
  const filteredTransactions = transactions.filter((t: Transaction) => {
    // Filter by fund type
    const fundTypeMatch = fundTypeFilter === 'all' || (t.fundType || 'Members Assistance Funds') === fundTypeFilter;
    
    // Filter by search query
    if (!searchQuery) return fundTypeMatch;
    
    const query = searchQuery.toLowerCase();
    const searchMatch = (
      (t.receiptNumber || '').toLowerCase().includes(query) ||
      (t.category || '').toLowerCase().includes(query) ||
      (t.description || '').toLowerCase().includes(query) ||
      (t.memberName || '').toLowerCase().includes(query) ||
      t.amount.toString().includes(query)
    );
    
    return fundTypeMatch && searchMatch;
  });

  const totalIn = filteredTransactions.filter((t: Transaction) => t.type === 'IN').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  const totalOut = filteredTransactions.filter((t: Transaction) => t.type === 'OUT').reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
      // Prepare data for export
      const exportData = filteredTransactions.map((transaction: Transaction) => ({
        'Receipt Number': transaction.receiptNumber || '',
        'Date': new Date(transaction.date).toLocaleDateString(),
        'Type': transaction.type || '',
        'Category': transaction.category || '',
        'Description': transaction.description || '',
        'Member': transaction.memberName || '',
        'Amount (KD)': transaction.amount || 0,
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `MAAGAP_Transactions_${date}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
      
      showAlert('success', 'SUCCESS', `Exported ${filteredTransactions.length} transaction(s) to Excel successfully.

File: ${filename}`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showAlert('error', 'ERROR', `Failed to export to Excel.

Please try again.`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
          <div className="flex gap-6 mt-2">
            <p className="text-green-600 font-semibold">Total IN: KD{totalIn.toLocaleString()}</p>
            <p className="text-red-600 font-semibold">Total OUT: KD{totalOut.toLocaleString()}</p>
            <p className="text-blue-600 font-semibold">Balance: KD{(totalIn - totalOut).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <select
            value={fundTypeFilter}
            onChange={(e) => setFundTypeFilter(e.target.value as any)}
            className="input-field w-auto"
          >
            <option value="all">All Funds</option>
            <option value="Members Assistance Funds">Members Assistance Funds</option>
            <option value="MAAGAP Fund">MAAGAP Fund</option>
          </select>
          <input
            type="text"
            placeholder="🔍 Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-64"
          />
          <button onClick={handleExportExcel} className="btn-secondary">
            📥 Export Excel
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            + New Transaction
          </button>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-6">Showing: {filteredTransactions.length} of {transactions.length} transactions</p>

      {showForm && (
        <div className="card mb-6">
          <h3 className="text-lg font-bold mb-4">{editingTransaction ? 'Edit' : 'Add'} Transaction</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number *</label>
              <input
                type="text"
                value={formData.receiptNumber}
                onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="input-field"
                required
              >
                <option value="IN">IN (Income)</option>
                <option value="OUT">OUT (Expense)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fund Type *</label>
              <select
                value={formData.fundType}
                onChange={(e) => setFormData({ ...formData, fundType: e.target.value as any })}
                className="input-field"
                required
              >
                <option value="Members Assistance Funds">Members Assistance Funds</option>
                <option value="MAAGAP Fund">MAAGAP Fund</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
                placeholder="e.g., Membership Fee, Donation, Expense"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member (Optional)</label>
              <select
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                className="input-field"
              >
                <option value="">-- Select Member --</option>
                {members.map((m: Member) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={3}
                required
              />
            </div>
            <div className="md:col-span-2 flex gap-4 justify-end">
              <button type="button" onClick={() => {
                setShowForm(false);
                setEditingTransaction(null);
                setFormData({
                  receiptNumber: '',
                  type: 'IN',
                  fundType: 'Members Assistance Funds',
                  date: new Date().toISOString().split('T')[0],
                  amount: '',
                  category: '',
                  description: '',
                  memberId: '',
                });
              }} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingTransaction ? 'Update' : 'Add'} Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Receipt #</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Fund Type</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Member</th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction: Transaction) => (
              <tr key={transaction.id}>
                <td className="px-4 py-3 text-sm text-gray-700">{transaction.receiptNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.fundType === 'Members Assistance Funds' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {transaction.fundType || 'Members Assistance Funds'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{transaction.category}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{transaction.description}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{transaction.memberName || '-'}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold">
                  KD{transaction.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// BILLING VIEW
export function BillingView({ billingItems, members, user, onRefresh }: any) {
  const [showItemForm, setShowItemForm] = useState(false);
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BillingItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [activeTab, setActiveTab] = useState<'items' | 'records'>('items');
  const [recordFilter, setRecordFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [itemForm, setItemForm] = useState({
    name: '',
    amount: '',
    type: 'monthly' as 'monthly' | 'one-time',
  });
  const [billingForm, setBillingForm] = useState({
    billingItemId: '',
    month: new Date().toISOString().substring(0, 7),
    selectedMembers: [] as string[],
  });

  // Filter billing items by search query
  const filteredBillingItems = billingItems.filter((item: BillingItem) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (item.name || '').toLowerCase().includes(query) ||
      (item.type || '').toLowerCase().includes(query) ||
      item.amount.toString().includes(query)
    );
  });

  const loadBillingRecords = async () => {
    setLoadingRecords(true);
    try {
      const snap = await getDocs(collection(db, 'billingRecords'));
      const records = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
        paidDate: d.data().paidDate?.toDate(),
      } as BillingRecord));
      // Sort by createdAt desc
      records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBillingRecords(records);
    } catch (err) {
      console.error('Error loading records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleMarkAsPaid = async (record: BillingRecord) => {
    try {
      await updateDoc(doc(db, 'billingRecords', record.id), {
        status: 'paid',
        paidDate: new Date(),
      });
      showAlert('success', 'SUCCESS', `Marked as PAID: ${record.memberName} - ${record.billingItemName}`);
      loadBillingRecords();
    } catch (err) {
      showAlert('error', 'ERROR', 'Failed to update. Please try again.');
    }
  };

  const handleMarkAsUnpaid = async (record: BillingRecord) => {
    try {
      await updateDoc(doc(db, 'billingRecords', record.id), {
        status: 'pending',
        paidDate: null,
        transactionId: null,
      });
      showAlert('success', 'SUCCESS', `Marked as UNPAID: ${record.memberName} - ${record.billingItemName}`);
      loadBillingRecords();
    } catch (err) {
      showAlert('error', 'ERROR', 'Failed to update. Please try again.');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Update existing item
        await updateDoc(doc(db, 'billingItems', editingItem.id), {
          name: itemForm.name,
          amount: parseFloat(itemForm.amount),
          type: itemForm.type,
        });
        showAlert('success', 'SUCCESS', 'Billing item has been updated successfully.');
      } else {
        // Create new item
        await addDoc(collection(db, 'billingItems'), {
          name: itemForm.name,
          amount: parseFloat(itemForm.amount),
          type: itemForm.type,
          createdAt: new Date(),
        });
        showAlert('success', 'SUCCESS', 'Billing item has been created successfully.');
      }
      setItemForm({ name: '', amount: '', type: 'monthly' });
      setEditingItem(null);
      setShowItemForm(false);
      onRefresh();
    } catch (error) {
      console.error('Error saving billing item:', error);
      showAlert('error', 'ERROR', `Failed to save billing item.

Please verify your data and try again.`);
    }
  };

  const handleEditItem = (item: BillingItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      amount: item.amount.toString(),
      type: item.type,
    });
    setShowItemForm(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    const confirmed = await showConfirm('CONFIRM DELETE', `Are you sure you want to delete this billing item?

This action cannot be undone.`);
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, 'billingItems', itemId));
      showAlert('success', 'SUCCESS', 'Billing item has been deleted successfully.');
      onRefresh();
    } catch (error) {
      console.error('Error deleting billing item:', error);
      showAlert('error', 'ERROR', `Failed to delete billing item.

Please try again or contact support.`);
    }
  };

  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
      // Prepare data for export
      const exportData = filteredBillingItems.map((item: BillingItem) => ({
        'Item Name': item.name || '',
        'Amount (KD)': item.amount || 0,
        'Type': item.type || '',
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Billing Items');

      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `MAAGAP_Billing_Items_${date}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
      
      showAlert('success', 'SUCCESS', `Exported ${filteredBillingItems.length} billing item(s) to Excel successfully.

File: ${filename}`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showAlert('error', 'ERROR', `Failed to export to Excel.

Please try again.`);
    }
  };

  const handleCreateBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedItem = billingItems.find((item: BillingItem) => item.id === billingForm.billingItemId);
      if (!selectedItem) return;

      const promises = billingForm.selectedMembers.map((memberId) => {
        const member = members.find((m: Member) => m.id === memberId);
        return addDoc(collection(db, 'billingRecords'), {
          memberId,
          memberName: member ? `${member.firstName} ${member.lastName}` : '',
          billingItemId: selectedItem.id,
          billingItemName: selectedItem.name,
          amount: selectedItem.amount,
          month: billingForm.month,
          status: 'pending',
          createdAt: new Date(),
        });
      });

      await Promise.all(promises);
      setBillingForm({ billingItemId: '', month: new Date().toISOString().substring(0, 7), selectedMembers: [] });
      setShowBillingForm(false);
      showAlert('success', 'SUCCESS', 'Billing records have been created successfully.');
      onRefresh();
    } catch (error) {
      console.error('Error creating billing:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Billing Management</h2>
          <p className="text-gray-600 text-sm mt-1">Showing: {filteredBillingItems.length} of {billingItems.length} items</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="🔍 Search billing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-64"
          />
          <button onClick={handleExportExcel} className="btn-secondary">
            📥 Export Excel
          </button>
          <button onClick={() => setShowItemForm(!showItemForm)} className="btn-secondary">
            + New Billing Item
          </button>
          <button onClick={() => setShowBillingForm(!showBillingForm)} className="btn-primary">
            Create Monthly Billing
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'items' ? 'border-b-2 border-maagap-blue text-maagap-blue' : 'text-gray-600 hover:text-gray-800'}`}
        >
          📋 Billing Items
        </button>
        <button
          onClick={() => { setActiveTab('records'); loadBillingRecords(); }}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'records' ? 'border-b-2 border-maagap-blue text-maagap-blue' : 'text-gray-600 hover:text-gray-800'}`}
        >
          💰 Billing Records
        </button>
      </div>

      {showItemForm && (
        <div className="card mb-6">
          <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit' : 'Add'} Billing Item</h3>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <input
                type="text"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                className="input-field"
                placeholder="e.g., Monthly Dues"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
              <input
                type="number"
                step="0.01"
                value={itemForm.amount}
                onChange={(e) => setItemForm({ ...itemForm, amount: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={itemForm.type}
                onChange={(e) => setItemForm({ ...itemForm, type: e.target.value as any })}
                className="input-field"
              >
                <option value="monthly">Monthly</option>
                <option value="one-time">One-Time</option>
              </select>
            </div>
            <div className="md:col-span-3 flex gap-4 justify-end">
              <button type="button" onClick={() => setShowItemForm(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}

      {showBillingForm && (
        <div className="card mb-6">
          <h3 className="text-lg font-bold mb-4">Create Monthly Billing</h3>
          <form onSubmit={handleCreateBilling} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Item *</label>
                <select
                  value={billingForm.billingItemId}
                  onChange={(e) => setBillingForm({ ...billingForm, billingItemId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">-- Select Billing Item --</option>
                  {filteredBillingItems.map((item: BillingItem) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - KD{item.amount.toLocaleString()} ({item.type})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
                <input
                  type="month"
                  value={billingForm.month}
                  onChange={(e) => setBillingForm({ ...billingForm, month: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Members *</label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={billingForm.selectedMembers.length === members.filter((m: Member) => m.status === 'approved').length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBillingForm({
                          ...billingForm,
                          selectedMembers: members.filter((m: Member) => m.status === 'approved').map((m: Member) => m.id),
                        });
                      } else {
                        setBillingForm({ ...billingForm, selectedMembers: [] });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="font-medium">Select All</span>
                </label>
                {members
                  .filter((m: Member) => m.status === 'approved')
                  .map((member: Member) => (
                    <label key={member.id} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        checked={billingForm.selectedMembers.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBillingForm({
                              ...billingForm,
                              selectedMembers: [...billingForm.selectedMembers, member.id],
                            });
                          } else {
                            setBillingForm({
                              ...billingForm,
                              selectedMembers: billingForm.selectedMembers.filter((id) => id !== member.id),
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      {member.firstName} {member.lastName}
                    </label>
                  ))}
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <button type="button" onClick={() => setShowBillingForm(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create Billing ({billingForm.selectedMembers.length} members)
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {activeTab === 'items' ? (
          <>
            <h3 className="text-lg font-bold mb-4">📋 Billing Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBillingItems.map((item: BillingItem) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">KD{item.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          </>
        ) : (
          /* Billing Records Tab */
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">💰 Billing Records</h3>
              <div className="flex gap-2">
                {(['all', 'pending', 'paid'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setRecordFilter(f)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      recordFilter === f
                        ? f === 'paid' ? 'bg-green-500 text-white'
                          : f === 'pending' ? 'bg-red-500 text-white'
                          : 'bg-maagap-blue text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'paid' ? '✓ Paid' : '✗ Unpaid'}
                    {' '}({f === 'all' ? billingRecords.length
                      : billingRecords.filter(r => r.status === (f === 'paid' ? 'paid' : 'pending')).length})
                  </button>
                ))}
              </div>
            </div>
            {loadingRecords ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-maagap-blue"></div>
                <p className="mt-3 text-gray-500">Loading records...</p>
              </div>
            ) : billingRecords.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-lg">No billing records yet</p>
                <p className="text-sm mt-1">Create monthly billing to generate records</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Member</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Billing Item</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Month</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Paid Date</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {billingRecords
                      .filter(r => recordFilter === 'all' || (recordFilter === 'paid' ? r.status === 'paid' : r.status === 'pending'))
                      .map((record) => (
                      <tr key={record.id} className={record.status === 'paid' ? 'bg-green-50' : 'bg-red-50'}>
                        <td className="px-4 py-3 font-medium text-gray-900">{record.memberName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{record.billingItemName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{record.month}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          KD {record.amount.toLocaleString('en-US', { minimumFractionDigits: 3 })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {record.status === 'paid' ? (
                            <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">✓ PAID</span>
                          ) : (
                            <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">✗ UNPAID</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {record.paidDate ? new Date(record.paidDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {record.status === 'pending' ? (
                            <button
                              onClick={() => handleMarkAsPaid(record)}
                              className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600"
                            >
                              ✓ Mark Paid
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkAsUnpaid(record)}
                              className="px-3 py-1 bg-gray-400 text-white rounded text-xs font-semibold hover:bg-gray-500"
                            >
                              ↩ Unpaid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// USERS VIEW
export function UsersView({ users, members, maggots, onRefresh }: any) {
  const [loading, setLoading] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const handleApprove = async (userId: string) => {
    setActionUserId(userId);
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), { approved: true });
      await onRefresh();
      showAlert('success', 'SUCCESS', 'User has been approved successfully.');
    } catch (error) {
      console.error('Error approving user:', error);
      showAlert('error', 'ERROR', `Failed to approve user.

Please try again.`);
    } finally {
      setLoading(false);
      setActionUserId(null);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    setActionUserId(userId);
    setLoading(true);
    try {
      const currentUser = users.find((u: User) => u.id === userId);
      const oldRole = currentUser?.role;

      // Update user role
      await updateDoc(doc(db, 'users', userId), { role: newRole });

      // Handle record migration
      if (oldRole === 'member' && newRole === 'maggot') {
        // Find member record by userId or email
        const memberRecord = members.find((m: Member) => 
          m.userId === userId || m.emailAddress === currentUser?.email
        );

        if (memberRecord) {
          // Create maggot record from member data
          const maggotData = {
            userId: userId,
            name: `${memberRecord.firstName} ${memberRecord.middleName} ${memberRecord.lastName}`.trim(),
            address: memberRecord.cityAddress || memberRecord.provincialAddress || '',
            telephone: memberRecord.cpTel || '',
            maggotBy: 'Converted from Member',
            photoUrl: memberRecord.photoUrl || '',
            signatureUrl: memberRecord.signatureUrl || '',
            status: memberRecord.status || 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Add to maggots collection
          await addDoc(collection(db, 'maggots'), maggotData);

          // Delete from members collection
          await deleteDoc(doc(db, 'members', memberRecord.id));

          showAlert('success', 'SUCCESS', `User role changed to MAGGOT.

Member record has been moved to Maggots.`);
        } else {
          showAlert('success', 'SUCCESS', 'User role changed to MAGGOT.');
        }
      } else if (oldRole === 'maggot' && newRole === 'member') {
        // Find maggot record by userId
        const maggotRecord = maggots.find((m: any) => m.userId === userId);

        if (maggotRecord) {
          // Create member record from maggot data
          const nameParts = maggotRecord.name.split(' ');
          const memberData = {
            userId: userId,
            firstName: nameParts[0] || '',
            middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '',
            lastName: nameParts[nameParts.length - 1] || '',
            pseudonym: '',
            membershipType: 'Regular' as const,
            chapter: '',
            province: '',
            region: '',
            cpTel: maggotRecord.telephone || '',
            emailAddress: currentUser?.email || '',
            provincialAddress: maggotRecord.address || '',
            cityAddress: maggotRecord.address || '',
            officeAddress: '',
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
            occupation: '',
            photoUrl: maggotRecord.photoUrl || '',
            signatureUrl: maggotRecord.signatureUrl || '',
            spouseName: '',
            spouseOccupation: '',
            spouseCompany: '',
            numberOfChildren: 0,
            fatherName: '',
            motherName: '',
            emergencyContact: { name: '', relationship: '' },
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
            status: maggotRecord.status || 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Add to members collection
          await addDoc(collection(db, 'members'), memberData);

          // Delete from maggots collection
          await deleteDoc(doc(db, 'maggots', maggotRecord.id));

          showAlert('success', 'SUCCESS', `User role changed to MEMBER.

MAGGOT record has been moved to Members.`);
        } else {
          showAlert('success', 'SUCCESS', 'User role changed to MEMBER.');
        }
      } else {
        showAlert('success', 'SUCCESS', 'User role changed successfully.');
      }

      await onRefresh();
    } catch (error) {
      console.error('Error changing role:', error);
      showAlert('error', 'ERROR', `Failed to change user role.

Please try again.`);
    } finally {
      setLoading(false);
      setActionUserId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    const confirmed = await showConfirm('CONFIRM DELETE', `Are you sure you want to delete this user?

This action cannot be undone.`);
    if (!confirmed) return;
    
    setActionUserId(userId);
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'users', userId));
      await onRefresh();
      showAlert('success', 'SUCCESS', 'User has been deleted successfully.');
    } catch (error) {
      console.error('Error deleting user:', error);
      showAlert('error', 'ERROR', `Failed to delete user.

Please try again.`);
    } finally {
      setLoading(false);
      setActionUserId(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">User Management</h2>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user: User) => (
              <tr key={user.id}>
                <td className="px-4 py-3 text-sm text-gray-700">{user.name || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                    disabled={loading && actionUserId === user.id}
                    className="input-field w-auto text-sm disabled:opacity-50"
                  >
                    <option value="member">Member</option>
                    <option value="maggot">Maggot</option>
                    <option value="treasurer">Treasurer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {!user.approved && (
                      <button
                        onClick={() => handleApprove(user.id)}
                        disabled={loading && actionUserId === user.id}
                        className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                      >
                        {loading && actionUserId === user.id ? 'Approving...' : 'Approve'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={loading && actionUserId === user.id}
                      className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                    >
                      {loading && actionUserId === user.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// REPORTS VIEW
export function ReportsView({ transactions, members }: any) {
  const [reportType, setReportType] = useState<'statement' | 'summary'>('summary');
  const [selectedMember, setSelectedMember] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const generatePDF = () => {
    const doc = new jsPDF() as any;
    
    doc.setFontSize(16);
    doc.text('MAAGAP GUARDIANS', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Financial Report', 105, 22, { align: 'center' });
    
    if (reportType === 'summary') {
      const totalIn = transactions.filter((t: Transaction) => t.type === 'IN').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      const totalOut = transactions.filter((t: Transaction) => t.type === 'OUT').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      
      doc.autoTable({
        startY: 30,
        head: [['Description', 'Amount']],
        body: [
          ['Total Income', `KD${totalIn.toLocaleString()}`],
          ['Total Expenses', `KD${totalOut.toLocaleString()}`],
          ['Balance', `KD${(totalIn - totalOut).toLocaleString()}`],
        ],
      });

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Receipt #', 'Date', 'Type', 'Category', 'Amount']],
        body: transactions.map((t: Transaction) => [
          t.receiptNumber,
          new Date(t.date).toLocaleDateString(),
          t.type,
          t.category,
          `KD${t.amount.toLocaleString()}`,
        ]),
      });
    }

    doc.text('Developed by Godmisoft - Heber Mayormita', 105, doc.internal.pageSize.height - 10, { align: 'center' });
    doc.save('MAAGAP-Financial-Report.pdf');
  };

  const exportToExcel = () => {
    const data = transactions.map((t: Transaction) => ({
      'Receipt Number': t.receiptNumber,
      'Date': new Date(t.date).toLocaleDateString(),
      'Type': t.type,
      'Category': t.category,
      'Description': t.description,
      'Member': t.memberName || '',
      'Amount': t.amount,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, 'MAAGAP-Transactions.xlsx');
  };

  const totalIn = transactions.filter((t: Transaction) => t.type === 'IN').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  const totalOut = transactions.filter((t: Transaction) => t.type === 'OUT').reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reports & Statements</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Total Income</h3>
          <p className="text-3xl font-bold">KD{totalIn.toLocaleString()}</p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold">KD{totalOut.toLocaleString()}</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Balance</h3>
          <p className="text-3xl font-bold">KD{(totalIn - totalOut).toLocaleString()}</p>
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="text-lg font-bold mb-4">Export Options</h3>
        <div className="flex gap-4">
          <button onClick={generatePDF} className="btn-primary">
            📄 Export to PDF
          </button>
          <button onClick={exportToExcel} className="btn-gold">
            📊 Export to Excel
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-4">Transaction Summary by Category</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">IN</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">OUT</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from(new Set(transactions.map((t: Transaction) => t.category))).map((category) => {
                const categoryTransactions = transactions.filter((t: Transaction) => t.category === category);
                const inAmount = categoryTransactions.filter((t: Transaction) => t.type === 'IN').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
                const outAmount = categoryTransactions.filter((t: Transaction) => t.type === 'OUT').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
                return (
                  <tr key={category as string}>
                    <td className="px-4 py-3 text-sm text-gray-700">{category as string}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">
                      KD{inAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600 font-semibold">
                      KD{outAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      KD{(inAmount - outAmount).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// MEMBERS ASSISTANCE FUNDS VIEW
export function MembersAssistanceView({ transactions, members, user, onRefresh }: any) {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    receiptNumber: '',
    type: 'IN' as 'IN' | 'OUT',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    description: '',
    memberId: '',
  });

  // Filter only Members Assistance Funds transactions
  const fundTransactions = transactions.filter((t: Transaction) => 
    (t.fundType || 'Members Assistance Funds') === 'Members Assistance Funds'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedMember = members.find((m: Member) => m.id === formData.memberId);
      
      if (editingTransaction) {
        await updateDoc(doc(db, 'transactions', editingTransaction.id), {
          receiptNumber: formData.receiptNumber,
          type: formData.type,
          fundType: 'Members Assistance Funds',
          category: formData.category,
          description: formData.description,
          amount: parseFloat(formData.amount),
          memberId: formData.memberId,
          memberName: selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : '',
          date: new Date(formData.date),
        });
        showAlert('success', 'SUCCESS', `Transaction has been updated successfully.`);
      } else {
        await addDoc(collection(db, 'transactions'), {
          receiptNumber: formData.receiptNumber,
          type: formData.type,
          fundType: 'Members Assistance Funds',
          category: formData.category,
          description: formData.description,
          amount: parseFloat(formData.amount),
          memberId: formData.memberId,
          memberName: selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : '',
          createdBy: user.id,
          createdByName: user.email,
          date: new Date(formData.date),
          createdAt: new Date(),
        });
        showAlert('success', 'SUCCESS', `Transaction has been created successfully.`);
      }
      
      setFormData({
        receiptNumber: '',
        type: 'IN',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        description: '',
        memberId: '',
      });
      setEditingTransaction(null);
      setShowForm(false);
      onRefresh();
    } catch (error) {
      console.error('Error saving transaction:', error);
      showAlert('error', 'ERROR', `Failed to save transaction.

Please try again.`);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      receiptNumber: transaction.receiptNumber,
      type: transaction.type,
      date: new Date(transaction.date).toISOString().split('T')[0],
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      memberId: transaction.memberId || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (transactionId: string) => {
    const confirmed = await showConfirm('CONFIRM DELETE', `Are you sure you want to delete this transaction?

This action cannot be undone.`);
    if (!confirmed) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'transactions', transactionId));
      showAlert('success', 'SUCCESS', `Transaction has been deleted successfully.`);
      onRefresh();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showAlert('error', 'ERROR', `Failed to delete transaction.

Please try again.`);
    }
  };

  // Filter by search query
  const filteredTransactions = fundTransactions.filter((t: Transaction) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (t.receiptNumber || '').toLowerCase().includes(query) ||
      (t.category || '').toLowerCase().includes(query) ||
      (t.description || '').toLowerCase().includes(query) ||
      (t.memberName || '').toLowerCase().includes(query) ||
      t.amount.toString().includes(query)
    );
  });

  const totalIn = filteredTransactions.filter((t: Transaction) => t.type === 'IN').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  const totalOut = filteredTransactions.filter((t: Transaction) => t.type === 'OUT').reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
      const exportData = filteredTransactions.map((transaction: Transaction) => ({
        'Receipt Number': transaction.receiptNumber || '',
        'Date': new Date(transaction.date).toLocaleDateString(),
        'Type': transaction.type || '',
        'Category': transaction.category || '',
        'Description': transaction.description || '',
        'Member': transaction.memberName || '',
        'Amount (KD)': transaction.amount || 0,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Members Assistance');

      const date = new Date().toISOString().split('T')[0];
      const filename = `Members_Assistance_Funds_${date}.xlsx`;

      XLSX.writeFile(wb, filename);
      
      showAlert('success', 'SUCCESS', `Exported ${filteredTransactions.length} transaction(s) to Excel successfully.

File: ${filename}`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showAlert('error', 'ERROR', `Failed to export to Excel.

Please try again.`);
    }
  };

  const handleExportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      require('jspdf-autotable');

      const doc = new jsPDF() as any;

      // Title - removed Ø=Üœ
      doc.setFontSize(16);
      doc.setTextColor(128, 0, 128); // Purple
      doc.text('MEMBERS ASSISTANCE FUNDS', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Statement of Account`, 14, 28);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 34);

      // Summary
      doc.setFontSize(12);
      doc.text(`Total IN: KD ${totalIn.toLocaleString()}`, 14, 44);
      doc.text(`Total OUT: KD ${totalOut.toLocaleString()}`, 80, 44);
      doc.text(`Balance: KD ${(totalIn - totalOut).toLocaleString()}`, 146, 44);

      // Table
      const tableData = filteredTransactions.map((t: Transaction) => [
        new Date(t.date).toLocaleDateString(),
        t.receiptNumber,
        t.type,
        t.category,
        t.description,
        t.memberName || '-',
        `KD ${t.amount.toLocaleString()}`
      ]);

      doc.autoTable({
        startY: 50,
        head: [['Date', 'Receipt #', 'Type', 'Category', 'Description', 'Member', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [128, 0, 128] }, // Purple
        styles: { fontSize: 8 },
        columnStyles: {
          6: { halign: 'right' }
        }
      });

      // Signature section
      const finalY = doc.lastAutoTable.finalY + 20;
      
      doc.setFontSize(10);
      
      // Prepared by
      doc.text('Prepared by:', 14, finalY);
      doc.text('_____________________', 14, finalY + 15);
      doc.text('MAAGAP District Treasurer', 14, finalY + 20);
      
      // Audited by
      doc.text('Audited by:', 75, finalY);
      doc.text('_____________________', 75, finalY + 15);
      doc.text('MAAGAP District Auditor', 75, finalY + 20);
      
      // Approved by
      doc.text('Approved by:', 140, finalY);
      doc.text('_____________________', 140, finalY + 15);
      doc.text('MAAGAP District President', 140, finalY + 20);
      
      // Noted by section
      const notedY = finalY + 35;
      doc.text('Noted by:', 14, notedY);
      
      // MAAGAP Commander
      doc.text('_____________________', 14, notedY + 15);
      doc.text('MAAGAP Commander', 14, notedY + 20);
      
      // MAAGAP Supreme Commander
      doc.text('_____________________', 75, notedY + 15);
      doc.text('MAAGAP Supreme Commander', 75, notedY + 20);
      
      // MAAGAP Senior Supreme Commander
      doc.text('_____________________', 140, notedY + 15);
      doc.text('MAAGAP Senior Supreme Commander', 140, notedY + 20);

      const date = new Date().toISOString().split('T')[0];
      const filename = `Members_Assistance_Funds_${date}.pdf`;
      doc.save(filename);

      showAlert('success', 'SUCCESS', `Exported ${filteredTransactions.length} transaction(s) to PDF successfully.

File: ${filename}`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      showAlert('error', 'ERROR', `Failed to export to PDF.

Please try again.`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-purple-800">💜 Members Assistance Funds</h2>
          <div className="flex gap-6 mt-2">
            <p className="text-green-600 font-semibold">Total IN: KD{totalIn.toLocaleString()}</p>
            <p className="text-red-600 font-semibold">Total OUT: KD{totalOut.toLocaleString()}</p>
            <p className="text-purple-600 font-semibold">Balance: KD{(totalIn - totalOut).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="🔍 Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-64"
          />
          <button onClick={handleExportExcel} className="btn-secondary">
            📥 Export Excel
          </button>
          <button onClick={handleExportPDF} className="btn-secondary">
            📄 Export PDF
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            + New Transaction
          </button>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-6">Showing: {filteredTransactions.length} of {fundTransactions.length} transactions</p>

      {/* Form and table - same as TransactionsView but fundType is locked */}
      {showForm && (
        <div className="card mb-6">
          <h3 className="text-lg font-bold mb-4">{editingTransaction ? 'Edit' : 'Add'} Transaction (Members Assistance Funds)</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number *</label>
              <input
                type="text"
                value={formData.receiptNumber}
                onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="input-field"
                required
              >
                <option value="IN">IN (Income)</option>
                <option value="OUT">OUT (Expense)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KD) *</label>
              <input
                type="number"
                step="0.001"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member (Optional)</label>
              <select
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                className="input-field"
              >
                <option value="">No Member</option>
                {members.filter((m: Member) => m.status === 'approved').map((m: Member) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={3}
                required
              />
            </div>
            <div className="md:col-span-2 flex gap-4 justify-end">
              <button type="button" onClick={() => {
                setShowForm(false);
                setEditingTransaction(null);
                setFormData({
                  receiptNumber: '',
                  type: 'IN',
                  date: new Date().toISOString().split('T')[0],
                  amount: '',
                  category: '',
                  description: '',
                  memberId: '',
                });
              }} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingTransaction ? 'Update' : 'Create'} Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Receipt #</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Member</th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction: Transaction) => (
              <tr key={transaction.id}>
                <td className="px-4 py-3 text-sm text-gray-700">{transaction.receiptNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{transaction.category}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{transaction.description}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{transaction.memberName || '-'}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold">
                  KD{transaction.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// MAAGAP FUND VIEW
export function MAAGAPFundView({ transactions, members, user, onRefresh }: any) {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    receiptNumber: '',
    type: 'IN' as 'IN' | 'OUT',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    description: '',
    memberId: '',
  });

  // Filter only MAAGAP Fund transactions
  const fundTransactions = transactions.filter((t: Transaction) => 
    t.fundType === 'MAAGAP Fund'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedMember = members.find((m: Member) => m.id === formData.memberId);
      
      if (editingTransaction) {
        await updateDoc(doc(db, 'transactions', editingTransaction.id), {
          receiptNumber: formData.receiptNumber,
          type: formData.type,
          fundType: 'MAAGAP Fund',
          category: formData.category,
          description: formData.description,
          amount: parseFloat(formData.amount),
          memberId: formData.memberId,
          memberName: selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : '',
          date: new Date(formData.date),
        });
        showAlert('success', 'SUCCESS', `Transaction has been updated successfully.`);
      } else {
        await addDoc(collection(db, 'transactions'), {
          receiptNumber: formData.receiptNumber,
          type: formData.type,
          fundType: 'MAAGAP Fund',
          category: formData.category,
          description: formData.description,
          amount: parseFloat(formData.amount),
          memberId: formData.memberId,
          memberName: selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : '',
          createdBy: user.id,
          createdByName: user.email,
          date: new Date(formData.date),
          createdAt: new Date(),
        });
        showAlert('success', 'SUCCESS', `Transaction has been created successfully.`);
      }
      
      setFormData({
        receiptNumber: '',
        type: 'IN',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        description: '',
        memberId: '',
      });
      setEditingTransaction(null);
      setShowForm(false);
      onRefresh();
    } catch (error) {
      console.error('Error saving transaction:', error);
      showAlert('error', 'ERROR', `Failed to save transaction.

Please try again.`);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      receiptNumber: transaction.receiptNumber,
      type: transaction.type,
      date: new Date(transaction.date).toISOString().split('T')[0],
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      memberId: transaction.memberId || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (transactionId: string) => {
    const confirmed = await showConfirm('CONFIRM DELETE', `Are you sure you want to delete this transaction?

This action cannot be undone.`);
    if (!confirmed) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'transactions', transactionId));
      showAlert('success', 'SUCCESS', `Transaction has been deleted successfully.`);
      onRefresh();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showAlert('error', 'ERROR', `Failed to delete transaction.

Please try again.`);
    }
  };

  // Filter by search query
  const filteredTransactions = fundTransactions.filter((t: Transaction) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (t.receiptNumber || '').toLowerCase().includes(query) ||
      (t.category || '').toLowerCase().includes(query) ||
      (t.description || '').toLowerCase().includes(query) ||
      (t.memberName || '').toLowerCase().includes(query) ||
      t.amount.toString().includes(query)
    );
  });

  const totalIn = filteredTransactions.filter((t: Transaction) => t.type === 'IN').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  const totalOut = filteredTransactions.filter((t: Transaction) => t.type === 'OUT').reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
      const exportData = filteredTransactions.map((transaction: Transaction) => ({
        'Receipt Number': transaction.receiptNumber || '',
        'Date': new Date(transaction.date).toLocaleDateString(),
        'Type': transaction.type || '',
        'Category': transaction.category || '',
        'Description': transaction.description || '',
        'Member': transaction.memberName || '',
        'Amount (KD)': transaction.amount || 0,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'MAAGAP Fund');

      const date = new Date().toISOString().split('T')[0];
      const filename = `MAAGAP_Fund_${date}.xlsx`;

      XLSX.writeFile(wb, filename);
      
      showAlert('success', 'SUCCESS', `Exported ${filteredTransactions.length} transaction(s) to Excel successfully.

File: ${filename}`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showAlert('error', 'ERROR', `Failed to export to Excel.

Please try again.`);
    }
  };

  const handleExportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      require('jspdf-autotable');

      const doc = new jsPDF() as any;

      // Title - removed emoji/weird character
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 255); // Blue
      doc.text('MAAGAP FUND', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Statement of Account`, 14, 28);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 34);

      // Summary
      doc.setFontSize(12);
      doc.text(`Total IN: KD ${totalIn.toLocaleString()}`, 14, 44);
      doc.text(`Total OUT: KD ${totalOut.toLocaleString()}`, 80, 44);
      doc.text(`Balance: KD ${(totalIn - totalOut).toLocaleString()}`, 146, 44);

      // Table
      const tableData = filteredTransactions.map((t: Transaction) => [
        new Date(t.date).toLocaleDateString(),
        t.receiptNumber,
        t.type,
        t.category,
        t.description,
        t.memberName || '-',
        `KD ${t.amount.toLocaleString()}`
      ]);

      doc.autoTable({
        startY: 50,
        head: [['Date', 'Receipt #', 'Type', 'Category', 'Description', 'Member', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 123, 255] }, // Blue
        styles: { fontSize: 8 },
        columnStyles: {
          6: { halign: 'right' }
        }
      });

      // Signature section
      const finalY = doc.lastAutoTable.finalY + 20;
      
      doc.setFontSize(10);
      
      // Prepared by
      doc.text('Prepared by:', 14, finalY);
      doc.text('_____________________', 14, finalY + 15);
      doc.text('MAAGAP District Treasurer', 14, finalY + 20);
      
      // Audited by
      doc.text('Audited by:', 75, finalY);
      doc.text('_____________________', 75, finalY + 15);
      doc.text('MAAGAP District Auditor', 75, finalY + 20);
      
      // Approved by
      doc.text('Approved by:', 140, finalY);
      doc.text('_____________________', 140, finalY + 15);
      doc.text('MAAGAP District President', 140, finalY + 20);
      
      // Noted by section
      const notedY = finalY + 35;
      doc.text('Noted by:', 14, notedY);
      
      // MAAGAP Commander
      doc.text('_____________________', 14, notedY + 15);
      doc.text('MAAGAP Commander', 14, notedY + 20);
      
      // MAAGAP Supreme Commander
      doc.text('_____________________', 75, notedY + 15);
      doc.text('MAAGAP Supreme Commander', 75, notedY + 20);
      
      // MAAGAP Senior Supreme Commander
      doc.text('_____________________', 140, notedY + 15);
      doc.text('MAAGAP Senior Supreme Commander', 140, notedY + 20);

      const date = new Date().toISOString().split('T')[0];
      const filename = `MAAGAP_Fund_${date}.pdf`;
      doc.save(filename);

      showAlert('success', 'SUCCESS', `Exported ${filteredTransactions.length} transaction(s) to PDF successfully.

File: ${filename}`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      showAlert('error', 'ERROR', `Failed to export to PDF.

Please try again.`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-800">💙 MAAGAP Fund</h2>
          <div className="flex gap-6 mt-2">
            <p className="text-green-600 font-semibold">Total IN: KD{totalIn.toLocaleString()}</p>
            <p className="text-red-600 font-semibold">Total OUT: KD{totalOut.toLocaleString()}</p>
            <p className="text-blue-600 font-semibold">Balance: KD{(totalIn - totalOut).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="🔍 Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-64"
          />
          <button onClick={handleExportExcel} className="btn-secondary">
            📥 Export Excel
          </button>
          <button onClick={handleExportPDF} className="btn-secondary">
            📄 Export PDF
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            + New Transaction
          </button>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-6">Showing: {filteredTransactions.length} of {fundTransactions.length} transactions</p>

      {/* Form - same structure */}
      {showForm && (
        <div className="card mb-6">
          <h3 className="text-lg font-bold mb-4">{editingTransaction ? 'Edit' : 'Add'} Transaction (MAAGAP Fund)</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number *</label>
              <input
                type="text"
                value={formData.receiptNumber}
                onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="input-field"
                required
              >
                <option value="IN">IN (Income)</option>
                <option value="OUT">OUT (Expense)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KD) *</label>
              <input
                type="number"
                step="0.001"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member (Optional)</label>
              <select
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                className="input-field"
              >
                <option value="">No Member</option>
                {members.filter((m: Member) => m.status === 'approved').map((m: Member) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={3}
                required
              />
            </div>
            <div className="md:col-span-2 flex gap-4 justify-end">
              <button type="button" onClick={() => {
                setShowForm(false);
                setEditingTransaction(null);
                setFormData({
                  receiptNumber: '',
                  type: 'IN',
                  date: new Date().toISOString().split('T')[0],
                  amount: '',
                  category: '',
                  description: '',
                  memberId: '',
                });
              }} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingTransaction ? 'Update' : 'Create'} Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Receipt #</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Member</th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction: Transaction) => (
              <tr key={transaction.id}>
                <td className="px-4 py-3 text-sm text-gray-700">{transaction.receiptNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{transaction.category}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{transaction.description}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{transaction.memberName || '-'}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold">
                  KD{transaction.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
