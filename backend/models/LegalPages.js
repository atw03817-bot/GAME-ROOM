import mongoose from 'mongoose';

const legalPagesSchema = new mongoose.Schema({
  // Privacy Policy
  privacyPolicy: {
    title: { type: String, default: 'سياسة الخصوصية' },
    content: { type: String, default: `
<h1>سياسة الخصوصية</h1>

<h2>مقدمة</h2>
<p>نحن في {{companyName}} نحترم خصوصيتك ونلتزم بحماية معلوماتك الشخصية.</p>

<h2>المعلومات التي نجمعها</h2>
<ul>
  <li>الاسم الكامل</li>
  <li>عنوان البريد الإلكتروني</li>
  <li>رقم الهاتف</li>
  <li>عنوان الشحن</li>
</ul>

<h2>كيف نستخدم معلوماتك</h2>
<ul>
  <li>معالجة الطلبات</li>
  <li>التواصل معك</li>
  <li>تحسين خدماتنا</li>
  <li>إرسال العروض (بموافقتك)</li>
</ul>

<h2>حماية المعلومات</h2>
<p>نستخدم أحدث تقنيات الأمان لحماية معلوماتك الشخصية.</p>

<h2>الاتصال بنا</h2>
<p>إذا كان لديك أي استفسار حول سياسة الخصوصية، يرجى التواصل معنا:</p>
<ul>
  <li>البريد الإلكتروني: {{email}}</li>
  <li>الهاتف: {{phone}}</li>
</ul>
    ` },
    isActive: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now }
  },

  // Terms and Conditions
  termsAndConditions: {
    title: { type: String, default: 'الشروط والأحكام' },
    content: { type: String, default: `
<h1>الشروط والأحكام</h1>

<h2>القبول بالشروط</h2>
<p>باستخدام موقع {{companyName}}، فإنك توافق على هذه الشروط والأحكام.</p>

<h2>استخدام الموقع</h2>
<ul>
  <li>يجب أن تكون 18 سنة أو أكثر للتسوق</li>
  <li>يجب تقديم معلومات صحيحة ودقيقة</li>
  <li>لا يُسمح بالاستخدام غير القانوني للموقع</li>
</ul>

<h2>الطلبات والدفع</h2>
<ul>
  <li>جميع الأسعار بالريال السعودي</li>
  <li>الدفع مطلوب عند تأكيد الطلب</li>
  <li>نحتفظ بالحق في إلغاء الطلبات</li>
</ul>

<h2>الشحن والتسليم</h2>
<ul>
  <li>نشحن لجميع أنحاء المملكة</li>
  <li>مدة التسليم 2-5 أيام عمل</li>
  <li>الشحن مجاني للطلبات فوق 200 ريال</li>
</ul>

<h2>الإرجاع والاستبدال</h2>
<ul>
  <li>يمكن إرجاع المنتجات خلال 14 يوم</li>
  <li>يجب أن تكون المنتجات في حالتها الأصلية</li>
  <li>تكلفة الإرجاع على العميل</li>
</ul>

<h2>الاتصال بنا</h2>
<p>للاستفسارات:</p>
<ul>
  <li>البريد الإلكتروني: {{email}}</li>
  <li>الهاتف: {{phone}}</li>
  <li>العنوان: {{address}}</li>
</ul>
    ` },
    isActive: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now }
  },

  // Return Policy
  returnPolicy: {
    title: { type: String, default: 'سياسة الإرجاع والاستبدال' },
    content: { type: String, default: `
<h1>سياسة الإرجاع والاستبدال</h1>

<h2>شروط الإرجاع</h2>
<ul>
  <li>يمكن إرجاع المنتجات خلال 14 يوم من تاريخ الاستلام</li>
  <li>يجب أن تكون المنتجات في حالتها الأصلية</li>
  <li>يجب الاحتفاظ بالفاتورة الأصلية</li>
</ul>

<h2>المنتجات القابلة للإرجاع</h2>
<ul>
  <li>الهواتف الذكية (غير مستخدمة)</li>
  <li>الإكسسوارات (في عبوتها الأصلية)</li>
  <li>الأجهزة اللوحية</li>
</ul>

<h2>المنتجات غير القابلة للإرجاع</h2>
<ul>
  <li>المنتجات المستخدمة</li>
  <li>المنتجات التالفة بسبب سوء الاستخدام</li>
  <li>المنتجات المخصصة</li>
</ul>

<h2>عملية الإرجاع</h2>
<ol>
  <li>تواصل معنا على {{phone}}</li>
  <li>احصل على رقم الإرجاع</li>
  <li>أرسل المنتج مع الفاتورة</li>
  <li>سيتم رد المبلغ خلال 7-14 يوم عمل</li>
</ol>

<h2>الاستبدال</h2>
<ul>
  <li>يمكن استبدال المنتج بآخر من نفس القيمة</li>
  <li>الاستبدال متاح خلال 7 أيام</li>
  <li>تكلفة الشحن على العميل</li>
</ul>

<h2>الاتصال بنا</h2>
<p>لطلبات الإرجاع والاستبدال:</p>
<ul>
  <li>الهاتف: {{phone}}</li>
  <li>البريد الإلكتروني: {{email}}</li>
</ul>
    ` },
    isActive: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now }
  },

  // Contact Information (for template variables)
  contactInfo: {
    email: { type: String, default: 'info@store.com' },
    phone: { type: String, default: '+966 50 000 0000' },
    address: { type: String, default: 'الرياض، المملكة العربية السعودية' },
    companyName: { type: String, default: 'أبعاد التواصل' },
    workingHours: { type: String, default: 'السبت - الخميس: 9 صباحاً - 6 مساءً' },
    supportDescription: { type: String, default: 'متاح على مدار الساعة عبر الواتساب والبريد الإلكتروني' }
  },

  // FAQ Section
  faq: {
    enabled: { type: Boolean, default: true },
    title: { type: String, default: 'الأسئلة الشائعة' },
    questions: [{
      question: { type: String, required: true },
      answer: { type: String, required: true },
      order: { type: Number, default: 0 }
    }]
  }
}, {
  timestamps: true
});

// Add default FAQ data when creating new document or when FAQ is empty
legalPagesSchema.pre('save', function(next) {
  // Initialize FAQ if it doesn't exist or is empty
  if (!this.faq) {
    this.faq = {
      enabled: true,
      title: 'الأسئلة الشائعة',
      questions: []
    };
  }
  
  // Add default questions if none exist
  if (!this.faq.questions || this.faq.questions.length === 0) {
    this.faq.questions = [
      {
        question: 'كم تستغرق مدة التوصيل؟',
        answer: 'عادة من 2-5 أيام عمل حسب موقعك',
        order: 1
      },
      {
        question: 'هل يمكنني إرجاع المنتج؟',
        answer: 'نعم، خلال 14 يوم من تاريخ الاستلام',
        order: 2
      },
      {
        question: 'هل المنتجات أصلية؟',
        answer: 'نعم، جميع منتجاتنا أصلية 100% مع ضمان الوكيل',
        order: 3
      },
      {
        question: 'ما هي طرق الدفع المتاحة؟',
        answer: 'الدفع عند الاستلام، البطاقات الائتمانية، Tabby',
        order: 4
      }
    ];
  }
  next();
});

export default mongoose.model('LegalPages', legalPagesSchema);