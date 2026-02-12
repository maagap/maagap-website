'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, deleteDoc, addDoc, orderBy } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { User, UserRole, Member, Maggot, Transaction, BillingItem, BillingRecord } from './types';
import Image from 'next/image';
import SignaturePad from './components/SignaturePad';
import { uploadToCloudinary, dataURLtoFile } from './lib/cloudinary';
import MembersView from './components/MembersView';
import MaggotsView from './components/MaggotsView';
import MemberProfileView from './components/MemberProfileView';
import MemberApplicationForm from './components/MemberApplicationForm';
import MaggotProfileView from './components/MaggotProfileView';
import MaggotApplicationForm from './components/MaggotApplicationForm';
import ContributionStatus from './components/ContributionStatus';
import MAAGAPLoader from './components/MAAGAPLoader';
import { TransactionsView, BillingView, UsersView, ReportsView, MembersAssistanceView, MAAGAPFundView } from './components/AllViews';
import { registerServiceWorker } from './lib/serviceWorker';
import { AlertProvider } from './components/ProfessionalAlert';

export default function Home() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Dashboard states
  const [dashboardView, setDashboardView] = useState<'overview' | 'members' | 'maggots' | 'transactions' | 'members-assistance' | 'maagap-fund' | 'billing' | 'users' | 'reports'>('overview');
  const [memberView, setMemberView] = useState<'profile' | 'contributions'>('profile');
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [memberDataLoading, setMemberDataLoading] = useState(true);
  const [maggots, setMaggots] = useState<Maggot[]>([]);
  const [currentMaggot, setCurrentMaggot] = useState<Maggot | null>(null);
  const [maggotDataLoading, setMaggotDataLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalMaggots: 0,
    totalIn: 0,
    totalOut: 0,
    balance: 0,
    pendingApprovals: 0
  });

  // Register service worker for PWA
  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() } as User;
          setUser(userData);
          if (userData.approved) {
            setView('dashboard');
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load dashboard data when user is set
  useEffect(() => {
    if (user && user.approved && view === 'dashboard') {
      loadDashboardData();
    }
  }, [user, view]);

  // Load users specifically when Users tab is clicked
  useEffect(() => {
    const loadUsers = async () => {
      if (user?.role === 'admin' && dashboardView === 'users') {
        try {
          const usersSnap = await getDocs(collection(db, 'users'));
          const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
          setUsers(usersData);
        } catch (error) {
          console.error('Error loading users:', error);
        }
      }
    };
    loadUsers();
  }, [dashboardView, user]);

  const loadDashboardData = async () => {
    try {
      // Set loading for members and maggots
      if (user?.role === 'member') {
        setMemberDataLoading(true);
      }
      if (user?.role === 'maggot') {
        setMaggotDataLoading(true);
      }

      // Load members
      const membersSnap = await getDocs(collection(db, 'members'));
      const membersData = membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
      setMembers(membersData);

      // Load current member data if user is a member
      if (user?.role === 'member') {
        const memberData = membersData.find(m => m.emailAddress === user.email);
        setCurrentMember(memberData || null);
        setMemberDataLoading(false);
      }

      // Load maggots
      const maggotsSnap = await getDocs(collection(db, 'maggots'));
      const maggotsData = maggotsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Maggot));
      setMaggots(maggotsData);

      // Load current maggot data if user is a maggot
      if (user?.role === 'maggot') {
        const maggotData = maggotsData.find(m => m.userId === user.id);
        setCurrentMaggot(maggotData || null);
        setMaggotDataLoading(false);
      }

      // Load transactions
      const transactionsSnap = await getDocs(query(collection(db, 'transactions'), orderBy('date', 'desc')));
      const transactionsData = transactionsSnap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      } as Transaction));
      setTransactions(transactionsData);

      // Load billing items
      const billingSnap = await getDocs(collection(db, 'billingItems'));
      const billingData = billingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BillingItem));
      setBillingItems(billingData);

      // Load users (admin only)
      if (user?.role === 'admin') {
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersData);
      }

      // Calculate stats
      const totalIn = transactionsData.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.amount, 0);
      const totalOut = transactionsData.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.amount, 0);
      const pendingApprovals = [...membersData, ...maggotsData].filter(m => m.status === 'pending').length;

      setStats({
        totalMembers: membersData.filter(m => m.status === 'approved').length,
        totalMaggots: maggotsData.filter(m => m.status === 'approved').length,
        totalIn,
        totalOut,
        balance: totalIn - totalOut,
        pendingApprovals
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError('Invalid email or password');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        name: name || email.split('@')[0], // Use name or email prefix as fallback
        role: 'member',
        approved: true, // Auto-approve members
        createdAt: new Date()
      });
      setError('Registration successful! You can now login.');
      // Auto-login after successful registration
      setTimeout(() => {
        setView('login');
        setError('');
      }, 2000);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('login');
  };

  if (loading) {
    return <MAAGAPLoader />;
  }

  if (!firebaseUser || !user || !user.approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maagap-blue to-blue-900 p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Image src="/logo.png" alt="MAAGAP Logo" width={120} height={120} className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-maagap-blue">MAAGAP GUARDIANS</h1>
            <p className="text-gray-600">Financial Management System</p>
          </div>

          {user && !user.approved && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-center">
                Your account is pending approval. Please wait for an administrator to approve your access.
              </p>
              <button onClick={handleLogout} className="btn-secondary w-full mt-4">
                Logout
              </button>
            </div>
          )}

          {!user && (
            <>
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setView('login')}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    view === 'login' ? 'bg-maagap-blue text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setView('register')}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    view === 'register' ? 'bg-maagap-blue text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Register
                </button>
              </div>

              {error && (
                <div className={`mb-4 p-3 rounded-lg ${error.includes('successful') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {error}
                </div>
              )}

              <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-4">
                {view === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                      placeholder="Juan Dela Cruz"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  {view === 'login' ? 'Login' : 'Register'}
                </button>
              </form>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>Developed by <span className="font-semibold text-maagap-blue">Godmisoft</span></p>
            <p className="text-xs mt-1">Heber Mayormita © 2025</p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <AlertProvider>
      <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-maagap-blue text-white shadow-lg">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Image src="/logo.png" alt="MAAGAP Logo" width={50} height={50} />
                <div>
                  <h1 className="text-xl font-bold">MAAGAP GUARDIANS</h1>
                  <p className="text-sm text-blue-200">Financial Management System</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm">{user.email}</p>
                <p className="text-xs text-blue-200 capitalize">{user.role}</p>
              </div>
              <button onClick={handleLogout} className="bg-white text-maagap-blue px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* Member Role - Show Profile/Form/Status */}
          {user.role === 'member' ? (
            memberDataLoading ? (
              <MAAGAPLoader />
            ) : currentMember ? (
              <>
                {/* Navigation for approved members */}
                {currentMember.status === 'approved' && (
                  <nav className="bg-white rounded-lg shadow-md p-2 mb-6 flex gap-2">
                    <button
                      onClick={() => setMemberView('profile')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        memberView === 'profile' ? 'bg-maagap-blue text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      👤 My Profile
                    </button>
                    <button
                      onClick={() => setMemberView('contributions')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        memberView === 'contributions' ? 'bg-maagap-blue text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      💰 Contributions
                    </button>
                  </nav>
                )}

                {/* Content based on view */}
                {currentMember.status === 'approved' ? (
                  memberView === 'profile' ? (
                    <MemberProfileView 
                      member={currentMember} 
                      user={user} 
                      onRefresh={loadDashboardData} 
                    />
                  ) : (
                    <ContributionStatus
                      member={currentMember}
                      user={user}
                    />
                  )
                ) : (
                  // Show pending application in read-only mode
                  <div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">⏳</div>
                        <div>
                          <h3 className="text-lg font-semibold text-yellow-800">Application Pending Review</h3>
                          <p className="text-yellow-700 text-sm">
                            Your membership application is currently being reviewed by admin.
                          </p>
                        </div>
                      </div>
                    </div>
                    <MemberProfileView 
                      member={currentMember} 
                      user={user} 
                      onRefresh={loadDashboardData} 
                    />
                  </div>
                )}
              </>
            ) : (
              <MemberApplicationForm 
                user={user} 
                onSubmit={loadDashboardData} 
              />
            )
          ) : user.role === 'maggot' ? (
            /* Maggot Role - Show Profile/Form/Status */
            maggotDataLoading ? (
              <MAAGAPLoader />
            ) : currentMaggot ? (
              currentMaggot.status === 'approved' ? (
                <MaggotProfileView 
                  maggot={currentMaggot} 
                  user={user} 
                  onRefresh={loadDashboardData} 
                />
              ) : (
                // Show pending application in read-only mode
                <div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">⏳</div>
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-800">Application Pending Review</h3>
                        <p className="text-yellow-700 text-sm">
                          Your MAGGOT application is currently being reviewed by admin.
                        </p>
                      </div>
                    </div>
                  </div>
                  <MaggotProfileView 
                    maggot={currentMaggot} 
                    user={user} 
                    onRefresh={loadDashboardData} 
                  />
                </div>
              )
            ) : (
              <MaggotApplicationForm 
                user={user} 
                onSubmit={loadDashboardData} 
              />
            )
          ) : (
            <>
              {/* Navigation - Admin/Treasurer Only */}
              <nav className="bg-white rounded-lg shadow-md p-2 mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setDashboardView('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dashboardView === 'overview' ? 'bg-maagap-blue text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setDashboardView('members')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dashboardView === 'members' ? 'bg-maagap-blue text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Members
            </button>
            <button
              onClick={() => setDashboardView('maggots')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dashboardView === 'maggots' ? 'bg-maagap-blue text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Maggots
            </button>
            {(user.role === 'admin' || user.role === 'treasurer') && (
              <>
                <button
                  onClick={() => setDashboardView('transactions')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    dashboardView === 'transactions' ? 'bg-maagap-blue text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Transactions
                </button>
                <button
                  onClick={() => setDashboardView('members-assistance')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    dashboardView === 'members-assistance' ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  💜 Members Assistance
                </button>
                <button
                  onClick={() => setDashboardView('maagap-fund')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    dashboardView === 'maagap-fund' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  💙 MAAGAP Fund
                </button>
                <button
                  onClick={() => setDashboardView('billing')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    dashboardView === 'billing' ? 'bg-maagap-blue text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Billing
                </button>
                <button
                  onClick={() => setDashboardView('reports')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    dashboardView === 'reports' ? 'bg-maagap-blue text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Reports
                </button>
              </>
            )}
            {user.role === 'admin' && (
              <button
                onClick={() => setDashboardView('users')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dashboardView === 'users' ? 'bg-maagap-blue text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Users
              </button>
            )}
          </nav>

          {/* Dashboard Content */}
          {dashboardView === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <h3 className="text-lg font-semibold mb-2">Total Members</h3>
                  <p className="text-4xl font-bold">{stats.totalMembers}</p>
                </div>
                <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <h3 className="text-lg font-semibold mb-2">Total Maggots</h3>
                  <p className="text-4xl font-bold">{stats.totalMaggots}</p>
                </div>
                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <h3 className="text-lg font-semibold mb-2">Total Income</h3>
                  <p className="text-4xl font-bold">KD{stats.totalIn.toLocaleString()}</p>
                </div>
                <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
                  <h3 className="text-lg font-semibold mb-2">Total Expenses</h3>
                  <p className="text-4xl font-bold">KD{stats.totalOut.toLocaleString()}</p>
                </div>
                <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                  <h3 className="text-lg font-semibold mb-2">Balance</h3>
                  <p className="text-4xl font-bold">KD{stats.balance.toLocaleString()}</p>
                </div>
                {user.role === 'admin' && (
                  <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <h3 className="text-lg font-semibold mb-2">Pending Approvals</h3>
                    <p className="text-4xl font-bold">{stats.pendingApprovals}</p>
                  </div>
                )}
              </div>

              {/* Recent Transactions */}
              <div className="card mt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Receipt #</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.slice(0, 10).map((transaction) => (
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
                          <td className="px-4 py-3 text-sm text-gray-700">{transaction.description}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold">
                            KD{transaction.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {dashboardView === 'members' && <MembersView members={members} user={user} onRefresh={loadDashboardData} />}
          {dashboardView === 'maggots' && <MaggotsView maggots={maggots} user={user} onRefresh={loadDashboardData} />}
          {dashboardView === 'transactions' && <TransactionsView transactions={transactions} members={members} billingItems={billingItems} user={user} onRefresh={loadDashboardData} />}
          {dashboardView === 'members-assistance' && <MembersAssistanceView transactions={transactions} members={members} billingItems={billingItems} user={user} onRefresh={loadDashboardData} />}
          {dashboardView === 'maagap-fund' && <MAAGAPFundView transactions={transactions} members={members} billingItems={billingItems} user={user} onRefresh={loadDashboardData} />}
          {dashboardView === 'billing' && <BillingView billingItems={billingItems} members={members} user={user} onRefresh={loadDashboardData} />}
          {dashboardView === 'users' && user.role === 'admin' && <UsersView users={users} members={members} maggots={maggots} onRefresh={loadDashboardData} />}
          {dashboardView === 'reports' && <ReportsView transactions={transactions} members={members} />}
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600">
            <p>Developed by <span className="font-semibold text-maagap-blue">Godmisoft</span></p>
            <p className="text-xs mt-1">Heber Mayormita © 2025</p>
          </div>
        </footer>
      </div>
    </AlertProvider>
  );
}
