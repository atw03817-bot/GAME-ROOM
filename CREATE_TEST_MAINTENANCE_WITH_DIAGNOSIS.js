// إنشاء طلب صيانة تجريبي مع تقرير تشخيص حقيقي
const mongoose = require('mongoose');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/hotwav-maintenance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// تعريف النموذج
const maintenanceSchema = new mongoose.Schema({
  requestNumber: { type: String, required: true, unique: true },
  customerInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true }
  },
  device: {
    model: { type: String, required: true },
    color: { type: String },
    storage: { type: String },
    serialNumber: { type: String, required: true },
    purchaseDate: { type: Date },
    hasPassword: { type: Boolean, default: false },
    passwordType: { type: String, enum: ['text', 'pattern'] },
    passwordValue: { type: String },
    patternValue: { type: String }
  },
  issue: {
    category: { type: String, required: true },
    subCategory: { type: String },
    description: { type: String, required: true },
    images: [{ type: String }],
    priority: { type: String, enum: ['normal', 'urgent', 'emergency'], default: 'normal' },
    symptoms: [{ type: String }]
  },
  diagnosis: {
    initialCheck: { type: String },
    problemFound: { type: String },
    rootCause: { type: String },
    recommendedSolution: { type: String },
    requiredParts: [{
      partName: String,
      partNumber: String,
      price: Number,
      availability: { type: String, enum: ['available', 'unavailable', 'special_order'], default: 'available' }
    }],
    repairability: { type: String, enum: ['repairable', 'unrepairable', 'needs_parts'], default: 'repairable' },
    estimatedTime: { type: Number },
    technicianNotes: { type: String }
  },
  status: {
    current: { type: String, default: 'received' },
    history: [{
      status: String,
      date: { type: Date, default: Date.now },
      note: String,
      updatedBy: String
    }]
  },
  cost: {
    diagnosticFee: { type: Number, default: 0 },
    partsCost: { type: Number, default: 0 },
    laborCost: { type: Number, default: 0 },
    priorityFee: { type: Number, default: 0 },
    totalEstimated: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' }
  },
  customerApproval: {
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    decision: { type: String },
    customerNotes: { type: String },
    approvalDate: { type: Date },
    approvalMethod: { type: String, enum: ['online', 'in_store'], default: 'online' }
  }
}, {
  timestamps: true
});

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceSchema);

async function createTestRequest() {
  try {
    console.log('إنشاء طلب صيانة تجريبي مع تقرير حقيقي...');
    
    // حذف الطلب التجريبي إذا كان موجوداً
    await MaintenanceRequest.deleteOne({ requestNumber: 'MR-TEST-001' });
    
    const testRequest = new MaintenanceRequest({
      requestNumber: 'MR-TEST-001',
      customerInfo: {
        name: 'عبد التواصل',
        phone: '0500909030',
        email: 'abadaltwasl390@gmail.com',
        address: 'الرياض، حي النخيل، شارع الملك فهد'
      },
      device: {
        model: 'HOTWAV Cyber 15',
        color: 'أسود',
        storage: '256GB',
        serialNumber: 'HW15-2024-001234',
        purchaseDate: new Date('2024-01-15'),
        hasPassword: true,
        passwordType: 'text',
        passwordValue: '123456'
      },
      issue: {
        category: 'screen',
        subCategory: 'شاشة مكسورة',
        description: 'سقط الجهاز وانكسرت الشاشة، يعمل اللمس لكن يوجد خطوط وتشققات',
        images: [
          '/uploads/device-front.jpg',
          '/uploads/device-back.jpg',
          '/uploads/device-side.jpg'
        ],
        priority: 'urgent',
        symptoms: ['شاشة مكسورة', 'خطوط على الشاشة', 'تشققات']
      },
      diagnosis: {
        initialCheck: 'تم فحص الجهاز بالكامل. الجهاز يعمل بشكل طبيعي من ناحية النظام والبطارية والشحن. المشكلة محصورة في الشاشة الخارجية فقط.',
        problemFound: 'كسر في الشاشة الخارجية (LCD + Touch Screen) مع وجود تشققات في الزجاج الواقي. الشاشة الداخلية سليمة والجهاز يعمل بشكل طبيعي.',
        rootCause: 'سقوط الجهاز على سطح صلب أدى إلى كسر الشاشة الخارجية والزجاج الواقي. لا توجد أضرار داخلية.',
        recommendedSolution: 'استبدال الشاشة الخارجية بالكامل (LCD + Touch + Glass) مع تركيب واقي شاشة جديد. العملية تتطلب فك الجهاز بالكامل وإعادة تجميعه.',
        requiredParts: [
          {
            partName: 'شاشة LCD كاملة مع اللمس',
            partNumber: 'HW15-LCD-001',
            price: 450,
            availability: 'available'
          },
          {
            partName: 'واقي شاشة زجاجي',
            partNumber: 'HW15-GLASS-001',
            price: 25,
            availability: 'available'
          }
        ],
        repairability: 'repairable',
        estimatedTime: 48,
        technicianNotes: 'يُنصح بعدم استخدام الجهاز حتى إتمام الإصلاح لتجنب تفاقم الضرر. سيتم اختبار جميع وظائف الجهاز بعد الإصلاح للتأكد من سلامته.'
      },
      status: {
        current: 'waiting_approval',
        history: [
          {
            status: 'received',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // قبل يومين
            note: 'تم استلام الجهاز من العميل',
            updatedBy: 'أحمد الفني'
          },
          {
            status: 'diagnosed',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // قبل يوم
            note: 'تم فحص الجهاز وتحديد المشكلة',
            updatedBy: 'أحمد الفني'
          },
          {
            status: 'waiting_approval',
            date: new Date(),
            note: 'تم إرسال تقرير الصيانة للعميل للموافقة',
            updatedBy: 'أحمد الفني'
          }
        ]
      },
      cost: {
        diagnosticFee: 25,
        partsCost: 475, // 450 + 25
        laborCost: 100,
        priorityFee: 50, // urgent priority
        totalEstimated: 650, // 25 + 475 + 100 + 50
        paymentStatus: 'unpaid'
      },
      customerApproval: {
        status: 'pending'
      }
    });
    
    await testRequest.save();
    
    console.log('تم إنشاء طلب الصيانة التجريبي بنجاح!');
    console.log('رقم الطلب:', testRequest.requestNumber);
    console.log('رابط الموافقة:', `http://localhost:3000/maintenance/approval/${testRequest.requestNumber}`);
    console.log('');
    console.log('تفاصيل التقرير:');
    console.log('- الفحص الأولي:', testRequest.diagnosis.initialCheck);
    console.log('- المشكلة المكتشفة:', testRequest.diagnosis.problemFound);
    console.log('- السبب الجذري:', testRequest.diagnosis.rootCause);
    console.log('- الحل المقترح:', testRequest.diagnosis.recommendedSolution);
    console.log('- عدد القطع المطلوبة:', testRequest.diagnosis.requiredParts.length);
    console.log('- الوقت المقدر:', testRequest.diagnosis.estimatedTime, 'ساعة');
    console.log('- التكلفة الإجمالية:', testRequest.cost.totalEstimated, 'ريال');
    
  } catch (error) {
    console.error('خطأ في إنشاء الطلب التجريبي:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestRequest();