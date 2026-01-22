# MAAGAP Kuwait - Complete Deployment Guide

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ installed
- Firebase account
- Cloudinary account (for images)
- GitHub account
- Vercel account

### 2. Initial Setup

```bash
# Clone/Download the project
cd maagap-website

# Install dependencies
npm install
```

### 3. Firebase Setup

1. Go to https://console.firebase.google.com/
2. Create a new project: "maagap-kuwait"
3. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create database"
   - Start in production mode
   - Choose location closest to Kuwait
4. Enable Storage:
   - Go to Storage
   - Click "Get Started"
5. Enable Authentication (Optional):
   - Go to Authentication
   - Enable Email/Password
6. Get your config:
   - Go to Project Settings
   - Under "Your apps", click the web icon (</>)
   - Register app: "MAAGAP Kuwait Web"
   - Copy the firebaseConfig values

### 4. Cloudinary Setup

1. Go to https://cloudinary.com
2. Sign up for free account
3. Get your Cloud Name from dashboard
4. Note: You'll need this for uploading gallery images

### 5. Environment Variables

Create `.env.local` file in root directory:

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=maagap-kuwait.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=maagap-kuwait
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=maagap-kuwait.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 6. Add MAAGAP Logo

Place your MAAGAP logo in:
- `/public/images/maagap-logo.png` (Main logo, 400x400px recommended)
- `/public/favicon.ico` (Favicon, 32x32px)
- `/public/icons/icon-192x192.png` (PWA icon, 192x192px)
- `/public/icons/icon-512x512.png` (PWA icon, 512x512px)

You can create all icon sizes from your main logo using online tools like:
- https://realfavicongenerator.net/
- https://www.favicon-generator.org/

### 7. Test Locally

```bash
npm run dev
```

Visit http://localhost:3000

Test all features:
- ✅ Home page loads
- ✅ Registration form works
- ✅ Admin dashboard accessible
- ✅ Financial management functional
- ✅ All navigation links work

### 8. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

#### Option B: Using GitHub + Vercel Dashboard

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial MAAGAP Kuwait website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/maagap-kuwait.git
git push -u origin main
```

2. **Deploy on Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables (same as .env.local)
   - Click "Deploy"

3. **Custom Domain (Optional):**
   - In Vercel dashboard, go to project settings
   - Add custom domain (e.g., maagapkuwait.org)
   - Follow DNS setup instructions

### 9. Post-Deployment Setup

#### Add Sample Data

You can add initial data through the registration form or directly in Firebase Console:

1. **Test Member:**
```
First Name: Juan
Last Name: Dela Cruz
Email: juan@example.com
Phone: +965 1234 5678
Member Type: Member
Status: Active
```

2. **Test Transaction:**
```
Type: IN
Amount: 100.000
Category: Donations
Description: Initial funds
Date: 2025-01-20
```

### 10. PWA Installation

After deployment, users can install the app:

**On Android:**
1. Visit website in Chrome
2. Tap "Add to Home Screen" when prompted
3. App icon appears on home screen

**On iOS:**
1. Visit website in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. App icon appears on home screen

### 11. Admin Access

To secure admin access, you can:

1. **Option A:** Add Firebase Authentication
   - Implement login page
   - Protect `/admin` route

2. **Option B:** Use environment-based password
   - Add simple password check
   - Store password in environment variables

### 12. Ongoing Maintenance

**Database Collections Structure:**

```
firestore/
├── members/
│   ├── {memberId}
│   │   ├── firstName
│   │   ├── lastName
│   │   ├── email
│   │   ├── phone
│   │   ├── memberType (Maggot/Member)
│   │   ├── status (Active/Inactive)
│   │   └── ...
│   
├── financial/
│   ├── {transactionId}
│   │   ├── type (IN/OUT)
│   │   ├── amount
│   │   ├── category
│   │   ├── description
│   │   └── date
│   
└── gallery/
    ├── {photoId}
    │   ├── url
    │   ├── title
    │   ├── date
    │   └── uploadedAt
```

**Regular Tasks:**
- Monitor member registrations
- Track financial transactions
- Upload activity photos to gallery
- Backup Firestore database monthly

### 13. Troubleshooting

**Issue: Firebase not connecting**
- Double-check environment variables
- Verify Firebase project settings
- Check browser console for errors

**Issue: PWA not installing**
- Ensure HTTPS is enabled
- Check manifest.json is accessible
- Verify all icon sizes exist

**Issue: Images not loading**
- Check Cloudinary configuration
- Verify image URLs in database
- Check Next.js image domains in next.config.js

### 14. Support & Updates

For technical support:
- Check Firebase console for errors
- Review Vercel deployment logs
- Contact MAAGAP Kuwait tech team

---

## 🎉 You're All Set!

Your MAAGAP Kuwait website is now live and ready to serve the community!

**Next Steps:**
1. Share the website URL with members
2. Encourage members to register
3. Start adding activity photos
4. Track organizational finances

**"THE TRUTH STILL STAND"** 🙏

