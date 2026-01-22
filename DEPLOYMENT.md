# MAAGAP Kuwait - Deployment Guide

## 🚀 Quick Deployment to Vercel

### Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done)
```bash
cd maagap-website
git init
git add .
git commit -m "Initial commit - MAAGAP Kuwait website"
```

2. **Create GitHub Repository**
- Go to https://github.com/new
- Create a new repository named `maagap-kuwait`
- Do NOT initialize with README (we already have one)

3. **Push to GitHub**
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/maagap-kuwait.git
git push -u origin main
```

### Step 2: Set Up Firebase

1. **Create Firebase Project**
- Visit https://console.firebase.google.com
- Click "Add project"
- Name it "maagap-kuwait"
- Disable Google Analytics (optional)

2. **Enable Firestore Database**
- In Firebase Console, go to "Firestore Database"
- Click "Create database"
- Start in **production mode**
- Choose your region (preferably closest to Kuwait)

3. **Set Up Authentication**
- Go to "Authentication" → "Get started"
- Enable "Email/Password" provider

4. **Get Firebase Config**
- Go to Project Settings (gear icon)
- Scroll to "Your apps"
- Click "Web" (</>) icon
- Register app as "MAAGAP Kuwait"
- Copy the config values

5. **Create Firestore Collections**
In Firestore, create these collections:
- `members`
- `gallery`
- `financials`
- `users`

6. **Set Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /members/{memberId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /gallery/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /financials/{recordId} {
      allow read, write: if request.auth != null;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 3: Set Up Cloudinary

1. **Create Account**
- Visit https://cloudinary.com/users/register/free
- Sign up for free account

2. **Get Credentials**
- Go to Dashboard
- Copy:
  - Cloud Name
  - API Key
  - API Secret

3. **Create Upload Preset**
- Settings → Upload → Upload presets
- Click "Add upload preset"
- Name it "maagap-gallery"
- Set "Signing Mode" to "Unsigned"
- Save

### Step 4: Deploy to Vercel

1. **Connect to Vercel**
- Visit https://vercel.com
- Sign up/Login with GitHub
- Click "Add New Project"
- Import your `maagap-kuwait` repository

2. **Configure Environment Variables**
In Vercel project settings, add these variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Deploy**
- Click "Deploy"
- Wait for build to complete (2-3 minutes)
- Your site will be live at `https://maagap-kuwait.vercel.app`

### Step 5: Custom Domain (Optional)

1. **Add Domain in Vercel**
- Project Settings → Domains
- Add your domain (e.g., maagap-kuwait.org)

2. **Configure DNS**
- Add CNAME record pointing to `cname.vercel-dns.com`
- Wait for propagation (up to 48 hours)

## 📱 PWA Installation Instructions

### For Users - Mobile (iOS)
1. Open Safari browser
2. Visit your website
3. Tap Share button
4. Tap "Add to Home Screen"
5. Confirm

### For Users - Mobile (Android)
1. Open Chrome browser
2. Visit your website
3. Tap the menu (3 dots)
4. Tap "Add to Home Screen"
5. Confirm

### For Users - Desktop (Chrome/Edge)
1. Visit your website
2. Look for install icon in address bar
3. Click "Install"
4. App opens in standalone window

## 🔧 Post-Deployment Tasks

### 1. Replace Logo Images
Upload your actual MAAGAP logo to:
- `/public/icons/icon-72x72.png`
- `/public/icons/icon-96x96.png`
- `/public/icons/icon-128x128.png`
- `/public/icons/icon-144x144.png`
- `/public/icons/icon-152x152.png`
- `/public/icons/icon-192x192.png`
- `/public/icons/icon-384x384.png`
- `/public/icons/icon-512x512.png`
- `/public/favicon.ico`

### 2. Create Admin Account
```javascript
// In Firebase Console → Authentication
// Add user manually:
// Email: admin@maagap-kuwait.org
// Password: [create secure password]
```

### 3. Test All Features
- [ ] Homepage loads correctly
- [ ] Members page displays (empty initially)
- [ ] Gallery page works
- [ ] Admin dashboard accessible
- [ ] Financial management works
- [ ] PWA can be installed
- [ ] Offline mode works

### 4. Add Sample Data
Use the admin panel to add:
- 2-3 sample members
- 3-5 sample gallery images
- A few financial records

## 🔒 Security Checklist

- [ ] Firebase security rules are set
- [ ] Environment variables are configured in Vercel
- [ ] .env files are in .gitignore
- [ ] Admin authentication is set up
- [ ] HTTPS is enabled (automatic with Vercel)

## 📊 Monitoring

### Vercel Analytics
- Enable in Project Settings → Analytics
- Track page views and performance

### Firebase Usage
- Monitor in Firebase Console
- Check Firestore reads/writes
- Monitor storage usage

## 🆘 Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify Node version (use 18+)
- Check build logs in Vercel

### PWA Not Installing
- Check manifest.json is accessible
- Verify HTTPS is enabled
- Check service worker registration

### Images Not Loading
- Verify Cloudinary credentials
- Check image URLs in Firestore
- Verify CORS settings

## 📞 Support

For deployment issues:
- Email: hebz@godmisoft.com
- GitHub Issues: Create issue in repository

---

**Congratulations! Your MAAGAP Kuwait website is now live! 🎉**

Share your URL with your community and start building your digital presence.
