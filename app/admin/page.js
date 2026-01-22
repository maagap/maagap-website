'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/firebase.config.js';
import { collection, getDocs, query, orderBy, where, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ memberType: 'All', status: 'All' });
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newTransaction, setNewTransaction] = useState({
    type: 'IN',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchMembers();
    fetchTransactions();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const memberData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(memberData);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const q = query(collection(db, 'financial'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const transactionData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(transactionData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'financial'), {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
        createdAt: serverTimestamp()
      });
      
      setNewTransaction({
        type: 'IN',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      fetchTransactions();
      alert('Transaction added successfully!');
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction');
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesType = filter.memberType === 'All' || member.memberType === filter.memberType;
    const matchesStatus = filter.status === 'All' || member.status === filter.status;
    const matchesSearch = searchTerm === '' || 
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const calculateBalance = () => {
    return transactions.reduce((acc, t) => {
      return t.type === 'IN' ? acc + t.amount : acc - t.amount;
    }, 0);
  };

  const totalIncome = transactions.filter(t => t.type === 'IN').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-red-800 p-8">
              <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-yellow-300 text-lg">MAAGAP Kuwait Management System</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'members'
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Members ({members.length})
              </button>
              <button
                onClick={() => setActiveTab('financial')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'financial'
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Financial Management
              </button>
            </div>

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="p-8">
                {/* Filters */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Search</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Member Type</label>
                    <select
                      value={filter.memberType}
                      onChange={(e) => setFilter({ ...filter, memberType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All Types</option>
                      <option value="Maggot">Maggot</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Status</label>
                    <select
                      value={filter.status}
                      onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Members List */}
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading members...</p>
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No members found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-gray-700 font-medium">Name</th>
                          <th className="px-4 py-3 text-left text-gray-700 font-medium">Email</th>
                          <th className="px-4 py-3 text-left text-gray-700 font-medium">Phone</th>
                          <th className="px-4 py-3 text-left text-gray-700 font-medium">Type</th>
                          <th className="px-4 py-3 text-left text-gray-700 font-medium">Status</th>
                          <th className="px-4 py-3 text-left text-gray-700 font-medium">Registered</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">
                                {member.firstName} {member.lastName}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{member.email}</td>
                            <td className="px-4 py-3 text-gray-600">{member.phone}</td>
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                member.memberType === 'Maggot'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {member.memberType}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                member.status === 'Active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {member.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-sm">
                              {member.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
              <div className="p-8">
                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-green-100 rounded-lg p-6 border-l-4 border-green-500">
                    <p className="text-green-800 font-medium mb-2">Total Income</p>
                    <p className="text-3xl font-bold text-green-900">KWD {totalIncome.toFixed(3)}</p>
                  </div>
                  <div className="bg-red-100 rounded-lg p-6 border-l-4 border-red-500">
                    <p className="text-red-800 font-medium mb-2">Total Expenses</p>
                    <p className="text-3xl font-bold text-red-900">KWD {totalExpenses.toFixed(3)}</p>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-6 border-l-4 border-blue-500">
                    <p className="text-blue-800 font-medium mb-2">Current Balance</p>
                    <p className="text-3xl font-bold text-blue-900">KWD {calculateBalance().toFixed(3)}</p>
                  </div>
                </div>

                {/* Add Transaction Form */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Transaction</h3>
                  <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Type</label>
                      <select
                        value={newTransaction.type}
                        onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="IN">Income (IN)</option>
                        <option value="OUT">Expense (OUT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Amount (KWD)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Category</label>
                      <input
                        type="text"
                        value={newTransaction.category}
                        onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                        required
                        placeholder="e.g., Donations, Events"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Description</label>
                      <input
                        type="text"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Date</label>
                      <input
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-900 to-red-800 text-white font-bold py-2 px-8 rounded-lg hover:shadow-lg transition-all"
                      >
                        Add Transaction
                      </button>
                    </div>
                  </form>
                </div>

                {/* Transactions List */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-700 font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-gray-700 font-medium">Type</th>
                        <th className="px-4 py-3 text-left text-gray-700 font-medium">Category</th>
                        <th className="px-4 py-3 text-left text-gray-700 font-medium">Description</th>
                        <th className="px-4 py-3 text-right text-gray-700 font-medium">Amount (KWD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-600">{transaction.date}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              transaction.type === 'IN'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700 font-medium">{transaction.category}</td>
                          <td className="px-4 py-3 text-gray-600">{transaction.description}</td>
                          <td className={`px-4 py-3 text-right font-bold ${
                            transaction.type === 'IN' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'IN' ? '+' : '-'}{transaction.amount.toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

