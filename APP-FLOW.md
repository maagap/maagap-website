# MAAGAP Financial App - Flow ug Features

## 📱 **Overview**

Kining app kay financial management system para sa MAAGAP Guardians. Naa ni'y 4 main components:

---

## 1️⃣ **MEMBERS Registration**

**Purpose:** Complete member information based sa official DOCX form

**Pwede mag-register:**
- Admin
- Users with "Member" role

**Info Collected:**
- Personal details (Name, Address, Contact)
- Family information
- Educational background
- Emergency contacts
- References (3 persons)
- Photo ug Signature
- Approval workflow (Sponsored by, Screened by, etc.)

**Status:** Pending → Admin approval → Approved

---

## 2️⃣ **MAGGOTS Registration**

**Purpose:** Simplified registration for aspirants/trainees

**Pwede mag-register:**
- Admin
- Users with "Maggot" role

**Info Collected:**
- Name
- Address
- Maggot By (sino nag-recruit)
- Telephone
- Photo ug Signature

**Status:** Pending → Admin approval → Approved

**Note:** Mas simple compared sa Members. Maggots are not yet full members.

---

## 3️⃣ **TRANSACTIONS (IN/OUT)**

**Purpose:** Track all money in and out sa organization

**Pwede mag-manage:**
- Admin
- Treasurer

**Features:**
- **IN** transactions = Income (membership fees, donations, collections)
- **OUT** transactions = Expenses (office supplies, events, utilities)
- Auto-generate receipt numbers (format: RCP-YYYYMM-XXXX)
- Link to members (optional - para ma-track kinsa nag-bayad)
- Categories (Membership Fee, Donation, Utilities, etc.)

**Example IN:**
```
Receipt: RCP-202502-1234
Type: IN
Amount: ₱5,000
Category: Membership Fees
Member: Juan dela Cruz
Description: February 2025 monthly dues
```

**Example OUT:**
```
Receipt: RCP-202502-1235
Type: OUT
Amount: ₱2,000
Category: Office Supplies
Description: Printer ink and bond paper
```

---

## 4️⃣ **BILLING SYSTEM**

**Purpose:** Create template payments na pwede i-apply sa tanan members

**Pwede mag-manage:**
- Admin
- Treasurer

### **How it Works:**

**Step 1: Create Payment Item**
```
Name: Monthly Dues - February 2025
Amount: ₱100
Category: Membership Dues
Month: February 2025
```

**Step 2: Apply to All Members**
- Click "Apply to All Members"
- System creates billing record para sa each member
- Status: Unpaid

**Step 3: Record Payments**
- When member pays:
  - Mark as Paid
  - Enter receipt number
  - Auto-creates IN transaction
  - Updates member's account

**Step 4: Track Collections**
- See who paid, who hasn't
- Total collected
- Outstanding balance

### **Example Billing Flow:**

1. **Treasurer creates:** "February 2025 Dues" (₱100)
2. **Apply to 50 members** = 50 billing records created
3. **Juan pays ₱100:**
   - Billing record → Paid ✅
   - Receipt: RCP-202502-1236
   - Transaction IN created (₱100)
   - Shows in Statement of Accounts
4. **Track progress:**
   - 30 paid (₱3,000)
   - 20 unpaid (₱2,000)
   - Total: ₱5,000 expected

---

## 5️⃣ **REPORTS / STATEMENT OF ACCOUNTS**

**Purpose:** See complete financial picture

**Pwede mag-view:**
- Admin
- Treasurer

**Features:**
- Filter by:
  - Member (see individual's transactions)
  - Date range (monthly, quarterly, yearly)
- Shows:
  - All IN transactions (green)
  - All OUT transactions (red)
  - Running balance (updated per transaction)
- Export:
  - Excel (.xlsx)
  - PDF

**Example Report:**
```
Period: February 1-28, 2025
Total IN:  ₱50,000
Total OUT: ₱30,000
Balance:   ₱20,000

Recent Transactions:
Feb 28 | IN  | RCP-202502-1250 | Membership Fee | Juan     | +₱100 | ₱20,000
Feb 27 | OUT | RCP-202502-1249 | Office Rent    | -        | -₱5,000 | ₱19,900
Feb 26 | IN  | RCP-202502-1248 | Donation       | Pedro    | +₱500 | ₱24,900
```

---

## 6️⃣ **USER MANAGEMENT**

**Pwede mag-manage:**
- Admin only

**Features:**
- Approve/Reject registrations
- Assign roles:
  - **Admin** - Full access
  - **Treasurer** - Manage finances only
  - **Member** - Can register members
  - **Maggot** - Can register maggots
- Edit user roles
- Delete users

---

## 🔄 **TYPICAL WORKFLOW**

### **Monthly Dues Collection:**

1. **Treasurer** creates billing item: "March 2025 Dues - ₱100"
2. Apply to all 100 members
3. Members pay throughout the month
4. **Treasurer** records payments:
   - Opens billing records
   - Finds member name
   - Clicks "Mark as Paid"
   - Enters receipt number
   - System auto-creates IN transaction
5. End of month:
   - View reports
   - Export statement
   - Track who hasn't paid

### **Event Expense:**

1. **Treasurer** creates OUT transaction:
   - Type: OUT
   - Amount: ₱10,000
   - Category: Event Expenses
   - Description: Christmas Party 2024
   - Receipt: RCP-202412-5678
2. Saved to database
3. Shows in reports
4. Updates balance

---

## ❓ **FAQ**

**Q: Ngano naa'y Members UG Maggots?**
A: Members = full members (complete info). Maggots = aspirants (simplified).

**Q: Ngano naa'y Billing separate sa Transactions?**
A: Billing = TEMPLATE for recurring payments. Transactions = ACTUAL money movement. Mas organized ang collection tracking.

**Q: Pwede ba mag-edit ang Admin sa Billing?**
A: YES. Admin can edit/delete billing items and records.

**Q: Unsay difference sa Billing ug Transactions?**
A: 
- **Billing** = "Who should pay what" (planning)
- **Transactions** = "Who actually paid" (execution)
- Billing creates transactions when marked as paid

**Q: Kinsa makakita sa Reports?**
A: Admin ug Treasurer lang.

---

## 🎯 **SUMMARY**

**Users/Roles** → **Members/Maggots** → **Billing Items** → **Payments** → **Transactions** → **Reports**

1. Admin approves users
2. Members/Maggots register
3. Treasurer creates billing items
4. Apply to members
5. Members pay
6. Treasurer records payments
7. Auto-creates transactions
8. View reports/statements

---

**Developed by Godmisoft**  
**Heber Mayormita © 2025**
