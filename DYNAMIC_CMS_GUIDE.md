# 🎨 MAAGAP Dynamic CMS - Complete Guide

## ✅ What You Can Control as Admin

### 1. **Website Settings** ⚙️
- Change site title (e.g., "MAAGAP Kuwait")
- Update subtitle
- Modify motto ("THE TRUTH STILL STAND")
- Update contact information
- Toggle maintenance mode
- Control banner display

### 2. **Homepage Banners** 🖼️
- Upload banner images
- Add titles and descriptions
- Set links for each banner
- Activate/deactivate banners
- Multiple banner support
- Auto-slideshow on homepage

### 3. **Custom Pages** 📄
- Create unlimited new pages
- Set custom URLs (e.g., /events, /rules, /gallery2024)
- Write content (supports HTML)
- Control navigation display
- Set page order in menu
- Delete pages anytime

### 4. **Activities & Events** 🎉
- Add new activities
- Upload multiple photos per activity
- Upload videos
- Set date and location
- Write descriptions
- Display in activities page
- Auto-add to gallery

### 5. **Promotions & Announcements** 📢
- Create promotions
- Set expiry dates
- Add promotional images
- Activate/deactivate anytime
- Show on homepage
- Highlight important announcements

### 6. **History Content** 📜
- Edit "Our Beginning" section
- Update "Growth and Development"
- Modify "Our Present"
- Change "Our Commitment"
- Real-time updates on website

## 🚀 How to Access CMS

### For Admin:
1. Go to: `https://your-website.com/admin/cms`
2. Select the tab you want to manage:
   - ⚙️ Settings
   - 🖼️ Banners
   - 📄 Custom Pages
   - 🎉 Activities
   - 📢 Promotions
   - 📜 History

### Each Tab Explained:

#### ⚙️ Settings Tab
- **What it does:** Control global website settings
- **Example use:**
  - Change "MAAGAP Kuwait" to "MAAGAP Kuwait Chapter 2025"
  - Update contact email
  - Add phone number
  - Turn on/off banners

#### 🖼️ Banners Tab
- **What it does:** Manage homepage hero banners
- **How to add:**
  1. Enter banner title
  2. Write description
  3. Upload image (recommended: 1920x600px)
  4. Add link (optional)
  5. Click "Add Banner"
- **Result:** Shows in homepage slideshow

#### 📄 Custom Pages Tab
- **What it does:** Create new pages that appear in navigation
- **Example pages to create:**
  - "Rules and Regulations"
  - "2024 Events Calendar"
  - "Officers & Committee"
  - "Membership Benefits"
  - "Contact Form"
- **How to add:**
  1. Enter page title
  2. Content will be at: `/your-title-here`
  3. Write content (HTML works!)
  4. Set order (lower number = appears first)
  5. Check "Show in Navigation"
  6. Click "Add Page"
- **Result:** New page appears in top menu

#### 🎉 Activities Tab
- **What it does:** Document all MAAGAP activities
- **How to add:**
  1. Enter activity title (e.g., "Christmas Party 2024")
  2. Set date
  3. Enter location
  4. Write description
  5. Upload photos & videos
  6. Click "Add Activity"
- **Result:** 
  - Shows in Activities page
  - Photos go to Gallery
  - Creates activity archive

#### 📢 Promotions Tab
- **What it does:** Show announcements on homepage
- **Example promotions:**
  - "Early Bird Registration - 20% Off"
  - "Special Meeting on Feb 15"
  - "New Benefits Available"
- **How to add:**
  1. Enter promotion title
  2. Set expiry date
  3. Write description
  4. Add image (optional)
  5. Click "Add Promotion"
- **Control:**
  - Activate/Deactivate anytime
  - Active = shows on homepage
  - Inactive = hidden but saved

#### 📜 History Tab
- **What it does:** Edit history page content
- **Sections:**
  - Our Beginning
  - Growth and Development
  - Our Present
  - Our Commitment
- **How to edit:**
  1. Type in text boxes
  2. Click "Save History Content"
  3. Changes appear immediately

## 💾 Database Structure

```
Firestore Collections:
├── settings/
│   └── website (site title, motto, contact)
├── banners/
│   └── {bannerId} (title, image, link, active)
├── customPages/
│   └── {pageId} (title, slug, content, order)
├── activities/
│   └── {activityId} (title, date, photos, videos)
├── promotions/
│   └── {promoId} (title, description, validUntil, active)
└── content/
    └── history (beginning, growth, present, commitment)
```

## 🎨 Content Best Practices

### Banners:
- Use high-quality images (1920x600px recommended)
- Keep titles short (5-8 words)
- Descriptions: 1-2 sentences
- Maximum 5 active banners

### Custom Pages:
- Keep URLs simple and lowercase
- Use hyphens for spaces (e.g., "membership-benefits")
- Structure content with headings
- Add images for visual appeal

### Activities:
- Always add photos/videos
- Write detailed descriptions
- Include date and location
- Tag participants if possible

### Promotions:
- Set realistic expiry dates
- Clear call-to-action
- Eye-catching titles
- Deactivate when expired

### History:
- Keep it factual and chronological
- Update annually
- Add new achievements
- Maintain professional tone

## 📱 How Content Appears

### Homepage:
- Banners: Slideshow at top
- Promotions: Card grid below hero
- Site Title: In header
- Motto: Everywhere

### Navigation:
- Default pages: Home, Prayer, Gallery, About, etc.
- Custom pages: Added automatically
- Ordered by: Page order number

### Activities Page:
- All activities listed
- Most recent first
- Photos in gallery
- Videos embedded

### History Page:
- Dynamic content from CMS
- Four main sections
- Auto-updates

## 🔧 Advanced Features

### HTML in Content:
You can use HTML in:
- Custom page content
- Activity descriptions
- History sections

**Example:**
```html
<h2>Welcome to MAAGAP</h2>
<p>This is a <strong>bold</strong> statement.</p>
<ul>
  <li>Point 1</li>
  <li>Point 2</li>
</ul>
```

### Image URLs:
- Upload to Firebase Storage
- Get URL
- Use in content: `<img src="URL" />`

### Video Embedding:
- YouTube: Upload activity videos
- Stored in activities
- Auto-displays on site

## 🚨 Important Notes

1. **Changes are LIVE** - All edits appear immediately
2. **Backup content** - Save important text elsewhere
3. **Test before deleting** - Deleted content can't be recovered
4. **Use preview** - Check pages before making public
5. **Mobile-friendly** - All content auto-adjusts for phones

## 🎯 Common Use Cases

### Weekly Announcements:
1. Go to Promotions
2. Add new promotion
3. Set expiry to next week
4. Shows on homepage

### New Event:
1. Go to Activities
2. Add event details
3. Upload event photos
4. Automatically appears in gallery

### Update Contact:
1. Go to Settings
2. Update email/phone
3. Save settings
4. Updates everywhere on site

### Add New Menu Item:
1. Go to Custom Pages
2. Create page (e.g., "FAQ")
3. Write content
4. Check "Show in Navigation"
5. Appears in top menu

### Change Homepage Banner:
1. Go to Banners
2. Upload new image
3. Add title/description
4. Replaces current banner

## 📞 Support

Need help? Contact MAAGAP tech team!

---

**"THE TRUTH STILL STAND"** 🙏

**MAAGAP Kuwait - Fully Dynamic Website**
