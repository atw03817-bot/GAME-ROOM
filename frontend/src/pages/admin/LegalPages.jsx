import { useState, useEffect } from 'react';
import { FiSave, FiFileText, FiEye, FiEyeOff, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function LegalPages() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('privacy-policy');
  const [showPreview, setShowPreview] = useState(false);
  const [legalData, setLegalData] = useState({
    privacyPolicy: {
      title: 'سياسة الخصوصية',
      content: '',
      isActive: true
    },
    termsAndConditions: {
      title: 'الشروط والأحكام',
      content: '',
      isActive: true
    },
    returnPolicy: {
      title: 'سياسة الإرجاع والاستبدال',
      content: '',
      isActive: true
    },
    contactInfo: {
      email: 'info@store.com',
      phone: '+966 50 000 0000',
      address: 'الرياض، المملكة العربية السعودية',
      companyName: '',
      workingHours: 'السبت - الخميس: 9 صباحاً - 6 مساءً',
      supportDescription: 'متاح على مدار الساعة عبر الواتساب والبريد الإلكتروني'
    },
    faq: {
      enabled: true,
      title: 'الأسئلة الشائعة',
      questions: []
    }
  });

  useEffect(() => {
    fetchLegalData();
  }, []);

  const fetchLegalData = async () => {
    try {
      const response = await api.get('/legal-pages');
      if (response.data.success) {
        console.log('Fetched legal data:', JSON.stringify(response.data.data, null, 2));
        setLegalData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching legal data:', error);
      toast.error('خطأ في جلب بيانات الصفحات القانونية');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Saving legal data:', JSON.stringify(legalData, null, 2));
      const response = await api.put('/legal-pages', legalData);
      if (response.data.success) {
        toast.success('تم حفظ الصفحات القانونية بنجاح');
        // Refresh data after save to ensure consistency
        await fetchLegalData();
      }
    } catch (error) {
      console.error('Error saving legal data:', error);
      toast.error('خطأ في حفظ الصفحات القانونية');
    } finally {
      setSaving(false);
    }
  };

  const handleSectionChange = (section, field, value) => {
    setLegalData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // FAQ Functions
  const addFaqQuestion = () => {
    setLegalData(prev => ({
      ...prev,
      faq: {
        ...prev.faq,
        questions: [
          ...(prev.faq?.questions || []),
          { question: 'سؤال جديد', answer: 'الإجابة', order: (prev.faq?.questions?.length || 0) + 1 }
        ]
      }
    }));
  };

  const removeFaqQuestion = (index) => {
    setLegalData(prev => ({
      ...prev,
      faq: {
        ...prev.faq,
        questions: (prev.faq?.questions || []).filter((_, i) => i !== index)
      }
    }));
  };

  const updateFaqQuestion = (index, field, value) => {
    setLegalData(prev => ({
      ...prev,
      faq: {
        ...prev.faq,
        questions: (prev.faq?.questions || []).map((faq, i) => 
          i === index ? { ...faq, [field]: value } : faq
        )
      }
    }));
  };

  // HTML Formatting Functions
  const insertHtmlTag = (field, tag, defaultText) => {
    const currentData = legalData[field];
    const newContent = currentData.content + `\n<${tag}>${defaultText}</${tag}>\n`;
    handleSectionChange(field, 'content', newContent);
  };

  const insertHtmlList = (field) => {
    const currentData = legalData[field];
    const listHtml = `
<ul>
  <li>العنصر الأول</li>
  <li>العنصر الثاني</li>
  <li>العنصر الثالث</li>
</ul>
`;
    const newContent = currentData.content + listHtml;
    handleSectionChange(field, 'content', newContent);
  };

  const insertHtmlBreak = (field) => {
    const currentData = legalData[field];
    const newContent = currentData.content + '<br>\n';
    handleSectionChange(field, 'content', newContent);
  };

  const tabs = [
    { id: 'privacy-policy', label: 'سياسة الخصوصية', field: 'privacyPolicy' },
    { id: 'terms-conditions', label: 'الشروط والأحكام', field: 'termsAndConditions' },
    { id: 'return-policy', label: 'سياسة الإرجاع', field: 'returnPolicy' },
    { id: 'contact-info', label: 'معلومات الاتصال', field: 'contactInfo' },
    { id: 'faq', label: 'الأسئلة الشائعة', field: 'faq' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <FiFileText className="text-primary-600" />
            الصفحات القانونية
          </h1>
          <p className="text-gray-600">إدارة محتوى سياسة الخصوصية والشروط والأحكام</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
        >
          <FiSave size={18} />
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Contact Info Tab */}
          {activeTab === 'contact-info' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">معلومات الاتصال</h3>
                <p className="text-sm text-gray-600 mb-6">
                  هذه المعلومات ستُستخدم في الصفحات القانونية تلقائياً باستخدام المتغيرات مثل {'{'}{'{'} email {'}'}{'}'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم الشركة</label>
                  <input
                    type="text"
                    value={legalData.contactInfo.companyName}
                    onChange={(e) => handleSectionChange('contactInfo', 'companyName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={legalData.contactInfo.email}
                    onChange={(e) => handleSectionChange('contactInfo', 'email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                  <input
                    type="text"
                    value={legalData.contactInfo.phone}
                    onChange={(e) => handleSectionChange('contactInfo', 'phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                  <input
                    type="text"
                    value={legalData.contactInfo.address}
                    onChange={(e) => handleSectionChange('contactInfo', 'address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ساعات العمل</label>
                  <input
                    type="text"
                    value={legalData.contactInfo.workingHours}
                    onChange={(e) => handleSectionChange('contactInfo', 'workingHours', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">وصف الدعم الفني</label>
                  <input
                    type="text"
                    value={legalData.contactInfo.supportDescription}
                    onChange={(e) => handleSectionChange('contactInfo', 'supportDescription', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">المتغيرات المتاحة:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div><code className="bg-blue-100 px-2 py-1 rounded">{'{{companyName}}'}</code> - اسم الشركة</div>
                  <div><code className="bg-blue-100 px-2 py-1 rounded">{'{{email}}'}</code> - البريد الإلكتروني</div>
                  <div><code className="bg-blue-100 px-2 py-1 rounded">{'{{phone}}'}</code> - رقم الهاتف</div>
                  <div><code className="bg-blue-100 px-2 py-1 rounded">{'{{address}}'}</code> - العنوان</div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">الأسئلة الشائعة</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    إدارة الأسئلة الشائعة التي تظهر في صفحة "اتصل بنا"
                  </p>
                </div>
                <button
                  onClick={addFaqQuestion}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  <FiPlus size={16} />
                  إضافة سؤال
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={legalData.faq?.enabled || false}
                    onChange={(e) => handleSectionChange('faq', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
                <span className="font-medium">تفعيل قسم الأسئلة الشائعة</span>
              </div>

              {legalData.faq?.enabled && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">عنوان القسم</label>
                    <input
                      type="text"
                      value={legalData.faq?.title || 'الأسئلة الشائعة'}
                      onChange={(e) => handleSectionChange('faq', 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-4">
                    {(legalData.faq?.questions || []).map((faq, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-800">سؤال {index + 1}</h4>
                          <button
                            onClick={() => removeFaqQuestion(index)}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">السؤال</label>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => updateFaqQuestion(index, 'question', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="اكتب السؤال هنا"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الإجابة</label>
                            <textarea
                              value={faq.answer}
                              onChange={(e) => updateFaqQuestion(index, 'answer', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="اكتب الإجابة هنا"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ترتيب العرض</label>
                            <input
                              type="number"
                              value={faq.order || index + 1}
                              onChange={(e) => updateFaqQuestion(index, 'order', parseInt(e.target.value) || 0)}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              min="1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Legal Pages Tabs */}
          {activeTab !== 'contact-info' && activeTab !== 'faq' && (
            <div className="space-y-6">
              {(() => {
                const currentTab = tabs.find(tab => tab.id === activeTab);
                const currentData = legalData[currentTab.field];
                
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{currentTab.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          آخر تحديث: {currentData.lastUpdated ? new Date(currentData.lastUpdated).toLocaleDateString('ar-SA') : 'غير محدد'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentData.isActive}
                            onChange={(e) => handleSectionChange(currentTab.field, 'isActive', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                        <span className="text-sm font-medium flex items-center gap-2">
                          {currentData.isActive ? (
                            <>
                              <FiEye className="text-green-600" />
                              مفعل
                            </>
                          ) : (
                            <>
                              <FiEyeOff className="text-gray-400" />
                              معطل
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الصفحة</label>
                      <input
                        type="text"
                        value={currentData.title}
                        onChange={(e) => handleSectionChange(currentTab.field, 'title', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">محتوى الصفحة</label>
                      
                      {/* HTML Formatting Toolbar */}
                      <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => insertHtmlTag(currentTab.field, 'h1', 'عنوان رئيسي')}
                          className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
                        >
                          H1
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHtmlTag(currentTab.field, 'h2', 'عنوان فرعي')}
                          className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHtmlTag(currentTab.field, 'h3', 'عنوان صغير')}
                          className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHtmlTag(currentTab.field, 'strong', 'نص عريض')}
                          className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition font-bold"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHtmlTag(currentTab.field, 'em', 'نص مائل')}
                          className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition italic"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHtmlList(currentTab.field)}
                          className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
                        >
                          قائمة
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHtmlTag(currentTab.field, 'p', 'فقرة جديدة')}
                          className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
                        >
                          فقرة
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHtmlBreak(currentTab.field)}
                          className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
                        >
                          سطر جديد
                        </button>
                      </div>
                      
                      <textarea
                        value={currentData.content}
                        onChange={(e) => handleSectionChange(currentTab.field, 'content', e.target.value)}
                        rows={20}
                        className="w-full px-4 py-3 border border-gray-300 rounded-b-lg border-t-0 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                        placeholder="اكتب محتوى الصفحة هنا... يمكنك استخدام HTML للتنسيق"
                      />
                      
                      {/* Preview */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">معاينة المحتوى</label>
                          <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className="text-xs text-primary-600 hover:text-primary-700"
                          >
                            {showPreview ? 'إخفاء المعاينة' : 'إظهار المعاينة'}
                          </button>
                        </div>
                        {showPreview && (
                          <div 
                            className="border border-gray-300 rounded-lg p-4 bg-gray-50 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: currentData.content }}
                          />
                        )}
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <p>يمكنك استخدام HTML للتنسيق:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><code>&lt;h1&gt;عنوان رئيسي&lt;/h1&gt;</code></div>
                          <div><code>&lt;h2&gt;عنوان فرعي&lt;/h2&gt;</code></div>
                          <div><code>&lt;strong&gt;نص عريض&lt;/strong&gt;</code></div>
                          <div><code>&lt;em&gt;نص مائل&lt;/em&gt;</code></div>
                          <div><code>&lt;p&gt;فقرة&lt;/p&gt;</code></div>
                          <div><code>&lt;br&gt; سطر جديد</code></div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LegalPages;