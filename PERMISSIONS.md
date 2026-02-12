# MAAGAP Financial - Permissions Summary

## 👥 **USER ROLES ug PERMISSIONS**

### **1. ADMIN** 👑
**Full Access sa Everything**

✅ **Users:**
- View all users
- Approve/reject users
- Change user roles
- **DELETE users** ✅

✅ **Members:**
- Create members
- Update/edit members
- **DELETE members** ✅

✅ **Maggots:**
- Create maggots
- Update/edit maggots
- **DELETE maggots** ✅

✅ **Transactions:**
- Create IN/OUT transactions
- **UPDATE transactions** ✅
- **DELETE transactions** ✅

✅ **Billing:**
- Create billing items
- **UPDATE billing items** ✅
- **DELETE billing items** ✅
- Create billing records
- **UPDATE billing records** ✅
- **DELETE billing records** ✅

✅ **Reports:**
- View all reports
- Export to Excel/PDF

---

### **2. TREASURER** 💰
**Finance Management**

❌ **Users:**
- View users (read-only)
- Cannot approve/delete

❌ **Members/Maggots:**
- View only (read-only)
- Cannot create/edit/delete

✅ **Transactions:**
- Create IN/OUT transactions
- **UPDATE transactions** ✅
- **DELETE transactions** ✅

✅ **Billing:**
- Create billing items
- **UPDATE billing items** ✅
- **DELETE billing items** ✅
- Create billing records
- **UPDATE billing records** ✅
- **DELETE billing records** ✅

✅ **Reports:**
- View all reports
- Export to Excel/PDF

---

### **3. MEMBER** 👤
**Member Registration**

❌ **Users:**
- View only (read-only)

✅ **Members:**
- Create members
- Update/edit members
- View all members

❌ **Maggots:**
- View only (read-only)

❌ **Transactions/Billing:**
- View only (read-only)

❌ **Reports:**
- Limited view

---

### **4. MAGGOT** 🐛
**Maggot Registration**

❌ **Users:**
- View only (read-only)

❌ **Members:**
- View only (read-only)

✅ **Maggots:**
- Create maggots
- Update/edit maggots
- View all maggots

❌ **Transactions/Billing:**
- View only (read-only)

❌ **Reports:**
- Limited view

---

## 📊 **PERMISSIONS TABLE**

| Feature | Admin | Treasurer | Member | Maggot |
|---------|-------|-----------|--------|--------|
| **Users - View** | ✅ | ✅ | ✅ | ✅ |
| **Users - Create** | ✅ | ✅ | ✅ | ✅ |
| **Users - Approve** | ✅ | ❌ | ❌ | ❌ |
| **Users - Edit Role** | ✅ | ❌ | ❌ | ❌ |
| **Users - Delete** | ✅ | ❌ | ❌ | ❌ |
| | | | | |
| **Members - View** | ✅ | ✅ | ✅ | ✅ |
| **Members - Create** | ✅ | ❌ | ✅ | ❌ |
| **Members - Update** | ✅ | ❌ | ✅ | ❌ |
| **Members - Delete** | ✅ | ❌ | ❌ | ❌ |
| | | | | |
| **Maggots - View** | ✅ | ✅ | ✅ | ✅ |
| **Maggots - Create** | ✅ | ❌ | ❌ | ✅ |
| **Maggots - Update** | ✅ | ❌ | ❌ | ✅ |
| **Maggots - Delete** | ✅ | ❌ | ❌ | ❌ |
| | | | | |
| **Transactions - View** | ✅ | ✅ | ✅ | ✅ |
| **Transactions - Create** | ✅ | ✅ | ❌ | ❌ |
| **Transactions - Update** | ✅ | ✅ | ❌ | ❌ |
| **Transactions - Delete** | ✅ | ✅ | ❌ | ❌ |
| | | | | |
| **Billing - View** | ✅ | ✅ | ✅ | ✅ |
| **Billing - Create** | ✅ | ✅ | ❌ | ❌ |
| **Billing - Update** | ✅ | ✅ | ❌ | ❌ |
| **Billing - Delete** | ✅ | ✅ | ❌ | ❌ |
| | | | | |
| **Reports - View** | ✅ | ✅ | ❌ | ❌ |
| **Reports - Export** | ✅ | ✅ | ❌ | ❌ |

---

## 🔑 **KEY POINTS:**

### **Financial Management (Transactions & Billing):**
- ✅ **Admin** - FULL access (create, update, delete)
- ✅ **Treasurer** - FULL access (create, update, delete)
- ❌ **Member/Maggot** - Read-only

### **User Management:**
- ✅ **Admin ONLY** - Can approve, change roles, delete users
- ❌ **All others** - Read-only

### **Member/Maggot Records:**
- ✅ **Admin** - Can delete
- ✅ **Member role** - Can create/update members
- ✅ **Maggot role** - Can create/update maggots
- ❌ **Cannot delete** (except admin)

---

## 🚨 **IMPORTANTE:**

**Ang TREASURER kay pareho ra sa ADMIN when it comes to FINANCIAL OPERATIONS:**

- ✅ Create transactions
- ✅ **EDIT transactions** (update amount, description, etc.)
- ✅ **DELETE transactions** (if wrong entry)
- ✅ Create billing items
- ✅ **EDIT billing items** (update amount, month, etc.)
- ✅ **DELETE billing items** (if duplicate/error)
- ✅ **EDIT billing records** (mark as paid, update receipt)
- ✅ **DELETE billing records** (if error)

**Pero ang TREASURER dili pwede:**
- ❌ Delete users
- ❌ Approve users
- ❌ Change user roles
- ❌ Delete members/maggots

---

**Developed by Godmisoft**  
**Heber Mayormita © 2025**
