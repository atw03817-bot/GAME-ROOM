export default function ProductFilters({
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  selectedConditions,
  setSelectedConditions,
}) {

  const categories = [
    { id: 'smartphones', name: 'الجوالات الذكية', count: 4 },
    { id: 'tablets', name: 'الأجهزة اللوحية', count: 2 },
    { id: 'smartwatches', name: 'الساعات الذكية', count: 3 },
    { id: 'headphones', name: 'السماعات', count: 3 },
  ];

  const conditions = [
    { id: 'new', name: 'جديد' },
    { id: 'refurbished', name: 'مجدد' },
    { id: 'used', name: 'مستعمل' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 sticky top-24">
      <h2 className="text-xl font-bold mb-6">الفلاتر</h2>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="font-bold mb-3 text-sm">الفئة</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                value={category.id}
                checked={selectedCategory === category.id}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm flex-1">{category.name}</span>
              <span className="text-xs text-gray-400">({category.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="font-bold mb-3 text-sm">السعر</h3>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>0 ر.س</span>
            <span>{priceRange[1].toLocaleString()} ر.س</span>
          </div>
        </div>
      </div>

      {/* Condition */}
      <div className="mb-6">
        <h3 className="font-bold mb-3 text-sm">الحالة</h3>
        <div className="space-y-2">
          {conditions.map((condition) => (
            <label key={condition.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedConditions.includes(condition.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedConditions([...selectedConditions, condition.id]);
                  } else {
                    setSelectedConditions(selectedConditions.filter(c => c !== condition.id));
                  }
                }}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm">{condition.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button 
        onClick={() => {
          setSelectedCategory('');
          setPriceRange([0, 10000]);
          setSelectedConditions([]);
        }}
        className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
      >
        إعادة تعيين
      </button>
    </div>
  );
}
