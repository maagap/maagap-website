# MAAGAP Kuwait Website

Official dynamic website for MAAGAP (Multigeneration of Active Apostolic Guardians Association of the Philippines) - Kuwait Chapter

## Features

- ✅ Fully Dynamic PWA (Progressive Web App)
- ✅ Member Registration System
- ✅ Admin Dashboard with Member Management
- ✅ Financial Management (IN/OUT transactions in KWD)
- ✅ Gallery with Cloudinary Integration
- ✅ Member Types: Maggot / Member
- ✅ Status Management: Active / Inactive
- ✅ Responsive Design with Beautiful Animations
- ✅ Firebase Backend (Firestore + Storage)
- ✅ Vercel Deployment Ready
- ✅ Custom Favicon & App Icons

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **Media**: Cloudinary for images
- **Deployment**: Vercel
- **PWA**: Installable on mobile devices

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

Create a Firebase project at https://console.firebase.google.com/

Then create `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
```

### 3. Cloudinary Setup

Create account at https://cloudinary.com and add your cloud name to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Build for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## Project Structure

```
maagap-website/
├── app/
│   ├── page.js                 # Home page
│   ├── layout.js              # Root layout with Navigation
│   ├── register/              # Registration page
│   ├── admin/                 # Admin dashboard
│   ├── members/               # Member list & profiles
│   ├── financial/             # Financial management
│   ├── gallery/               # Photo gallery
│   ├── about/                 # About page
│   ├── maagap-prayer/         # MAAGAP Prayer page
│   └── history-mkd/           # History page
├── components/
│   ├── Navigation.js          # Main navigation
│   ├── Footer.js              # Footer component
│   └── PWAInstallPrompt.js    # PWA install banner
├── firebase.config.js         # Firebase configuration
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── icons/                 # App icons
│   └── images/                # Static images
└── package.json
```

## Admin Features

- View all registered members
- Filter by Member Type (Maggot/Member)
- Filter by Status (Active/Inactive)
- Search members
- Export member list
- Update member information
- Financial tracking (Income/Expenses in KWD)

## Member Registration

Members can register with:
- Full name (First, Middle, Last)
- Contact information (Email, Phone)
- Address in Kuwait
- Date of Birth
- Civil Status
- Occupation
- Member Type selection
- Emergency contact
- Auto-assigned Active status

## Financial Management

Track organizational finances with:
- Income transactions (IN)
- Expense transactions (OUT)
- Category management
- Date-based filtering
- Real-time balance calculation
- KWD currency support
- Detailed transaction history

## Gallery

- Upload activity photos via Cloudinary
- Automatic optimization
- Responsive image gallery
- Event categorization
- Admin-managed uploads

## PWA Features

- Installable on iOS and Android
- Offline capability
- App-like experience
- Custom app icon
- Splash screen

## Support

For technical support, contact the MAAGAP Kuwait tech team.

---

**"THE TRUTH STILL STAND"**

MAAGAP Kuwait © 2025
