import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../utils/api';
import toast from 'react-hot-toast';

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      setOrders(response.data.orders || response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('خطأ في جلب الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <FaBox className="text-yellow-600" />;
      case 'PROCESSING':
        return <FaTruck className="text-primary-600" />;
      case 'SHIPPED':
        return <FaTruck className="text-primary-600" />;
      case 'DELIVERED':
        return <FaCheckCircle className="text-green-600" />;
      case 'CANCELLED':
        return <FaTimesCircle className="text-red-600" />;
      default:
        return <FaBox className="text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'قيد الانتظار';
      case 'PROCESSING':
        return 'قيد التجهيز';
      case 'SHIPPED':
        return 'تم الشحن';
      case 'DELIVERED':
        return 'تم التسليم';
      case 'CANCELLED':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-primary-100 text-primary-800';
      case 'SHIPPED':
        return 'bg-primary-100 text-primary-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.status === 'PENDING' || order.status === 'PROCESSING';
    if (filter === 'completed') return order.status === 'DELIVERED';
    if (filter === 'cancelled') return order.status === 'CANCELLED';
    return true;
  });

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
        <h1 className="text-3xl font-bold mb-6">طلباتي</h1>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            الكل ({orders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            قيد التنفيذ ({orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            مكتمل ({orders.filter(o => o.status === 'DELIVERED').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
              filter === 'cancelled'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ملغي ({orders.filter(o => o.status === 'CANCELLED').length})
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FaBox className="mx-auto text-6xl text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              لا توجد طلبات
            </h2>
            <p className="text-gray-500 mb-6">
              {filter === 'all' ? 'لم تقم بأي طلبات بعد' : 'لا توجد طلبات في هذه الفئة'}
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
            >
              تصفح المنتجات
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
                onClick={() => navigate(`/orders/${order._id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-semibold">
                          طلب #{order._id?.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Items Count */}
                    <p className="text-sm text-gray-600">
                      {order.items?.length} {order.items?.length === 1 ? 'منتج' : 'منتجات'}
                    </p>
                  </div>

                  {/* Status & Total */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">المجموع</p>
                      <p className="text-xl font-bold text-primary-600">
                        {order.total?.toFixed(2)} ر.س
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
