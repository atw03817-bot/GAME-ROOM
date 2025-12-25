import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaUser, 
  FaMapMarkerAlt, 
  FaBox, 
  FaSignOutAlt, 
  FaEdit, 
  FaHeart,
  FaCog,
  FaSave,
  FaTimes,
  FaClock,
  FaCheckCircle,
  FaShoppingBag,
  FaChartBar,
  FaTools,
  FaWrench
} from 'react-icons/fa';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import toast from 'react-hot-toast';
import PatternDisplay from '../components/PatternDisplay';

function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('orders');
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  // تحديث البيانات عند تغيير التبويب للصيانة
  useEffect(() => {
    if (activeTab === 'maintenance' && user?.phone) {
      fetchMaintenanceRequests();
    }
  }, [activeTab]);

  const fetchMaintenanceRequests = async () => {
    if (!user?.phone) return;
    
    try {
      const maintenanceRes = await api.get('/maintenance/customer/requests', {
        params: { phone: user.phone }
      });
      setMaintenanceRequests(maintenanceRes.data.data || []);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, addressesRes, ordersRes] = await Promise.all([
        api.get('/auth/profile'),
        api.get('/addresses'),
        api.get('/orders/user/me')
      ]);

      setProfile(profileRes.data.user);
      setAddresses(addressesRes.data.data || []);
      
      // إخفاء الطلبات DRAFT (غير المكتملة)
      const allOrders = ordersRes.data.orders || ordersRes.data || [];
      const confirmedOrders = allOrders.filter(order => 
        order.status !== 'draft' && order.status !== 'DRAFT'
      );
      setOrders(confirmedOrders);
      
      setFormData({
        name: profileRes.data.user.name,
        phone: profileRes.data.user.phone || ''
      });

      // جلب المفضلة من localStorage
      const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (favoriteIds.length > 0) {
        const productsRes = await api.get('/products', { params: { limit: 1000 } });
        const allProducts = productsRes.data.data || productsRes.data || [];
        const favoriteProducts = allProducts.filter(p => favoriteIds.includes(p.id || p._id));
        setFavorites(favoriteProducts);
      }

      // جلب طلبات الصيانة إذا كان لدى المستخدم رقم جوال
      if (profileRes.data.user.phone) {
        try {
          const maintenanceRes = await api.get('/maintenance/customer/requests', {
            params: { phone: profileRes.data.user.phone }
          });
          setMaintenanceRequests(maintenanceRes.data.data || []);
        } catch (error) {
          console.error('Error fetching maintenance requests:', error);
          // لا نعرض خطأ للمستخدم هنا لأن طلبات الصيانة قد تكون فارغة
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', formData);
      toast.success('تم تحديث الملف الشخصي');
      setEditMode(false);
      fetchData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('خطأ في تحديث الملف الشخصي');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('تم تسجيل الخروج');
  };

  const removeFavorite = (productId) => {
    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
    const newFavorites = favoriteIds.filter(id => id !== productId);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setFavorites(favorites.filter(p => (p.id || p._id) !== productId));
    toast.success('تم إزالة المنتج من المفضلة');
  };

  const getMaintenanceStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'received':
        return 'bg-blue-100 text-blue-700';
      case 'diagnosed':
        return 'bg-yellow-100 text-yellow-700';
      case 'waiting_approval':
        return 'bg-orange-100 text-orange-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-purple-100 text-purple-700';
      case 'testing':
        return 'bg-indigo-100 text-indigo-700';
      case 'ready':
        return 'bg-green-200 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'on_hold':
        return 'bg-gray-200 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getMaintenanceStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'received':
        return 'تم الاستلام';
      case 'diagnosed':
        return 'تم الفحص';
      case 'waiting_approval':
        return 'في انتظار الموافقة';
      case 'approved':
        return 'تمت الموافقة';
      case 'in_progress':
        return 'قيد الإصلاح';
      case 'testing':
        return 'قيد الاختبار';
      case 'ready':
        return 'جاهز للاستلام';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      case 'on_hold':
        return 'معلق';
      default:
        return status;
    }
  };

  const getIssueCategoryText = (category) => {
    switch (category?.toLowerCase()) {
      case 'hardware':
        return 'عتاد/هاردوير';
      case 'software':
        return 'برمجيات/سوفتوير';
      case 'screen':
        return 'الشاشة';
      case 'battery':
        return 'البطارية';
      case 'charging':
        return 'الشحن';
      case 'camera':
        return 'الكاميرا';
      case 'audio':
        return 'الصوت';
      case 'network':
        return 'الشبكة';
      case 'performance':
        return 'الأداء';
      case 'other':
        return 'أخرى';
      default:
        return category;
    }
  };

  const getMaintenanceStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'received':
        return <FaBox />;
      case 'diagnosed':
        return <FaWrench />;
      case 'waiting_approval':
        return <FaClock />;
      case 'approved':
        return <FaCheckCircle />;
      case 'in_progress':
        return <FaTools />;
      case 'testing':
        return <FaClock />;
      case 'ready':
        return <FaCheckCircle />;
      case 'completed':
        return <FaCheckCircle />;
      case 'cancelled':
        return <FaTimes />;
      case 'on_hold':
        return <FaClock />;
      default:
        return <FaClock />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-primary-100 text-primary-700';
      case 'shipped':
      case 'shipping':
        return 'bg-purple-100 text-purple-700';
      case 'delivered':
        return 'bg-green-200 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'في انتظار التأكيد';
      case 'confirmed':
        return 'مؤكد';
      case 'processing':
        return 'قيد المعالجة';
      case 'shipped':
      case 'shipping':
        return 'قيد الشحن';
      case 'delivered':
        return 'تم التوصيل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <FaClock />;
      case 'confirmed':
        return <FaCheckCircle />;
      case 'processing':
        return <FaClock />;
      case 'shipped':
      case 'shipping':
        return <FaBox />;
      case 'delivered':
        return <FaCheckCircle />;
      case 'cancelled':
        return <FaTimes />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">حسابي</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="text-center mb-4 pb-4 border-b">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaUser className="text-3xl text-primary-600" />
                </div>
                <h3 className="font-semibold">{profile?.name}</h3>
                <p className="text-sm text-gray-600">{profile?.email}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'orders'
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaShoppingBag />
                  طلباتي ({orders.length})
                </button>
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'maintenance'
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaTools />
                  طلبات الصيانة ({maintenanceRequests.length})
                </button>
                <Link
                  to="/maintenance"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-700 hover:bg-gray-50"
                >
                  <FaWrench />
                  طلب صيانة جديد
                </Link>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'wishlist'
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaHeart />
                  المفضلة ({favorites.length})
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'addresses'
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaMapMarkerAlt />
                  العناوين ({addresses.length})
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'profile'
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaUser />
                  الملف الشخصي
                </button>
                <Link
                  to="/my-analytics"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-700 hover:bg-gray-50"
                >
                  <FaChartBar />
                  إحصائياتي الشخصية
                </Link>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'settings'
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaCog />
                  الإعدادات
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
                >
                  <FaSignOutAlt />
                  تسجيل الخروج
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">طلباتي</h2>
                  {orders.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaShoppingBag className="text-4xl text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">لا توجد طلبات</h3>
                      <p className="text-gray-600 mb-6">لم تقم بأي طلبات بعد</p>
                      <Link
                        to="/products"
                        className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition"
                      >
                        تصفح المنتجات
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg p-6 hover:shadow-md transition">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-lg">
                                {order.orderNumber || `طلب #${order._id?.slice(-6)}`}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                            <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {getStatusText(order.status)}
                            </span>
                          </div>

                          {/* Order Items */}
                          {order.items && order.items.length > 0 && (
                            <div className="border-t border-b py-3 my-3 space-y-2">
                              {order.items.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm">
                                  <span className="text-gray-600 font-bold">{item.quantity}×</span>
                                  <span className="font-medium text-gray-800">
                                    {item.productName || item.name || 'منتج'}
                                  </span>
                                  <span className="text-gray-500 mr-auto">
                                    {(item.price * item.quantity).toLocaleString('en-US')} ر.س
                                  </span>
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <p className="text-xs text-gray-500">و {order.items.length - 3} منتج آخر...</p>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm text-gray-600">طريقة الدفع</p>
                              <p className="font-medium">
                                {order.paymentMethod === 'cod' && 'الدفع عند الاستلام'}
                                {order.paymentMethod === 'tap' && 'Tap Payment'}
                                {!['cod', 'tap'].includes(order.paymentMethod) && 'مدفوع'}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">الإجمالي</p>
                              <p className="text-xl font-bold text-primary-600">
                                {order.total?.toLocaleString('en-US')} ر.س
                              </p>
                            </div>
                            <Link
                              to={`/orders/${order.orderNumber || order._id}`}
                              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm font-bold whitespace-nowrap"
                            >
                              عرض التفاصيل
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Maintenance Requests Tab */}
              {activeTab === 'maintenance' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">طلبات الصيانة</h2>
                    <Link
                      to="/maintenance"
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-700 transition flex items-center gap-2"
                    >
                      <FaTools />
                      طلب صيانة جديد
                    </Link>
                  </div>
                  
                  {maintenanceRequests.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaTools className="text-4xl text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">لا توجد طلبات صيانة</h3>
                      <p className="text-gray-600 mb-6">لم تقم بأي طلبات صيانة بعد</p>
                      <Link
                        to="/maintenance"
                        className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition"
                      >
                        طلب صيانة جديد
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {maintenanceRequests.map((request) => (
                        <div key={request._id} className="bg-white rounded-lg p-6 hover:shadow-md transition border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-lg flex items-center gap-2">
                                <FaWrench className="text-primary-600" />
                                {request.requestNumber}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {new Date(request.createdAt).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                            <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${getMaintenanceStatusColor(request.status.current)}`}>
                              {getMaintenanceStatusIcon(request.status.current)}
                              {getMaintenanceStatusText(request.status.current)}
                            </span>
                          </div>

                          {/* Device Info */}
                          <div className="border-t border-b py-3 my-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600 font-medium">نوع الجهاز:</span>
                                <p className="font-bold text-gray-800">{request.device.model}</p>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">المشكلة:</span>
                                <p className="font-bold text-gray-800">{getIssueCategoryText(request.issue.category)}</p>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">الأولوية:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  request.issue.priority === 'emergency' ? 'bg-red-100 text-red-800' :
                                  request.issue.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {request.issue.priority === 'emergency' ? 'طارئ' :
                                   request.issue.priority === 'urgent' ? 'عاجل' : 'عادي'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Device Protection Info */}
                          {request.device.hasPassword && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-blue-800 font-medium text-sm">
                                  🔐 الجهاز محمي بـ {
                                    request.device.passwordType === 'text' ? 'كلمة سر نصية' :
                                    request.device.passwordType === 'pattern' ? 'نمط الفتح' : 'غير محدد'
                                  }
                                </span>
                              </div>
                              
                              {request.device.passwordType === 'text' && request.device.passwordValue && (
                                <div className="mt-2 p-2 bg-white border border-blue-300 rounded text-center">
                                  <p className="text-xs text-blue-800 mb-1">كلمة السر:</p>
                                  <p className="font-mono text-blue-900 font-bold">
                                    {request.device.passwordValue}
                                  </p>
                                </div>
                              )}
                              
                              {request.device.passwordType === 'pattern' && request.device.patternValue && (
                                <div className="mt-2 flex justify-center">
                                  <PatternDisplay 
                                    patternValue={request.device.patternValue} 
                                    size={60}
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Cost Info */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm text-gray-600">التكلفة المقدرة</p>
                              <p className="font-bold text-lg text-primary-600">
                                {request.cost.totalEstimated?.toLocaleString('en-US')} ر.س
                              </p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-sm text-gray-600">حالة الدفع</p>
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                request.cost.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                request.cost.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {request.cost.paymentStatus === 'paid' ? 'مدفوع' :
                                 request.cost.paymentStatus === 'partial' ? 'مدفوع جزئياً' : 'غير مدفوع'}
                              </span>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Link
                                to={`/maintenance/${request.requestNumber}`}
                                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm font-bold whitespace-nowrap text-center"
                              >
                                عرض التفاصيل
                              </Link>
                              
                              {request.status.current === 'ready' && (
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs font-bold text-center">
                                  جاهز للاستلام
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Timeline Preview */}
                          {request.status.history && request.status.history.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-sm font-medium text-gray-700 mb-2">آخر التحديثات:</p>
                              <div className="space-y-1">
                                {request.status.history.slice(-2).reverse().map((history, index) => (
                                  <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                                    <span className="font-medium">
                                      {getMaintenanceStatusText(history.status)}
                                    </span>
                                    <span>-</span>
                                    <span>
                                      {new Date(history.date).toLocaleDateString('ar-SA')}
                                    </span>
                                    {history.note && (
                                      <>
                                        <span>-</span>
                                        <span>{history.note}</span>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">المفضلة</h2>
                  {favorites.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaHeart className="text-4xl text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">لا توجد منتجات مفضلة</h3>
                      <p className="text-gray-600 mb-6">لم تقم بإضافة أي منتجات للمفضلة</p>
                      <Link
                        to="/products"
                        className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition"
                      >
                        تصفح المنتجات
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favorites.map((product) => (
                        <div key={product.id || product._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                          <Link to={`/products/${product.id || product._id}`}>
                            <div className="aspect-square bg-gray-100 flex items-center justify-center">
                              {product.images && product.images[0] ? (
                                <img src={product.images[0]} alt={product.nameAr} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-6xl">📱</span>
                              )}
                            </div>
                          </Link>
                          <div className="p-4">
                            <Link to={`/products/${product.id || product._id}`}>
                              <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
                              <h3 className="font-bold mb-2 line-clamp-2">{product.nameAr}</h3>
                              <p className="text-primary-600 font-bold text-lg mb-3">
                                {product.price?.toLocaleString()} ر.س
                              </p>
                            </Link>
                            <div className="flex gap-2">
                              <Link
                                to={`/products/${product.id || product._id}`}
                                className="flex-1 bg-primary-600 text-white py-2 rounded-lg text-center font-bold hover:bg-primary-700 transition text-sm"
                              >
                                عرض المنتج
                              </Link>
                              <button
                                onClick={() => removeFavorite(product.id || product._id)}
                                className="w-10 h-10 border-2 border-red-500 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-50 transition"
                                aria-label="إزالة من المفضلة"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">الملف الشخصي</h2>
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-700 transition"
                      >
                        <FaEdit />
                        تعديل
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateProfile}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition"
                        >
                          <FaSave />
                          حفظ
                        </button>
                        <button
                          onClick={() => {
                            setEditMode(false);
                            setFormData({
                              name: profile?.name,
                              phone: profile?.phone || ''
                            });
                          }}
                          className="flex items-center gap-2 border-2 border-gray-300 px-4 py-2 rounded-lg font-bold hover:border-red-500 hover:text-red-600 transition"
                        >
                          <FaTimes />
                          إلغاء
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-lg p-6">
                    {editMode ? (
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold mb-2">الاسم</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-600"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold mb-2">رقم الجوال</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-600"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold mb-2">البريد الإلكتروني</label>
                          <input
                            type="email"
                            value={profile?.email}
                            disabled
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                          />
                          <p className="text-xs text-gray-500 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold mb-2">الاسم</label>
                          <p className="text-gray-800">{profile?.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2">البريد الإلكتروني</label>
                          <p className="text-gray-800">{profile?.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2">رقم الجوال</label>
                          <p className="text-gray-800" dir="ltr">{profile?.phone || 'غير محدد'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2">تاريخ التسجيل</label>
                          <p className="text-gray-800">
                            {new Date(profile?.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">العناوين</h2>
                  {addresses.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaMapMarkerAlt className="text-4xl text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">لا توجد عناوين محفوظة</h3>
                      <p className="text-gray-600 mb-6">أضف عنوانك الأول لتسهيل عملية الشراء</p>
                      <Link
                        to="/checkout"
                        className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition"
                      >
                        إضافة عنوان
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div key={address._id} className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-primary-600 transition">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <h4 className="font-bold text-lg">{address.fullName}</h4>
                                {address.isDefault && (
                                  <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold">
                                    افتراضي
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1 text-gray-600">
                                <p className="flex items-center gap-2">
                                  <span className="font-medium">📱</span>
                                  <span dir="ltr">{address.phone}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="font-medium">📍</span>
                                  <span>{address.city} - {address.district}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="font-medium">🏠</span>
                                  <span>{address.street} - {address.building}</span>
                                </p>
                                {address.notes && (
                                  <p className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">📝</span>
                                    <span>{address.notes}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">الإعدادات</h2>
                  <div className="bg-white rounded-lg p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-bold mb-4">الإشعارات</h3>
                        <div className="space-y-3">
                          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span>إشعارات البريد الإلكتروني</span>
                            <input type="checkbox" className="w-5 h-5 text-primary-600" defaultChecked />
                          </label>
                          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span>إشعارات الطلبات</span>
                            <input type="checkbox" className="w-5 h-5 text-primary-600" defaultChecked />
                          </label>
                          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span>العروض والخصومات</span>
                            <input type="checkbox" className="w-5 h-5 text-primary-600" />
                          </label>
                        </div>
                      </div>
                      
                      <div className="border-t pt-6">
                        <h3 className="font-bold mb-4 text-red-600">منطقة الخطر</h3>
                        <button 
                          onClick={() => {
                            if (window.confirm('هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.')) {
                              toast.error('ميزة حذف الحساب غير متاحة حالياً');
                            }
                          }}
                          className="w-full border-2 border-red-300 text-red-600 py-3 rounded-lg hover:bg-red-50 transition font-bold"
                        >
                          حذف الحساب
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;
