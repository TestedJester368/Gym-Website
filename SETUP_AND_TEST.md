# APEX Gym — Complete Setup & Testing Guide

## ✅ Prerequisites

- Node.js installed (check: `node -v`)
- Git Bash or Command Prompt
- A code editor (VS Code recommended)
- Two terminal windows

---

## 🚀 Step 1: Start the Backend

**Terminal 1 - Backend:**

```bash
cd /c/Users/user/Downloads/Gym-Website/backend
npm install
npm run dev
```

**Expected output:**
```
✅ Auth server running on http://localhost:5000
📍 Health check: http://localhost:5000/health
```

**Test it works:**
- Go to: `http://localhost:5000/`
- You should see JSON with API endpoints

---

## 🌐 Step 2: Start the Frontend

**Terminal 2 - Frontend:**

```bash
cd /c/Users/user/Downloads/Gym-Website/apex
```

**Option A: Using Live Server (VS Code)**
1. Right-click on `index.html`
2. Select "Open with Live Server"
3. Browser opens at `http://localhost:5500`

**Option B: Using Python HTTP Server**
```bash
python -m http.server 5500
```

**Option C: Using Node HTTP Server**
```bash
npx http-server -p 5500
```

---

## 🧪 Testing Checklist

### Test 1: Homepage Loads
- [ ] Go to `http://localhost:5500`
- [ ] Page loads without errors
- [ ] Custom cursor appears
- [ ] Navigation bar visible
- [ ] Hero section displays
- [ ] All animations work

**Check browser console (F12):**
- Should have NO errors
- Should see auth initialization message

---

### Test 2: Login Button Works
- [ ] Click "Join Now" in navbar
- [ ] Should redirect to `http://localhost:5500/pages/login.html`
- [ ] Login form appears
- [ ] No console errors

---

### Test 3: Register New Account

**On login page:**

1. Click "Sign up" link
2. Fill in form:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm: `password123`
3. Click "Create Account"

**Expected:**
- ✅ Success message appears: "✓ Account created! Redirecting..."
- ✅ Redirects to homepage after 1 second
- ✅ "Join Now" button now shows "Test User"
- ✅ No console errors

**If it fails:**
- Open DevTools (F12) → Console tab
- Look for red errors
- Check if backend is running (`http://localhost:5000/health`)

---

### Test 4: Login with Existing Account

**Back on login page:**

1. Click "Sign in" tab (should already be there)
2. Fill in:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign In"

**Expected:**
- ✅ Success message: "✓ Login successful! Redirecting..."
- ✅ Redirects to homepage
- ✅ Button shows "Test User"

---

### Test 5: Logout

**On homepage:**

1. Click your username in navbar (where "Join Now" was)
2. Confirm logout

**Expected:**
- ✅ Button changes back to "Join Now"
- ✅ Redirects to homepage
- ✅ Page refreshes

---

### Test 6: Protected Routes

1. Register/Login
2. Try accessing CTA buttons ("Start Membership", "Start Free Trial")
3. Should work now (previously would redirect to login)

---

## 🐛 Debugging Errors

### Error: "Cannot GET /"
- Backend not running
- **Fix:** Make sure `npm run dev` is active in Terminal 1

### Error: "Cannot POST /api/auth/register"
- Backend not running OR CORS issue
- **Fix:** Check backend terminal for errors, restart if needed

### Error: "Passwords do not match"
- Entered different passwords
- **Fix:** Make sure both password fields are identical

### Error: "Email already registered"
- That email already has an account
- **Fix:** Use a different email (e.g., `test2@example.com`)

### Console Error: "Cannot read properties of null"
- Missing HTML element
- **Fix:** Check if `id="cursor"` exists in HTML

### Error: CORS Error in Console
- Backend CORS not configured for your port
- **Fix:** Update `server.js` → add your port to `origin` array

---

## 📊 Testing with Multiple Users

**Create 3 test accounts:**

```
User 1:
Email: john@example.com
Password: password123
Name: John Doe

User 2:
Email: jane@example.com
Password: password123
Name: Jane Smith

User 3:
Email: mike@example.com
Password: password123
Name: Mike Johnson
```

Test:
- [ ] All can register
- [ ] All can login
- [ ] Each shows their own name
- [ ] Logout works for each

---

## 🎯 Final Verification

**Run this complete flow:**

1. **Fresh start:**
   - Close both terminals
   - Clear browser cache (Ctrl+Shift+Delete)
   - Restart backend and frontend

2. **Test flow:**
   - Homepage loads cleanly
   - Register new account → Success
   - Logout
   - Login with same account → Success
   - Logout again
   - Try accessing "Join Now" without login → Redirects
   - Login → Can now access features

3. **Check browser console:**
   - Press F12
   - Console tab
   - Should be COMPLETELY CLEAN (no red errors)

---

## ✨ Performance Check

**Measure load times:**
- Homepage: Should load in < 1 second
- Login page: Should load in < 500ms
- Login submission: Should complete in < 2 seconds

**Check for:**
- [ ] No memory leaks (keep DevTools open 5 minutes, memory shouldn't grow)
- [ ] No infinite loops
- [ ] Smooth animations
- [ ] Fast interactions

---

## 🚢 Ready to Present?

Once all tests pass:

1. ✅ Backend running smoothly
2. ✅ Frontend loads instantly
3. ✅ Auth system works perfectly
4. ✅ No console errors
5. ✅ All user flows complete

**You're ready to present!**

---

## 📝 Quick Commands Reference

```bash
# Start backend
cd /c/Users/user/Downloads/Gym-Website/backend && npm run dev

# Start frontend (Python)
cd /c/Users/user/Downloads/Gym-Website/apex && python -m http.server 5500

# Kill backend (if needed)
# Press Ctrl+C in backend terminal

# Check if ports are in use
netstat -ano | findstr :5000
netstat -ano | findstr :5500
```

---

## 🎓 What to Show in Presentation

1. **Homepage** → Full animations, smooth scroll
2. **Click "Join Now"** → Redirects to login
3. **Register account** → Fill form, success message, redirect
4. **See name in navbar** → Proof of auth working
5. **Click username** → Logout works
6. **Login again** → System remembers you
7. **Check browser DevTools** → Zero errors, clean console

---

## 💡 Tips

- Keep both terminal windows visible during presentation
- Have test account ready (email + password written down)
- Test internet connection (auth uses API calls)
- Take screenshots of success states for slides
- Have a backup plan (pre-recorded demo) just in case

---

**Good luck! You've got this! 🚀**
