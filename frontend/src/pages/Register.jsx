import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';
import useAuthStore from '../store/useAuthStore';

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  // دالة تنسيق رقم الجوال
  const formatPhoneNumber = (phone) => {
    // إزالة جميع الرموز غير الرقمية
    let cleanPhone = phone.replace(/\D/g, '');
    
    // إزالة رمز الدولة إذا كان موجود
    if (cleanPhone.startsWith('966')) {
      cleanPhone = cleanPhone.substring(3);
    }
    
    // إضافة 0 في البداية إذا لم تكن موجودة
    if (cleanPhone.length === 9 && !cleanPhone.startsWith('0')) {
      cleanPhone = '0' + cleanPhone;
    }
    
    return cleanPhone;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setFormData({ ...formData, phone: formatted });
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(05|5)[0-9]{8}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const validateForm = () => {
    if (!validatePhone(formData.phone)) {
      toast.error('رقم الجوال يجب أن يكون رقم سعودي صحيح (مثال: 0501234567)');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('كلمة المرور وتأكيد كلمة المرور غير متطابقتان');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      // إرسال البيانات بدون confirmPassword
      const { confirmPassword, ...submitData } = formData;
      
      const { data } = await authAPI.register(submitData);
      login(data.user, data.token);
      toast.success(data.message || 'تم إنشاء الحساب بنجاح');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في إنشاء الحساب';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">إنشاء حساب جديد</h2>
          <p className="text-gray-600 mt-2">ابدأ التسوق معنا الآن</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الجوال *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="0501234567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              dir="ltr"
            />
            <p className="text-xs text-gray-500 mt-1">
              مثال: 0501234567 أو 966501234567
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="6 أحرف على الأقل"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تأكيد كلمة المرور *
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="أعد كتابة كلمة المرور"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              تسجيل الدخول
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            بإنشاء الحساب، أنت توافق على شروط الاستخدام وسياسة الخصوصية
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
