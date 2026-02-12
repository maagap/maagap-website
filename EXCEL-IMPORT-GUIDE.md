# Excel Import Guide - Members

## 📊 **How to Import Members from Excel**

### **Step 1: Prepare Your Excel File**

Your Excel file must have these **EXACT** column headers (copy-paste sa first row):

```
SR	Chapter	Province/City	Region	CP/Tel No.	Last Name	First Name	Middle Name	Pseudonym	Position	Provincial Address (Complete)	City Address (Complete)	Office/Business Address	Date of Birth	Place of Birth	Age	Sex	Civil Status	Religion	Dialect	Height	Weight	Blood Type	Eyes	Hair	PHLT No.	SSS No.	TIN	Occupation	Email Address	Name of Spouse	No. of Children	Spouse Occupation	Spouse Company	Name of Father	Name of Mother	Contact Name	Relationship	Incase of Emergency (Contact)	Sponsored By	Date Accomplished	RANK	STATUS
```

### **Step 2: Fill in Your Data**

Example row:
```
1	Davao	Davao City	Region XI	09123456789	Dela Cruz	Juan	Santos	JP	Member	Poblacion, Davao	123 Anda St, Davao	ABC Corp, Davao	01/15/1990	Davao City	35	Male	Married	Catholic	Bisaya	5'8"	70kg	O+	Brown	Black	1234567	09-1234567-8	123-456-789-000	Engineer	juan@email.com	Maria Dela Cruz	2	Teacher	DepEd	Pedro Dela Cruz	Ana Dela Cruz	Maria Dela Cruz	Spouse	09187654321	SP Hebz	02/09/2026	Regular	approved
```

### **Step 3: Save as Excel**

- Save as `.xlsx` or `.xls` format
- Make sure all columns are present (even if empty)

### **Step 4: Import**

1. Go to **Members** tab
2. Click **📊 Import Excel** button
3. Select your Excel file
4. Wait for import to complete
5. Check results:
   - ✅ Imported: Number of successful imports
   - ❌ Errors: Number of failed rows

---

## 📋 **Column Mapping**

### **Required Columns:**
- **Last Name** - Required
- **First Name** - Required
- **Sex** - Male/Female
- **Civil Status** - Single/Married/Widowed/Separated

### **Optional Columns:**
All other columns are optional but recommended for complete records.

### **STATUS Column:**
- **approved** - Member will be automatically approved
- **pending** - Member will need admin approval
- Any other value - Defaults to pending

---

## 🎯 **Sample Data:**

Here's a complete sample row with all fields:

| Column | Example Value |
|--------|--------------|
| SR | 1 |
| Chapter | Davao Chapter |
| Province/City | Davao City |
| Region | Region XI |
| CP/Tel No. | 09123456789 |
| Last Name | Mayormita |
| First Name | Heber |
| Middle Name | Santos |
| Pseudonym | SP Hebz |
| Position | Member |
| Provincial Address (Complete) | Brgy. Poblacion, Davao Del Sur |
| City Address (Complete) | 123 Bonifacio St, Davao City |
| Office/Business Address | Godmisoft, Kuwait |
| Date of Birth | 01/15/1990 |
| Place of Birth | Davao City |
| Age | 35 |
| Sex | Male |
| Civil Status | Married |
| Religion | Catholic |
| Dialect | Bisaya |
| Height | 5'8" |
| Weight | 70kg |
| Blood Type | O+ |
| Eyes | Brown |
| Hair | Black |
| PHLT No. | 1234567890 |
| SSS No. | 09-1234567-8 |
| TIN | 123-456-789-000 |
| Occupation | Software Developer |
| Email Address | heber@godmisoft.com |
| Name of Spouse | Maria Mayormita |
| No. of Children | 2 |
| Spouse Occupation | Teacher |
| Spouse Company | DepEd |
| Name of Father | Pedro Mayormita |
| Name of Mother | Ana Mayormita |
| Contact Name | Maria Mayormita |
| Relationship | Spouse |
| Incase of Emergency (Contact) | 09187654321 |
| Sponsored By | SP Juan |
| Date Accomplished | 02/09/2026 |
| RANK | Regular |
| STATUS | approved |

---

## ⚠️ **Important Notes:**

1. **Column Headers Must Match Exactly**
   - Use the exact spelling and spacing
   - Include all columns even if empty
   
2. **Sex Values**
   - Use: Male or Female
   - Case insensitive
   
3. **Civil Status Values**
   - Use: Single, Married, Widowed, or Separated
   - Defaults to "Single" if invalid
   
4. **STATUS Values**
   - Use: "approved" for auto-approval
   - Use: "pending" or leave blank for manual approval
   
5. **Numbers**
   - Age and No. of Children will be converted to numbers
   - Invalid numbers will default to 0
   
6. **Dates**
   - Can use any format (MM/DD/YYYY, DD/MM/YYYY, etc.)
   - Stored as text in database

---

## 🔧 **Troubleshooting:**

**Error: "Failed to import Excel file"**
- Check that file is .xlsx or .xls format
- Verify all column headers match exactly
- Make sure file is not corrupted

**Some rows didn't import**
- Check that Last Name and First Name are filled
- Verify data doesn't have special characters that break formatting
- Look at browser console (F12) for detailed errors

**Members not showing up**
- Refresh the page
- Check filter (All/Pending/Approved)
- If STATUS was blank, they're in "Pending"

---

## 💡 **Tips:**

1. **Start Small**
   - Test with 5-10 members first
   - Verify import works correctly
   - Then import full list

2. **Backup First**
   - Keep original Excel file
   - Can re-import if needed

3. **Clean Data**
   - Remove empty rows at bottom
   - Remove extra spaces in names
   - Standardize formats (dates, phone numbers)

4. **Admin Only**
   - Only Admin can import Excel
   - This prevents accidental bulk imports

---

**Developed by Godmisoft**  
**Heber Mayormita © 2025**
