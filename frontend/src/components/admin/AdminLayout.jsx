import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { FiMenu } from 'react-icons/fi'
import AdminSidebar from './AdminSidebar'
import useAuthStore from '../../store/useAuthStore'

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocation()

  // التحقق من تسجيل الدخول والصلاحيات
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // دعم كل من admin و ADMIN و technician و manager
  const userRole = user?.role?.toLowerCase();
  if (!['admin', 'technician', 'manager'].includes(userRole)) {
    return <Navigate to="/" replace />
  }

  // إعادة توجيه الفنيين إلى صفحة الصيانة إذا كانوا في الصفحة الرئيسية للإدارة
  if (userRole === 'technician' && (location.pathname === '/admin' || location.pathname === '/admin/')) {
    return <Navigate to="/admin/maintenance" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="px-4 py-4 flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiMenu size={24} />
              </button>
              <div className="flex-1 lg:mr-4">
                <h1 className="text-xl font-bold text-gray-800">لوحة الإدارة</h1>
                <p className="text-sm text-gray-600">مرحباً {user?.name || user?.phone}</p>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default AdminLayout
