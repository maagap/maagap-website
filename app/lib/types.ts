export type MembershipType = 'Regular' | 'Associate' | 'Honorary';

export type UserRole = 'admin' | 'treasurer' | 'member' | 'maggot';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  approved: boolean;
  createdAt: Date;
}

export interface Member {
  id: string;
  userId?: string;
  idNumber?: string;
  
  // Basic Info
  membershipType: MembershipType;
  chapter: string;
  province: string;
  region: string;
  cpTel: string;
  
  // Name
  lastName: string;
  firstName: string;
  middleName: string;
  pseudonym: string;
  
  // Addresses
  provincialAddress: string;
  cityAddress: string;
  officeAddress: string;
  
  // Personal Info
  dateOfBirth: string;
  placeOfBirth: string;
  age: number;
  sex: 'Male' | 'Female';
  civilStatus: 'Single' | 'Married' | 'Widow' | 'Separated';
  religion: string;
  dialect: string;
  height: string;
  weight: string;
  bloodType: string;
  phltNo: string;
  sssNo: string;
  
  // Occupation
  occupation: string;
  emailAddress: string;
  
  // Spouse Info
  spouseName: string;
  spouseOccupation: string;
  spouseCompany: string;
  numberOfChildren: number;
  
  // Parents
  fatherName: string;
  motherName: string;
  
  // Education
  education: {
    elementary: { school: string; course: string; dateCompleted: string };
    secondary: { school: string; course: string; dateCompleted: string };
    vocational: { school: string; course: string; dateCompleted: string };
    college: { school: string; course: string; dateCompleted: string };
    graduate: { school: string; course: string; dateCompleted: string };
  };
  
  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
  };
  
  // References
  references: Array<{
    name: string;
    address: string;
    telCp: string;
  }>;
  
  // Documents
  photoUrl: string;
  signatureUrl: string;
  
  // Approval
  sponsoredBy: string;
  screenedBy: string;
  recommendedBy: string;
  approvedBy: string;
  dateAccomplished: string;
  
  // Status
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Maggot {
  id: string;
  userId?: string;
  
  // Basic Info
  name: string;
  address: string;
  maggotBy: string;
  telephone: string;
  
  // Documents
  photoUrl: string;
  signatureUrl: string;
  
  // Status
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  type: 'IN' | 'OUT';
  fundType: 'Members Assistance Funds' | 'MAAGAP Fund';
  date: Date;
  amount: number;
  category: string;
  description: string;
  memberId?: string;
  memberName?: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
}

export interface BillingItem {
  id: string;
  name: string;
  amount: number;
  type: 'monthly' | 'one-time';
  createdAt: Date;
}

export interface BillingRecord {
  id: string;
  memberId: string;
  memberName: string;
  billingItemId: string;
  billingItemName: string;
  amount: number;
  month: string; // Format: YYYY-MM
  status: 'pending' | 'paid';
  paidDate?: Date;
  transactionId?: string;
  createdAt: Date;
}

export interface StatementOfAccount {
  memberId: string;
  memberName: string;
  period: string;
  transactions: Transaction[];
  totalIn: number;
  totalOut: number;
  balance: number;
}
