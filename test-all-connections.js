const axios = require('axios');

const testConnections = async () => {
  console.log('🔍 Testing all connections...\n');

  // Test Backend
  try {
    console.log('1️⃣ Testing Backend (BE-DATN)...');
    const backendPing = await axios.get('http://localhost:8888/api/ping');
    console.log('✅ Backend ping successful:', backendPing.data.message);
    
    const backendBanners = await axios.get('http://localhost:8888/api/banners');
    console.log('✅ Backend banners API working:', backendBanners.data);
  } catch (error) {
    console.log('❌ Backend error:', error.message);
  }

  // Test Frontend
  try {
    console.log('\n2️⃣ Testing Frontend (FE-DATN)...');
    const frontendResponse = await axios.get('http://localhost:5173');
    console.log('✅ Frontend is running on port 5173');
  } catch (error) {
    console.log('❌ Frontend error:', error.message);
  }

  // Test Admin
  try {
    console.log('\n3️⃣ Testing Admin (DATN-ADMIN)...');
    const adminResponse = await axios.get('http://localhost:5174');
    console.log('✅ Admin is running on port 5174');
  } catch (error) {
    console.log('❌ Admin error:', error.message);
  }

  console.log('\n🎯 Summary:');
  console.log('- Backend should be on: http://localhost:8888');
  console.log('- Frontend should be on: http://localhost:5173');
  console.log('- Admin should be on: http://localhost:5174');
  console.log('\n📝 If any service is not running, start it with:');
  console.log('  Backend: cd BE-DATN && npm start');
  console.log('  Frontend: cd FE-DATN && npm run dev');
  console.log('  Admin: cd DATN-ADMIN && npm run dev');
};

testConnections(); 