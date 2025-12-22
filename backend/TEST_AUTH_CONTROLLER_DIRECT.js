// اختبار authController مباشرة
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { register } from './controllers/authController.js';

dotenv.config();

const testAuthController = async () => {
  try {
    console.log('🔍 TESTING AUTH CONTROLLER DIRECTLY');
    console.log('='.repeat(50));

    // الاتصال بقاعدة البيانات
    console.log('\n1️⃣ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // محاكاة req و res
    console.log('\n2️⃣ Testing register function...');
    
    const mockReq = {
      body: {
        phone: '0501234567',
        password: '123456'
      }
    };

    let responseData = null;
    let statusCode = null;

    const mockRes = {
      status: (code) => {
        statusCode = code;
        return mockRes;
      },
      json: (data) => {
        responseData = data;
        return mockRes;
      }
    };

    console.log('📝 Request data:', mockReq.body);
    console.log('🔄 Calling register function...');

    await register(mockReq, mockRes);

    console.log('\n📊 RESULTS:');
    console.log('Status Code:', statusCode);
    console.log('Response Data:', JSON.stringify(responseData, null, 2));

    if (statusCode === 201 && responseData?.success) {
      console.log('✅ AUTH CONTROLLER WORKS PERFECTLY!');
      console.log('🔍 The issue must be in the server routing or middleware');
    } else {
      console.log('❌ AUTH CONTROLLER HAS ISSUES');
      console.log('🔍 This is where the problem is');
    }

  } catch (error) {
    console.error('\n❌ AUTH CONTROLLER TEST FAILED:', error);
    console.log('\n📋 Full error details:');
    console.log(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
};

testAuthController();