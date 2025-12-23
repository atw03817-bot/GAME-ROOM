import TamaraSettings from '../models/TamaraSettings.js';

// الحصول على إعدادات تمارا
export const getTamaraSettings = async (req, res) => {
  try {
    const settings = await TamaraSettings.getSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching Tamara settings:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إعدادات تمارا',
      error: error.message
    });
  }
};

// تحديث إعدادات تمارا
export const updateTamaraSettings = async (req, res) => {
  try {
    const {
      commissionEnabled,
      commissionRate,
      commissionDisplayName,
      enabled,
      apiUrl,
      merchantToken,
      notificationKey,
      testMode,
      showInstallmentInfo,
      minOrderAmount,
      maxOrderAmount
    } = req.body;

    // التحقق من صحة البيانات
    if (commissionRate !== undefined) {
      if (commissionRate < 0 || commissionRate > 100) {
        return res.status(400).json({
          success: false,
          message: 'نسبة العمولة يجب أن تكون بين 0 و 100'
        });
      }
    }

    if (minOrderAmount !== undefined && maxOrderAmount !== undefined) {
      if (minOrderAmount >= maxOrderAmount) {
        return res.status(400).json({
          success: false,
          message: 'أقل مبلغ طلب يجب أن يكون أقل من أعلى مبلغ طلب'
        });
      }
    }

    let settings = await TamaraSettings.findOne();
    
    if (!settings) {
      // إنشاء إعدادات جديدة
      settings = new TamaraSettings(req.body);
    } else {
      // تحديث الإعدادات الموجودة
      Object.assign(settings, req.body);
    }

    await settings.save();

    res.json({
      success: true,
      message: 'تم تحديث إعدادات تمارا بنجاح',
      data: settings
    });
  } catch (error) {
    console.error('Error updating Tamara settings:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث إعدادات تمارا',
      error: error.message
    });
  }
};

// حساب عمولة تمارا لمبلغ معين
export const calculateTamaraCommission = async (req, res) => {
  try {
    const { subtotal } = req.body;

    if (!subtotal || subtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'المبلغ الفرعي مطلوب ويجب أن يكون أكبر من صفر'
      });
    }

    const commission = await TamaraSettings.calculateCommission(subtotal);

    res.json({
      success: true,
      data: {
        subtotal,
        commission
      }
    });
  } catch (error) {
    console.error('Error calculating Tamara commission:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حساب عمولة تمارا',
      error: error.message
    });
  }
};

// التحقق من إمكانية استخدام تمارا لطلب معين
export const checkTamaraEligibility = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'مبلغ الطلب مطلوب ويجب أن يكون أكبر من صفر'
      });
    }

    const settings = await TamaraSettings.getSettings();

    const isEligible = settings.enabled && 
                      totalAmount >= settings.minOrderAmount && 
                      totalAmount <= settings.maxOrderAmount;

    res.json({
      success: true,
      data: {
        eligible: isEligible,
        minAmount: settings.minOrderAmount,
        maxAmount: settings.maxOrderAmount,
        enabled: settings.enabled
      }
    });
  } catch (error) {
    console.error('Error checking Tamara eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من أهلية تمارا',
      error: error.message
    });
  }
};