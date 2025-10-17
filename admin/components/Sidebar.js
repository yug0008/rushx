import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  FaTachometerAlt, 
  FaTrophy, 
  FaUsers, 
  FaMoneyBillWave, 
  FaCog,
  FaChartBar,
  FaBell,
  FaUserCheck
} from 'react-icons/fa'

const Sidebar = ({ open, setOpen }) => {
  const router = useRouter()

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: FaTachometerAlt },
    { name: 'Tournaments', href: '/admin/tournaments', icon: FaTrophy },
    { name: 'Enrollments', href: '/admin/enrollments', icon: FaUserCheck },
    { name: 'Users', href: '/admin/users', icon: FaUsers },
    { name: 'watch', href: '/admin/watch', icon: FaMoneyBillWave },
    { name: 'Analytics', href: '/admin/analytics', icon: FaChartBar },
    { name: 'Notifications', href: '/admin/notifications', icon: FaBell },
    { name: 'results', href: '/admin/results', icon: FaCog },
  ]

  const isActive = (href) => router.pathname === href

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-cyan-500 to-purple-600">
          <h1 className="text-xl font-bold text-white">RushX Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 cursor-pointer ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Version info */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="text-center text-xs text-gray-500">
            v1.0.0
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar