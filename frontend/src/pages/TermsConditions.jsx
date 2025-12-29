import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function TermsConditions() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      const response = await api.get('/legal-pages/terms-conditions');
      if (response.data.success) {
        setPageData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching terms and conditions:', error);
      // Use default data if API fails
      setPageData({
        title: 'الشروط والأحكام',
        content: 'باستخدامك لهذا الموقع، فإنك توافق على الالتزام بهذه الشروط والأحكام.',
        isActive: true
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C72C15]"></div>
      </div>
    );
  }

  if (!pageData || !pageData.isActive) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">الصفحة غير متاحة</h1>
          <p className="text-gray-300">هذه الصفحة غير متاحة حالياً.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111]" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-xl text-orange-100">يرجى قراءة الشروط بعناية قبل استخدام الموقع</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-[#1a1a1a] border border-[#C72C15] rounded-xl shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            {pageData.lastUpdated && (
              <div className="bg-[#C72C15]/10 border-r-4 border-[#C72C15] p-6 rounded-lg mb-8">
                <p className="text-[#C72C15] font-semibold mb-2">
                  آخر تحديث: {new Date(pageData.lastUpdated).toLocaleDateString('ar-SA')}
                </p>
              </div>
            )}
            
            <div 
              className="markdown-content prose prose-lg max-w-none text-gray-300 prose-headings:text-white prose-strong:text-white prose-a:text-[#C72C15]"
              dangerouslySetInnerHTML={{ __html: pageData.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
