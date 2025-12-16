import Address from '../models/Address.js';

// @desc    Get all addresses for logged in user
// @route   GET /api/addresses
// @access  Private
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    
    res.json({
      success: true,
      data: addresses
    });
  } catch (error) {
    console.error('Error getting addresses:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب العناوين'
    });
  }
};

// @desc    Get single address
// @route   GET /api/addresses/:id
// @access  Private
export const getAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'العنوان غير موجود'
      });
    }
    
    res.json({
      success: true,
      data: address
    });
  } catch (error) {
    console.error('Error getting address:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب العنوان'
    });
  }
};

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
export const createAddress = async (req, res) => {
  try {
    const { fullName, phone, city, district, street, building, postalCode, isDefault } = req.body;
    
    // Validation
    if (!fullName || !phone || !city || !district || !street || !building) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة'
      });
    }
    
    // If this is set as default, unset other defaults
    if (isDefault) {
      await Address.updateMany(
        { userId: req.user._id },
        { isDefault: false }
      );
    }
    
    // If this is the first address, make it default
    const addressCount = await Address.countDocuments({ userId: req.user._id });
    const shouldBeDefault = addressCount === 0 || isDefault;
    
    const address = await Address.create({
      userId: req.user._id,
      fullName,
      phone,
      city,
      district,
      street,
      building,
      postalCode,
      isDefault: shouldBeDefault
    });
    
    res.status(201).json({
      success: true,
      data: address,
      message: 'تم إضافة العنوان بنجاح'
    });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إضافة العنوان'
    });
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const { fullName, phone, city, district, street, building, postalCode, isDefault } = req.body;
    
    // Find address
    let address = await Address.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'العنوان غير موجود'
      });
    }
    
    // If setting as default, unset other defaults
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { userId: req.user._id, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }
    
    // Update address
    address = await Address.findByIdAndUpdate(
      req.params.id,
      {
        fullName,
        phone,
        city,
        district,
        street,
        building,
        postalCode,
        isDefault
      },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: address,
      message: 'تم تحديث العنوان بنجاح'
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث العنوان'
    });
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'العنوان غير موجود'
      });
    }
    
    // If deleting default address, set another as default
    if (address.isDefault) {
      const otherAddress = await Address.findOne({
        userId: req.user._id,
        _id: { $ne: req.params.id }
      });
      
      if (otherAddress) {
        otherAddress.isDefault = true;
        await otherAddress.save();
      }
    }
    
    await Address.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'تم حذف العنوان بنجاح'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف العنوان'
    });
  }
};

// @desc    Set address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
export const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'العنوان غير موجود'
      });
    }
    
    // Unset all other defaults
    await Address.updateMany(
      { userId: req.user._id },
      { isDefault: false }
    );
    
    // Set this as default
    address.isDefault = true;
    await address.save();
    
    res.json({
      success: true,
      data: address,
      message: 'تم تعيين العنوان الافتراضي بنجاح'
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تعيين العنوان الافتراضي'
    });
  }
};
