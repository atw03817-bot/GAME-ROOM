import mongoose from 'mongoose';

const tamaraSettingsSchema = new mongoose.Schema({
  // إعدادات عمولة تمارا
  commissionEnabled: {
    type: Boolean,
    default: true,
    description: 'تفعيل عمولة الأقساط لتمارا'
  },
  commissionRate: {
    type: Number,
    default: 3.0,
    min: 0,
    max: 100,
    description: 'نسبة عمولة الأقساط (بالنسبة المئوية)'
  },
  commissionDisplayName: {
    type: String,
    default: 'عمولة الأقساط - تمارا',
    description: 'اسم العمولة كما يظهر للعميل'
  },
  
  // إعدادات تمارا العامة
  enabled: {
    type: Boolean,
    default: false,
    description: 'تفعيل تمارا كوسيلة دفع'
  },
  apiUrl: {
    type: String,
    default: 'https://api.tamara.co',
    description: 'رابط API تمارا'
  },
  merchantToken: {
    type: String,
    description: 'رمز التاجر من تمارا'
  },
  notificationKey: {
    type: String,
    description: 'مفتاح الإشعارات من تمارا'
  },
  testMode: {
    type: Boolean,
    default: true,
    description: 'وضع التجربة'
  },
  
  // إعدادات العرض
  showInstallmentInfo: {
    type: Boolean,
    default: true,
    description: 'إظهار معلومات الأقساط في صفحة المنتج'
  },
  minOrderAmount: {
    type: Number,
    default: 100,
    description: 'أقل مبلغ طلب لتفعيل تمارا'
  },
  maxOrderAmount: {
    type: Number,
    default: 10000,
    description: 'أعلى مبلغ طلب لتفعيل تمارا'
  }
}, {
  timestamps: true
});

// إنشاء فهرس فريد لضمان وجود إعدادات واحدة فقط
tamaraSettingsSchema.index({ _id: 1 }, { unique: true });

// دالة للحصول على الإعدادات أو إنشاءها
tamaraSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// دالة لحساب عمولة تمارا
tamaraSettingsSchema.statics.calculateCommission = async function(subtotal) {
  const settings = await this.getSettings();
  
  if (!settings.commissionEnabled) {
    return {
      amount: 0,
      rate: 0,
      displayName: settings.commissionDisplayName
    };
  }
  
  const commissionAmount = (subtotal * settings.commissionRate) / 100;
  
  return {
    amount: Math.round(commissionAmount * 100) / 100, // تقريب لأقرب قرش
    rate: settings.commissionRate,
    displayName: settings.commissionDisplayName
  };
};

export default mongoose.model('TamaraSettings', tamaraSettingsSchema);