'use client';

import { useState, useEffect } from 'react';
import { Member, User, BillingRecord } from '../types';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ContributionStatusProps {
  member: Member;
  user: User;
}

export default function ContributionStatus({ member, user }: ContributionStatusProps) {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBilling = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'billingRecords'),
          where('memberId', '==', member.id),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const records = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          paidDate: doc.data().paidDate?.toDate(),
        } as BillingRecord));
        setBillingRecords(records);
      } catch (error) {
        console.error('Error loading billing:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBilling();
  }, [member.id]);

  const totalAmount = billingRecords.reduce((sum, r) => sum + r.amount, 0);
  const paidCount = billingRecords.filter(r => r.status === 'paid').length;
  const unpaidCount = billingRecords.filter(r => r.status === 'pending').length;
  const paidAmount = billingRecords.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
  const unpaidAmount = billingRecords.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-8 rounded-lg shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">💰 Contribution Status</h1>
            <p className="text-green-100">
              {member.firstName} {member.lastName} - {member.chapter} Chapter
            </p>
          </div>
          {!loading && billingRecords.length > 0 && (
            <div className="bg-white text-green-800 px-6 py-4 rounded-lg">
              <div className="text-2xl font-bold">
                ₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm">Total Billing</div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && billingRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card bg-blue-50 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Records</h3>
            <p className="text-3xl font-bold text-blue-600">{billingRecords.length}</p>
          </div>
          <div className="card bg-green-50 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✓ Paid</h3>
            <p className="text-3xl font-bold text-green-600">{paidCount}</p>
            <p className="text-sm text-green-700 mt-1">
              ₱{paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="card bg-red-50 border-l-4 border-red-500">
            <h3 className="text-lg font-semibold text-red-800 mb-2">✗ Unpaid</h3>
            <p className="text-3xl font-bold text-red-600">{unpaidCount}</p>
            <p className="text-sm text-red-700 mt-1">
              ₱{unpaidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {/* Billing Records Table */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Billing Records</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600"></div>
            <p className="text-gray-600 mt-4">Loading billing records...</p>
          </div>
        ) : billingRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-xl text-gray-600 mb-2">No Billing Records Yet</p>
            <p className="text-gray-500">Your billing records will appear here when the admin creates them.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Month</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Paid Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {billingRecords.map((record) => (
                  <tr 
                    key={record.id} 
                    className={`${record.status === 'paid' ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'} transition-colors`}
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{record.billingItemName}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {record.month ? new Date(record.month + '-01').toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      }) : '-'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-lg font-bold text-gray-900">
                        ₱{record.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {record.status === 'paid' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-500 text-white">
                          <span className="mr-1">✓</span> PAID
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-500 text-white">
                          <span className="mr-1">✗</span> UNPAID
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {record.paidDate ? (
                        <div>
                          <div className="font-medium">
                            {new Date(record.paidDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(record.paidDate).toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr className="font-semibold">
                  <td colSpan={2} className="px-4 py-4 text-gray-800">Total:</td>
                  <td className="px-4 py-4 text-right text-lg text-gray-900">
                    ₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} className="px-4 py-4">
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-700">
                        <span className="font-semibold">{paidCount}</span> Paid
                      </span>
                      <span className="text-red-700">
                        <span className="font-semibold">{unpaidCount}</span> Unpaid
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="card bg-blue-50 mt-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">ℹ️</div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">About Your Contributions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>PAID</strong> items are already settled and recorded in the system</li>
              <li>• <strong>UNPAID</strong> items need to be paid to the treasurer</li>
              <li>• Contact your chapter treasurer for payment arrangements</li>
              <li>• Your payment will be reflected here once the treasurer processes it</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
