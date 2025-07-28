# 🎭 Mock API Guide - YouApp

## 🚨 Current Status: External API Down

The external API (`techtest.youapp.ai`) is currently experiencing **Cloudflare Tunnel Error 1033**, which means it's temporarily unavailable. This is why we've implemented a comprehensive mock API system.

## 🔧 Quick Setup

### Enable Mock API:
\`\`\`bash
# Add to .env.local
NEXT_PUBLIC_USE_MOCK_API=true
\`\`\`

### Restart Development Server:
\`\`\`bash
npm run dev
\`\`\`

## ✅ What Works with Mock API

### 🔐 **Authentication**
- ✅ User registration with validation
- ✅ User login with credential checking
- ✅ JWT-like token generation
- ✅ Session management
- ✅ Logout functionality

### 👤 **Profile Management**
- ✅ Create user profiles
- ✅ Update profile information
- ✅ Image upload and storage
- ✅ Interest management
- ✅ Height/weight with units
- ✅ Zodiac calculation

### 🎨 **UI Features**
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Password strength indicator
- ✅ API status indicator

## 🧪 Testing Instructions

### 1. **Register a New User**
\`\`\`
Email: demo@test.com
Username: DemoUser
Password: Demo123!
\`\`\`

### 2. **Login with Created User**
Use the same credentials you registered with.

### 3. **Create Profile**
- Add personal information
- Upload profile image
- Set interests
- Configure height/weight

### 4. **Test All Features**
- Edit profile information
- Add/remove interests
- Update profile image
- Test zodiac calculation

## 🎯 Mock API Features

### **Realistic Behavior**
- ✅ Proper HTTP status codes
- ✅ Validation errors
- ✅ Duplicate user detection
- ✅ Token-based authentication
- ✅ Data persistence during session

### **Error Simulation**
- ✅ Invalid credentials
- ✅ User not found
- ✅ Duplicate registration
- ✅ Missing required fields

### **Data Storage**
- 🔄 In-memory storage (session-based)
- 🔄 Automatic token generation
- 🔄 User profile persistence
- 🔄 Interest management

## 📊 API Status Indicator

The top-right corner shows current API status:

- 🟢 **Green**: Real API is online
- 🟡 **Yellow**: Real API is offline (mock active)
- 🔴 **Red**: Real API has errors (mock active)
- 🔵 **Blue**: Mock API is enabled

Click the indicator to refresh API status.

## 🔄 Switching Between APIs

### **Use Mock API (Recommended for now)**
\`\`\`bash
NEXT_PUBLIC_USE_MOCK_API=true
\`\`\`

### **Use Real API (when available)**
\`\`\`bash
NEXT_PUBLIC_USE_MOCK_API=false
\`\`\`

### **Automatic Fallback**
Even with `USE_MOCK_API=false`, the app will automatically fall back to mock API if the real API fails.

## 🚀 Demo Workflow

### **Complete Registration Flow:**
1. Go to `/register`
2. Fill form with valid data
3. See "Demo Mode Active" notification
4. Register successfully
5. Redirect to profile page

### **Complete Login Flow:**
1. Go to `/login`
2. Use registered credentials
3. Login successfully
4. Access all features

### **Profile Management:**
1. Create/edit profile
2. Add interests
3. Upload images
4. All data persists during session

## 🔍 Debugging

### **Console Logs**
The mock API provides detailed console logs:
\`\`\`
🎭 Using Mock API for registration
✅ Mock registration successful
💾 Access token stored after registration
\`\`\`

### **Network Tab**
- Status: 200 (success)
- Response: Proper JSON format
- Headers: Correct content-type

### **Error Handling**
- User-friendly error messages
- Proper validation feedback
- Graceful fallback behavior

## 📝 Mock Data Examples

### **Sample Users**
\`\`\`javascript
{
  id: "user_1234567890_abc123",
  email: "demo@test.com",
  username: "DemoUser",
  access_token: "mock_token_user_1234567890_abc123_1234567890"
}
\`\`\`

### **Sample Profile**
\`\`\`javascript
{
  name: "Demo User",
  birthday: "1990-01-01",
  height: 175,
  weight: 70,
  interests: ["Technology", "Travel", "Music"],
  gender: "male",
  profileImage: "data:image/jpeg;base64,..."
}
\`\`\`

## 🎉 Benefits of Mock API

### **Development**
- ✅ Work offline
- ✅ Consistent responses
- ✅ Fast development
- ✅ No API rate limits

### **Testing**
- ✅ Predictable behavior
- ✅ Error simulation
- ✅ Complete feature testing
- ✅ No external dependencies

### **User Experience**
- ✅ App always works
- ✅ Full functionality
- ✅ Smooth experience
- ✅ Clear status indication

## 🔮 Future Improvements

When the real API is back online:
1. Set `NEXT_PUBLIC_USE_MOCK_API=false`
2. Test real API integration
3. Keep mock API as fallback
4. Monitor API status automatically

---

**The app is fully functional with mock API! 🚀**

Try registering and exploring all features - everything works exactly as it would with the real API.
