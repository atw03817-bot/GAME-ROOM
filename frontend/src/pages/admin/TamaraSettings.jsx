import { useState, useEffect } from 'react';
import { FaSave, FaCalculator, FaCreditCard, FaInfoCircle } from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function TamaraSettings() {
  const [settings, setSettings] = useState({
    // إعدادات العمولة
    commissionEnabled: true,
    commissionRate: 3.0,
    commissionDisplayName: 'عمولة الأقساط - تمارا'
  });
  
  const [loading, setLoading] = useState(false);
  const [testAmount, setTestAmount] = useState(1000);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tamara-settings');
      if (response.data.success) {
        // التأكد من أن جميع القيم معرفة لتجنب تحذير React
        const data = response.data.data;
        setSettings({
          commissionEnabled: data.commissionEnabled ?? true,
          commissionRate: data.commissionRate ?? 3.0,
          commissionDisplayName: data.commissionDisplayName ?? 'عمولة الأقساط - تمارا'
        });
      }
    } catch (error) {
      console.error('Error fetching Tamara settings:', error);
      toast.error('خطأ في جلب إعدادات تمارا');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await api.put('/tamara-settings', settings);
      
      if (response.data.success) {
        toast.success('تم حفظ إعدادات عمولة تمارا بنجاح');
        const data = response.data.data;
        setSettings({
          commissionEnabled: data.commissionEnabled ?? true,
          commissionRate: data.commissionRate ?? 3.0,
          commissionDisplayName: data.commissionDisplayName ?? 'عمولة الأقساط - تمارا'
        });
      }
    } catch (error) {
      console.error('Error saving Tamara settings:', error);
      toast.error(error.response?.data?.message || 'خطأ في حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const testCommissionCalculation = async () => {
    try {
      const response = await api.post('/tamara-settings/calculate-commission', {
        subtotal: testAmount
      });
      
      if (response.data.success) {
        setTestResult(response.data.data);
        toast.success('تم حساب العمولة بنجاح');
      }
    } catch (error) {
      console.error('Error testing commission:', error);
      toast.error('خطأ في حساب العمولة');
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading && !settings.commissionRate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل إعدادات عمولة تمارا...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaCreditCard className="text-2xl text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold">إعدادات عمولة تمارا</h1>
            <p className="text-gray-600">إدارة عمولة الأقساط الإضافية عند استخدام تمارا</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* إعدادات العمولة */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaCalculator className="text-lg text-green-600" />
            <h2 className="text-xl font-semibold">إعدادات العمولة</h2>
          </div>

          <div className="space-y-4">
            {/* تفعيل العمولة */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.commissionEnabled || false}
                  onChange={(e) => handleInputChange('commissionEnabled', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="font-medium">تفعيل عمولة الأقساط</span>
              </label>
              <p className="text-sm text-gray-600 mt-1">
                عند التفعيل، ستُضاف عمولة إضافية عند اختيار تمارا كوسيلة دفع
              </p>
            </div>

            {/* نسبة العمولة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نسبة العمولة (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.commissionRate || 0}
                onChange={(e) => handleInputChange('commissionRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="3.0"
              />
              <p className="text-sm text-gray-600 mt-1">
                النسبة المئوية للعمولة من المبلغ الفرعي
              </p>
            </div>

            {/* اسم العمولة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم العمولة (كما يظهر للعميل)
              </label>
              <input
                type="text"
                value={settings.commissionDisplayName || ''}
                onChange={(e) => handleInputChange('commissionDisplayName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="عمولة الأقساط - تمارا"
              />
            </div>

            {/* اختبار حساب العمولة */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">اختبار حساب العمولة</h3>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  value={testAmount || 0}
                  onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="مبلغ الاختبار"
                />
                <button
                  onClick={testCommissionCalculation}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  احسب
                </button>
              </div>
              
              {testResult && (
                <div className="text-sm space-y-1">
                  <p>المبلغ الفرعي: <span className="font-semibold">{testResult.subtotal} ر.س</span></p>
                  <p>العمولة: <span className="font-semibold text-orange-600">{testResult.commission.amount} ر.س</span></p>
                  <p>المجموع مع العمولة: <span className="font-semibold">{(testResult.subtotal + testResult.commission.amount).toFixed(2)} ر.س</span></p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* معاينة العمولة */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">معاينة العمولة</h2>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">مثال على عرض العمولة في السلة:</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">المجموع الفرعي</span>
                <span className="font-semibold">500.00 ر.س</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">الشحن</span>
                <span className="font-semibold">30.00 ر.س</span>
              </div>
              
              {settings.commissionEnabled && (
                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">{settings.commissionDisplayName || 'عمولة الأقساط - تمارا'}</span>
                  </div>
                  <span className="font-semibold text-orange-600">
                    {((500 * (settings.commissionRate || 0)) / 100).toFixed(2)} ر.س
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">الضريبة (15%)</span>
                <span className="font-semibold">
                  {((530 + (settings.commissionEnabled ? (500 * (settings.commissionRate || 0)) / 100 : 0)) * 0.15).toFixed(2)} ر.س
                </span>
              </div>
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-bold">المجموع الكلي</span>
                  <span className="text-xl font-bold text-primary-600">
                    {(530 + (settings.commissionEnabled ? (500 * (settings.commissionRate || 0)) / 100 : 0) + ((530 + (settings.commissionEnabled ? (500 * (settings.commissionRate || 0)) / 100 : 0)) * 0.15)).toFixed(2)} ر.س
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <FaInfoCircle className="text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">ملاحظات مهمة:</p>
                <ul className="space-y-1 text-xs">
                  <li>• العمولة تُحسب من المبلغ الفرعي فقط (قبل الشحن والضريبة)</li>
                  <li>• الضريبة تُحسب على المجموع شاملاً العمولة</li>
                  <li>• العمولة تظهر فقط عند اختيار تمارا كوسيلة دفع</li>
                  <li>• يمكن تعطيل العمولة مؤقتاً دون حذف الإعدادات</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* أزرار الحفظ */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400"
          >
            <FaSave />
            {loading ? 'جاري الحفظ...' : 'حفظ إعدادات العمولة'}
          </button>
          
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
          >
            إعادة تحميل
          </button>
        </div>
      </div>
    </div>
  );
}

export default TamaraSettings;