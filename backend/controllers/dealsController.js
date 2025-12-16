import Product from '../models/Product.js';

// Get all products with deals (originalPrice > price)
export const getDeals = async (req, res) => {
  try {
    const deals = await Product.find({
      originalPrice: { $exists: true, $ne: null },
      $expr: { $gt: ['$originalPrice', '$price'] }
    })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate discount percentage
    const dealsWithDiscount = deals.map(product => ({
      ...product,
      discountPercentage: Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    }));

    res.json({
      success: true,
      deals: dealsWithDiscount,
      count: dealsWithDiscount.length
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب العروض'
    });
  }
};

// Add deal to product (set originalPrice and discounted price)
export const addDealToProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { discountPercentage, discountAmount, originalPrice } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }

    // Calculate new price
    let newPrice;
    const currentOriginalPrice = originalPrice || product.price;

    if (discountPercentage) {
      newPrice = currentOriginalPrice * (1 - discountPercentage / 100);
    } else if (discountAmount) {
      newPrice = currentOriginalPrice - discountAmount;
    } else {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد نسبة الخصم أو قيمة الخصم'
      });
    }

    // Update product
    product.originalPrice = currentOriginalPrice;
    product.price = Math.round(newPrice * 100) / 100; // Round to 2 decimals
    await product.save();

    res.json({
      success: true,
      message: 'تم إضافة العرض بنجاح',
      product: {
        ...product.toObject(),
        discountPercentage: Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      }
    });
  } catch (error) {
    console.error('Error adding deal:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة العرض'
    });
  }
};

// Remove deal from product (restore original price)
export const removeDealFromProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }

    // Restore original price
    if (product.originalPrice) {
      product.price = product.originalPrice;
      product.originalPrice = null;
      await product.save();
    }

    res.json({
      success: true,
      message: 'تم إزالة العرض بنجاح',
      product
    });
  } catch (error) {
    console.error('Error removing deal:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إزالة العرض'
    });
  }
};

// Update deal on product
export const updateDeal = async (req, res) => {
  try {
    const { productId } = req.params;
    const { discountPercentage, discountAmount } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }

    if (!product.originalPrice) {
      return res.status(400).json({
        success: false,
        message: 'المنتج ليس عليه عرض'
      });
    }

    // Calculate new price
    let newPrice;
    if (discountPercentage) {
      newPrice = product.originalPrice * (1 - discountPercentage / 100);
    } else if (discountAmount) {
      newPrice = product.originalPrice - discountAmount;
    } else {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد نسبة الخصم أو قيمة الخصم'
      });
    }

    product.price = Math.round(newPrice * 100) / 100;
    await product.save();

    res.json({
      success: true,
      message: 'تم تحديث العرض بنجاح',
      product: {
        ...product.toObject(),
        discountPercentage: Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      }
    });
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث العرض'
    });
  }
};
