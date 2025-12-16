import express from 'express';
import { auth, adminAuth } from '../middleware/auth.js';
import StoreSettings from '../models/StoreSettings.js';

const router = express.Router();

// Get settings (public - for frontend to fetch)
router.get('/', async (req, res) => {
  try {
    let settings = await StoreSettings.findOne({ singleton: true });
    
    // If no settings exist, create default
    if (!settings) {
      settings = await StoreSettings.create({
        singleton: true,
        storeName: '',
        storeNameAr: '',
        storeDescription: '',
        storeDescriptionAr: '',
        contactEmail: '',
        contactPhone: '',
        currency: 'SAR',
        taxRate: 15,
        shippingEnabled: true,
        freeShippingEnabled: false,
        freeShippingThreshold: 200,
        codEnabled: true,
        tapEnabled: false,
        tapSecretKey: '',
        tapPublicKey: ''
      });
    }
    
    // Return all settings (including keys for admin)
    // Frontend will handle showing/hiding based on user role
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'خطأ في جلب الإعدادات' });
  }
});

// Update settings (admin only)
router.put('/', auth, adminAuth, async (req, res) => {
  try {
    const updates = req.body;
    console.log('📝 Received updates:', JSON.stringify(updates, null, 2));
    
    let settings = await StoreSettings.findOne({ singleton: true });
    
    if (!settings) {
      // Create new settings if doesn't exist
      console.log('✨ Creating new settings');
      settings = new StoreSettings({
        singleton: true,
        ...updates
      });
      await settings.save();
    } else {
      // Update existing settings - use findOneAndUpdate for better reliability
      console.log('🔄 Updating existing settings');
      settings = await StoreSettings.findOneAndUpdate(
        { singleton: true },
        { $set: updates },
        { new: true, runValidators: false }
      );
    }
    
    console.log('✅ Settings saved successfully');
    console.log('Tap Enabled:', settings.tapEnabled);
    console.log('Tap Secret Key:', settings.tapSecretKey ? '***' + settings.tapSecretKey.slice(-4) : 'EMPTY');
    console.log('Tap Public Key:', settings.tapPublicKey ? '***' + settings.tapPublicKey.slice(-4) : 'EMPTY');
    
    res.json({ 
      success: true, 
      message: 'تم تحديث الإعدادات بنجاح',
      settings 
    });
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    res.status(500).json({ message: 'خطأ في تحديث الإعدادات', error: error.message });
  }
});

export default router;
