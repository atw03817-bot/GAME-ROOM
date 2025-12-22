// إصلاح مشكلة email index
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const fixEmailIndex = async () => {
  try {
    console.log('🔧 FIXING EMAIL INDEX ISSUE');
    console.log('='.repeat(40));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // عرض الفهارس الحالية
    console.log('\n📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach((index, i) => {
      console.log(`   ${i + 1}. ${JSON.stringify(index.key)} - ${index.name}`);
    });

    // حذف فهرس email إذا كان موجود
    try {
      await collection.dropIndex('email_1');
      console.log('✅ Dropped email_1 index');
    } catch (error) {
      console.log('ℹ️ email_1 index not found or already dropped');
    }

    // حذف جميع المستخدمين الذين عندهم email: null
    const deleteResult = await collection.deleteMany({ email: null });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} users with null email`);

    // إنشاء فهرس جديد للـ email (sparse)
    await collection.createIndex(
      { email: 1 }, 
      { 
        unique: true, 
        sparse: true, // يسمح بـ null/undefined values متعددة
        name: 'email_1_sparse'
      }
    );
    console.log('✅ Created new sparse email index');

    // عرض الفهارس الجديدة
    console.log('\n📋 Updated indexes:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach((index, i) => {
      console.log(`   ${i + 1}. ${JSON.stringify(index.key)} - ${index.name}`);
    });

    console.log('\n✅ Email index fixed!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
};

fixEmailIndex();