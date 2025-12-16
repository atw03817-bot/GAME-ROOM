import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiPackage,
} from 'react-icons/fi'
import api from '../../utils/api'

function Products() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await api.get('/products', {
        params: { limit: 1000 } // جلب جميع المنتجات
      })
      setProducts(response.data.products || response.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return

    try {
      await api.delete(`/products/${id}`)
      setProducts(products.filter(p => p._id !== id))
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('حدث خطأ أثناء حذف المنتج')
    }
  }

  const filteredProducts = products.filter(p =>
    p.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nameEn?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📦 إدارة المنتجات</h1>
          <p className="text-gray-600">{products.length} منتج</p>
        </div>
        <Link
          to="/admin/products/add"
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
        >
          <FiPlus size={18} />
          <span className="hidden md:inline">إضافة منتج</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <span className="text-sm text-gray-600 block mb-2">إجمالي المنتجات</span>
          <span className="text-2xl font-bold text-gray-800">{products.length}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <span className="text-sm text-gray-600 block mb-2">متوفر</span>
          <span className="text-2xl font-bold text-green-600">
            {products.filter(p => p.stock > 0).length}
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <span className="text-sm text-gray-600 block mb-2">نفذت الكمية</span>
          <span className="text-2xl font-bold text-red-600">
            {products.filter(p => p.stock === 0).length}
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <span className="text-sm text-gray-600 block mb-2">إجمالي القيمة</span>
          <span className="text-2xl font-bold text-primary-600">
            {products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()} ر.س
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد منتجات</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'ابدأ بإضافة منتج جديد'}
          </p>
          {!searchQuery && (
            <Link
              to="/admin/products/add"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              <FiPlus size={18} />
              إضافة منتج
            </Link>
          )}
        </div>
      )}

      {/* Products Grid (Mobile) */}
      {filteredProducts.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {currentProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.nameAr} className="w-full h-full object-cover" />
                    ) : (
                      <FiPackage className="text-gray-400" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold truncate">{product.nameAr}</h3>
                    <p className="text-sm text-gray-600">
                      {product.category?.name?.ar || product.category?.nameAr || product.categoryName || 'غير محدد'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">السعر</p>
                    <p className="font-bold text-primary-600">
                      {product.price.toLocaleString()} ر.س
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">المخزون</p>
                    <p className={`font-bold ${
                      product.stock === 0 ? 'text-red-600' :
                      product.stock < 20 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {product.stock}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    product.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {product.stock > 0 ? 'متوفر' : 'نفذت الكمية'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/admin/products/edit/${product._id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <FiEdit2 size={16} />
                    تعديل
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">المنتج</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الفئة</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">السعر</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">المخزون</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الحالة</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => (
                  <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.nameAr} className="w-full h-full object-cover" />
                          ) : (
                            <FiPackage className="text-gray-400" size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold">{product.nameAr}</p>
                          <p className="text-sm text-gray-600">#{product._id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {product.category?.icon && (
                          <span className="text-lg">{product.category.icon}</span>
                        )}
                        <span className="text-gray-600">
                          {product.category?.name?.ar || product.category?.nameAr || product.categoryName || 'غير محدد'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold">{product.price.toLocaleString()} ر.س</td>
                    <td className="py-4 px-6">
                      <span className={`font-bold ${
                        product.stock === 0 ? 'text-red-600' :
                        product.stock < 20 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        product.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {product.stock > 0 ? 'متوفر' : 'نفذت الكمية'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                          <FiEdit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-lg border border-gray-100">
              <div className="text-sm text-gray-600">
                عرض {startIndex + 1} - {Math.min(endIndex, filteredProducts.length)} من {filteredProducts.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  السابق
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-bold transition ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="flex items-center px-2">...</span>
                    }
                    return null
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Products
