# Firebase Setup Instructions

## IMPORTANTE! I-setup ni FIRST before mag-work ang app!

### 1. Firestore Database Rules

Go to Firebase Console: https://console.firebase.google.com

1. Select your project: **maagap-financial**
2. Click **Firestore Database** sa left menu
3. Click **Rules** tab
4. Copy-paste this code:

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

5. Click **Publish**

### 2. Authentication Setup

1. Click **Authentication** sa left menu
2. Click **Sign-in method** tab
3. Enable **Email/Password**
4. Click **Save**

### 3. Cloudinary Upload Preset

Go to Cloudinary Console: https://cloudinary.com/console

1. Login to your account (dugchj51b)
2. Click **Settings** (gear icon)
3. Click **Upload** tab
4. Scroll to **Upload presets**
5. Click **Add upload preset**
6. Fill in:
   - Preset name: `maagap_uploads`
   - Signing mode: **Unsigned**
   - Folder: `maagap`
7. Click **Save**

### 4. Test the Application

1. Register a new account
2. Go to Firebase Console > Firestore Database
3. Find your user in the `users` collection
4. Click the document
5. Edit fields:
   - Change `approved` to `true`
   - Change `role` to `admin`
6. Save
7. Login again - you should now have admin access!

### 5. Troubleshooting

**Error: "Failed to save"**
- Check Firestore rules are published
- Check you're logged in
- Check browser console for detailed error
- Verify Cloudinary upload preset exists

**Error: "Permission denied"**
- User is not authenticated
- Firestore rules not properly set
- User `approved` field is `false`

**Images not uploading**
- Cloudinary upload preset must be "Unsigned"
- Check cloud name is correct: `dugchj51b`
- Check preset name is correct: `maagap_uploads`

### 6. First Admin User

After deployment:
1. Sign up through the app
2. Go to Firestore Database
3. Find your user document
4. Manually set:
   - `approved`: true
   - `role`: "admin"
5. Sign in again

You're now the admin! ✅
