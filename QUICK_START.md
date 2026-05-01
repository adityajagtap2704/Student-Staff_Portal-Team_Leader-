# Quick Start Guide - Three-Phase Credential System

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Email Service (Development)

1. Visit https://ethereal.email
2. Click "Create Ethereal Account"
3. Copy the SMTP credentials
4. Update `.env.local`:

```env
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@ethereal.email
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@kalnet.edu
```

### Step 3: Run Database Migration

```bash
npx prisma migrate dev --name add_email_otp_password
```

### Step 4: Hash Existing Staff Passwords

```bash
npx ts-node scripts/hash-passwords.ts
```

### Step 5: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## 📝 Testing the System

### Test Enquiry Submission

1. Go to http://localhost:3000/admissions/enquire
2. Fill in the form:
   - Student Name: John Doe
   - Parent Name: Jane Doe
   - Email: your-test-email@ethereal.email
   - Phone: 9876543210
   - Class: Class 10
   - Start Date: Tomorrow
3. Click "Continue"
4. Check Ethereal Email for OTP
5. Enter OTP and submit

### Test Approval Flow

1. Go to http://localhost:3000/login
2. Login as HOD (use existing HOD credentials)
3. Go to Dashboard → Admissions
4. Find the pending enquiry
5. Click "Approve"
6. Check Ethereal Email for approval notification
7. Credentials will be displayed

### Test Student Login

1. Use the email and password from approval email
2. Login at http://localhost:3000/login
3. Access student dashboard

---

## 🔧 Configuration

### Email Providers

**Ethereal (Development - Recommended)**
```env
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@ethereal.email
EMAIL_PASSWORD=your-password
```

**SendGrid (Production)**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

**Gmail (Production)**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## 📊 What's New

### Phase 1: Email Verification
✅ OTP-based email verification
✅ Unique enquiry numbers
✅ Email collection in form

### Phase 2: Secure Credentials
✅ Password hashing (bcryptjs)
✅ Random temporary passwords
✅ Email notifications
✅ Approval tracking

### Phase 3: Post-Approval
✅ Official Student ID (KN-YYYY-XXX)
✅ Official email (firstname.lastname@kalnet.edu)
✅ Status tracking component
✅ Dashboard access control

---

## 🐛 Troubleshooting

### OTP Not Sending?
1. Check `.env.local` email settings
2. Verify Ethereal account is active
3. Check Ethereal inbox at https://ethereal.email/messages

### Database Migration Failed?
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then run migration again
npx prisma migrate dev
```

### Password Hashing Error?
```bash
# Reinstall bcryptjs
npm uninstall bcryptjs
npm install bcryptjs
```

---

## 📚 Documentation

- **Full Implementation Guide**: See `IMPLEMENTATION_GUIDE.md`
- **Features List**: See `FEATURES_IMPLEMENTED.md`
- **API Documentation**: See `IMPLEMENTATION_GUIDE.md` → API Changes

---

## 🎯 Next Steps

1. ✅ Test the enquiry flow
2. ✅ Test approval and email notifications
3. ✅ Test student login
4. 📋 Customize email templates (optional)
5. 🔐 Setup production email service
6. 🚀 Deploy to production

---

## 💡 Tips

- **Test Emails**: All test emails go to Ethereal inbox
- **OTP Expiry**: OTP expires after 10 minutes
- **Temporary Passwords**: Students should change on first login
- **Email Templates**: Customize in `src/lib/email.ts`

---

## 📞 Support

For detailed information, see:
- `IMPLEMENTATION_GUIDE.md` - Complete setup and troubleshooting
- `FEATURES_IMPLEMENTED.md` - Detailed feature list
- `src/lib/email.ts` - Email templates and configuration

---

**You're all set! 🎉**

Start with the enquiry form and test the complete flow.
