# ⚡ MAAGAP Kuwait - Quick Setup Guide

## Step 1: Install Node.js
Download and install from: https://nodejs.org/ (Choose LTS version)

## Step 2: Install Dependencies
```bash
cd maagap-website
npm install
```

## Step 3: Setup Firebase

### Create Firebase Project:
1. Go to: https://console.firebase.google.com/
2. Click "Add project"
3. Name: `maagap-kuwait`
4. Disable Google Analytics (optional)
5. Click "Create project"

### Enable Firestore:
1. In Firebase Console, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select location: `asia-south1` (closest to Kuwait)
5. Click "Enable"

### Get Firebase Config:
1. Click gear icon ⚙️ → "Project settings"
2. Scroll to "Your apps"
3. Click web icon `</>`
4. App nickname: `MAAGAP Kuwait`
5. Don't check "Firebase Hosting"
6. Click "Register app"
7. **COPY the firebaseConfig values** (you'll need these next)

## Step 4: Create Environment File

Create a file named `.env.local` in the maagap-website folder:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=maagap-kuwait
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=demo
```

Replace the values with your Firebase config from Step 3.

## Step 5: Add Logo

Save your MAAGAP logo as:
- `public/images/maagap-logo.png`

For PWA icons, use this tool to generate all sizes:
- Visit: https://realfavicongenerator.net/
- Upload your logo
- Download the package
- Extract to `public/` folder

## Step 6: Test Locally

```bash
npm run dev
```

Open browser: http://localhost:3000

You should see the MAAGAP Kuwait homepage! 🎉

## Step 7: Deploy to Vercel

### Easy Way (GitHub + Vercel):

1. **Create GitHub Repository:**
   - Go to: https://github.com/new
   - Name: `maagap-kuwait`
   - Make it public or private
   - Click "Create repository"

2. **Upload Code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "MAAGAP Kuwait website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/maagap-kuwait.git
   git push -u origin main
   ```

3. **Deploy on Vercel:**
   - Go to: https://vercel.com
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Click "Deploy"
   - Add environment variables (same as .env.local)
   - Wait for deployment to finish

4. **Get Your Website URL:**
   - Vercel will give you a URL like: `maagap-kuwait.vercel.app`
   - Share this with your members!

## Troubleshooting

### "npm: command not found"
- Install Node.js from https://nodejs.org/

### "Firebase is not defined"
- Check your `.env.local` file
- Make sure all NEXT_PUBLIC_ variables are set
- Restart the dev server (Ctrl+C then `npm run dev`)

### Logo not showing
- Make sure logo is at `public/images/maagap-logo.png`
- Clear browser cache (Ctrl+Shift+R)

### Can't access admin page
- The admin page is public by default
- Later, you can add password protection

## What's Next?

1. **Test the registration:** Go to `/register` and submit a test member
2. **Check admin panel:** Go to `/admin` to see the member
3. **Add a transaction:** In admin panel, switch to "Financial Management"
4. **Customize content:** Edit the About page and History page
5. **Add photos:** Upload activity photos to Cloudinary, add URLs to Firebase

## Need Help?

- Check the full DEPLOYMENT_GUIDE.md for detailed instructions
- Contact MAAGAP Kuwait tech team
- Email: support@maagapkuwait.org

---

**"THE TRUTH STILL STAND"** 🙏
