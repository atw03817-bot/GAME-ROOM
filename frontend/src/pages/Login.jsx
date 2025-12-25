import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';
import useAuthStore from '../store/useAuthStore';

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({ phone: '', password: '' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من صحة رقم الجوال
    if (!validatePhone(formData.phone)) {
      toast.error('رقم الجوال يجب أن يكون رقم سعودي صحيح (مثال: 0501234567)');
      return;
    }
    
    setLoading(true);

    try {
      // Clear old tokens first
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      
      const { data } = await authAPI.login(formData);
      login(data.user, data.token);
      
      toast.success(data.message || 'تم تسجيل الدخول بنجاح', { duration: 4000 });
      
      // Navigate based on role
      const userRole = data.user.role?.toLowerCase();
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'technician' || userRole === 'manager') {
        navigate('/admin/maintenance');
      } else {
        navigate('/');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في تسجيل الدخول';
      console.error('Login error:', errorMessage);
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">تسجيل الدخول</h2>
          <p className="text-gray-600 mt-2">ادخل رقم جوالك وكلمة المرور</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الجوال
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
              كلمة المرور
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="ادخل كلمة المرور"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            بتسجيل الدخول، أنت توافق على شروط الاستخدام وسياسة الخصوصية
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
