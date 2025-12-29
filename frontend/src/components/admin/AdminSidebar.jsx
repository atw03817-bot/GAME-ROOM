import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiX,
  FiLayout,
  FiGrid,
  FiTag,
  FiTruck,
  FiBarChart2,
  FiBookOpen,
  FiTool,
  FiUserCheck,
} from 'react-icons/fi'
import api from '../../utils/api'

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const response = await api.get('/auth/profile')
        setUser(response.data.user)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    navigate('/login')
  }

  // تحديد الصفحة النشطة من الـ URL
  const getActivePage = () => {
    const path = location.pathname
    if (path === '/admin' || path === '/admin/dashboard') return 'dashboard'
    if (path.includes('/admin/homepage')) return 'homepage'
    if (path.includes('/admin/products')) return 'products'
    if (path.includes('/admin/orders')) return 'orders'
    if (path.includes('/admin/customers')) return 'customers'
    if (path.includes('/admin/users')) return 'users'
    if (path.includes('/admin/categories')) return 'categories'
    if (path.includes('/admin/deals')) return 'deals'
    if (path.includes('/admin/distribution')) return 'distribution'
    if (path.includes('/admin/analytics')) return 'analytics'
    if (path.includes('/admin/blog')) return 'blog'
    if (path.includes('/admin/maintenance')) return 'maintenance'
    if (path.includes('/admin/settings')) return 'settings'
    return ''
  }

  const activePage = getActivePage()

  const menuItems = [
    { id: 'dashboard', path: '/admin/dashboard', icon: FiHome, label: 'الرئيسية', roles: ['admin', 'manager'] },
    { id: 'homepage', path: '/admin/homepage-builder', icon: FiLayout, label: 'الصفحة الرئيسية', roles: ['admin', 'manager'] },
    { id: 'products', path: '/admin/products', icon: FiPackage, label: 'المنتجات', roles: ['admin', 'manager'] },
    { id: 'categories', path: '/admin/categories', icon: FiGrid, label: 'الفئات', roles: ['admin', 'manager'] },
    { id: 'orders', path: '/admin/orders', icon: FiShoppingBag, label: 'الطلبات', roles: ['admin', 'manager'] },
    { id: 'customers', path: '/admin/customers', icon: FiUsers, label: 'العملاء', roles: ['admin', 'manager'] },
    { id: 'users', path: '/admin/users', icon: FiUserCheck, label: 'إدارة المستخدمين', roles: ['admin'] },
    { id: 'maintenance', path: '/admin/maintenance', icon: FiTool, label: 'الصيانة', roles: ['admin', 'manager', 'technician'] },
    { id: 'blog', path: '/admin/blog', icon: FiBookOpen, label: 'المدونة', roles: ['admin', 'manager'] },
    { id: 'analytics', path: '/admin/analytics', icon: FiBarChart2, label: 'التحليلات', roles: ['admin', 'manager'] },
    { id: 'deals', path: '/admin/deals', icon: FiTag, label: 'العروض', roles: ['admin', 'manager'] },
    { id: 'distribution', path: '/admin/distribution', icon: FiTruck, label: 'التوزيع', roles: ['admin', 'manager'] },
    { id: 'settings', path: '/admin/settings', icon: FiSettings, label: 'الإعدادات', roles: ['admin'] },
  ]

  // فلترة القائمة حسب دور المستخدم
  const userRole = user?.role?.toLowerCase();
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  const settingsItems = []

  return (
    <aside
      className={`fixed lg:static inset-y-0 right-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold">جيم روم</h2>
              <p className="text-xs text-gray-400">لوحة الإدارة</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition"
            >
              <FiX size={20} />
            </button>
          </div>

          {user && (
            <div className="mb-6 p-4 bg-slate-700 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="font-bold text-sm">{user.name}</p>
                  <p className="text-xs text-gray-400">
                    {user.role === 'admin' ? 'مدير' : 
                     user.role === 'technician' ? 'فني صيانة' :
                     user.role === 'manager' ? 'مدير قسم' : 'مستخدم'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive
                      ? 'bg-primary-600 font-bold shadow-lg'
                      : 'hover:bg-slate-700'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600 rounded-xl transition"
          >
            <FiLogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
