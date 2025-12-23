import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiPrinter, FiDownload, FiCalendar, FiUser, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import QRCode from 'qrcode';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function Invoice() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    fetchOrder();
    fetchSettings();
  }, [orderNumber]);

  useEffect(() => {
    if (order && settings) {
      generateQRCode();
    }
  }, [order, settings]);

  const generateQRCode = async () => {
    try {
      // إنشاء QR Code متوافق مع هيئة الضريبة السعودية
      const qrData = {
        // اسم البائع
        sellerName: settings.storeNameAr || 'متجر الإلكترونيات',
        // الرقم الضريبي (يجب إضافته في الإعدادات)
        vatNumber: settings.vatNumber || '123456789012345',
        // تاريخ الفاتورة
        invoiceDate: new Date(order.createdAt).toISOString(),
        // إجمالي الفاتورة
        totalAmount: order.total?.toFixed(2) || '0.00',
        // مبلغ الضريبة
        vatAmount: (order.taxAmount || order.tax || 0).toFixed(2)
      };

      // تكوين البيانات حسب معايير هيئة الضريبة
      const qrString = [
        `1\u001f${qrData.sellerName}`,
        `2\u001f${qrData.vatNumber}`, 
        `3\u001f${qrData.invoiceDate}`,
        `4\u001f${qrData.totalAmount}`,
        `5\u001f${qrData.vatAmount}`
      ].join('\u001f');

      const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
        width: 150,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/number/${orderNumber}`);
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('خطأ في جلب بيانات الطلب');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الفاتورة...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">الطلب غير موجود</h2>
          <p className="text-gray-600">لم يتم العثور على الطلب المطلوب</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 invoice-container">
      <div className="max-w-4xl mx-auto px-4">
        {/* أزرار الطباعة والتحميل - تختفي عند الطباعة */}
        <div className="mb-6 flex gap-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            <FiPrinter size={20} />
            طباعة الفاتورة
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            <FiDownload size={20} />
            تحميل PDF
          </button>
        </div>

        {/* الفاتورة */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-none">
          {/* رأس الفاتورة */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-8 invoice-header print:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">فاتورة ضريبية</h1>
                <p className="text-primary-100">Tax Invoice</p>
              </div>
              
              {/* QR Code */}
              <div className="flex flex-col items-center mx-4">
                {qrCodeUrl && (
                  <div className="bg-white p-2 rounded-lg">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="w-24 h-24"
                    />
                  </div>
                )}
                <p className="text-xs text-primary-100 mt-1 text-center">رمز الاستجابة السريعة</p>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold">#{order.orderNumber}</div>
                <div className="flex items-center gap-2 mt-2 text-primary-100">
                  <FiCalendar size={16} />
                  <span>{new Date(order.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* معلومات المتجر والعميل */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:grid print:grid-cols-2 print:gap-8">
              {/* معلومات المتجر */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  بيانات المتجر
                </h3>
                <div className="space-y-2 text-gray-700">
                  <div className="font-bold text-xl text-primary-600">
                    {settings.storeNameAr || 'متجر الإلكترونيات'}
                  </div>
                  <div className="text-gray-600">
                    {settings.storeName || 'Electronics Store'}
                  </div>
                  {settings.vatNumber && (
                    <div className="text-sm text-gray-600">
                      الرقم الضريبي: {settings.vatNumber}
                    </div>
                  )}
                  {settings.contactPhone && (
                    <div className="flex items-center gap-2">
                      <FiPhone size={16} />
                      <span>{settings.contactPhone}</span>
                    </div>
                  )}
                  {settings.contactEmail && (
                    <div className="flex items-center gap-2">
                      <FiMail size={16} />
                      <span>{settings.contactEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* معلومات العميل */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  بيانات العميل
                </h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center gap-2">
                    <FiUser size={16} />
                    <span className="font-semibold">{order.customerInfo?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPhone size={16} />
                    <span>{order.customerInfo?.phone}</span>
                  </div>
                  {order.customerInfo?.email && (
                    <div className="flex items-center gap-2">
                      <FiMail size={16} />
                      <span>{order.customerInfo?.email}</span>
                    </div>
                  )}
                  {order.shippingAddress && (
                    <div className="flex items-start gap-2">
                      <FiMapPin size={16} className="mt-1" />
                      <div>
                        <div>{order.shippingAddress.street}</div>
                        <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                        <div>{order.shippingAddress.zipCode}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* جدول المنتجات */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                تفاصيل الطلب
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-right font-semibold">المنتج</th>
                      <th className="border border-gray-200 px-4 py-3 text-center font-semibold">الكمية</th>
                      <th className="border border-gray-200 px-4 py-3 text-center font-semibold">السعر</th>
                      <th className="border border-gray-200 px-4 py-3 text-center font-semibold">المجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3">
                          <div>
                            <div className="font-semibold">
                              {item.productName || item.name || item.product?.nameAr || item.product?.name || 'منتج غير محدد'}
                            </div>
                            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                              <div className="text-sm text-gray-600 mt-1">
                                {Object.entries(item.selectedOptions).map(([key, value]) => {
                                  // تحويل أسماء الخيارات للعربية
                                  const getArabicKey = (key) => {
                                    switch(key.toLowerCase()) {
                                      case 'color': return 'اللون';
                                      case 'storage': return 'السعة';
                                      case 'other': return 'خيارات أخرى';
                                      default: return key;
                                    }
                                  };

                                  // التعامل مع القيم كـ objects أو strings
                                  const displayValue = typeof value === 'object' && value !== null 
                                    ? (value.nameAr || value.name || value.value || JSON.stringify(value))
                                    : value;
                                  
                                  // تخطي الخيارات الفارغة أو المصفوفات الفارغة
                                  if (!displayValue || (Array.isArray(value) && value.length === 0)) {
                                    return null;
                                  }
                                  
                                  return (
                                    <span key={key} className="inline-block mr-2">
                                      {getArabicKey(key)}: {displayValue}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center">{item.quantity}</td>
                        <td className="border border-gray-200 px-4 py-3 text-center">{item.price} ر.س</td>
                        <td className="border border-gray-200 px-4 py-3 text-center font-semibold">
                          {(item.price * item.quantity).toFixed(2)} ر.س
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ملخص المبالغ */}
            <div className="flex justify-end">
              <div className="w-full md:w-1/2">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">ملخص الفاتورة</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">المجموع الفرعي:</span>
                      <span className="font-semibold">{order.subtotal?.toFixed(2)} ر.س</span>
                    </div>
                    
                    {order.shippingCost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">الشحن:</span>
                        <span className="font-semibold">{order.shippingCost?.toFixed(2)} ر.س</span>
                      </div>
                    )}

                    {/* عمولة تمارا - التحقق من وجودها */}
                    {((order.tamaraCommission?.amount > 0) || (order.paymentMethod === 'tamara' && order.tamaraCommission?.amount)) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {order.tamaraCommission?.displayName || 'عمولة الأقساط - تمارا'}:
                        </span>
                        <span className="font-semibold text-orange-600">
                          {(order.tamaraCommission?.amount || 0).toFixed(2)} ر.س
                        </span>
                      </div>
                    )}

                    {/* الضريبة - التحقق من وجودها */}
                    {(order.taxAmount > 0 || order.tax > 0) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          ضريبة القيمة المضافة (15%):
                        </span>
                        <span className="font-semibold">
                          {(order.taxAmount || order.tax || 0).toFixed(2)} ر.س
                        </span>
                      </div>
                    )}

                    <div className="border-t border-gray-300 pt-3">
                      <div className="flex justify-between text-xl font-bold">
                        <span>المجموع الكلي:</span>
                        <span className="text-primary-600">{order.total?.toFixed(2)} ر.س</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* معلومات إضافية */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 print:grid print:grid-cols-2 print:gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">معلومات الدفع</h4>
                  <p>طريقة الدفع: {order.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 
                                    order.paymentMethod === 'tamara' ? 'تمارا - اشتري الآن وادفع لاحقاً' :
                                    order.paymentMethod === 'tap' ? 'الدفع الإلكتروني' : order.paymentMethod}</p>
                  <p>حالة الدفع: {order.paymentStatus === 'paid' ? 'مدفوع' : 
                                  order.paymentStatus === 'pending' ? 'في انتظار الدفع' : 'غير مدفوع'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">معلومات الطلب</h4>
                  <p>حالة الطلب: {order.status === 'pending' ? 'قيد المراجعة' :
                                 order.status === 'confirmed' ? 'مؤكد' :
                                 order.status === 'shipped' ? 'تم الشحن' :
                                 order.status === 'delivered' ? 'تم التسليم' : order.status}</p>
                  <p>تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
            </div>

            {/* تذييل الفاتورة */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>شكراً لك على تسوقك معنا</p>
              <p className="mt-1">هذه فاتورة ضريبية صادرة إلكترونياً</p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS للطباعة */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* إخفاء كل شي في الصفحة عدا الفاتورة */
          body * {
            visibility: hidden;
          }
          
          /* إظهار الفاتورة وعناصرها فقط */
          .invoice-container,
          .invoice-container * {
            visibility: visible;
          }
          
          /* وضع الفاتورة في أعلى الصفحة */
          .invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          
          .print\\:w-full {
            width: 100% !important;
          }
          
          .print\\:max-w-none {
            max-width: none !important;
          }
          
          .print\\:p-6 {
            padding: 1.5rem !important;
          }
          
          .print\\:grid {
            display: grid !important;
          }
          
          .print\\:grid-cols-2 {
            grid-template-columns: 1fr 1fr !important;
          }
          
          .print\\:gap-8 {
            gap: 2rem !important;
          }
          
          .print\\:gap-6 {
            gap: 1.5rem !important;
          }
          
          /* إجبار الألوان على الظهور في الطباعة */
          .bg-gradient-to-r {
            background: linear-gradient(to right, #7c3aed, #6d28d9) !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .text-white {
            color: white !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .text-primary-600 {
            color: #7c3aed !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .text-orange-600 {
            color: #ea580c !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .bg-gray-50 {
            background-color: #f9fafb !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .bg-primary-50 {
            background-color: #f3e8ff !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          .border-gray-200 {
            border-color: #e5e7eb !important;
          }
          
          .border-gray-300 {
            border-color: #d1d5db !important;
          }
          
          /* تأكيد ظهور الخلفية الملونة للرأس */
          .invoice-header {
            background: linear-gradient(to right, #7c3aed, #6d28d9) !important;
            color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* تحسين الجداول للطباعة */
          table {
            page-break-inside: avoid;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          /* تحسين الخط والحجم للطباعة */
          .invoice-container {
            font-size: 12pt;
            line-height: 1.4;
          }
          
          .invoice-container h1 {
            font-size: 24pt;
          }
          
          .invoice-container h2 {
            font-size: 18pt;
          }
          
          .invoice-container h3 {
            font-size: 14pt;
          }
          
          /* الحفاظ على تنسيق الـ grid في الطباعة */
          .grid.md\\:grid-cols-2 {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 2rem !important;
          }
          
          /* تحسين المسافات للطباعة */
          .gap-8 {
            gap: 2rem !important;
          }
          
          .gap-6 {
            gap: 1.5rem !important;
          }
          
          .mb-8 {
            margin-bottom: 2rem !important;
          }
          
          .p-8 {
            padding: 1.5rem !important;
          }
        }
        
        /* إعدادات عامة للألوان */
        .invoice-header {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>
    </div>
  );
}

export default Invoice;