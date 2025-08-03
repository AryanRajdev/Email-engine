import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiChevronLeft, FiChevronRight, FiPlus, FiGrid } from "react-icons/fi";
import { FiUser, FiBell } from "react-icons/fi";

const navItems = [
  {
    name: "Dashboard",
    to: "/dashboard",
    icon: <FiGrid className="w-5 h-5 flex-shrink-0" />,
  },
  {
    name: "Create Campaign",
    to: "/campaigns/new",
    icon: <FiPlus className="w-5 h-5 flex-shrink-0" />,
  }
];

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Toggle sidebar collapse on desktop
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Get current page title
  const getPageTitle = () => {
    if (location.pathname.includes("dashboard")) return "Dashboard";
    if (location.pathname.includes("campaigns/new")) return "Create Campaign";
    return "Dashboard";
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:w-16" : "md:w-64"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className={`h-16 flex items-center px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-gray-800">
                Email<span className="text-blue-600">Campaign</span>
              </h1>
            )}
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={toggleCollapse}
                className="hidden md:flex items-center justify-center p-1.5 rounded-lg hover:bg-gray-100"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <FiChevronRight className="w-5 h-5 text-gray-600" />
                ) : (
                  <FiChevronLeft className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  } ${isCollapsed ? "justify-center" : ""}`
                }
                end
              >
                <span className="flex items-center">
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="ml-3 text-sm">{item.name}</span>
                  )}
                </span>
              </NavLink>
            ))}
          </nav>

          {/* User Profile & Logout */}
          <div className={`p-3 border-t border-gray-100 ${isCollapsed ? 'flex justify-center' : ''}`}>
            <button className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">AR</span>
              </div>
              {!isCollapsed && (
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-gray-900">Aryan Raj</p>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        isCollapsed ? "md:ml-16" : "md:ml-64"
      }`}>
        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 h-16 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="md:hidden mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiMenu className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <FiBell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-px h-6 bg-gray-200"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">AR</span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 hidden md:inline">Aryan Raj</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
