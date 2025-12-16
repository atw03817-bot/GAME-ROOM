import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function ReturnPolicy() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      const response = await api.get('/legal-pages/return-policy');
      if (response.data.success) {
        setPageData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching return policy:', error);
      // Use default data if API fails
      setPageData({
        title: 'سياسة الإرجاع والاستبدال',
        content: 'يمكنك إرجاع المنتجات خلال 14 يوم من تاريخ الاستلام.',
        isActive: true
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!pageData || !pageData.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">الصفحة غير متاحة</h1>
          <p className="text-gray-600">هذه الصفحة غير متاحة حالياً.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-xl text-primary-100">سهولة في الإرجاع والاستبدال</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            {pageData.lastUpdated && (
              <div className="bg-primary-50 border-r-4 border-primary-600 p-6 rounded-lg mb-8">
                <p className="text-primary-900 font-semibold mb-2">
                  آخر تحديث: {new Date(pageData.lastUpdated).toLocaleDateString('ar-SA')}
                </p>
              </div>
            )}
            
            <div 
              className="markdown-content prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: pageData.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}