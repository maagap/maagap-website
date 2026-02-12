# MAAGAP Financial Management System

Progressive Web Application para sa Multi Generation of Active Apostolic Guardians Association of the Philippines (MAAGAP), Inc.

![MAAGAP Logo](public/logo.png)

## ⚠️ IMPORTANTE - READ FIRST!

**Before running the app, setup Firebase and Cloudinary first!**

See **FIREBASE-SETUP.md** for complete step-by-step instructions.

### Quick Checklist:
- [ ] Firestore Rules published
- [ ] Email/Password Authentication enabled
- [ ] Cloudinary upload preset created (`maagap_uploads`, Unsigned mode)
- [ ] Environment variables configured
- [ ] First admin user approved in Firestore

## Features

✅ **Member Registration** - Complete member information form
✅ **Maggot Registration** - Simplified registration  
✅ **Financial Transactions** - IN/OUT with receipt numbers
✅ **Payment Items** - Monthly payment tracking
✅ **Statement of Accounts** - Complete financial reports
✅ **User Management** - Admin approval system
✅ **PWA Support** - Install as mobile/desktop app

## Quick Setup

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Environment Variables
Naa na ang `.env.local` file with Firebase and Cloudinary credentials!

### 3. Setup Cloudinary Upload Preset
1. Go to https://cloudinary.com/console
2. Settings > Upload > Upload presets
3. Click "Add upload preset"
4. Name: `maagap_uploads`
5. Signing Mode: **Unsigned**
6. Folder: `maagap`
7. Save

### 4. Setup Firebase Rules
Go to Firebase Console > Firestore > Rules:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`

### 5. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:3000

### 6. Create First Admin
1. Register sa app
2. Go to Firebase Console > Firestore
3. Find your user sa `users` collection
4. Edit:
   - `status`: "approved"
   - `role`: "admin"
5. Login ulit

## Deploy to Vercel

### Add Environment Variables sa Vercel:
\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCYLcQphD-kQVFbm-lVSU4sDFYuc-fj4Qo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=maagap-financial.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=maagap-financial
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=maagap-financial.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=478314562787
NEXT_PUBLIC_FIREBASE_APP_ID=1:478314562787:web:821e0788d2bf289daef1d6
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dugchj51b
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=maagap_uploads
\`\`\`

### Deploy Steps:
1. Push to GitHub
2. Import sa Vercel
3. Add environment variables
4. Deploy!

## Firestore Collections

Auto-create when first data is added:

- **users** - User accounts and roles
- **members** - Full member registrations
- **maggots** - Maggot registrations
- **transactions** - Financial IN/OUT records
- **paymentItems** - Monthly payment templates
- **memberPayments** - Individual member payments

## User Roles

- **Admin** - Full access, user approval
- **Treasurer** - Manage finances
- **Member** - Register members
- **Maggot** - Register maggots

## Tech Stack

- Next.js 14 + TypeScript
- Firebase (Auth + Firestore)
- Cloudinary (Images)
- Tailwind CSS
- PWA

---

**Developed by Godmisoft**  
**Heber Mayormita © 2025**

**"THE TRUTH STILL STANDING"**
