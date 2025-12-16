import { useState, useEffect } from 'react'
import { FiSearch, FiCheck, FiPackage, FiX } from 'react-icons/fi'
import api from '../utils/api'

function ProductSelector({ selectedIds = [], onChange, maxSelection = null }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = products.filter(
        (product) =>
          product.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/products', {
        params: { limit: 1000 } // جلب جميع المنتجات
      })
      const productsData = response.data.products || response.data
      setProducts(productsData)
      setFilteredProducts(productsData)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProduct = (productId) => {
    if (selectedIds.includes(productId)) {
      // Remove
      onChange(selectedIds.filter((id) => id !== productId))
    } else {
      // Add (check max selection)
      if (maxSelection && selectedIds.length >= maxSelection) {
        alert(`يمكنك اختيار ${maxSelection} منتجات كحد أقصى`)
        return
      }
      onChange([...selectedIds, productId])
    }
  }

  const clearSelection = () => {
    onChange([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiPackage className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            المنتجات المختارة: {selectedIds.length}
            {maxSelection && ` / ${maxSelection}`}
          </span>
        </div>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={clearSelection}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <FiX size={16} />
            مسح الكل
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث عن منتج..."
          className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
      </div>

      {/* Products List */}
      <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
        {filteredProducts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredProducts.map((product) => {
              const isSelected = selectedIds.includes(product._id)
              
              return (
                <div
                  key={product._id}
                  onClick={() => toggleProduct(product._id)}
                  className={`p-3 cursor-pointer transition hover:bg-gray-50 ${
                    isSelected ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        isSelected
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <FiCheck className="text-white" size={14} />}
                    </div>

                    {/* Image */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={product.images?.[0] || '/placeholder.jpg'}
                        alt={product.nameAr}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.nameAr}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {product.brand && (
                          <span className="text-xs text-gray-500">{product.brand}</span>
                        )}
                        <span className="text-xs font-semibold text-primary-600">
                          {product.price} ر.س
                        </span>
                      </div>
                    </div>

                    {/* Stock Badge */}
                    <div className="flex-shrink-0">
                      {product.stock > 0 ? (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          متوفر
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          نفذ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FiPackage size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد منتجات'}
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      {maxSelection && (
        <div className="text-xs text-gray-500">
          💡 يمكنك اختيار حتى {maxSelection} منتجات
        </div>
      )}
    </div>
  )
}

export default ProductSelector
