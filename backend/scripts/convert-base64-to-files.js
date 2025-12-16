import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function convertBase64ToFiles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 وجدت ${products.length} منتج`);

    let converted = 0;
    let skipped = 0;

    for (const product of products) {
      let hasChanges = false;
      const newImages = [];

      for (let i = 0; i < product.images.length; i++) {
        const image = product.images[i];

        // Check if it's base64
        if (image.startsWith('data:image')) {
          try {
            // Extract base64 data
            const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
            if (!matches) {
              console.log(`⚠️  صورة غير صالحة في المنتج: ${product.nameAr}`);
              newImages.push(image);
              continue;
            }

            const ext = matches[1];
            const data = matches[2];
            const buffer = Buffer.from(data, 'base64');

            // Generate filename
            const filename = `product-${product._id}-${i}-${Date.now()}.${ext}`;
            const filepath = path.join(__dirname, '../uploads', filename);

            // Ensure uploads directory exists
            const uploadsDir = path.join(__dirname, '../uploads');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // Save file
            fs.writeFileSync(filepath, buffer);

            // Add new URL
            const imageUrl = `${process.env.API_URL || 'http://localhost:5000'}/uploads/${filename}`;
            newImages.push(imageUrl);

            hasChanges = true;
            converted++;
            console.log(`✅ تم تحويل صورة: ${filename}`);
          } catch (error) {
            console.error(`❌ خطأ في تحويل صورة المنتج ${product.nameAr}:`, error.message);
            newImages.push(image);
          }
        } else {
          // Already a URL, keep it
          newImages.push(image);
          skipped++;
        }
      }

      // Update product if there are changes
      if (hasChanges) {
        product.images = newImages;
        await product.save();
        console.log(`💾 تم تحديث المنتج: ${product.nameAr}`);
      }
    }

    console.log('\n📊 النتائج:');
    console.log(`✅ تم تحويل ${converted} صورة`);
    console.log(`⏭️  تم تخطي ${skipped} صورة (روابط بالفعل)`);
    console.log('\n✅ اكتمل التحويل بنجاح!');

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
}

convertBase64ToFiles();
