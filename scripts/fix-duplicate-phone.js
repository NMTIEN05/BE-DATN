import mongoose from 'mongoose';
import UserModel from '../src/model/User.js';

// Kết nối database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/web_phone');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Script để fix duplicate phone
const fixDuplicatePhone = async () => {
  try {
    console.log('🔍 Checking for duplicate phones...');
    
    // Tìm tất cả users có phone
    const usersWithPhone = await UserModel.find({ phone: { $exists: true, $ne: null, $ne: '' } });
    console.log(`Found ${usersWithPhone.length} users with phone numbers`);
    
    // Nhóm theo phone
    const phoneGroups = {};
    usersWithPhone.forEach(user => {
      if (!phoneGroups[user.phone]) {
        phoneGroups[user.phone] = [];
      }
      phoneGroups[user.phone].push(user);
    });
    
    // Tìm phone trùng lặp
    const duplicates = Object.entries(phoneGroups).filter(([phone, users]) => users.length > 1);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate phones found');
      return;
    }
    
    console.log(`❌ Found ${duplicates.length} duplicate phone numbers:`);
    
    for (const [phone, users] of duplicates) {
      console.log(`\n📱 Phone: ${phone}`);
      console.log(`   Users: ${users.length}`);
      
      // Giữ user đầu tiên, xóa phone của các user còn lại
      const [keepUser, ...removeUsers] = users.sort((a, b) => a.createdAt - b.createdAt);
      
      console.log(`   Keeping: ${keepUser.email} (created: ${keepUser.createdAt})`);
      
      for (const user of removeUsers) {
        console.log(`   Removing phone from: ${user.email}`);
        await UserModel.findByIdAndUpdate(user._id, { 
          $unset: { phone: 1 } 
        });
      }
    }
    
    console.log('\n✅ Fixed duplicate phones successfully');
    
  } catch (error) {
    console.error('❌ Error fixing duplicate phones:', error);
  }
};

// Chạy script
const run = async () => {
  await connectDB();
  await fixDuplicatePhone();
  process.exit(0);
};

run(); 