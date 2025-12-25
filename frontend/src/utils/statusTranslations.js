// ترجمة حالات طلبات الصيانة
export const getStatusText = (status) => {
  const statusMap = {
    'received': 'تم الاستلام',
    'diagnosed': 'تم الفحص', 
    'waiting_approval': 'في انتظار الموافقة',
    'approved': 'تمت الموافقة',
    'in_progress': 'قيد الإصلاح',
    'testing': 'قيد الاختبار',
    'ready': 'جاهز للاستلام',
    'completed': 'مكتمل',
    'cancelled': 'ملغي'
  }
  return statusMap[status] || status
}

// ألوان الحالات
export const getStatusColor = (status) => {
  const colorMap = {
    'received': 'bg-blue-100 text-blue-700',
    'diagnosed': 'bg-yellow-100 text-yellow-700',
    'waiting_approval': 'bg-orange-100 text-orange-700', 
    'approved': 'bg-green-100 text-green-700',
    'in_progress': 'bg-purple-100 text-purple-700',
    'testing': 'bg-indigo-100 text-indigo-700',
    'ready': 'bg-green-200 text-green-800',
    'completed': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-700'
  }
  return colorMap[status] || 'bg-gray-100 text-gray-700'
}

// أيقونات الحالات
export const getStatusIcon = (status) => {
  // يمكن إضافة الأيقونات هنا لاحقاً إذا لزم الأمر
  return null
}

// ترجمة أولوية الطلبات
export const getPriorityText = (priority) => {
  const priorityMap = {
    'normal': 'عادي',
    'urgent': 'عاجل', 
    'emergency': 'طارئ'
  }
  return priorityMap[priority] || priority
}

// ألوان الأولوية
export const getPriorityColor = (priority) => {
  const colorMap = {
    'normal': 'bg-gray-100 text-gray-700',
    'urgent': 'bg-orange-100 text-orange-700',
    'emergency': 'bg-red-100 text-red-700'
  }
  return colorMap[priority] || 'bg-gray-100 text-gray-700'
}