export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  address: string;
  memberType: 'Maggot' | 'Member';
  status: 'Active' | 'Inactive';
  dateJoined: Date;
  profileImage?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface GalleryImage {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  cloudinaryId: string;
  category: string;
  eventDate: Date;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface FinancialRecord {
  id: string;
  type: 'IN' | 'OUT';
  amount: number;
  currency: 'KWD';
  category: string;
  description: string;
  date: Date;
  receiptUrl?: string;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'member';
  createdAt: Date;
}

export interface MaagapPrayer {
  id: string;
  title: string;
  content: string;
  category: string;
  order: number;
}
