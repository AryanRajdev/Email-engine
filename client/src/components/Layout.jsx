import { NavLink } from "react-router-dom";

const navItems = [
  {
    name: "Dashboard",
    to: "/dashboard",
    icon: (
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 21V8.25c0-.414.336-.75.75-.75h13.5a.75.75 0 0 1 .75.75V21m-7.5 0V3" /></svg>
    ),
  },
  {
    name: "Create Campaign",
    to: "/campaigns/new",
    icon: (
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
    ),
  },
];

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white shadow-sm p-6 sticky top-0 h-screen">
        <div className="mb-8">
          <span className="text-xl font-bold text-gray-800">Email Campaign</span>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-xl transition-colors ${
                  isActive ? "bg-gray-200 text-gray-900 font-semibold" : "text-gray-700 hover:bg-gray-200"
                }`
              }
              end
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
      {/* Topbar for mobile */}
      <header className="md:hidden w-full bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
        <span className="text-lg font-bold text-gray-800">Campaign Builder</span>
        <nav className="flex gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-2 py-1 rounded transition-colors ${
                  isActive ? "bg-gray-200 text-gray-900 font-semibold" : "text-gray-700 hover:bg-gray-200"
                }`
              }
              end
            >
              {item.icon}
            </NavLink>
          ))}
        </nav>
      </header>
      {/* Main content */}
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout; 